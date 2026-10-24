import { useState, type FormEvent } from 'react';
import { isValidPin } from '@/lib/appLock';
import { useAppLock } from '@/lib/appLockContext';

const inputClass =
  'min-h-[44px] w-full rounded-[12px] border border-line bg-navy px-4 py-3 font-mono text-[16px] tracking-[0.3em] text-ink placeholder:tracking-normal placeholder-muted-2 focus:border-violet focus:outline-none';
const secondaryButton =
  'min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy px-3 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-violet';

const digitsOnly = (v: string) => v.replace(/\D/g, '').slice(0, 8);

/** More → App lock: set a PIN, toggle Face ID, lock now, or turn the lock off. */
export function AppLockSettings() {
  const lock = useAppLock();
  const [mode, setMode] = useState<'idle' | 'setup' | 'disable'>('idle');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [useBiometry, setUseBiometry] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMode('idle');
    setPin('');
    setConfirm('');
    setError(null);
  }

  async function turnOn(e: FormEvent) {
    e.preventDefault();
    if (!isValidPin(pin)) return setError('Use 4 to 8 digits.');
    if (pin !== confirm) return setError('The two PINs don’t match.');
    await lock.turnOn(pin, useBiometry);
    reset();
  }

  async function turnOff(e: FormEvent) {
    e.preventDefault();
    const r = await lock.turnOff(pin);
    setPin('');
    if (r.status === 'ok') reset();
    else setError(r.waitMs > 0 ? `Wrong PIN. Try again in ${Math.ceil(r.waitMs / 1000)} s.` : 'Wrong PIN.');
  }

  if (!lock.loaded) return null;

  return (
    <section className="rounded-[16px] border border-line bg-navy-2 p-5">
      <h3 className="text-[15px] font-semibold">App lock</h3>
      <p className="mb-4 mt-1 text-[12px] text-muted-2">
        Locks your ward list, logbook, MDT sheets and CME record behind your own PIN
        {lock.biometry ? ` or ${lock.biometry}` : ''}. Calculators and on-call tools stay open. It
        locks again after 5 minutes away from the app.
      </p>

      {!lock.settings.enabled && mode !== 'setup' && (
        <button
          type="button"
          onClick={() => setMode('setup')}
          className="min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep"
        >
          Set a PIN
        </button>
      )}

      {mode === 'setup' && (
        <form onSubmit={turnOn} className="space-y-3" noValidate>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={pin}
            onChange={(e) => {
              setPin(digitsOnly(e.target.value));
              setError(null);
            }}
            placeholder="New PIN (4–8 digits)"
            aria-label="New PIN"
            className={inputClass}
          />
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(digitsOnly(e.target.value));
              setError(null);
            }}
            placeholder="Repeat PIN"
            aria-label="Repeat PIN"
            className={inputClass}
          />
          {lock.biometry && (
            <label className="flex min-h-[44px] items-center gap-3 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={useBiometry}
                onChange={(e) => setUseBiometry(e.target.checked)}
                className="h-5 w-5 accent-violet"
              />
              Also unlock with {lock.biometry}
            </label>
          )}
          <p className="text-[12px] text-muted-2">
            A forgotten PIN can’t be recovered — removing the lock then erases the locked data on
            this device.
          </p>
          {error && (
            <p role="alert" className="text-[13px] text-amber">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={reset} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex-1 rounded-[11px] bg-violet px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-deep"
            >
              Turn on lock
            </button>
          </div>
        </form>
      )}

      {lock.settings.enabled && mode === 'idle' && (
        <div className="space-y-3">
          {lock.biometry && (
            <label className="flex min-h-[44px] items-center gap-3 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={lock.settings.biometrics}
                onChange={(e) => void lock.setBiometrics(e.target.checked)}
                className="h-5 w-5 accent-violet"
              />
              Unlock with {lock.biometry}
            </label>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={lock.lockNow} className={secondaryButton}>
              Lock now
            </button>
            <button type="button" onClick={() => setMode('disable')} className={secondaryButton}>
              Turn off lock
            </button>
          </div>
        </div>
      )}

      {mode === 'disable' && (
        <form onSubmit={turnOff} className="space-y-3" noValidate>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => {
              setPin(digitsOnly(e.target.value));
              setError(null);
            }}
            placeholder="Current PIN"
            aria-label="Current PIN"
            className={inputClass}
          />
          {error && (
            <p role="alert" className="text-[13px] text-amber">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={reset} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.length < 4}
              className="min-h-[44px] flex-1 rounded-[11px] bg-violet px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-violet-deep disabled:opacity-50"
            >
              Turn off
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
