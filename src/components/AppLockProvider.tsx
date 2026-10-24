import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  LOCK_OFF,
  checkPin,
  createSettings,
  eraseLockedData,
  loadLock,
  saveLock,
  shouldRelock,
  type LockSettings,
} from '@/lib/appLock';
import { AppLockContext, type AppLockState, type UnlockResult } from '@/lib/appLockContext';
import { biometryLabel, verifyBiometric } from '@/lib/biometrics';

/** Owns the app-lock state for the whole app; see lib/appLock for the rules. */
export function AppLockProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LockSettings>(LOCK_OFF);
  const [loaded, setLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [biometry, setBiometry] = useState<string | null>(null);
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    void loadLock().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
    void biometryLabel().then(setBiometry);
  }, []);

  // Leaving the app (home screen, PACS, a call) for a while locks it again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
      } else {
        if (shouldRelock(hiddenAt.current, Date.now())) setUnlocked(false);
        hiddenAt.current = null;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const persist = useCallback(async (next: LockSettings) => {
    setSettings(next);
    await saveLock(next);
  }, []);

  const attempt = useCallback(
    async (pin: string): Promise<UnlockResult> => {
      const r = await checkPin(settings, pin, Date.now());
      await persist(r.next);
      return r.status === 'ok' ? { status: 'ok' } : { status: r.status, waitMs: r.waitMs };
    },
    [settings, persist],
  );

  const value = useMemo<AppLockState>(
    () => ({
      settings,
      loaded,
      unlocked,
      biometry,
      turnOn: async (pin, biometrics) => {
        await persist(await createSettings(pin, biometrics && biometry !== null));
        setUnlocked(true); // whoever just chose the PIN is already "in"
      },
      turnOff: async (pin) => {
        const r = await attempt(pin);
        if (r.status === 'ok') await persist(LOCK_OFF);
        return r;
      },
      setBiometrics: async (on) => {
        // Turning Face ID on is confirmed with Face ID, so it is known to work.
        if (on && !(await verifyBiometric('Use Face ID or Touch ID to unlock UroApp'))) return;
        await persist({ ...settings, biometrics: on });
      },
      unlockWithPin: async (pin) => {
        const r = await attempt(pin);
        if (r.status === 'ok') setUnlocked(true);
        return r;
      },
      unlockWithBiometrics: async () => {
        if (!settings.biometrics || biometry === null) return false;
        const ok = await verifyBiometric('Unlock your ward list and logbook');
        if (ok) setUnlocked(true);
        return ok;
      },
      lockNow: () => setUnlocked(false),
      forgotPin: async () => {
        await eraseLockedData();
        setSettings(LOCK_OFF);
        setUnlocked(true);
      },
    }),
    [settings, loaded, unlocked, biometry, persist, attempt],
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}
