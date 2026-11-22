/**
 * Pre-op checklists: tomorrow's (or any day's) cases, each with a list to tick
 * before theatre.
 *
 * Owner's decisions (2026-11-15): one checklist per case (initials + an
 * operation + a date); anticoagulation is a single tick item — no stop-day
 * numbers in the app; the general list can be extended and trimmed; Pro; one
 * reminder at 06:00 on the day of surgery if anything is unticked; a case is
 * deleted automatically 2 days after its date; any operation name is allowed,
 * and the app's 22 procedures add their own items. Each case names its
 * attending (added the same day).
 *
 * DEVICE ONLY, like the stent register: not synced, behind the app lock,
 * erased by "Forgot PIN".
 *
 * Sources: the general items are plain tasks (consent signed, side marked…)
 * with no thresholds or advice, so they carry no citation. The
 * procedure-specific items are the cited "Before theatre" sections of
 * data/procedures.ts (Campbell-Walsh-Wein), shown with that citation.
 */
import { PROCEDURES } from '@/data/procedures';
import type { Citation } from '@/data/citations';
import { addDays } from './date';

export const PREOP_KEY = 'uroapp.preop.v1';

export const LABEL_MAX = 12;
export const NOTE_MAX = 60;
export const OPERATION_MAX = 60;
export const ATTENDING_MAX = 40;
export const ITEM_MAX = 80;

/** A case disappears this many days after its operation date (owner). */
export const KEEP_DAYS = 2;

export interface ChecklistItem {
  id: string;
  text: string;
}

/** The default general list — tasks only, no clinical thresholds. */
export const GENERAL_ITEMS: readonly ChecklistItem[] = [
  { id: 'g:consent', text: 'Consent signed and filed' },
  { id: 'g:site', text: 'Operative side / site marked' },
  { id: 'g:allergy', text: 'Allergies checked and recorded' },
  {
    id: 'g:anticoag',
    text: 'Anticoagulant / antiplatelet plan agreed (drug, last dose, bridging)',
  },
  { id: 'g:bloods', text: 'Pre-op blood results reviewed' },
  { id: 'g:groupsave', text: 'Group and screen / cross-match sent if needed' },
  { id: 'g:imaging', text: 'Imaging available for theatre' },
  { id: 'g:anaesthesia', text: 'Anaesthetic review done' },
  { id: 'g:fasting', text: 'Fasting instructions given' },
  { id: 'g:abx', text: 'Antibiotic prophylaxis planned' },
  { id: 'g:vte', text: 'VTE prophylaxis planned' },
  { id: 'g:kit', text: 'Special equipment / implants available' },
  { id: 'g:bed', text: 'Post-op bed arranged (ward / HDU / ICU)' },
];

export interface PreopCase {
  id: string;
  /** Initials only. */
  label: string;
  /** Short de-identified note. Never shown in notifications. */
  note: string;
  /** One of the app's procedures, or '' for a typed operation. */
  procedureId: string;
  /** Operation name as shown; the procedure's name when one is picked. */
  operation: string;
  /** yyyy-mm-dd, the day of surgery. */
  date: string;
  /** The responsible attending / consultant, e.g. "Dr Hassan" (owner, 2026-11-15). Never in notifications. */
  attending: string;
  /** Ids of ticked items. */
  ticked: string[];
}

export interface PreopStore {
  cases: PreopCase[];
  /** The user's own general items, added to every case. */
  custom: ChecklistItem[];
  /** Default general items the user has hidden. */
  hidden: string[];
}

export const emptyStore = (): PreopStore => ({
  cases: [],
  custom: [],
  hidden: [],
});

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function normalizePreop(raw: unknown): PreopStore {
  if (!raw || typeof raw !== 'object') return emptyStore();
  const r = raw as Record<string, unknown>;
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  const objects = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object') : [];

  const cases = objects(r.cases)
    .map((c): PreopCase => ({
      id: s(c.id),
      label: s(c.label, LABEL_MAX),
      note: s(c.note, NOTE_MAX),
      procedureId: PROCEDURES.some((p) => p.id === c.procedureId) ? (c.procedureId as string) : '',
      operation: s(c.operation, OPERATION_MAX),
      date: typeof c.date === 'string' && ISO.test(c.date) ? c.date : '',
      attending: s(c.attending, ATTENDING_MAX),
      ticked: strings(c.ticked),
    }))
    .filter((c) => c.id && c.date && c.operation);

  const custom = objects(r.custom)
    .map((c): ChecklistItem => ({ id: s(c.id), text: s(c.text, ITEM_MAX) }))
    .filter((c) => c.id.startsWith('c:') && c.text);

  const known = new Set(GENERAL_ITEMS.map((g) => g.id));
  return {
    cases,
    custom,
    hidden: strings(r.hidden).filter((id) => known.has(id)),
  };
}

/** Drops cases more than KEEP_DAYS past their date. */
export function purgeOld(store: PreopStore, today: string): PreopStore {
  const cutoff = addDays(today, -KEEP_DAYS);
  const cases = store.cases.filter((c) => c.date >= cutoff);
  return cases.length === store.cases.length ? store : { ...store, cases };
}

/** The general list as this user has it: defaults not hidden, then their own. */
export function generalItems(store: Pick<PreopStore, 'custom' | 'hidden'>): ChecklistItem[] {
  const hidden = new Set(store.hidden);
  return [...GENERAL_ITEMS.filter((g) => !hidden.has(g.id)), ...store.custom];
}

/** Items from a procedure's cited "Before theatre" workup and setup, with that source. */
export function procedureItems(procedureId: string): {
  items: ChecklistItem[];
  source: Citation | null;
} {
  const p = PROCEDURES.find((x) => x.id === procedureId);
  if (!p?.preop) return { items: [], source: null };
  return {
    items: [
      ...p.preop.workup.map((text, i) => ({ id: `p:w${i}`, text })),
      ...p.preop.setup.map((text, i) => ({ id: `p:s${i}`, text })),
    ],
    source: p.extrasSource ?? p.citation,
  };
}

/** Every item for a case, general first. */
export function caseItems(c: PreopCase, store: Pick<PreopStore, 'custom' | 'hidden'>): ChecklistItem[] {
  return [...generalItems(store), ...procedureItems(c.procedureId).items];
}

/** Items on the case's current list that aren't ticked. */
export function openCount(c: PreopCase, store: Pick<PreopStore, 'custom' | 'hidden'>): number {
  const ticked = new Set(c.ticked);
  return caseItems(c, store).filter((i) => !ticked.has(i.id)).length;
}

/** Upcoming cases first (soonest at the top), then past ones. */
export function sortCases(cases: readonly PreopCase[], today: string): { upcoming: PreopCase[]; past: PreopCase[] } {
  const byDate = [...cases].sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
  return {
    upcoming: byDate.filter((c) => c.date >= today),
    past: byDate.filter((c) => c.date < today).reverse(),
  };
}

/** "Today", "Tomorrow", or "Mon 17 Nov". */
export function dayText(iso: string, today: string): string {
  if (iso === today) return 'Today';
  if (iso === addDays(today, 1)) return 'Tomorrow';
  if (iso === addDays(today, -1)) return 'Yesterday';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
}

/** Attendings already used, most recent first — offered as suggestions in the form. */
export function knownAttendings(cases: readonly PreopCase[]): string[] {
  const out: string[] = [];
  const lower = new Set<string>();
  for (const c of [...cases].sort((a, b) => b.date.localeCompare(a.date))) {
    const name = c.attending.trim();
    if (name && !lower.has(name.toLowerCase())) {
      lower.add(name.toLowerCase());
      out.push(name);
    }
  }
  return out;
}
