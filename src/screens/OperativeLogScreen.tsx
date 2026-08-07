import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { getJSON, setJSON } from '@/lib/storage';
import { escapeHtml, printDocument, saveDocument } from '@/lib/print';
import { todayISO } from '@/lib/date';
import { SegmentedField } from '@/components/calculators/primitives';

type Gender = 'male' | 'female';
type Role = 'lead' | 'first' | 'second';

interface LogEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  gender: Gender;
  procedure: string;
  role: Role;
}

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

// Common urology procedures for quick entry (free text is still allowed).
const COMMON_PROCEDURES = [
  'Cystoscopy', 'TURBT', 'TURP', 'Ureteroscopy (URS)', 'PCNL', 'DJ stent insertion',
  'Optical urethrotomy', 'Circumcision', 'Orchidopexy', 'Orchidectomy', 'Hydrocelectomy',
  'Vasectomy', 'Varicocelectomy', 'Radical prostatectomy', 'Radical nephrectomy',
  'Partial nephrectomy', 'Nephroureterectomy', 'Pyeloplasty', 'Ureteric reimplantation',
  'Hypospadias repair', 'Cystectomy',
];


export function OperativeLogScreen() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // form state
  const [date, setDate] = useState(todayISO());
  const [gender, setGender] = useState<Gender>('male');
  const [procedure, setProcedure] = useState('');
  const [role, setRole] = useState<Role>('lead');

  useEffect(() => {
    getJSON<LogEntry[]>(STORAGE_KEY, []).then((e) => {
      setEntries(e);
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
    const entry: LogEntry = { id: crypto.randomUUID(), date, gender, procedure: name, role };
    persist([entry, ...entries].sort((a, b) => b.date.localeCompare(a.date)));
    setProcedure('');
  }

  function remove(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  const counts = useMemo(() => {
    const c = { total: entries.length, lead: 0, first: 0, second: 0 };
    for (const e of entries) c[e.role] += 1;
    return c;
  }, [entries]);

  const [printError, setPrintError] = useState(false);

  /** Body HTML shared by print and save. */
  function buildLogBody() {
    const rows = entries
      .map(
        (e) =>
          `<tr><td>${escapeHtml(e.date)}</td><td>${escapeHtml(e.procedure)}</td>` +
          `<td>${e.gender === 'male' ? 'Male' : 'Female'}</td>` +
          `<td>${escapeHtml(ROLE_LABEL[e.role])}</td></tr>`,
      )
      .join('');

    return `
      <h1>Operative logbook</h1>
      <p class="sub">Generated ${new Date().toLocaleDateString()} · ${counts.total} case${counts.total === 1 ? '' : 's'}</p>
      <div class="stats">
        <span>Total <b>${counts.total}</b></span>
        <span>Lead surgeon <b>${counts.lead}</b></span>
        <span>1st assistant <b>${counts.first}</b></span>
        <span>2nd assistant <b>${counts.second}</b></span>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Procedure</th><th>Patient gender</th><th>Role</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">No cases logged.</td></tr>'}</tbody>
      </table>
      <div class="note">De-identified by design — this log records no patient names or
      medical-record numbers. It is a personal training record, not a medical record.</div>`;
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
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Operative log
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Surgical logbook.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Your case log, stored on this device. De-identified by design — no names or medical-record
        numbers, only date, patient gender, procedure and your role.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        {/* Entry form */}
        <section className="rounded-[20px] border border-line bg-navy-2 p-6">
          <h3 className="mb-4 font-display text-[19px] font-semibold">Add a case</h3>

          <label className="mb-3.5 block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Date of surgery</span>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13px] text-ink outline-none focus:border-violet"
            />
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
              className="w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13px] text-ink outline-none focus:border-violet"
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
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total" value={counts.total} tone="text-ink" />
            <Stat label="Lead" value={counts.lead ?? 0} tone="text-violet-soft" />
            <Stat label="1st assist" value={counts.first ?? 0} tone="text-teal" />
            <Stat label="2nd assist" value={counts.second ?? 0} tone="text-muted" />
          </div>

          {entries.length > 0 && (
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={printLog}
                className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-violet"
              >
                🖨 Print
              </button>
              <button
                type="button"
                onClick={saveLog}
                className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-teal"
              >
                ⬇ Save file
              </button>
            </div>
          )}

          {printError && (
            <p className="mb-4 rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
              Printing was blocked by the browser. Use your browser’s own Print command
              (Ctrl/Cmd + P) and choose “Save as PDF”.
            </p>
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
                <article key={e.id} className="flex items-center gap-3 rounded-[14px] border border-line bg-navy-2 p-4">
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
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-navy-2 p-4">
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-2">{label}</div>
      <div className={cn('mt-1 font-display text-[26px] font-semibold', tone)}>{value}</div>
    </div>
  );
}
