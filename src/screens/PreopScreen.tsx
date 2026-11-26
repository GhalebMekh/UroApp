import { useEffect, useMemo, useState } from 'react';
import { CitationNote } from '@/components/CitationNote';
import { DateInput } from '@/components/DateInput';
import { SwipeRow } from '@/components/SwipeRow';
import { CheckIcon } from '@/components/icons';
import { PROCEDURES } from '@/data/procedures';
import { cn } from '@/lib/cn';
import { addDays, todayISO } from '@/lib/date';
import { getJSON, setJSON } from '@/lib/storage';
import { notificationsSupported, permissionState, PREOP_HOUR, requestPermission } from '@/lib/notifications';
import { looksLikeIdentifier } from '@/lib/stents';
import {
  ATTENDING_MAX,
  GENERAL_ITEMS,
  ITEM_MAX,
  KEEP_DAYS,
  LABEL_MAX,
  NOTE_MAX,
  OPERATION_MAX,
  PREOP_KEY,
  caseItems,
  dayText,
  emptyStore,
  generalItems,
  knownAttendings,
  normalizePreop,
  openCount,
  procedureItems,
  purgeOld,
  sortCases,
  type ChecklistItem,
  type PreopCase,
  type PreopStore,
} from '@/lib/preop';

const inputCls =
  'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-3 text-[13px] text-ink outline-none focus:border-violet';
const fieldLabel = 'mb-2 block text-[13px] font-medium text-muted';
const action = 'min-h-[44px] rounded-[10px] px-3 text-[13px] font-medium transition-colors';

/** The operation picker's value for "type my own". */
const OTHER = '__other';

type Draft = Pick<PreopCase, 'label' | 'note' | 'procedureId' | 'operation' | 'date' | 'attending'>;

/** Procedures grouped by category, for the picker. */
const GROUPS = (() => {
  const map = new Map<string, { id: string; name: string }[]>();
  for (const p of PROCEDURES) map.set(p.category, [...(map.get(p.category) ?? []), { id: p.id, name: p.name }]);
  return [...map].map(([category, items]) => ({
    category,
    items: items.sort((a, b) => a.name.localeCompare(b.name)),
  }));
})();

/**
 * Pre-op checklists (Residency → OR → Pre-op). Each case gets the general list
 * plus, for the app's own procedures, the cited "Before theatre" items. Stays on
 * this device behind the app lock; one reminder at 06:00 on the day if anything
 * is still open; cases clear themselves 2 days after surgery.
 */
export function PreopScreen() {
  const [store, setStore] = useState<PreopStore>(emptyStore);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // a case id, or 'new'
  const [open, setOpen] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [denied, setDenied] = useState(false);
  const today = todayISO();

  useEffect(() => {
    void getJSON<unknown>(PREOP_KEY, null).then((raw) => {
      const normal = normalizePreop(raw);
      const purged = purgeOld(normal, todayISO());
      setStore(purged);
      if (purged !== normal) void setJSON(PREOP_KEY, purged);
      setLoaded(true);
    });
    void permissionState().then((s) => setDenied(s === 'denied'));
  }, []);

  /** Every change builds on the latest state, so quick taps never overwrite each other. */
  function update(change: (prev: PreopStore) => PreopStore) {
    setStore((prev) => {
      const next = change(prev);
      void setJSON(PREOP_KEY, next);
      return next;
    });
  }

  function save(d: Draft) {
    if (editing === 'new') {
      const id = crypto.randomUUID();
      update((st) => ({
        ...st,
        cases: [...st.cases, { id, ...d, ticked: [] }],
      }));
      setOpen(id);
      // Ask for notification permission the first time a reminder is needed.
      void requestPermission().then((ok) => setDenied(!ok && notificationsSupported()));
    } else {
      update((st) => ({
        ...st,
        cases: st.cases.map((c) =>
          c.id === editing
            ? {
                ...c,
                ...d,
                // A different procedure brings different items; keep only the general ticks.
                ticked: d.procedureId === c.procedureId ? c.ticked : c.ticked.filter((t) => !t.startsWith('p:')),
              }
            : c,
        ),
      }));
    }
    setEditing(null);
  }

  function toggle(caseId: string, itemId: string) {
    update((st) => ({
      ...st,
      cases: st.cases.map((c) =>
        c.id !== caseId
          ? c
          : {
              ...c,
              ticked: c.ticked.includes(itemId) ? c.ticked.filter((t) => t !== itemId) : [...c.ticked, itemId],
            },
      ),
    }));
  }

  function remove(id: string) {
    if (window.confirm('Delete this case and its checklist? This can’t be undone.')) {
      update((st) => ({ ...st, cases: st.cases.filter((c) => c.id !== id) }));
    }
  }

  const { upcoming, past } = sortCases(store.cases, today);
  const todayCases = upcoming.filter((c) => c.date === today);
  const openItems = upcoming.reduce((n, c) => n + openCount(c, store), 0);

  const renderCase = (c: PreopCase) =>
    editing === c.id ? (
      <li key={c.id}>
        <CaseForm
          initial={c}
          title="Edit case"
          onSave={save}
          onCancel={() => setEditing(null)}
          today={today}
          attendings={knownAttendings(store.cases)}
        />
      </li>
    ) : (
      <CaseCard
        key={c.id}
        c={c}
        store={store}
        today={today}
        expanded={open === c.id}
        onToggleOpen={() => setOpen((o) => (o === c.id ? null : c.id))}
        onTick={(itemId) => toggle(c.id, itemId)}
        onEdit={() => setEditing(c.id)}
        onDelete={() => remove(c.id)}
      />
    );

  return (
    // The heading lives in the Residency header (ResidencyScreen).
    <div className="mx-auto max-w-wrap px-4 pb-12 pt-6 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Upcoming" value={upcoming.length} />
          <Stat label="Today" value={todayCases.length} />
          <Stat label="Open items" value={openItems} tone={openItems ? 'text-amber' : undefined} />
        </div>

        {editing === 'new' ? (
          <CaseForm
            initial={{
              label: '',
              note: '',
              procedureId: '',
              operation: '',
              date: addDays(today, 1),
              attending: '',
            }}
            title="Add a case"
            onSave={save}
            onCancel={() => setEditing(null)}
            today={today}
            attendings={knownAttendings(store.cases)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="min-h-[48px] w-full rounded-[12px] bg-violet-deep py-3 text-[14px] font-medium text-white transition hover:bg-violet-press"
          >
            + Add a case
          </button>
        )}

        <p className="text-[12px] leading-relaxed text-muted-2">
          {notificationsSupported()
            ? `If anything is still unticked, you get one notification at ${PREOP_HOUR}:00 on the day of surgery. `
            : 'Reminders arrive in the UroApp iPhone and iPad app. '}
          Cases delete themselves {KEEP_DAYS} days after the operation. Stored only on this device and never backed up.
          Initials only, no names or record numbers. Swipe a case left to delete it, or press and hold it for Edit and
          Delete.
        </p>
        {denied && (
          <p className="text-[12px] text-amber">
            Notifications are off for UroApp, so no reminders will arrive. Turn them on in Settings → Notifications →
            UroApp.
          </p>
        )}

        {loaded && upcoming.length === 0 && editing !== 'new' && (
          <div className="rounded-[14px] border border-line bg-navy-2 px-5 py-8 text-center text-[13px] text-muted">
            No cases yet. Add tomorrow’s list and tick each item off as it’s done.
          </div>
        )}

        <ul className="space-y-3">{upcoming.map(renderCase)}</ul>

        {past.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setShowPast((v) => !v)}
              aria-expanded={showPast}
              className="min-h-[44px] text-[13px] font-medium text-violet-soft hover:text-ink"
            >
              {showPast ? 'Hide' : 'Show'} done ({past.length})
            </button>
            {showPast && <ul className="mt-2 space-y-3">{past.map(renderCase)}</ul>}
          </section>
        )}

        <section className="rounded-[14px] border border-line bg-navy-2">
          <button
            type="button"
            onClick={() => setCustomising((v) => !v)}
            aria-expanded={customising}
            className="flex min-h-[48px] w-full items-center justify-between px-4 text-left text-[14px] font-medium text-ink"
          >
            Customise the general list
            <span className="text-[12px] font-normal text-muted-2">{generalItems(store).length} items</span>
          </button>
          {customising && <Customise store={store} onChange={update} />}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-navy-2 p-3.5">
      <div className="text-[12px] text-muted-2">{label}</div>
      <div className={cn('mt-1 font-mono text-[24px] font-medium', tone)}>{value}</div>
    </div>
  );
}

function CaseCard({
  c,
  store,
  today,
  expanded,
  onToggleOpen,
  onTick,
  onEdit,
  onDelete,
}: {
  c: PreopCase;
  store: PreopStore;
  today: string;
  expanded: boolean;
  onToggleOpen: () => void;
  onTick: (itemId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const total = caseItems(c, store).length;
  const left = openCount(c, store);
  const done = total - left;
  const isPast = c.date < today;
  const general = generalItems(store);
  const proc = procedureItems(c.procedureId);
  const ticked = new Set(c.ticked);

  const chip = isPast
    ? 'border-line bg-steel text-muted-2'
    : left === 0
      ? 'border-teal/40 bg-teal/[0.12] text-teal'
      : c.date === today
        ? 'border-amber/40 bg-amber/[0.12] text-amber'
        : 'border-line bg-steel text-muted';

  return (
    <li className="overflow-hidden rounded-[14px] border border-line bg-navy-2">
      <SwipeRow onEdit={onEdit} onDelete={onDelete} className="rounded-none">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={expanded}
          className="flex w-full select-none items-start justify-between gap-3 bg-navy-2 p-4 text-left [-webkit-touch-callout:none]"
        >
          <div className="min-w-0">
            <div className="text-[15px] font-medium text-ink">
              {c.label ? `Patient ${c.label}` : 'Case'} · <span className="font-normal">{c.operation}</span>
            </div>
            {c.note && <div className="mt-0.5 text-[13px] text-muted">{c.note}</div>}
            <div className="mt-1 text-[12px] text-muted-2">
              {dayText(c.date, today)}
              {c.attending && ` · ${c.attending}`} · {done} of {total} done
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-steel">
              <div
                className="h-full rounded-full bg-violet-deep transition-[width]"
                style={{ width: total ? `${(done / total) * 100}%` : 0 }}
              />
            </div>
          </div>
          <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] font-medium', chip)}>
            {isPast ? 'Done' : left === 0 ? 'Ready' : `${left} open`}
          </span>
        </button>
      </SwipeRow>

      {expanded && (
        <div className="border-t border-line px-4 pb-4 pt-3">
          <ItemList items={general} ticked={ticked} onTick={onTick} />
          {proc.items.length > 0 && (
            <>
              <h4 className="mb-1 mt-4 text-[12px] font-medium text-muted-2">
                For this operation
              </h4>
              <ItemList items={proc.items} ticked={ticked} onTick={onTick} />
              {proc.source && (
                <div className="mt-2">
                  <CitationNote citation={proc.source} />
                </div>
              )}
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className={cn(action, 'border border-line bg-navy text-ink hover:border-violet')}
            >
              Edit
            </button>
            <button type="button" onClick={onDelete} className={cn(action, 'text-muted hover:text-ink')}>
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function ItemList({
  items,
  ticked,
  onTick,
}: {
  items: ChecklistItem[];
  ticked: Set<string>;
  onTick: (id: string) => void;
}) {
  return (
    <ul>
      {items.map((it) => {
        const on = ticked.has(it.id);
        return (
          <li key={it.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onTick(it.id)}
              className="flex min-h-[44px] w-full items-start gap-3 py-2 text-left"
            >
              <span
                className={cn(
                  'mt-[1px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[8px] border transition-colors',
                  on ? 'border-violet bg-violet-deep text-white' : 'border-line bg-navy',
                )}
              >
                {on && <CheckIcon className="text-[15px]" />}
              </span>
              <span className={cn('text-[13px] leading-snug', on ? 'text-muted-2 line-through' : 'text-ink')}>
                {it.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CaseForm({
  initial,
  title,
  onSave,
  onCancel,
  today,
  attendings,
}: {
  initial: Draft;
  title: string;
  onSave: (d: Draft) => void;
  onCancel: () => void;
  today: string;
  /** Names used before, offered as suggestions. */
  attendings: string[];
}) {
  const [d, setD] = useState<Draft>({
    label: initial.label,
    note: initial.note,
    procedureId: initial.procedureId,
    operation: initial.operation,
    date: initial.date,
    attending: initial.attending,
  });
  const [other, setOther] = useState(initial.operation !== '' && initial.procedureId === '');
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const pick = useMemo(() => (other ? OTHER : d.procedureId), [other, d.procedureId]);
  const idWarning = [d.label, d.note, d.operation, d.attending].some(looksLikeIdentifier);
  const canSave =
    d.label.trim() !== '' && d.operation.trim() !== '' && d.attending.trim() !== '' && d.date !== '' && !idWarning;

  return (
    <section className="rounded-[16px] border border-violet/50 bg-navy-2 p-5">
      <h3 className="mb-4 font-display text-[18px] font-medium">{title}</h3>

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
          <span className={fieldLabel}>Day of surgery</span>
          <DateInput
            value={d.date}
            min={today}
            onChange={(v) => set({ date: v })}
            className={inputCls}
            label="Day of surgery"
          />
        </label>
      </div>

      <label className="mt-3.5 block">
        <span className={fieldLabel}>Operation</span>
        <select
          value={pick}
          onChange={(e) => {
            const v = e.target.value;
            if (v === OTHER) {
              setOther(true);
              set({ procedureId: '', operation: '' });
            } else {
              setOther(false);
              set({
                procedureId: v,
                operation: PROCEDURES.find((p) => p.id === v)?.name ?? '',
              });
            }
          }}
          className={inputCls}
        >
          <option value="" disabled>
            Choose an operation
          </option>
          {GROUPS.map((g) => (
            <optgroup key={g.category} label={g.category}>
              {g.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={OTHER}>Other operation (type it)</option>
        </select>
      </label>
      {other && (
        <input
          value={d.operation}
          onChange={(e) => set({ operation: e.target.value.slice(0, OPERATION_MAX) })}
          placeholder="e.g. Botox bladder injection"
          aria-label="Operation name"
          className={cn(inputCls, 'mt-2')}
        />
      )}
      <p className="mt-2 text-[12px] text-muted-2">
        The app’s procedures add their own items from the cited “Before theatre” section; any other operation gets the
        general list.
      </p>

      <label className="mt-3.5 block">
        <span className={fieldLabel}>Attending</span>
        <input
          value={d.attending}
          onChange={(e) => set({ attending: e.target.value.slice(0, ATTENDING_MAX) })}
          placeholder="e.g. Dr Hassan"
          list="preop-attendings"
          autoCapitalize="words"
          className={inputCls}
        />
        <datalist id="preop-attendings">
          {attendings.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </label>

      <label className="mt-3.5 block">
        <span className={fieldLabel}>Short note (optional)</span>
        <input
          value={d.note}
          onChange={(e) => set({ note: e.target.value.slice(0, NOTE_MAX) })}
          placeholder="e.g. left side, first on the list"
          className={inputCls}
        />
      </label>

      {idWarning && (
        <p role="alert" className="mt-3 text-[12px] text-amber">
          That looks like a record or ID number. Use initials only; this list holds no identifiers.
        </p>
      )}

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={() =>
            onSave({
              ...d,
              label: d.label.trim(),
              note: d.note.trim(),
              operation: d.operation.trim(),
              attending: d.attending.trim(),
            })
          }
          disabled={!canSave}
          className="min-h-[44px] flex-1 rounded-[10px] bg-violet-deep px-3 py-3 text-[14px] font-medium text-white transition hover:bg-violet-press disabled:opacity-40"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] flex-1 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[14px] font-medium text-ink transition-colors hover:border-violet"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}

function Customise({
  store,
  onChange,
}: {
  store: PreopStore;
  onChange: (change: (prev: PreopStore) => PreopStore) => void;
}) {
  const [text, setText] = useState('');
  const hidden = new Set(store.hidden);
  const idWarning = looksLikeIdentifier(text);

  function add() {
    const t = text.trim();
    if (!t || idWarning) return;
    const item = { id: `c:${crypto.randomUUID()}`, text: t };
    onChange((st) => ({ ...st, custom: [...st.custom, item] }));
    setText('');
  }

  return (
    <div className="border-t border-line px-4 pb-4 pt-2">
      <p className="py-2 text-[12px] text-muted-2">Changes apply to every case. Hidden items come back with Show.</p>
      <ul>
        {GENERAL_ITEMS.map((g) => {
          const off = hidden.has(g.id);
          return (
            <li
              key={g.id}
              className="flex min-h-[44px] items-center justify-between gap-3 border-b border-line/60 py-1.5"
            >
              <span className={cn('text-[13px]', off ? 'text-muted-2 line-through' : 'text-ink')}>{g.text}</span>
              <button
                type="button"
                onClick={() =>
                  onChange((st) => ({
                    ...st,
                    hidden: off ? st.hidden.filter((h) => h !== g.id) : [...st.hidden, g.id],
                  }))
                }
                className={cn(action, 'shrink-0 text-violet-soft hover:text-ink')}
              >
                {off ? 'Show' : 'Hide'}
              </button>
            </li>
          );
        })}
        {store.custom.map((c) => (
          <li
            key={c.id}
            className="flex min-h-[44px] items-center justify-between gap-3 border-b border-line/60 py-1.5"
          >
            <span className="text-[13px] text-ink">{c.text}</span>
            <button
              type="button"
              onClick={() =>
                onChange((st) => ({
                  ...st,
                  custom: st.custom.filter((x) => x.id !== c.id),
                }))
              }
              className={cn(action, 'shrink-0 text-muted hover:text-ink')}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, ITEM_MAX))}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add your own, e.g. Book ICU bed"
          aria-label="New checklist item"
          className={inputCls}
        />
        <button
          type="button"
          onClick={add}
          disabled={!text.trim() || idWarning}
          className="min-h-[44px] shrink-0 rounded-[10px] bg-violet-deep px-4 text-[13px] font-medium text-white transition hover:bg-violet-press disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {idWarning && (
        <p role="alert" className="mt-2 text-[12px] text-amber">
          That looks like a record or ID number. Items are shared by every case, so no identifiers.
        </p>
      )}
    </div>
  );
}
