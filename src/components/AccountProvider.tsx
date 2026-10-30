import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AccountContext, type AccountState, type SyncState } from '@/lib/accountContext';
import { EMPTY_PROFILE, profileFromRow, profileToRow, type Profile } from '@/lib/profile';
import { onStorageChange } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { SYNCED_KEYS, forgetSync, isApplyingSync, syncAll } from '@/lib/sync';
import { reloadToolPrefs } from '@/lib/toolPrefs';

/** Wait after the last local edit before uploading, so a burst of edits is one sync. */
const EDIT_DEBOUNCE_MS = 8_000;
/** Coming back to the app syncs, but not more often than this. */
const FOREGROUND_MIN_GAP_MS = 60_000;

function friendly(e: unknown): string {
  // Database errors arrive as plain { message, code } objects, not Error instances.
  const msg =
    e instanceof Error
      ? e.message
      : e && typeof e === 'object' && 'message' in e
        ? String((e as { message: unknown }).message)
        : String(e);
  if (/fetch|network|load failed/i.test(msg)) return 'Can’t reach the server. Check your connection and try again.';
  if (/invalid login credentials/i.test(msg)) return 'Email or password is incorrect.';
  if (/token has expired|invalid.*otp|otp.*invalid/i.test(msg)) return 'That code is wrong or has expired. Request a new one.';
  if (/already registered/i.test(msg)) return 'An account with this email already exists. Sign in instead.';
  return msg;
}

/**
 * Optional accounts: sign-in, profile and cloud backup (see lib/sync). Renders
 * its children untouched when the build has no Supabase configuration.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AccountState['status']>(supabase ? 'loading' : 'disabled');
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [sync, setSync] = useState<SyncState>({ phase: 'idle', lastSyncedAt: null, error: null });
  const [dataVersion, setDataVersion] = useState(0);

  const inFlight = useRef(false);
  const again = useRef(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSync = useRef(0);
  const signedIn = status === 'signedIn';

  const runSync = useCallback(async () => {
    if (!supabase) return;
    if (inFlight.current) {
      again.current = true; // finish this one, then go again with the newer data
      return;
    }
    inFlight.current = true;
    setSync((s) => ({ ...s, phase: 'syncing', error: null }));
    try {
      do {
        again.current = false;
        if (await syncAll(supabase)) {
          await reloadToolPrefs();
          setDataVersion((v) => v + 1);
        }
      } while (again.current);
      lastSync.current = Date.now();
      setSync({ phase: 'idle', lastSyncedAt: lastSync.current, error: null });
    } catch (e) {
      setSync((s) => ({ ...s, phase: 'error', error: friendly(e) }));
    } finally {
      inFlight.current = false;
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('display_name, role, institution').maybeSingle();
    setProfile(profileFromRow(data));
  }, []);

  // Session: restore on launch, then follow sign-in / sign-out.
  useEffect(() => {
    if (!supabase) return;
    const apply = (s: Session | null) => {
      setSession(s);
      setStatus(s ? 'signedIn' : 'signedOut');
    };
    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      // Supabase advises against awaiting its own calls inside this callback.
      setTimeout(() => apply(s), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Each time someone signs in (or the app opens signed in): profile, then sync.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) return;
    void loadProfile();
    void runSync();
  }, [userId, loadProfile, runSync]);

  // Local edits to synced data upload a few seconds later.
  useEffect(() => {
    if (!signedIn) return;
    const off = onStorageChange((key) => {
      if (!SYNCED_KEYS.has(key) || isApplyingSync()) return;
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => void runSync(), EDIT_DEBOUNCE_MS);
    });
    return () => {
      off();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [signedIn, runSync]);

  // Returning to the app picks up changes made on the other device.
  useEffect(() => {
    if (!signedIn) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastSync.current > FOREGROUND_MIN_GAP_MS) {
        void runSync();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [signedIn, runSync]);

  const value = useMemo<AccountState>(() => {
    const client = () => {
      if (!supabase) throw new Error('Accounts are not available in this build.');
      return supabase;
    };
    const run = async (op: () => PromiseLike<{ error: unknown }>) => {
      try {
        const { error } = await op();
        if (error) throw error;
      } catch (e) {
        throw new Error(friendly(e));
      }
    };
    return {
      status,
      userId,
      email: session?.user.email ?? null,
      profile,
      sync,
      dataVersion,
      signIn: (email, password) =>
        run(() => client().auth.signInWithPassword({ email: email.trim(), password })),
      signUp: (email, password) => run(() => client().auth.signUp({ email: email.trim(), password })),
      verifySignUp: (email, code) =>
        run(() => client().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'signup' })),
      requestPasswordReset: (email) => run(() => client().auth.resetPasswordForEmail(email.trim())),
      resetPassword: async (email, code, newPassword) => {
        await run(() => client().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' }));
        await run(() => client().auth.updateUser({ password: newPassword }));
      },
      saveProfile: async (p) => {
        if (!userId) throw new Error('Sign in first.');
        await run(() =>
          client()
            .from('profiles')
            .upsert({ id: userId, ...profileToRow(p), updated_at: new Date().toISOString() }),
        );
        setProfile(profileFromRow(profileToRow(p)));
      },
      syncNow: runSync,
      signOut: async (removeLocalData) => {
        // 'local' signs out this device only; the iPad stays signed in.
        await client().auth.signOut({ scope: 'local' });
        await forgetSync(removeLocalData);
        setProfile(EMPTY_PROFILE);
        setSync({ phase: 'idle', lastSyncedAt: null, error: null });
        if (removeLocalData) {
          await reloadToolPrefs();
          setDataVersion((v) => v + 1);
        }
      },
      deleteAccount: async () => {
        // Server side: deletes the login, profile and every backed-up row (cascade).
        await run(() => client().rpc('delete_my_account'));
        await client().auth.signOut({ scope: 'local' }).catch(() => undefined);
        await forgetSync(false);
        setProfile(EMPTY_PROFILE);
        setSync({ phase: 'idle', lastSyncedAt: null, error: null });
      },
    };
  }, [status, session, profile, sync, dataVersion, userId, runSync]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}
