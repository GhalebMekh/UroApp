import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { getJSON, setJSON } from '@/lib/storage';
import { escapeHtml, printDocument, saveDocument } from '@/lib/print';
import { todayISO } from '@/lib/date';
import {
  ALERT_COLOURS,
  CHANNEL_LABELS,
  COLOUR_LABELS,
  TIP_LABELS,
  catheterDays,
  cbiChannelMismatch,
  describeCatheter,
  emptyCatheter,
  isRetaining,
  netOutput,
  type Catheter,
  type CatheterChannels,
  type CatheterTip,
  type UrineColour,
  type UrineEntry,
} from '@/lib/catheter';
import {
  countOutstanding,
  countOverdue,
  dueLabel,
  reminderStatus,
  sortReminders,
  type Reminder,
  type ReminderStatus,
} from '@/lib/reminders';

type Admission = 'elective' | 'er';
type Sex = 'male' | 'female' | '';

interface Exam {
  general: string;
  abdomen: string;
  other: string;
}
interface Labs {
  hb: string;
  wbc: string;
  plt: string;
  cr: string;
  egfr: string;
  na: string;
  k: string;
  crp: string;
  other: string;
}
interface SoapNote {
  id: string;
  date: string; // ISO datetime
  s: string;
  o: string;
  a: string;
  p: string;
}

interface Patient {
  id: string;
  /** First name or initials — never a full name or an MRN (de-identified, CLAUDE.md). */
  name: string;
  age: string;
  sex: Sex;
  location: string; // bed / ward
  admission: Admission;
  reason: string; // "admitted as case of"
  pmh: string;
  psh: string;
  meds: string;
  exam: Exam;
  labs: Labs;
  imaging: string;
  activeIssues: string;
  catheter: Catheter;
  reminders: Reminder[];
  notes: SoapNote[];
}

const STORAGE_KEY = 'uroapp.rounding.v1';

const EXAM_FIELDS: { key: keyof Exam; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'other', label: 'Other' },
];
const LAB_FIELDS: { key: keyof Labs; label: string }[] = [
  { key: 'hb', label: 'Hb' },
  { key: 'wbc', label: 'WBC' },
  { key: 'plt', label: 'Platelets' },
  { key: 'cr', label: 'Creatinine' },
  { key: 'egfr', label: 'eGFR' },
  { key: 'na', label: 'Na' },
  { key: 'k', label: 'K' },
  { key: 'crp', label: 'CRP' },
];

const emptyExam = (): Exam => ({ general: '', abdomen: '', other: '' });
const emptyLabs = (): Labs => ({ hb: '', wbc: '', plt: '', cr: '', egfr: '', na: '', k: '', crp: '', other: '' });

function emptyPatient(): Patient {
  return {
    id: crypto.randomUUID(),
    name: '',
    age: '',
    sex: '',
    location: '',
    admission: 'er',
    reason: '',
    pmh: '',
    psh: '',
    meds: '',
    exam: emptyExam(),
    labs: emptyLabs(),
    imaging: '',
    activeIssues: '',
    catheter: emptyCatheter(),
    reminders: [],
    notes: [],
  };
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** One of `allowed`, else ''. Keeps stored enums safe across schema changes. */
function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | '' {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : '';
}

/** Patients saved before reminders existed have no `reminders` key. */
function normalizeReminders(raw: unknown): Reminder[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).map((r) => ({
    id: str(r.id) || crypto.randomUUID(),
    text: str(r.text),
    due: str(r.due),
    done: r.done === true,
  }));
}

/** Patients saved before the catheter field existed have no `catheter` key. */
function normalizeCatheter(raw: unknown): Catheter {
  if (!raw || typeof raw !== 'object') return emptyCatheter();
  const c = raw as Record<string, unknown>;
  const log = Array.isArray(c.log) ? (c.log as Record<string, unknown>[]) : [];
  return {
    present: c.present === true,
    inserted: str(c.inserted),
    size: str(c.size),
    tip: oneOf<Exclude<CatheterTip, ''>>(c.tip, ['regular', 'coude']),
    channels: oneOf<Exclude<CatheterChannels, ''>>(c.channels, ['2-way', '3-way']),
    cbi: c.cbi === true,
    fixation: str(c.fixation),
    log: log.map((e) => ({
      id: str(e.id) || crypto.randomUUID(),
      datetime: str(e.datetime) || new Date().toISOString(),
      volume: str(e.volume),
      irrigation: str(e.irrigation),
      colour: oneOf<Exclude<UrineColour, ''>>(e.colour, [
        'clear',
        'straw',
        'concentrated',
        'pink',
        'frank',
        'clots',
      ]),
    })),
  };
}

/** Coerce stored data (including the legacy pre-SOAP shape) into a Patient. */
function normalize(raw: Record<string, unknown>): Patient {
  const exam = (raw.exam ?? {}) as Record<string, unknown>;
  const labs = (raw.labs ?? {}) as Record<string, unknown>;
  const sex = raw.sex;
  const notes = Array.isArray(raw.notes) ? (raw.notes as Record<string, unknown>[]) : [];
  return {
    id: str(raw.id) || crypto.randomUUID(),
    name: str(raw.name) || str(raw.alias),
    age: str(raw.age),
    sex: sex === 'male' || sex === 'female' ? sex : '',
    location: str(raw.location),
    admission: raw.admission === 'elective' ? 'elective' : 'er',
    reason: str(raw.reason),
    pmh: str(raw.pmh) || str(raw.pmhPsh),
    psh: str(raw.psh),
    meds: str(raw.meds) || str(raw.uroMeds),
    exam: { general: str(exam.general), abdomen: str(exam.abdomen), other: str(exam.other) },
    labs: { ...emptyLabs(), hb: str(labs.hb), wbc: str(labs.wbc), plt: str(labs.plt), cr: str(labs.cr), egfr: str(labs.egfr), na: str(labs.na), k: str(labs.k), crp: str(labs.crp), other: str(labs.other) },
    imaging: str(raw.imaging),
    activeIssues: str(raw.activeIssues),
    catheter: normalizeCatheter(raw.catheter),
    reminders: normalizeReminders(raw.reminders),
    notes: notes.map((n) => ({
      id: str(n.id) || crypto.randomUUID(),
      date: str(n.date) || new Date().toISOString(),
      s: str(n.s) || str(n.text), // legacy free-text note → Subjective
      o: str(n.o),
      a: str(n.a),
      p: str(n.p),
    })),
  };
}

export function RoundingScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    getJSON<Record<string, unknown>[]>(STORAGE_KEY, []).then((p) => {
      setPatients(p.map(normalize));
      setLoaded(true);
    });
  }, []);

  function persist(next: Patient[]) {
    setPatients(next);
    void setJSON(STORAGE_KEY, next);
  }

  const selected = patients.find((p) => p.id === selectedId) ?? null;

  function addPatient() {
    const p = emptyPatient();
    persist([p, ...patients]);
    setSelectedId(p.id);
  }
  function update(patch: Partial<Patient>) {
    if (!selected) return;
    persist(patients.map((p) => (p.id === selected.id ? { ...p, ...patch } : p)));
  }
  function remove(id: string) {
    persist(patients.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Rounding
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Ward round list.
      </h2>
      <p className="max-w-2xl text-[15px] text-muted">
        A working list for your patients, stored only on this device.{' '}
        <b className="text-ink">De-identified — a first name or initials and a bed/ward, never a full
        name or MRN.</b>{' '}
        A personal aide-mémoire, not a medical record.
      </p>

      {selected ? (
        <PatientDetail
          patient={selected}
          onBack={() => setSelectedId(null)}
          onChange={update}
          onDelete={() => remove(selected.id)}
        />
      ) : (
        <PatientList
          patients={patients}
          loaded={loaded}
          onAdd={addPatient}
          onOpen={setSelectedId}
          onDelete={remove}
        />
      )}
    </div>
  );
}

function AdmissionBadge({ admission }: { admission: Admission }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-[7px] px-2.5 py-1 text-[11px] font-semibold',
        admission === 'er' ? 'bg-crimson/[0.16] text-crimson' : 'bg-teal/[0.16] text-teal',
      )}
    >
      {admission === 'er' ? 'ER' : 'Elective'}
    </span>
  );
}

/** Overdue count if any, else the outstanding count — nothing when all clear. */
function ReminderBadge({ reminders }: { reminders: Reminder[] }) {
  const overdue = countOverdue(reminders);
  const outstanding = countOutstanding(reminders);
  if (outstanding === 0) return null;

  return (
    <span
      title={overdue > 0 ? `${overdue} overdue` : `${outstanding} outstanding`}
      className={cn(
        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        overdue > 0
          ? 'border-crimson/50 bg-crimson/[0.12] text-crimson'
          : 'border-line bg-steel text-muted-2',
      )}
    >
      {overdue > 0 ? `${overdue} overdue` : `${outstanding} to do`}
    </span>
  );
}

function PatientList({
  patients,
  loaded,
  onAdd,
  onOpen,
  onDelete,
}: {
  patients: Patient[];
  loaded: boolean;
  onAdd: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [handoverError, setHandoverError] = useState(false);
  const stem = `ward-handover-${todayISO()}`;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="min-h-[44px] rounded-[11px] bg-violet px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep"
        >
          + Add patient
        </button>
        {patients.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setHandoverError(!printDocument('Ward handover', buildHandoverHtml(patients)))}
              className="min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-4 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:border-violet"
            >
              Print handover
            </button>
            <button
              type="button"
              onClick={() => setHandoverError(!saveDocument('Ward handover', buildHandoverHtml(patients), '', stem))}
              className="min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-4 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:border-teal"
            >
              Save handover
            </button>
          </>
        )}
      </div>
      {handoverError && (
        <p className="mt-3 rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
          Printing was blocked. Use Save handover instead, or your browser’s own Print command.
        </p>
      )}

      <div className="mt-6 space-y-2.5">
        {!loaded ? (
          <p className="text-[13px] text-muted-2">Loading…</p>
        ) : patients.length === 0 ? (
          <div className="rounded-[16px] border border-line bg-navy-2 p-6 text-center text-[14px] text-muted">
            No patients on your list. Add one to start rounding.
          </div>
        ) : (
          patients.map((p) => {
            const meta = [
              p.age && `${p.age}y`,
              p.sex,
              p.location && `Bed ${p.location}`,
              p.reason,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <article key={p.id} className="flex items-center gap-3 rounded-[14px] border border-line bg-navy-2 p-4">
                <button type="button" onClick={() => onOpen(p.id)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-semibold">{p.name || 'Unnamed'}</span>
                    <AdmissionBadge admission={p.admission} />
                    <ReminderBadge reminders={p.reminders} />
                  </div>
                  <div className="mt-0.5 truncate text-[12.5px] text-muted-2">{meta || 'Tap to add details'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  aria-label="Remove patient"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-line text-muted-2 transition-colors hover:border-crimson hover:text-crimson"
                >
                  ✕
                </button>
              </article>
            );
          })
        )}
      </div>
    </>
  );
}

const inputCls =
  'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13.5px] text-ink outline-none focus:border-violet';

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[13px] font-semibold text-muted">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className={cn(inputCls, 'resize-y')} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      )}
    </label>
  );
}

/** A labelled row of mutually-exclusive chips; clicking the active one clears it. */
function ChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | '';
  options: { value: T; label: string }[];
  onChange: (v: T | '') => void;
}) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[13px] font-semibold text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? '' : o.value)}
            className={cn(
              'min-h-[44px] flex-1 rounded-[10px] border px-3 text-[12px] font-semibold transition-colors',
              value === o.value
                ? 'border-violet bg-violet/[0.18] text-violet-soft'
                : 'border-line bg-navy text-muted hover:border-violet',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </label>
  );
}

const REMINDER_ACCENT: Record<ReminderStatus, string> = {
  overdue: 'border-crimson/50 bg-crimson/[0.1] text-crimson',
  soon: 'border-amber/50 bg-amber/[0.1] text-amber',
  upcoming: 'border-teal/40 bg-teal/[0.08] text-teal',
  undated: 'border-line bg-navy text-muted-2',
  done: 'border-line bg-navy text-muted-2',
};

function RemindersSection({
  reminders,
  onChange,
}: {
  reminders: Reminder[];
  onChange: (next: Reminder[]) => void;
}) {
  const [text, setText] = useState('');
  const [due, setDue] = useState('');

  const sorted = sortReminders(reminders);
  const overdue = countOverdue(reminders);

  function add() {
    if (!text.trim()) return;
    onChange([{ id: crypto.randomUUID(), text: text.trim(), due, done: false }, ...reminders]);
    setText('');
    setDue('');
  }

  return (
    <Section title="Plan reminders">
      {overdue > 0 && (
        <div className="rounded-[10px] border border-crimson/40 bg-crimson/[0.1] px-3 py-2 text-[12.5px] text-crimson">
          {overdue} {overdue === 1 ? 'reminder is' : 'reminders are'} overdue.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_auto]">
        <Field
          label="What needs doing"
          value={text}
          onChange={setText}
          placeholder="e.g. Chase histology; repeat Hb; book stent removal"
        />
        <label className="block">
          <span className="mb-[7px] block text-[13px] font-semibold text-muted">Due (optional)</span>
          <input
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={add}
        className="min-h-[44px] w-full rounded-[10px] border border-violet bg-violet/[0.18] px-3 text-[13px] font-semibold text-violet-soft transition-colors hover:bg-violet/[0.26]"
      >
        Add reminder
      </button>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-[13px] text-muted-2">No reminders yet.</p>
        ) : (
          sorted.map((r) => {
            const status = reminderStatus(r);
            return (
              <div
                key={r.id}
                className={cn(
                  'flex items-start gap-3 rounded-[10px] border px-3 py-2.5',
                  status === 'overdue' ? 'border-crimson/50 bg-crimson/[0.08]' : 'border-line bg-navy',
                )}
              >
                <button
                  type="button"
                  aria-pressed={r.done}
                  aria-label={r.done ? 'Mark not done' : 'Mark done'}
                  onClick={() =>
                    onChange(reminders.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)))
                  }
                  className={cn(
                    'mt-px grid h-6 w-6 shrink-0 place-items-center rounded-[6px] border text-[12px] transition-colors',
                    r.done
                      ? 'border-teal bg-teal/20 text-teal'
                      : 'border-line bg-steel text-transparent hover:border-teal',
                  )}
                >
                  ✓
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-[13.5px]',
                      r.done ? 'text-muted-2 line-through' : 'text-ink',
                    )}
                  >
                    {r.text}
                  </div>
                  <span
                    className={cn(
                      'mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px]',
                      REMINDER_ACCENT[status],
                    )}
                  >
                    {dueLabel(r)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onChange(reminders.filter((x) => x.id !== r.id))}
                  className="shrink-0 text-[11px] text-muted-2 hover:text-crimson"
                >
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>
    </Section>
  );
}

function CatheterSection({
  catheter: c,
  onChange,
}: {
  catheter: Catheter;
  onChange: (patch: Partial<Catheter>) => void;
}) {
  const [entry, setEntry] = useState<{ volume: string; irrigation: string; colour: UrineColour }>({
    volume: '',
    irrigation: '',
    colour: '',
  });

  const days = catheterDays(c.inserted);
  const mismatch = cbiChannelMismatch(c);

  function addEntry() {
    if (!entry.volume.trim() && !entry.colour) return;
    const next: UrineEntry = {
      id: crypto.randomUUID(),
      datetime: new Date().toISOString(),
      ...entry,
    };
    onChange({ log: [next, ...c.log] });
    setEntry({ volume: '', irrigation: '', colour: '' });
  }

  return (
    <Section title="Urinary catheter">
      <button
        type="button"
        onClick={() => onChange({ present: !c.present })}
        className={cn(
          'min-h-[44px] w-full rounded-[10px] border px-3 text-[13px] font-semibold transition-colors',
          c.present
            ? 'border-violet bg-violet/[0.18] text-violet-soft'
            : 'border-line bg-navy text-muted hover:border-violet',
        )}
      >
        {c.present ? 'Catheter in situ' : 'No catheter — tap to add'}
      </button>

      {c.present && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-[7px] block text-[13px] font-semibold text-muted">Inserted</span>
              <input
                type="date"
                value={c.inserted}
                max={todayISO()}
                onChange={(e) => onChange({ inserted: e.target.value })}
                className={inputCls}
              />
            </label>
            <Field label="Size (Fr)" value={c.size} onChange={(v) => onChange({ size: v })} placeholder="e.g. 18" />
          </div>

          {days !== null && (
            <div className="rounded-[10px] border border-line bg-navy px-3 py-2 text-[12.5px] text-muted-2">
              In situ <span className="font-mono text-ink">day {days}</span> — infection risk rises
              with dwell time; review the need for it daily.
            </div>
          )}

          <ChipRow<Exclude<CatheterTip, ''>>
            label="Tip"
            value={c.tip}
            onChange={(v) => onChange({ tip: v })}
            options={[
              { value: 'regular', label: TIP_LABELS.regular },
              { value: 'coude', label: TIP_LABELS.coude },
            ]}
          />

          <ChipRow<Exclude<CatheterChannels, ''>>
            label="Channels"
            value={c.channels}
            onChange={(v) => onChange({ channels: v })}
            options={[
              { value: '2-way', label: CHANNEL_LABELS['2-way'] },
              { value: '3-way', label: CHANNEL_LABELS['3-way'] },
            ]}
          />

          <button
            type="button"
            onClick={() => onChange({ cbi: !c.cbi })}
            className={cn(
              'min-h-[44px] w-full rounded-[10px] border px-3 text-[12px] font-semibold transition-colors',
              c.cbi
                ? 'border-teal bg-teal/[0.16] text-teal'
                : 'border-line bg-navy text-muted hover:border-teal',
            )}
          >
            {c.cbi ? 'On continuous bladder irrigation' : 'Not on irrigation'}
          </button>

          {mismatch && (
            <div className="rounded-[10px] border border-amber/40 bg-amber/[0.1] px-3 py-2 text-[12.5px] text-amber">
              CBI runs through the third channel — a 2-way catheter cannot irrigate. Check the
              catheter actually in situ.
            </div>
          )}

          <Field
            label="Fixation"
            value={c.fixation}
            onChange={(v) => onChange({ fixation: v })}
            placeholder="e.g. thigh strap; abdominal wall post-hypospadias"
          />

          {/* Output log */}
          <div className="border-t border-line pt-3.5">
            <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-teal">
              Urine output
            </div>

            <div className={cn('grid gap-2.5', c.cbi ? 'grid-cols-2' : 'grid-cols-1')}>
              <Field
                label="Drained (mL)"
                value={entry.volume}
                onChange={(v) => setEntry((p) => ({ ...p, volume: v }))}
                placeholder="e.g. 450"
              />
              {c.cbi && (
                <Field
                  label="Irrigant in (mL)"
                  value={entry.irrigation}
                  onChange={(v) => setEntry((p) => ({ ...p, irrigation: v }))}
                  placeholder="e.g. 2000"
                />
              )}
            </div>

            <div className="mt-2.5">
              <ChipRow<Exclude<UrineColour, ''>>
                label="Colour"
                value={entry.colour}
                onChange={(v) => setEntry((p) => ({ ...p, colour: v }))}
                options={(Object.keys(COLOUR_LABELS) as Exclude<UrineColour, ''>[]).map((k) => ({
                  value: k,
                  label: COLOUR_LABELS[k],
                }))}
              />
            </div>

            {c.cbi && (
              <p className="mt-2 text-[12px] text-muted-2">
                On CBI the bag collects irrigant plus urine — record both so the true output is
                the difference, not the bag volume.
              </p>
            )}

            <button
              type="button"
              onClick={addEntry}
              className="mt-3 min-h-[44px] w-full rounded-[10px] border border-violet bg-violet/[0.18] px-3 text-[13px] font-semibold text-violet-soft transition-colors hover:bg-violet/[0.26]"
            >
              Add reading
            </button>

            <div className="mt-3.5 space-y-2">
              {c.log.length === 0 ? (
                <p className="text-[13px] text-muted-2">No readings yet.</p>
              ) : (
                c.log.map((e) => {
                  const net = netOutput(e, c.cbi);
                  const retaining = isRetaining(e, c.cbi);
                  const alert = retaining || (e.colour && ALERT_COLOURS.includes(e.colour));
                  return (
                    <div
                      key={e.id}
                      className={cn(
                        'rounded-[10px] border px-3 py-2.5',
                        alert ? 'border-crimson/50 bg-crimson/[0.08]' : 'border-line bg-navy',
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[11px] text-muted-2">
                          {new Date(e.datetime).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => onChange({ log: c.log.filter((x) => x.id !== e.id) })}
                          className="text-[11px] text-muted-2 hover:text-crimson"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px]">
                        {net !== null && (
                          <span className="font-mono text-ink">
                            {net} mL
                            {c.cbi && <span className="text-muted-2"> net</span>}
                          </span>
                        )}
                        {c.cbi && e.volume.trim() && (
                          <span className="text-[11.5px] text-muted-2">
                            ({e.volume} drained − {e.irrigation.trim() || '0'} in)
                          </span>
                        )}
                        {e.colour && (
                          <span className={cn(ALERT_COLOURS.includes(e.colour) ? 'text-crimson' : 'text-muted')}>
                            {COLOUR_LABELS[e.colour]}
                          </span>
                        )}
                      </div>
                      {retaining && (
                        <div className="mt-1.5 text-[12px] text-crimson">
                          More irrigant in than out — check for clot retention and a blocked
                          catheter; the bladder may be filling.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3.5 rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[18px] font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function PatientDetail({
  patient,
  onBack,
  onChange,
  onDelete,
}: {
  patient: Patient;
  onBack: () => void;
  onChange: (patch: Partial<Patient>) => void;
  onDelete: () => void;
}) {
  const [view, setView] = useState<'edit' | 'summary'>('edit');
  const [note, setNote] = useState<{ s: string; o: string; a: string; p: string }>({ s: '', o: '', a: '', p: '' });

  const setExam = (key: keyof Exam, v: string) => onChange({ exam: { ...patient.exam, [key]: v } });
  const setLabs = (key: keyof Labs, v: string) => onChange({ labs: { ...patient.labs, [key]: v } });

  function addNote() {
    if (!note.s.trim() && !note.o.trim() && !note.a.trim() && !note.p.trim()) return;
    const entry: SoapNote = { id: crypto.randomUUID(), date: new Date().toISOString(), ...note };
    onChange({ notes: [entry, ...patient.notes] });
    setNote({ s: '', o: '', a: '', p: '' });
  }
  function removeNote(id: string) {
    onChange({ notes: patient.notes.filter((n) => n.id !== id) });
  }

  if (view === 'summary') {
    return <PatientSummary patient={patient} onBack={() => setView('edit')} />;
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-[13px] text-violet-soft hover:underline">
          ← Back to list
        </button>
        <button type="button" onClick={onDelete} className="text-[13px] text-crimson hover:underline">
          Delete patient
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Patient">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name / initials" value={patient.name} onChange={(v) => onChange({ name: v })} placeholder="e.g. A.M." />
            <Field label="Age" value={patient.age} onChange={(v) => onChange({ age: v })} placeholder="e.g. 62" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-[7px] block text-[13px] font-semibold text-muted">Sex</span>
              <div className="flex gap-2">
                {(['male', 'female'] as Sex[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ sex: patient.sex === s ? '' : s })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-[10px] border px-2 text-[12px] font-semibold capitalize transition-colors',
                      patient.sex === s ? 'border-violet bg-violet/[0.18] text-violet-soft' : 'border-line bg-navy text-muted hover:border-violet',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </label>
            <Field label="Bed / ward" value={patient.location} onChange={(v) => onChange({ location: v })} placeholder="e.g. W4-12" />
          </div>
          <label className="block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Admission</span>
            <div className="flex gap-2">
              {(['er', 'elective'] as Admission[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onChange({ admission: a })}
                  className={cn(
                    'min-h-[44px] flex-1 rounded-[10px] border px-2 py-[10px] text-[12px] font-semibold transition-colors',
                    patient.admission === a ? 'border-violet bg-violet/[0.18] text-violet-soft' : 'border-line bg-navy text-muted hover:border-violet',
                  )}
                >
                  {a === 'er' ? 'Via ER' : 'Elective'}
                </button>
              ))}
            </div>
          </label>
          <Field label="Admitted as case of" value={patient.reason} onChange={(v) => onChange({ reason: v })} textarea placeholder="e.g. obstructing L VUJ stone + fever" />
        </Section>

        <Section title="History">
          <Field label="Past medical history" value={patient.pmh} onChange={(v) => onChange({ pmh: v })} textarea placeholder="e.g. DM, HTN" />
          <Field label="Past surgical history" value={patient.psh} onChange={(v) => onChange({ psh: v })} textarea placeholder="e.g. appendectomy" />
          <Field label="Current medications" value={patient.meds} onChange={(v) => onChange({ meds: v })} textarea placeholder="e.g. tamsulosin, metformin" />
        </Section>
      </div>

      <Section title="Upon assessment — examination">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EXAM_FIELDS.map((f) => (
            <Field key={f.key} label={`${f.label} examination`} value={patient.exam[f.key]} onChange={(v) => setExam(f.key, v)} />
          ))}
        </div>
      </Section>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Labs">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LAB_FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-[6px] block text-[12px] font-semibold text-muted">{f.label}</span>
                <input value={patient.labs[f.key]} onChange={(e) => setLabs(f.key, e.target.value)} className={inputCls} />
              </label>
            ))}
          </div>
          <Field label="Other labs" value={patient.labs.other} onChange={(v) => setLabs('other', v)} textarea placeholder="e.g. urine culture, coags" />
        </Section>

        <Section title="Imaging & issues">
          <Field label="Imaging (if applicable)" value={patient.imaging} onChange={(v) => onChange({ imaging: v })} textarea placeholder="e.g. CT KUB: 8 mm L VUJ stone, mild hydronephrosis" />
          <Field label="Active issues" value={patient.activeIssues} onChange={(v) => onChange({ activeIssues: v })} textarea placeholder="e.g. sepsis resolving, awaiting URS" />
        </Section>
      </div>

      <div className="mt-5">
        <RemindersSection
          reminders={patient.reminders}
          onChange={(reminders) => onChange({ reminders })}
        />
      </div>

      <div className="mt-5">
        <CatheterSection
          catheter={patient.catheter}
          onChange={(patch) => onChange({ catheter: { ...patient.catheter, ...patch } })}
        />
      </div>

      <Section title="Progress — SOAP">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Field label="Subjective" value={note.s} onChange={(v) => setNote((n) => ({ ...n, s: v }))} textarea placeholder="Symptoms, overnight events" />
          <Field label="Objective" value={note.o} onChange={(v) => setNote((n) => ({ ...n, o: v }))} textarea placeholder="Vitals, exam, results" />
          <Field label="Assessment / impression" value={note.a} onChange={(v) => setNote((n) => ({ ...n, a: v }))} textarea placeholder="Working impression" />
          <Field label="Plan" value={note.p} onChange={(v) => setNote((n) => ({ ...n, p: v }))} textarea placeholder="Next steps" />
        </div>
        <button
          type="button"
          onClick={addNote}
          className="min-h-[44px] rounded-[10px] bg-violet px-4 text-[13px] font-semibold text-white transition hover:bg-violet-deep"
        >
          Add SOAP note
        </button>

        <div className="mt-2 space-y-2.5">
          {patient.notes.length === 0 ? (
            <p className="text-[13px] text-muted-2">No progress notes yet.</p>
          ) : (
            patient.notes.map((n) => (
              <div key={n.id} className="rounded-[12px] border border-line bg-navy p-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11.5px] text-muted-2">{new Date(n.date).toLocaleString()}</span>
                  <button type="button" onClick={() => removeNote(n.id)} className="text-[11px] text-muted-2 hover:text-crimson">
                    remove
                  </button>
                </div>
                <SoapLines note={n} />
              </div>
            ))
          )}
        </div>
      </Section>

      <button
        type="button"
        onClick={() => setView('summary')}
        className="mt-5 min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14.5px] font-semibold text-white transition hover:bg-violet-deep"
      >
        Generate summary
      </button>
    </div>
  );
}

function SoapLines({ note }: { note: SoapNote }) {
  const rows: [string, string][] = [
    ['S', note.s],
    ['O', note.o],
    ['A', note.a],
    ['P', note.p],
  ];
  return (
    <div className="space-y-1 text-[13.5px] text-muted">
      {rows
        .filter(([, v]) => v.trim())
        .map(([k, v]) => (
          <p key={k}>
            <span className="font-semibold text-violet-soft">{k}:</span> {v}
          </p>
        ))}
    </div>
  );
}

/* ── Generated summary (read-only) ─────────────────────────────────────────── */

function summaryLabs(labs: Labs): string[] {
  const out = LAB_FIELDS.filter((f) => labs[f.key].trim()).map((f) => `${f.label} ${labs[f.key]}`);
  if (labs.other.trim()) out.push(labs.other);
  return out;
}

/**
 * One-page ward handover for every patient on the list — the safe version of
 * a "shared workflow": it hands over through whatever channel the hospital
 * already approves, without any shared server or patient data leaving the
 * phone. Sorted by bed so it reads in ward-round order.
 */
function buildHandoverHtml(patients: Patient[]): string {
  const sorted = [...patients].sort((a, b) =>
    (a.location || '~').localeCompare(b.location || '~', undefined, { numeric: true }),
  );

  const blocks = sorted
    .map((p) => {
      const head = [
        p.name || 'Unnamed',
        [p.age && `${p.age}y`, p.sex].filter(Boolean).join(' '),
        p.location && `Bed ${p.location}`,
        p.admission === 'er' ? 'via ER' : 'elective',
      ]
        .filter(Boolean)
        .join(' · ');

      const row = (label: string, val: string) =>
        val.trim() ? `<div class="row"><b>${escapeHtml(label)}</b> ${escapeHtml(val)}</div>` : '';

      // Catheter: description plus the most recent reading (log is newest-first).
      let catheter = '';
      if (p.catheter.present) {
        const last = p.catheter.log[0];
        const net = last ? netOutput(last, p.catheter.cbi) : null;
        const reading = last
          ? [
              net !== null ? `${net} mL${p.catheter.cbi ? ' net' : ''}` : '',
              last.colour ? COLOUR_LABELS[last.colour] : '',
              isRetaining(last, p.catheter.cbi) ? 'MORE IN THAN OUT — check for blockage' : '',
            ]
              .filter(Boolean)
              .join(', ')
          : '';
        catheter = row('Catheter', [describeCatheter(p.catheter), reading && `last: ${reading}`].filter(Boolean).join(' — '));
      }

      const open = sortReminders(p.reminders).filter((r) => !r.done);
      const todo = open.length
        ? `<div class="row"><b>Outstanding</b></div>` +
          open.map((r) => `<div class="row">&nbsp;&nbsp;• ${escapeHtml(r.text)} <i>(${escapeHtml(dueLabel(r))})</i></div>`).join('')
        : '';

      const latest = p.notes[0]; // notes are stored newest-first
      const plan = latest?.p.trim()
        ? row(`Plan (${new Date(latest.date).toLocaleDateString()})`, latest.p)
        : '';

      return (
        `<div class="card"><h3>${escapeHtml(head)}</h3>` +
        row('Admitted as', p.reason) +
        row('Active issues', p.activeIssues) +
        catheter +
        todo +
        plan +
        `</div>`
      );
    })
    .join('');

  return (
    `<h1>Ward handover</h1>` +
    `<p class="sub">${patients.length} patient${patients.length === 1 ? '' : 's'} · generated ${escapeHtml(new Date().toLocaleString())}</p>` +
    blocks +
    `<div class="note">De-identified working list — first name/initials and bed only, no full names or ` +
    `medical-record numbers. A personal aide-mémoire, not a medical record. Hand over through your ` +
    `hospital's approved channel and dispose of securely.</div>`
  );
}

/** Outstanding reminders for the printable summary; completed ones are omitted. */
function remindersHtml(reminders: Reminder[]): string {
  const open = sortReminders(reminders).filter((r) => !r.done);
  if (open.length === 0) return '';
  const rows = open
    .map(
      (r) =>
        `<div class="row"><b>${escapeHtml(dueLabel(r))}</b> ${escapeHtml(r.text)}</div>`,
    )
    .join('');
  return `<h2>Outstanding</h2>${rows}`;
}

/** Catheter block for the printable summary; empty when there is no catheter. */
function catheterHtml(c: Catheter): string {
  if (!c.present) return '';
  const head = describeCatheter(c);
  const readings = c.log
    .map((e) => {
      const net = netOutput(e, c.cbi);
      const bits = [
        net !== null ? `${net} mL${c.cbi ? ' net' : ''}` : '',
        e.colour ? COLOUR_LABELS[e.colour] : '',
        isRetaining(e, c.cbi) ? 'more in than out — check for blockage' : '',
      ].filter(Boolean);
      return `<div class="row"><b>${escapeHtml(new Date(e.datetime).toLocaleString())}</b> ${escapeHtml(bits.join(' · '))}</div>`;
    })
    .join('');
  return (
    `<h2>Urinary catheter</h2>` +
    (head ? `<p>${escapeHtml(head)}</p>` : '') +
    (c.fixation.trim() ? `<div class="row"><b>Fixation</b> ${escapeHtml(c.fixation)}</div>` : '') +
    readings
  );
}

function buildSummaryHtml(p: Patient): string {
  const sexAge = [p.age && `${p.age} years old`, p.sex].filter(Boolean).join(' ');
  const row = (label: string, val: string) =>
    val.trim() ? `<div class="row"><b>${escapeHtml(label)}</b> ${escapeHtml(val)}</div>` : '';
  const exam = EXAM_FIELDS.map(
    (f) => `<div class="row"><b>${f.label} examination</b> ${escapeHtml(p.exam[f.key]) || '—'}</div>`,
  ).join('');
  const labs = summaryLabs(p.labs);
  const soap = p.notes
    .map(
      (n) =>
        `<div class="card"><div class="meta">${escapeHtml(new Date(n.date).toLocaleString())}</div>` +
        row('S', n.s) + row('O', n.o) + row('A', n.a) + row('P', n.p) +
        `</div>`,
    )
    .join('');

  return (
    `<h1>${escapeHtml(p.name || 'Patient')}</h1>` +
    `<p class="sub">${escapeHtml(sexAge)}${p.location ? ` · Bed ${escapeHtml(p.location)}` : ''} · ${p.admission === 'er' ? 'Via ER' : 'Elective'}</p>` +
    `<h2>Known case of</h2>${row('Past medical history', p.pmh)}${row('Past surgical history', p.psh)}${row('Medications', p.meds)}` +
    (p.reason.trim() ? `<h2>Admitted as case of</h2><p>${escapeHtml(p.reason)}</p>` : '') +
    `<h2>Upon assessment</h2>${exam}` +
    (labs.length ? `<h2>Labs</h2><p>${labs.map(escapeHtml).join(' · ')}</p>` : '') +
    (p.imaging.trim() ? `<h2>Imaging</h2><p>${escapeHtml(p.imaging)}</p>` : '') +
    (p.activeIssues.trim() ? `<h2>Active issues</h2><p>${escapeHtml(p.activeIssues)}</p>` : '') +
    remindersHtml(p.reminders) +
    catheterHtml(p.catheter) +
    (soap ? `<h2>Progress (SOAP)</h2>${soap}` : '') +
    `<div class="note">De-identified working summary — a first name/initials and bed only, no full name or ` +
    `medical-record number. A personal aide-mémoire, not a medical record. Dispose of securely.</div>`
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="text-[13.5px]">
      <span className="text-muted-2">{label}:</span> <span className="text-ink">{value}</span>
    </div>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line px-5 py-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-violet-soft">{title}</div>
      {children}
    </div>
  );
}

function PatientSummary({ patient: p, onBack }: { patient: Patient; onBack: () => void }) {
  const [exportError, setExportError] = useState(false);
  const sexAge = [p.age && `${p.age} years old`, p.sex].filter(Boolean).join(' ');
  const labs = summaryLabs(p.labs);

  function print() {
    setExportError(false);
    if (!printDocument(`Round summary — ${p.name || 'patient'}`, buildSummaryHtml(p))) setExportError(true);
  }
  function save() {
    setExportError(false);
    const stem = `round-summary-${p.name || 'patient'}-${todayISO()}`;
    if (!saveDocument(`Round summary — ${p.name || 'patient'}`, buildSummaryHtml(p), '', stem)) setExportError(true);
  }

  return (
    <div className="mt-8">
      <button type="button" onClick={onBack} className="mb-4 text-[13px] text-violet-soft hover:underline">
        ← Back to editing
      </button>

      <div className="overflow-hidden rounded-[18px] border border-line bg-navy-2">
        <div className="px-5 py-5">
          <h3 className="font-display text-[26px] font-semibold leading-tight">{p.name || 'Patient'}</h3>
          <p className="mt-0.5 text-[14px] text-muted">
            {sexAge}
            {p.location ? ` · Bed ${p.location}` : ''} · {p.admission === 'er' ? 'Via ER' : 'Elective'}
          </p>
        </div>

        {(p.pmh || p.psh || p.meds) && (
          <SummaryBlock title="Known case of">
            <div className="space-y-1">
              <SummaryRow label="Past medical history" value={p.pmh} />
              <SummaryRow label="Past surgical history" value={p.psh} />
              <SummaryRow label="Medications" value={p.meds} />
            </div>
          </SummaryBlock>
        )}

        {p.reason.trim() && (
          <SummaryBlock title="Admitted as case of">
            <p className="text-[13.5px] text-ink">{p.reason}</p>
          </SummaryBlock>
        )}

        <SummaryBlock title="Upon assessment">
          <div className="space-y-1">
            {EXAM_FIELDS.map((f) => (
              <div key={f.key} className="text-[13.5px]">
                <span className="text-muted-2">{f.label} examination:</span>{' '}
                <span className="text-ink">{p.exam[f.key] || '—'}</span>
              </div>
            ))}
          </div>
        </SummaryBlock>

        {labs.length > 0 && (
          <SummaryBlock title="Labs">
            <p className="text-[13.5px] text-ink">{labs.join(' · ')}</p>
          </SummaryBlock>
        )}

        {p.imaging.trim() && (
          <SummaryBlock title="Imaging">
            <p className="text-[13.5px] text-ink">{p.imaging}</p>
          </SummaryBlock>
        )}

        {p.activeIssues.trim() && (
          <SummaryBlock title="Active issues">
            <p className="text-[13.5px] text-ink">{p.activeIssues}</p>
          </SummaryBlock>
        )}

        {p.catheter.present && (
          <SummaryBlock title="Urinary catheter">
            <SummaryRow label="Catheter" value={describeCatheter(p.catheter)} />
            <SummaryRow label="Fixation" value={p.catheter.fixation} />
            {p.catheter.log.slice(0, 5).map((e) => {
              const net = netOutput(e, p.catheter.cbi);
              return (
                <SummaryRow
                  key={e.id}
                  label={new Date(e.datetime).toLocaleString()}
                  value={[
                    net !== null ? `${net} mL${p.catheter.cbi ? ' net' : ''}` : '',
                    e.colour ? COLOUR_LABELS[e.colour] : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                />
              );
            })}
          </SummaryBlock>
        )}

        {p.notes.length > 0 && (
          <SummaryBlock title="Progress (SOAP)">
            <div className="space-y-3">
              {p.notes.map((n) => (
                <div key={n.id} className="rounded-[10px] border border-line bg-navy p-3">
                  <div className="mb-1 text-[11.5px] text-muted-2">{new Date(n.date).toLocaleString()}</div>
                  <SoapLines note={n} />
                </div>
              ))}
            </div>
          </SummaryBlock>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={print} className="min-h-[44px] flex-1 rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep">
          Print
        </button>
        <button type="button" onClick={save} className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-teal">
          Save file
        </button>
      </div>

      {exportError && (
        <p className="mt-3 rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
          Export was blocked by the browser. Use your browser’s own Print command (Ctrl/Cmd + P)
          and choose “Save as PDF”.
        </p>
      )}

      <p className="mt-4 text-[11.5px] text-muted-2">
        De-identified summary — first name/initials and bed only, no full name or MRN. A personal
        aide-mémoire, not a medical record. Dispose of securely.
      </p>
    </div>
  );
}
