import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { getJSON, setJSON } from '@/lib/storage';
import { escapeHtml, printDocument, saveDocument } from '@/lib/print';
import { todayISO } from '@/lib/date';
import { SegmentedField } from '@/components/calculators/primitives';
import { ProGate } from '@/components/ProGate';
import { useAccount } from '@/lib/accountContext';
import { profileByline } from '@/lib/profile';
import { CD_GRADES, CD_SHORT, cdBand, cdLabel, isCdGrade, type CdGrade } from '@/lib/clavienDindo';
import {
  normalizeEntry,
  rate,
  summariseByProcedure,
  type Gender,
  type LogEntry,
  type Role,
} from '@/lib/oplog';

const STORAGE_KEY = 'uroapp.oplog.v1';

const ROLE_LABEL: Record<Role, string> = {
  lead: 'Leading surgeon',
  first: '1st assistant',
  second: '2nd assistant',
};
const ROLE_BADGE: Record<Role, string> = {
  lead: 'bg-violet/[0.18] text-violet-soft',
  first: 'bg-teal/[0.16] text-teal',
  second: 'bg-steel text-muted',
};
const CD_BADGE = {
  low: 'border-teal/40 bg-teal/[0.12] text-teal',
  moderate: 'border-amber/40 bg-amber/[0.12] text-amber',
  high: 'border-crimson/40 bg-crimson/[0.12] text-crimson',
} as const;

// Common urology procedures for quick entry (free text is still allowed).
const COMMON_PROCEDURES = [
  'Cystoscopy', 'TURBT', 'TURP', 'Ureteroscopy (URS)', 'PCNL', 'DJ stent insertion',
  'Optical urethrotomy', 'Circumcision', 'Orchidopexy', 'Orchidectomy', 'Hydrocelectomy',
  'Vasectomy', 'Varicocelectomy', 'Radical prostatectomy', 'Radical nephrectomy',
  'Partial nephrectomy', 'Nephroureterectomy', 'Pyeloplasty', 'Ureteric reimplantation',
  'Hypospadias repair', 'Cystectomy',
];

const inputCls =
  'w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13px] text-ink outline-none focus:border-violet';

/** Dropdown of "no complication" plus the seven Clavien–Dindo grades. */
function GradeSelect({
  value,
  onChange,
  className,
  ariaLabel,
}: {
  value: CdGrade | '';
  onChange: (g: CdGrade | '') => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(isCdGrade(e.target.value) ? e.target.value : '')}
      className={cn(inputCls, className)}
    >
      <option value="">No complication</option>
      {CD_GRADES.map((g) => (
        <option key={g} value={g}>
          {CD_SHORT[g]}
        </option>
      ))}
    </select>
  );
}

export function OperativeLogScreen() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // form state
  const [date, setDate] = useState(todayISO());
  const [gender, setGender] = useState<Gender>('male');
  const [procedure, setProcedure] = useState('');
  const [role, setRole] = useState<Role>('lead');
  const [cdGrade, setCdGrade] = useState<CdGrade | ''>('');
  const [cdDisability, setCdDisability] = useState<'no' | 'yes'>('no');
  const [note, setNote] = useState('');

  useEffect(() => {
    getJSON<unknown>(STORAGE_KEY, []).then((raw) => {
      const list = Array.isArray(raw) ? raw.map(normalizeEntry).filter((e): e is LogEntry => e !== null) : [];
      setEntries(list);
      setLoaded(true);
    });
  }, []);

  function persist(next: LogEntry[]) {
    setEntries(next);
    void setJSON(STORAGE_KEY, next);
  }

  function add() {
    const name = procedure.trim();
    if (!date || !name) return;
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      date,
      gender,
      procedure: name,
      role,
      cdGrade,
      cdDisability: cdGrade !== '' && cdGrade !== 'V' && cdDisability === 'yes',
      complicationNote: cdGrade ? note.trim() : '',
    };
    persist([entry, ...entries].sort((a, b) => b.date.localeCompare(a.date)));
    setProcedure('');
    setCdGrade('');
    setCdDisability('no');
    setNote('');
  }

  function update(id: string, patch: Partial<LogEntry>) {
    persist(
      entries.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e, ...patch };
        // Clearing the grade clears what hangs off it; death has no "d" suffix.
        if (!next.cdGrade) return { ...next, cdDisability: false, complicationNote: '' };
        if (next.cdGrade === 'V') return { ...next, cdDisability: false };
        return next;
      }),
    );
  }

  function remove(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  const counts = useMemo(() => {
    const c = { total: entries.length, lead: 0, first: 0, second: 0, complications: 0 };
    for (const e of entries) {
      c[e.role] += 1;
      if (e.cdGrade) c.complications += 1;
    }
    return c;
  }, [entries]);

  const byProcedure = useMemo(() => summariseByProcedure(entries), [entries]);

  const [printError, setPrintError] = useState(false);
  const byline = profileByline(useAccount().profile);

  /** Body HTML shared by print and save. */
  function buildLogBody() {
    const rows = entries
      .map(
        (e) =>
          `<tr><td>${escapeHtml(e.date)}</td><td>${escapeHtml(e.procedure)}</td>` +
          `<td>${e.gender === 'male' ? 'Male' : 'Female'}</td>` +
          `<td>${escapeHtml(ROLE_LABEL[e.role])}</td>` +
          `<td>${e.cdGrade ? escapeHtml(cdLabel(e.cdGrade, e.cdDisability)) : '—'}` +
          `${e.complicationNote ? ` · ${escapeHtml(e.complicationNote)}` : ''}</td></tr>`,
      )
      .join('');

    const summary = byProcedure
      .map(
        (s) =>
          `<tr><td>${escapeHtml(s.procedure)}</td><td>${s.cases}</td><td>${s.asLead}</td>` +
          `<td>${s.withComplication} (${rate(s.withComplication, s.cases)}%)</td>` +
          `<td>${s.highest ?? '—'}</td></tr>`,
      )
      .join('');

    return `
      <h1>Operative logbook</h1>
      ${byline ? `<p class="sub">${escapeHtml(byline)}</p>` : ''}
      <p class="sub">Generated ${new Date().toLocaleDateString()} · ${counts.total} case${counts.total === 1 ? '' : 's'}</p>
      <div class="stats">
        <span>Total <b>${counts.total}</b></span>
        <span>Lead surgeon <b>${counts.lead}</b></span>
        <span>1st assistant <b>${counts.first}</b></span>
        <span>2nd assistant <b>${counts.second}</b></span>
        <span>Complications <b>${counts.complications}</b> (${rate(counts.complications, counts.total)}%)</span>
      </div>
      <h2>By procedure</h2>
      <table>
        <thead><tr><th>Procedure</th><th>Cases</th><th>As lead</th><th>With complication</th><th>Highest Clavien–Dindo</th></tr></thead>
        <tbody>${summary || '<tr><td colspan="5">No cases logged.</td></tr>'}</tbody>
      </table>
      <h2>All cases</h2>
      <table>
        <thead><tr><th>Date</th><th>Procedure</th><th>Patient gender</th><th>Role</th><th>Complication (Clavien–Dindo)</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5">No cases logged.</td></tr>'}</tbody>
      </table>
      <div class="note">De-identified by design — this log records no patient names or
      medical-record numbers. It is a personal training record, not a medical record.
      Complications graded by Clavien–Dindo (Dindo et al., Ann Surg 2004; PMID 15273542);
      "d" = still present at discharge.</div>`;
  }

  function printLog() {
    setPrintError(false);
    if (!printDocument('Operative logbook', buildLogBody())) setPrintError(true);
  }

  function saveLog() {
    setPrintError(false);
    const stem = `operative-logbook-${todayISO()}`;
    if (!saveDocument('Operative logbook', buildLogBody(), '', stem)) setPrintError(true);
  }

  return (
    // The heading lives in the Residency header (ResidencyScreen).
    <div className="mx-auto max-w-wrap px-4 pb-12 pt-6 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        {/* Entry form */}
        <section className="rounded-[20px] border border-line bg-navy-2 p-6">
          <h3 className="mb-4 font-display text-[19px] font-semibold">Add a case</h3>

          <label className="mb-3.5 block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Date of surgery</span>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>

          <SegmentedField<Gender>
            label="Patient gender"
            value={gender}
            onChange={setGender}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
          />

          <label className="mb-3.5 block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Procedure</span>
            <input
              list="uro-procedures"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="e.g. Ureteroscopy (URS)"
              className={inputCls}
            />
            <datalist id="uro-procedures">
              {COMMON_PROCEDURES.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>

          <SegmentedField<Role>
            label="Your role"
            value={role}
            onChange={setRole}
            options={[
              { value: 'lead', label: 'Lead surgeon' },
              { value: 'first', label: '1st assist' },
              { value: 'second', label: '2nd assist' },
            ]}
          />

          <label className="mb-3.5 block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Complication (Clavien–Dindo)</span>
            <GradeSelect value={cdGrade} onChange={setCdGrade} />
            <span className="mt-1.5 block text-[11.5px] text-muted-2">
              Not sure of the grade? Use the Clavien–Dindo grader in Calculators. You can add or
              change this later.
            </span>
          </label>

          {cdGrade && (
            <>
              {cdGrade !== 'V' && (
                <SegmentedField<'no' | 'yes'>
                  label="Still present at discharge (“d”)"
                  value={cdDisability}
                  onChange={setCdDisability}
                  options={[
                    { value: 'no', label: 'No' },
                    { value: 'yes', label: 'Yes' },
                  ]}
                />
              )}
              <label className="mb-3.5 block">
                <span className="mb-[7px] block text-[13px] font-semibold text-muted">What happened (optional)</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. urosepsis, clot retention" className={inputCls} />
              </label>
            </>
          )}

          <button
            type="button"
            onClick={add}
            disabled={!procedure.trim() || !date}
            className="mt-2 w-full rounded-[11px] bg-violet py-3 text-[14.5px] font-semibold text-white transition hover:bg-violet-deep disabled:cursor-default disabled:opacity-40"
          >
            Add to logbook
          </button>
        </section>

        {/* Summary + list */}
        <section>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Total" value={counts.total} tone="text-ink" />
            <Stat label="Lead" value={counts.lead} tone="text-violet-soft" />
            <Stat label="1st assist" value={counts.first} tone="text-teal" />
            <Stat label="2nd assist" value={counts.second} tone="text-muted" />
            <Stat
              label="Complications"
              value={counts.complications}
              tone="text-amber"
              sub={counts.total ? `${rate(counts.complications, counts.total)}%` : undefined}
            />
          </div>

          {entries.length > 0 && (
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={printLog}
                className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-violet"
              >
                Print
              </button>
              <button
                type="button"
                onClick={saveLog}
                className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-teal"
              >
                Save file
              </button>
            </div>
          )}

          {printError && (
            <p className="mb-4 rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
              Printing was blocked by the browser. Use your browser’s own Print command
              (Ctrl/Cmd + P) and choose “Save as PDF”.
            </p>
          )}

          {byProcedure.length > 0 && (
            <ProGate feature="audit" inline>
            <div className="mb-5 overflow-x-auto rounded-[16px] border border-line bg-navy-2">
              <div className="px-4 pt-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-violet-soft">
                Your audit by procedure
              </div>
              <table className="mt-2 w-full min-w-[460px] text-left text-[12.5px]">
                <thead className="text-[10.5px] uppercase tracking-[0.06em] text-muted-2">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Procedure</th>
                    <th className="px-2 py-2 font-semibold">Cases</th>
                    <th className="px-2 py-2 font-semibold">As lead</th>
                    <th className="px-2 py-2 font-semibold">Complications</th>
                    <th className="px-4 py-2 font-semibold">Highest</th>
                  </tr>
                </thead>
                <tbody>
                  {byProcedure.map((s) => (
                    <tr key={s.procedure} className="border-t border-line">
                      <td className="px-4 py-2.5 font-semibold text-ink">{s.procedure}</td>
                      <td className="px-2 py-2.5 font-mono text-ink">{s.cases}</td>
                      <td className="px-2 py-2.5 font-mono text-muted">{s.asLead}</td>
                      <td className="px-2 py-2.5 font-mono text-muted">
                        {s.withComplication} <span className="text-muted-2">({rate(s.withComplication, s.cases)}%)</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {s.highest ? (
                          <span className={cn('rounded-[6px] border px-1.5 py-0.5 font-mono text-[11px]', CD_BADGE[cdBand(s.highest)])}>
                            {s.highest}
                          </span>
                        ) : (
                          <span className="text-muted-2">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 pb-3 pt-2 text-[11px] text-muted-2">
                Small numbers make rates unstable — read percentages alongside the case count.
              </p>
            </div>
            </ProGate>
          )}

          <div className="space-y-2.5">
            {!loaded ? (
              <p className="text-[13px] text-muted-2">Loading…</p>
            ) : entries.length === 0 ? (
              <div className="rounded-[16px] border border-line bg-navy-2 p-6 text-center text-[14px] text-muted">
                No cases logged yet. Add your first case on the left.
              </div>
            ) : (
              entries.map((e) => (
                <article key={e.id} className="rounded-[14px] border border-line bg-navy-2 p-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-semibold">{e.procedure}</div>
                      <div className="mt-0.5 text-[12px] text-muted-2">
                        {e.date} · {e.gender === 'male' ? 'Male' : 'Female'}
                      </div>
                    </div>
                    <span className={cn('shrink-0 rounded-[7px] px-2.5 py-1 text-[11px] font-semibold', ROLE_BADGE[e.role])}>
                      {ROLE_LABEL[e.role]}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      aria-label="Delete case"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-line text-muted-2 transition-colors hover:border-crimson hover:text-crimson"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Complications usually surface after the day of surgery, so grade them here. */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <GradeSelect
                      ariaLabel={`Complication for ${e.procedure} on ${e.date}`}
                      value={e.cdGrade}
                      onChange={(g) => update(e.id, { cdGrade: g })}
                      className="min-h-[44px] w-auto flex-1 py-2"
                    />
                    {e.cdGrade && e.cdGrade !== 'V' && (
                      <button
                        type="button"
                        aria-pressed={e.cdDisability}
                        onClick={() => update(e.id, { cdDisability: !e.cdDisability })}
                        className={cn(
                          'min-h-[44px] rounded-[10px] border px-3 text-[12px] font-semibold transition-colors',
                          e.cdDisability ? 'border-amber bg-amber/[0.14] text-amber' : 'border-line bg-navy text-muted hover:border-amber',
                        )}
                      >
                        “d” at discharge
                      </button>
                    )}
                    {e.cdGrade && (
                      <span className={cn('rounded-[7px] border px-2 py-1 font-mono text-[11.5px]', CD_BADGE[cdBand(e.cdGrade)])}>
                        {cdLabel(e.cdGrade, e.cdDisability)}
                      </span>
                    )}
                  </div>
                  {e.cdGrade && (
                    <input
                      aria-label="What happened"
                      value={e.complicationNote}
                      onChange={(ev) => update(e.id, { complicationNote: ev.target.value })}
                      placeholder="What happened (optional)"
                      className={cn(inputCls, 'mt-2 py-2')}
                    />
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, tone, sub }: { label: string; value: number; tone: string; sub?: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-navy-2 p-4">
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-2">{label}</div>
      <div className={cn('mt-1 font-display text-[26px] font-semibold', tone)}>
        {value}
        {sub && <span className="ml-1.5 font-sans text-[12px] text-muted-2">{sub}</span>}
      </div>
    </div>
  );
}
