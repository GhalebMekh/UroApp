import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { LockIcon } from './icons';
import { useAppLock } from '@/lib/appLockContext';

const seconds = (ms: number) => Math.ceil(ms / 1000);

/**
 * Holds back a private section (ward list, logbook, MDT, CME) until the
 * user's own PIN or Face ID is given. Shows the section directly when the
 * lock is off. Free bedside tools are never wrapped in this.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const lock = useAppLock();
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  const prompted = useRef(false);

  const locked = lock.loaded && lock.settings.enabled && !lock.unlocked;
  const offerBiometrics = lock.settings.biometrics && lock.biometry !== null;

  // Offer Face ID straight away, once per visit to the lock screen.
  useEffect(() => {
    if (!locked) {
      prompted.current = false;
      return;
    }
    if (offerBiometrics && !prompted.current) {
      prompted.current = true;
      void lock.unlockWithBiometrics();
    }
  }, [locked, offerBiometrics, lock]);

  if (!lock.loaded) return null;
  if (!locked) return <>{children}</>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    try {
      const r = await lock.unlockWithPin(pin);
      setPin('');
      if (r.status === 'ok') setMessage(null);
      else if (r.status === 'blocked') setMessage(`Too many attempts. Try again in ${seconds(r.waitMs)} s.`);
      else setMessage(r.waitMs > 0 ? `Wrong PIN. Try again in ${seconds(r.waitMs)} s.` : 'Wrong PIN.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-sm rounded-card border border-line bg-navy-2 p-7">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-[11px] bg-steel text-[20px] text-violet-soft">
          <LockIcon />
        </div>
        <h3 className="mb-1 font-display text-[20px] font-semibold">Locked</h3>
        <p className="mb-5 text-[13px] text-muted">
          Your ward list, logbook, MDT sheets and CME record are locked. Calculators and on-call
          tools stay open.
        </p>

        <form onSubmit={submit} className="space-y-3" noValidate>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setMessage(null);
            }}
            placeholder="PIN"
            aria-label="PIN"
            aria-invalid={message !== null}
            className="min-h-[44px] w-full rounded-[12px] border border-line bg-navy px-4 py-3 text-center font-mono text-[18px] tracking-[0.4em] text-ink placeholder:tracking-normal placeholder-muted-2 focus:border-violet focus:outline-none"
          />
          {message && (
            <p role="alert" className="text-[13px] text-amber">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={checking || pin.length < 4}
            className="min-h-[44px] w-full rounded-[12px] bg-violet py-3 text-[15px] font-semibold text-white transition hover:bg-violet-deep disabled:opacity-50"
          >
            Unlock
          </button>
        </form>

        {offerBiometrics && (
          <button
            type="button"
            onClick={() => void lock.unlockWithBiometrics()}
            className="mt-3 min-h-[44px] w-full rounded-[12px] border border-line bg-navy py-3 text-[14px] font-semibold text-violet-soft transition-colors hover:border-violet"
          >
            Use {lock.biometry}
          </button>
        )}

        <div className="mt-5 border-t border-line pt-4">
          {!confirmErase ? (
            <button
              type="button"
              onClick={() => setConfirmErase(true)}
              className="min-h-[44px] text-[13px] font-semibold text-muted hover:text-ink"
            >
              Forgot PIN?
            </button>
          ) : (
            <div>
              <p className="mb-3 text-[13px] text-muted">
                A forgotten PIN can’t be recovered. Removing the lock{' '}
                <span className="font-semibold text-ink">erases the ward list, logbook, MDT sheets and
                CME record on this device</span>.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmErase(false)}
                  className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy text-[13px] font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void lock.forgotPin()}
                  className="min-h-[44px] flex-1 rounded-[11px] border border-amber/50 bg-amber/10 text-[13px] font-semibold text-amber"
                >
                  Erase and unlock
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
