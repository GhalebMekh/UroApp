import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { isEmail, passwordProblem, useAccount } from '@/lib/accountContext';
import { INSTITUTION_MAX, NAME_MAX, ROLES, ROLE_LABEL, type Profile } from '@/lib/profile';

const input =
  'min-h-[44px] w-full rounded-[12px] border border-line bg-navy px-4 py-3 text-[15px] text-ink placeholder-muted-2 focus:border-violet focus:outline-none';
const primary =
  'min-h-[44px] w-full rounded-[11px] bg-violet px-3 py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep disabled:opacity-50';
const secondary =
  'min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy px-3 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-violet disabled:opacity-50';
const link = 'min-h-[44px] text-[13px] font-semibold text-violet-soft hover:text-ink';

type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';

function ago(t: number): string {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  return new Date(t).toLocaleString();
}

function Alert({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'teal' }) {
  return (
    <p role={tone === 'amber' ? 'alert' : 'status'} className={`text-[13px] ${tone === 'amber' ? 'text-amber' : 'text-teal'}`}>
      {children}
    </p>
  );
}

/** Wraps an async action with busy + error state. */
function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, act };
}

function SignedOut() {
  const account = useAccount();
  const { busy, error, setError, act } = useAction();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const go = (m: Mode) => {
    setMode(m);
    setError(null);
    setCode('');
  };

  function needEmail(): boolean {
    if (isEmail(email)) return true;
    setError('Enter a valid email address.');
    return false;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'signin') {
      if (needEmail()) await act(() => account.signIn(email, password));
    } else if (mode === 'signup') {
      const problem = passwordProblem(password);
      if (!needEmail()) return;
      if (problem) return setError(problem);
      if (await act(() => account.signUp(email, password))) go('verify');
    } else if (mode === 'verify') {
      await act(() => account.verifySignUp(email, code));
    } else if (mode === 'forgot') {
      if (needEmail() && (await act(() => account.requestPasswordReset(email)))) go('reset');
    } else {
      const problem = passwordProblem(password);
      if (problem) return setError(problem);
      await act(() => account.resetPassword(email, code, password));
    }
  }

  const codeField = (
    <input
      value={code}
      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="6-digit code"
      aria-label="Code from the email"
      className={`${input} text-center font-mono tracking-[0.3em] placeholder:tracking-normal`}
    />
  );
  const emailField = (
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      autoComplete="email"
      autoCapitalize="none"
      placeholder="Email"
      aria-label="Email"
      className={input}
    />
  );
  const passwordField = (label: string, auto: string) => (
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete={auto}
      placeholder={label}
      aria-label={label}
      className={input}
    />
  );

  const submitLabel: Record<Mode, string> = {
    signin: 'Sign in',
    signup: 'Create account',
    verify: 'Confirm email',
    forgot: 'Email me a code',
    reset: 'Set new password',
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && emailField}
      {mode === 'signin' && passwordField('Password', 'current-password')}
      {mode === 'signup' && passwordField('Password (8+ characters, a letter and a number)', 'new-password')}
      {mode === 'verify' && (
        <>
          <p className="text-[13px] text-muted">
            We emailed a code to <span className="font-semibold text-ink">{email}</span>. Enter it to
            confirm your account.
          </p>
          {codeField}
        </>
      )}
      {mode === 'reset' && (
        <>
          <p className="text-[13px] text-muted">
            If an account exists for <span className="font-semibold text-ink">{email}</span>, we emailed
            it a code.
          </p>
          {codeField}
          {passwordField('New password', 'new-password')}
        </>
      )}
      {error && <Alert>{error}</Alert>}
      <button type="submit" disabled={busy} className={primary}>
        {busy ? 'Please wait…' : submitLabel[mode]}
      </button>
      <div className="flex flex-wrap justify-between gap-x-4">
        {mode === 'signin' ? (
          <>
            <button type="button" onClick={() => go('signup')} className={link}>
              Create an account
            </button>
            <button type="button" onClick={() => go('forgot')} className={link}>
              Forgot password?
            </button>
          </>
        ) : (
          <button type="button" onClick={() => go('signin')} className={link}>
            {mode === 'verify' ? 'Use a different email' : 'Back to sign in'}
          </button>
        )}
      </div>
    </form>
  );
}

function ProfileForm() {
  const account = useAccount();
  const { busy, error, act } = useAction();
  const [draft, setDraft] = useState<Profile>(account.profile);
  const [saved, setSaved] = useState(false);

  // Profile arrives from the server shortly after sign-in.
  useEffect(() => setDraft(account.profile), [account.profile]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaved(await act(() => account.saveProfile(draft)));
  }

  const edit = (patch: Partial<Profile>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  return (
    <form onSubmit={save} className="space-y-3" noValidate>
      <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Profile</h4>
      <input
        value={draft.displayName}
        onChange={(e) => edit({ displayName: e.target.value })}
        maxLength={NAME_MAX}
        autoComplete="name"
        placeholder="Display name, e.g. Dr A. Name"
        aria-label="Display name"
        className={input}
      />
      <select
        value={draft.role}
        onChange={(e) => edit({ role: e.target.value as Profile['role'] })}
        aria-label="Role / training level"
        className={input}
      >
        <option value="">Role / training level</option>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
      <input
        value={draft.institution}
        onChange={(e) => edit({ institution: e.target.value })}
        maxLength={INSTITUTION_MAX}
        autoComplete="organization"
        placeholder="Hospital / institution"
        aria-label="Hospital / institution"
        className={input}
      />
      <p className="text-[12px] text-muted-2">Printed on your logbook and CME record. About you only — never patients.</p>
      {error && <Alert>{error}</Alert>}
      {saved && <Alert tone="teal">Profile saved.</Alert>}
      <button type="submit" disabled={busy} className={primary}>
        {busy ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}

function SignedIn() {
  const account = useAccount();
  const { busy, error, act } = useAction();
  const [confirm, setConfirm] = useState<'none' | 'signout' | 'delete'>('none');
  const { sync } = account;

  const syncText =
    sync.phase === 'syncing'
      ? 'Syncing…'
      : sync.lastSyncedAt
        ? `Backed up ${ago(sync.lastSyncedAt)}`
        : 'Not synced yet';

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-muted">
        Signed in as <span className="font-semibold text-ink">{account.email}</span>
      </p>

      <ProfileForm />

      <div className="space-y-3 border-t border-line pt-4">
        <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Backup &amp; sync</h4>
        <p className="text-[13px] text-ink">{syncText}</p>
        {sync.error && <Alert>{sync.error}</Alert>}
        <button
          type="button"
          onClick={() => void account.syncNow()}
          disabled={sync.phase === 'syncing'}
          className={`${secondary} w-full`}
        >
          Sync now
        </button>
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        {error && <Alert>{error}</Alert>}
        {confirm === 'none' && (
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirm('signout')} className={secondary}>
              Sign out
            </button>
            <button type="button" onClick={() => setConfirm('delete')} className={secondary}>
              Delete account
            </button>
          </div>
        )}
        {confirm === 'signout' && (
          <div className="space-y-2">
            <p className="text-[13px] text-muted">
              Keep your logbook, CME record, favourites and rehearsal progress on this device after signing out?
              Remove them if this device will be used by someone else — your backup stays in your account.
            </p>
            <button type="button" disabled={busy} onClick={() => void act(() => account.signOut(false))} className={`${secondary} w-full`}>
              Sign out, keep data here
            </button>
            <button type="button" disabled={busy} onClick={() => void act(() => account.signOut(true))} className={`${secondary} w-full`}>
              Sign out and remove from this device
            </button>
            <button type="button" onClick={() => setConfirm('none')} className={`${link} w-full`}>
              Cancel
            </button>
          </div>
        )}
        {confirm === 'delete' && (
          <div className="space-y-2">
            <p className="text-[13px] text-muted">
              This <span className="font-semibold text-ink">permanently deletes</span> your account, profile
              and cloud backup. It can’t be undone. Data already on this device stays here.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void act(() => account.deleteAccount())}
              className="min-h-[44px] w-full rounded-[11px] border border-amber/50 bg-amber/10 text-[13px] font-semibold text-amber disabled:opacity-50"
            >
              {busy ? 'Deleting…' : 'Delete my account permanently'}
            </button>
            <button type="button" onClick={() => setConfirm('none')} className={`${link} w-full`}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** More → Account. Hidden entirely in builds without Supabase configured. */
export function AccountSettings() {
  const { status } = useAccount();
  if (status === 'disabled') return null;

  return (
    <section className="rounded-[16px] border border-line bg-navy-2 p-5">
      <h3 className="text-[15px] font-semibold">Account</h3>
      <p className="mb-4 mt-1 text-[12px] text-muted-2">
        Optional. Backs up your logbook, CME record, favourites and rehearsal progress, and keeps them in step between your
        iPhone and iPad. Your ward list and MDT sheets never leave this device.
      </p>
      {status === 'loading' && <p className="text-[13px] text-muted">Loading…</p>}
      {status === 'signedOut' && <SignedOut />}
      {status === 'signedIn' && <SignedIn />}
    </section>
  );
}
