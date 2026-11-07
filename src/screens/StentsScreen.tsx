import { useEffect, useState } from 'react';
import { DateInput } from '@/components/DateInput';
import { cn } from '@/lib/cn';
import { todayISO } from '@/lib/date';
import { getJSON, setJSON } from '@/lib/storage';
import { notificationsSupported, permissionState, requestPermission } from '@/lib/notifications';
import {
  LABEL_MAX,
  NOTE_MAX,
  REMOVE_BY_SHORTCUTS,
  SIDE_LABEL,
  SIZE_MAX,
  STENT_KEY,
  STENT_LEAD_DAYS,
  dueText,
  dwellDays,
  formatDay,
  looksLikeIdentifier,
  normalizeStents,
  shortcutDate,
  sortStents,
  stentStatus,
  type Stent,
  type StentSide,
  type StentStatus,
} from '@/lib/stents';

const inputCls =
  'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13.5px] text-ink outline-none focus:border-violet';
const fieldLabel = 'mb-[7px] block text-[13px] font-semibold text-muted';

/** Overdue is a risk cue (crimson); due within the week is amber (CLAUDE.md colour rules). */
const STATUS_CHIP: Record<StentStatus, string> = {
  overdue: 'border-crimson/40 bg-crimson/[0.12] text-crimson',
  'due-soon': 'border-amber/40 bg-amber/[0.12] text-amber',
  in: 'border-line bg-steel text-muted',
  removed: 'border-line bg-steel text-muted-2',
};

type Draft = Pick<Stent, 'label' | 'note' | 'side' | 'size' | 'inserted' | 'removeBy'>;

const emptyDraft = (): Draft => ({ label: '', note: '', side: 'left', size: '', inserted: todayISO(), removeBy: '' });

/**
 * Stent register (Residency → OR → Stents). Stays on this device behind the app
 * lock; each stent gets a reminder a week before its remove-by date.
 */
export function StentsScreen() {
  const [stents, setStents] = useState<Stent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // a stent id, or 'new'
  const [showRemoved, setShowRemoved] = useState(false);
  const [denied, setDenied] = useState(false);
  const today = todayISO();

  useEffect(() => {
    void getJSON<unknown>(STENT_KEY, []).then((raw) => {
      setStents(normalizeStents(raw));
      setLoaded(true);
    });
    void permissionState().then((s) => setDenied(s === 'denied'));
  }, []);

  function persist(next: Stent[]) {
    setStents(next);
    void setJSON(STENT_KEY, next);
  }

  function save(draft: Draft) {
    if (editing === 'new') {
      persist([...stents, { id: crypto.randomUUID(), ...draft, removed: '', setOn: today }]);
      // Ask for notification permission the first time a reminder is needed.
      void requestPermission().then((ok) => setDenied(!ok && notificationsSupported()));
    } else {
      persist(
        stents.map((s) =>
          s.id === editing ? { ...s, ...draft, setOn: draft.removeBy !== s.removeBy ? today : s.setOn } : s,
        ),
      );
    }
    setEditing(null);
  }

  const update = (id: string, patch: Partial<Stent>) => persist(stents.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  function remove(id: string) {
    if (window.confirm('Delete this stent from the register? This can’t be undone.')) {
      persist(stents.filter((s) => s.id !== id));
    }
  }

  const { active, removed } = sortStents(stents);
  const overdue = active.filter((s) => stentStatus(s, today) === 'overdue').length;
  const dueSoon = active.filter((s) => stentStatus(s, today) === 'due-soon').length;

  return (
    // The heading lives in the Residency header (ResidencyScreen).
    <div className="mx-auto max-w-wrap px-4 pb-12 pt-6 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="In situ" value={active.length} />
          <Stat label="This week" value={dueSoon} tone={dueSoon ? 'text-amber' : undefined} />
          <Stat label="Overdue" value={overdue} tone={overdue ? 'text-crimson' : undefined} />
        </div>

        {editing === 'new' ? (
          <StentForm initial={emptyDraft()} title="Add a stent" onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="min-h-[48px] w-full rounded-[12px] bg-violet py-3 text-[14.5px] font-semibold text-white transition hover:bg-violet-deep"
          >
            + Add a stent
          </button>
        )}

        <p className="text-[12.5px] leading-relaxed text-muted-2">
          {notificationsSupported()
            ? `You get a notification at 9:00, ${STENT_LEAD_DAYS} days before each remove-by date. `
            : 'Reminders arrive in the UroApp iPhone and iPad app. '}
          Stored only on this device and never backed up. Initials only — no names or record numbers.
        </p>
        {denied && (
          <p className="text-[12.5px] text-amber">
            Notifications are off for UroApp, so no reminders will arrive. Turn them on in Settings →
            Notifications → UroApp.
          </p>
        )}

        {loaded && active.length === 0 && editing !== 'new' && (
          <div className="rounded-[14px] border border-line bg-navy-2 px-5 py-8 text-center text-[13.5px] text-muted">
            No stents in the register. Add one after a case and it will remind you before it’s due out.
          </div>
        )}

        <ul className="space-y-3">
          {active.map((s) =>
            editing === s.id ? (
              <li key={s.id}>
                <StentForm initial={s} title="Edit stent" onSave={save} onCancel={() => setEditing(null)} />
              </li>
            ) : (
              <StentRow
                key={s.id}
                stent={s}
                today={today}
                onRemoved={() => update(s.id, { removed: today })}
                onEdit={() => setEditing(s.id)}
                onDelete={() => remove(s.id)}
              />
            ),
          )}
        </ul>

        {removed.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setShowRemoved((v) => !v)}
              aria-expanded={showRemoved}
              className="min-h-[44px] text-[13px] font-semibold text-violet-soft hover:text-ink"
            >
              {showRemoved ? 'Hide' : 'Show'} removed ({removed.length})
            </button>
            {showRemoved && (
              <ul className="mt-2 space-y-3">
                {removed.map((s) => (
                  <StentRow
                    key={s.id}
                    stent={s}
                    today={today}
                    onPutBack={() => update(s.id, { removed: '' })}
                    onDelete={() => remove(s.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-navy-2 p-3.5">
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-2">{label}</div>
      <div className={cn('mt-1 font-display text-[24px] font-semibold', tone)}>{value}</div>
    </div>
  );
}

function StentRow({
  stent: s,
  today,
  onRemoved,
  onPutBack,
  onEdit,
  onDelete,
}: {
  stent: Stent;
  today: string;
  onRemoved?: () => void;
  onPutBack?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  const status = stentStatus(s, today);
  const days = dwellDays(s, today);
  const action = 'min-h-[44px] rounded-[10px] px-3 text-[13px] font-semibold transition-colors';

  return (
    <li className="rounded-[14px] border border-line bg-navy-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">
            {s.label ? `Patient ${s.label}` : 'Stent'} · {SIDE_LABEL[s.side]}
            {s.size && <span className="font-normal text-muted"> · {s.size}</span>}
          </div>
          {s.note && <div className="mt-0.5 text-[13px] text-muted">{s.note}</div>}
          <div className="mt-1 text-[12px] text-muted-2">
            {s.inserted && `In ${formatDay(s.inserted)}`}
            {days !== null && ` · day ${days}`}
            {s.removed ? ` · removed ${formatDay(s.removed)}` : ` · remove by ${formatDay(s.removeBy)}`}
          </div>
        </div>
        <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold', STATUS_CHIP[status])}>
          {status === 'removed' ? 'Removed' : dueText(s, today)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {onRemoved && (
          <button type="button" onClick={onRemoved} className={cn(action, 'border border-violet bg-violet/[0.18] text-violet-soft hover:bg-violet/[0.26]')}>
            Mark removed
          </button>
        )}
        {onPutBack && (
          <button type="button" onClick={onPutBack} className={cn(action, 'border border-line bg-navy text-ink hover:border-violet')}>
            Put back in register
          </button>
        )}
        {onEdit && (
          <button type="button" onClick={onEdit} className={cn(action, 'border border-line bg-navy text-ink hover:border-violet')}>
            Edit
          </button>
        )}
        <button type="button" onClick={onDelete} className={cn(action, 'text-muted hover:text-ink')}>
          Delete
        </button>
      </div>
    </li>
  );
}

function StentForm({
  initial,
  title,
  onSave,
  onCancel,
}: {
  initial: Draft;
  title: string;
  onSave: (d: Draft) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<Draft>({
    label: initial.label,
    note: initial.note,
    side: initial.side,
    size: initial.size,
    inserted: initial.inserted,
    removeBy: initial.removeBy,
  });
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const idWarning = looksLikeIdentifier(d.label) || looksLikeIdentifier(d.note);
  const beforeInsert = d.inserted !== '' && d.removeBy !== '' && d.removeBy < d.inserted;
  const canSave = d.label.trim() !== '' && d.removeBy !== '' && !idWarning && !beforeInsert;

  return (
    <section className="rounded-[18px] border border-violet/50 bg-navy-2 p-5">
      <h3 className="mb-4 font-display text-[18px] font-semibold">{title}</h3>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="block">
          <span className={fieldLabel}>Patient initials</span>
          <input
            value={d.label}
            onChange={(e) => set({ label: e.target.value.slice(0, LABEL_MAX) })}
            placeholder="e.g. AM"
            autoCapitalize="characters"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={fieldLabel}>Size (optional)</span>
          <input
            value={d.size}
            onChange={(e) => set({ size: e.target.value.slice(0, SIZE_MAX) })}
            placeholder="e.g. 6 Fr 26 cm"
            className={inputCls}
          />
        </label>
      </div>

      <label className="mt-3.5 block">
        <span className={fieldLabel}>Short note (optional)</span>
        <input
          value={d.note}
          onChange={(e) => set({ note: e.target.value.slice(0, NOTE_MAX) })}
          placeholder="e.g. post-URS, 8 mm lower-pole stone"
          className={inputCls}
        />
      </label>

      <div className="mt-3.5">
        <span className={fieldLabel}>Side</span>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(SIDE_LABEL) as StentSide[]).map((side) => (
            <button
              key={side}
              type="button"
              aria-pressed={d.side === side}
              onClick={() => set({ side })}
              className={cn(
                'min-h-[44px] rounded-[10px] border px-2 text-[13px] transition-colors',
                d.side === side
                  ? 'border-violet bg-violet/[0.18] font-semibold text-violet-soft'
                  : 'border-line bg-navy text-muted hover:border-violet',
              )}
            >
              {SIDE_LABEL[side]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className="block">
          <span className={fieldLabel}>Inserted</span>
          <DateInput value={d.inserted} max={todayISO()} onChange={(v) => set({ inserted: v })} className={inputCls} label="Inserted" />
        </label>
        <label className="block">
          <span className={fieldLabel}>Remove by</span>
          <DateInput value={d.removeBy} onChange={(v) => set({ removeBy: v })} className={inputCls} label="Remove by" />
        </label>
      </div>

      {d.inserted && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {REMOVE_BY_SHORTCUTS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => set({ removeBy: shortcutDate(d.inserted, s) })}
              className="min-h-[36px] rounded-full border border-line bg-navy px-3 text-[12px] font-semibold text-muted transition-colors hover:border-violet hover:text-ink"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-[11.5px] text-muted-2">
        Shortcuts count from the insertion date. The remove-by date is your team’s plan; the app
        doesn’t suggest one.
      </p>

      {idWarning && (
        <p role="alert" className="mt-3 text-[12.5px] text-amber">
          That looks like a record or ID number. Use initials only — this register holds no identifiers.
        </p>
      )}
      {beforeInsert && (
        <p role="alert" className="mt-3 text-[12.5px] text-amber">
          The remove-by date is before the insertion date.
        </p>
      )}

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={() => onSave({ ...d, label: d.label.trim(), note: d.note.trim(), size: d.size.trim() })}
          disabled={!canSave}
          className="min-h-[44px] flex-1 rounded-[11px] bg-violet px-3 py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep disabled:opacity-40"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy px-3 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-violet"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
