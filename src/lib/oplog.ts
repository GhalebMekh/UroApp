/**
 * Operative logbook model and the personal-audit summaries built on it.
 * De-identified by design: date, patient gender, procedure, role, and an
 * optional Clavien–Dindo grade. No names, no MRNs.
 */
import { cdRank, isCdGrade, type CdGrade } from './clavienDindo';

export type Gender = 'male' | 'female';
export type Role = 'lead' | 'first' | 'second';

export interface LogEntry {
  id: string;
  /** ISO yyyy-mm-dd */
  date: string;
  gender: Gender;
  procedure: string;
  role: Role;
  /** Highest Clavien–Dindo grade for this case; '' = no complication recorded. */
  cdGrade: CdGrade | '';
  /** Complication still present at discharge (Clavien–Dindo "d" suffix). */
  cdDisability: boolean;
  /** Free-text, de-identified, e.g. "urosepsis". */
  complicationNote: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Entries saved before complications existed load with none recorded. */
export function normalizeEntry(raw: unknown): LogEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!str(r.id) || !str(r.procedure)) return null;
  return {
    id: str(r.id),
    date: str(r.date),
    gender: r.gender === 'female' ? 'female' : 'male',
    procedure: str(r.procedure),
    role: r.role === 'first' || r.role === 'second' ? r.role : 'lead',
    cdGrade: isCdGrade(r.cdGrade) ? r.cdGrade : '',
    cdDisability: r.cdDisability === true,
    complicationNote: str(r.complicationNote),
  };
}

/** Groups "TURP", "turp " and "Turp" together, keeping the first spelling seen. */
export function procedureKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export interface ProcedureSummary {
  procedure: string;
  cases: number;
  asLead: number;
  /** Cases with any recorded complication. */
  withComplication: number;
  /** Count per grade. */
  byGrade: Partial<Record<CdGrade, number>>;
  highest: CdGrade | null;
}

export function summariseByProcedure(entries: LogEntry[]): ProcedureSummary[] {
  const map = new Map<string, ProcedureSummary>();
  for (const e of entries) {
    const key = procedureKey(e.procedure);
    let s = map.get(key);
    if (!s) {
      s = { procedure: e.procedure.trim(), cases: 0, asLead: 0, withComplication: 0, byGrade: {}, highest: null };
      map.set(key, s);
    }
    s.cases += 1;
    if (e.role === 'lead') s.asLead += 1;
    if (e.cdGrade) {
      s.withComplication += 1;
      s.byGrade[e.cdGrade] = (s.byGrade[e.cdGrade] ?? 0) + 1;
      if (!s.highest || cdRank(e.cdGrade) > cdRank(s.highest)) s.highest = e.cdGrade;
    }
  }
  return [...map.values()].sort((a, b) => b.cases - a.cases || a.procedure.localeCompare(b.procedure));
}

/** Percentage rounded to one decimal; 0 when there are no cases. */
export function rate(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}
