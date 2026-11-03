import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  DEFAULT_PREFS,
  loadPrefs,
  notificationsSupported,
  permissionState,
  requestPermission,
  savePrefs,
  type ConferenceScope,
  type NotifyPrefs,
} from '@/lib/notifications';

const SCOPES: { id: ConferenceScope; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'attending', label: "Ones I'm attending" },
  { id: 'all', label: 'All congresses' },
];

const chip = (on: boolean) =>
  cn(
    'min-h-[44px] flex-1 rounded-[10px] border px-3 text-[13px] font-semibold transition-colors',
    on ? 'border-violet bg-violet/[0.16] text-ink' : 'border-line bg-navy text-muted hover:text-ink',
  );

/** More → Notifications: weekly reads and conference reminders, off by default. */
export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotifyPrefs>(DEFAULT_PREFS);
  const [denied, setDenied] = useState(false);
  const supported = notificationsSupported();

  useEffect(() => {
    void loadPrefs().then(setPrefs);
    void permissionState().then((s) => setDenied(s === 'denied'));
  }, []);

  /** Switching anything on asks iOS for permission first; nothing is saved if refused. */
  async function update(patch: Partial<NotifyPrefs>) {
    const next = { ...prefs, ...patch };
    const turningOn = (patch.weekly ?? false) || (patch.conferences !== undefined && patch.conferences !== 'off');
    if (turningOn && !(await requestPermission())) {
      setDenied(true);
      return;
    }
    setDenied(false);
    setPrefs(next);
    void savePrefs(next);
  }

  return (
    <section className="rounded-[16px] border border-line bg-navy-2 p-5">
      <h3 className="text-[15px] font-semibold">Notifications</h3>
      {!supported ? (
        <p className="mt-2 text-[13px] text-muted">Reminders are available in the iPhone and iPad app.</p>
      ) : (
        <>
          <p className="mt-1 text-[13px] text-muted">Reminders are set on this device; nothing is sent to a server.</p>

          <div className="mt-4">
            <div className="text-[13.5px] font-semibold">Weekly reads</div>
            <p className="mb-2 text-[12.5px] text-muted-2">Monday 9:00, when the new papers are in.</p>
            <div className="flex gap-2">
              <button type="button" aria-pressed={!prefs.weekly} onClick={() => void update({ weekly: false })} className={chip(!prefs.weekly)}>
                Off
              </button>
              <button type="button" aria-pressed={prefs.weekly} onClick={() => void update({ weekly: true })} className={chip(prefs.weekly)}>
                On
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[13.5px] font-semibold">Conferences</div>
            <p className="mb-2 text-[12.5px] text-muted-2">Two weeks before and the day before, at 9:00.</p>
            <div className="flex flex-wrap gap-2">
              {SCOPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={prefs.conferences === s.id}
                  onClick={() => void update({ conferences: s.id })}
                  className={chip(prefs.conferences === s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {denied && (
            <p className="mt-4 rounded-[10px] border border-amber/50 bg-amber/[0.10] px-4 py-3 text-[12.5px] text-muted">
              Notifications are turned off for UroApp. Turn them on in Settings → Notifications → UroApp, then try again.
            </p>
          )}
        </>
      )}
    </section>
  );
}
