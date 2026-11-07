/**
 * Stent register: ureteric stents still in, with a reminder a week before each
 * is due out, so none is forgotten.
 *
 * Owner's decisions (2026-11-06): label = initials plus a short note; one
 * reminder 1 week before the remove-by date; DEVICE ONLY — never synced (not in
 * lib/sync, and the database's key list refuses it), erased by "Forgot PIN"
 * with the ward list; Pro.
 *
 * No clinical intervals live here: the remove-by date is the clinician's own,
 * and the date shortcuts are plain arithmetic, so nothing needs a citation.
 * If a recommended dwell time is ever suggested, it must carry its source.
 */
import { addDays, addMonths, daysBetween } from './date';

export const STENT_KEY = 'uroapp.stents.v1';

export type StentSide = 'left' | 'right' | 'bilateral';

export const SIDE_LABEL: Record<StentSide, string> = {
  left: 'Left',
  right: 'Right',
  bilateral: 'Bilateral',
};

export const LABEL_MAX = 12;
export const NOTE_MAX = 60;
export const SIZE_MAX = 20;

export interface Stent {
  id: string;
  /** Initials only — it shows on the lock screen. */
  label: string;
  /** Short de-identified note, e.g. "post-URS, 8 mm stone". Not shown in notifications. */
  note: string;
  side: StentSide;
  /** Optional, e.g. "6 Fr 26 cm". */
  size: string;
  /** yyyy-mm-dd */
  inserted: string;
  /** yyyy-mm-dd, the clinician's planned removal or exchange date. */
  removeBy: string;
  /** yyyy-mm-dd when marked removed; empty while the stent is in. */
  removed: string;
  /** yyyy-mm-dd the remove-by date was last set — decides whether the 1-week reminder could fire. */
  setOn: string;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeStents(raw: unknown): Stent[] {
  if (!Array.isArray(raw)) return [];
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');
  const date = (v: unknown) => (typeof v === 'string' && ISO.test(v) ? v : '');
  return raw
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map((r): Stent => ({
      id: s(r.id),
      label: s(r.label, LABEL_MAX),
      note: s(r.note, NOTE_MAX),
      side: r.side === 'right' || r.side === 'bilateral' ? r.side : 'left',
      size: s(r.size, SIZE_MAX),
      inserted: date(r.inserted),
      removeBy: date(r.removeBy),
      removed: date(r.removed),
      setOn: date(r.setOn),
    }))
    .filter((r) => r.id && r.removeBy);
}

/**
 * Something that looks like a record or ID number: 5+ digits in a row. The
 * register is for initials; this catches an MRN typed by habit.
 */
export function looksLikeIdentifier(text: string): boolean {
  return /\d{5,}/.test(text.replace(/[\s-]/g, ''));
}

export type StentStatus = 'overdue' | 'due-soon' | 'in' | 'removed';

/** Days of the week before removal that the reminder fires — and that "due soon" covers. */
export const STENT_LEAD_DAYS = 7;

export function stentStatus(s: Stent, today: string): StentStatus {
  if (s.removed) return 'removed';
  const left = daysBetween(today, s.removeBy);
  if (left < 0) return 'overdue';
  if (left <= STENT_LEAD_DAYS) return 'due-soon';
  return 'in';
}

/** "Overdue by 3 days", "Due today", "Due in 5 days", "Due 12 Dec 2026". */
export function dueText(s: Stent, today: string): string {
  const left = daysBetween(today, s.removeBy);
  if (Number.isNaN(left)) return '';
  if (left < 0) return `Overdue by ${-left} day${left === -1 ? '' : 's'}`;
  if (left === 0) return 'Due today';
  if (left <= STENT_LEAD_DAYS) return `Due in ${left} day${left === 1 ? '' : 's'}`;
  return `Due ${formatDay(s.removeBy)}`;
}

/** Days in situ, counting the insertion day as day 1 (as the catheter record does). */
export function dwellDays(s: Stent, today: string): number | null {
  if (!s.inserted) return null;
  const end = s.removed || today;
  const d = daysBetween(s.inserted, end);
  return Number.isNaN(d) || d < 0 ? null : d + 1;
}

export function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Stents still in, most urgent first; then removed ones, most recent first. */
export function sortStents(list: readonly Stent[]): { active: Stent[]; removed: Stent[] } {
  const active = list.filter((s) => !s.removed).sort((a, b) => a.removeBy.localeCompare(b.removeBy));
  const removed = list.filter((s) => s.removed).sort((a, b) => b.removed.localeCompare(a.removed));
  return { active, removed };
}

/** Remove-by shortcuts from the insertion date — arithmetic only, not a recommendation. */
export const REMOVE_BY_SHORTCUTS: { label: string; days?: number; months?: number }[] = [
  { label: '+1 week', days: 7 },
  { label: '+2 weeks', days: 14 },
  { label: '+4 weeks', days: 28 },
  { label: '+3 months', months: 3 },
  { label: '+6 months', months: 6 },
];

export function shortcutDate(inserted: string, shortcut: { days?: number; months?: number }): string {
  return shortcut.months ? addMonths(inserted, shortcut.months) : addDays(inserted, shortcut.days ?? 0);
}
