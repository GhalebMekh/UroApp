import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { isUnlocked, onLock, passcodeEnabled, tryUnlock } from '@/lib/passcode';

/**
 * Holds back the app until the access passcode is entered, then remembers the
 * unlock on-device so it is asked once per device rather than once per visit.
 * See `@/lib/passcode` for what this protects against — and what it does not.
 */
export function PasscodeGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(passcodeEnabled ? null : true);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!passcodeEnabled) return;
    isUnlocked().then(setUnlocked);
    // Re-gate in place when the device is locked from More, so no page reload
    // is needed to bring the passcode screen back.
    return onLock(() => {
      setEntry('');
      setError(false);
      setUnlocked(false);
    });
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    setError(false);
    try {
      if (await tryUnlock(entry)) {
        setUnlocked(true);
      } else {
        setError(true);
        setEntry('');
      }
    } finally {
      setChecking(false);
    }
  }

  // null = still reading storage; render nothing rather than flashing the gate
  // at someone who has already unlocked this device.
  if (unlocked === null) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-navy px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex items-center gap-2.5">
          <BrandMark className="h-9 w-9 text-[20px]" />
          <span className="text-[17px] font-bold tracking-[-0.02em]">UroApp</span>
        </div>

        <h1 className="font-display text-[26px] font-semibold">Enter passcode</h1>
        <p className="mt-2 text-[13.5px] text-muted">
          This app holds a de-identified ward round list. Enter the passcode to continue.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3" noValidate>
          <input
            type="password"
            value={entry}
            onChange={(e) => {
              setEntry(e.target.value);
              setError(false);
            }}
            placeholder="Passcode"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="current-password"
            aria-invalid={error}
            className="min-h-[44px] w-full rounded-[12px] border border-line bg-navy-2 px-4 py-3 text-[15px] text-ink placeholder-muted-2 focus:border-violet focus:outline-none"
          />

          {error && (
            <p role="alert" className="text-[13px] text-crimson">
              That passcode isn’t right.
            </p>
          )}

          <button
            type="submit"
            disabled={checking || entry.trim() === ''}
            className="min-h-[44px] w-full rounded-[12px] bg-violet py-3.5 text-[15px] font-semibold text-white transition hover:bg-violet-deep disabled:opacity-50"
          >
            Unlock
          </button>
        </form>

        <p className="mt-6 text-[12px] text-muted-2">
          Never enter patient-identifiable details anywhere in this app — initials and a bed or ward
          only.
        </p>
      </div>
    </div>
  );
}
