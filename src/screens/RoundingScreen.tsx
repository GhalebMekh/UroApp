import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { getJSON, setJSON } from '@/lib/storage';
import { escapeHtml, printDocument, saveDocument } from '@/lib/print';
import { todayISO } from '@/lib/date';

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
    notes: [],
  };
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

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
  return (
    <>
      <button
        type="button"
        onClick={onAdd}
        className="mt-8 min-h-[44px] rounded-[11px] bg-violet px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep"
      >
        + Add patient
      </button>

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
          🖨 Print
        </button>
        <button type="button" onClick={save} className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-teal">
          ⬇ Save file
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
