/**
 * CME / CPD activity log, stored on the device.
 *
 * The required hours and cycle dates are entered by the user rather than
 * hard-coded: licensing bodies (e.g. SCFHS) set and revise their own CPD
 * rules, and none are written here from memory (CLAUDE.md). The tracker just
 * measures progress against whatever target the user sets.
 */

/** Storage keys (both synced with the account, see lib/sync). */
export const CME_ACTIVITIES_KEY = 'uroapp.cme.v1';
export const CME_TARGET_KEY = 'uroapp.cme.target.v1';

export type CmeType = 'conference' | 'workshop' | 'online' | 'journal-club' | 'teaching' | 'other';

export const CME_TYPE_LABEL: Record<CmeType, string> = {
  conference: 'Conference',
  workshop: 'Workshop / course',
  online: 'Online module',
  'journal-club': 'Journal club',
  teaching: 'Teaching / lecture given',
  other: 'Other',
};

export interface CmeActivity {
  id: string;
  /** ISO yyyy-mm-dd */
  date: string;
  title: string;
  provider: string;
  /** Credit hours claimed, e.g. 6.5 */
  hours: number;
  type: CmeType;
  /** Formally accredited for CPD credit. */
  accredited: boolean;
  /** Accreditation number or certificate reference, if any. */
  reference: string;
}

export interface CmeTarget {
  /** Hours required in the cycle; 0 = no target set. */
  hours: number;
  /** ISO dates, inclusive. Empty = not set. */
  cycleStart: string;
  cycleEnd: string;
}

const TYPES = Object.keys(CME_TYPE_LABEL) as CmeType[];
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);

export function normalizeActivity(raw: unknown): CmeActivity | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!str(r.id) || !str(r.title)) return null;
  return {
    id: str(r.id),
    date: str(r.date),
    title: str(r.title),
    provider: str(r.provider),
    hours: num(r.hours),
    type: TYPES.includes(r.type as CmeType) ? (r.type as CmeType) : 'other',
    accredited: r.accredited === true,
    reference: str(r.reference),
  };
}

export function normalizeTarget(raw: unknown): CmeTarget {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return { hours: num(r.hours), cycleStart: str(r.cycleStart), cycleEnd: str(r.cycleEnd) };
}

/** Inside the cycle (inclusive); with no cycle set, every activity counts. */
export function inCycle(a: CmeActivity, t: CmeTarget): boolean {
  if (t.cycleStart && a.date < t.cycleStart) return false;
  if (t.cycleEnd && a.date > t.cycleEnd) return false;
  return true;
}

export interface CmeSummary {
  total: number;
  accredited: number;
  byType: Partial<Record<CmeType, number>>;
  /** 0–100, or null when no target is set. */
  percent: number | null;
  remaining: number | null;
}

/** Rounded to one decimal place, avoiding float noise like 7.300000000001. */
const r1 = (n: number) => Math.round(n * 10) / 10;

export function summarise(activities: CmeActivity[], t: CmeTarget): CmeSummary {
  let total = 0;
  let accredited = 0;
  const byType: Partial<Record<CmeType, number>> = {};
  for (const a of activities) {
    if (!inCycle(a, t)) continue;
    total += a.hours;
    if (a.accredited) accredited += a.hours;
    byType[a.type] = r1((byType[a.type] ?? 0) + a.hours);
  }
  total = r1(total);
  accredited = r1(accredited);
  const percent = t.hours > 0 ? Math.min(100, Math.round((total / t.hours) * 100)) : null;
  const remaining = t.hours > 0 ? r1(Math.max(0, t.hours - total)) : null;
  return { total, accredited, byType, percent, remaining };
}

/** Show the renewal reminder this many days before the cycle ends. */
export const REMINDER_DAYS = 120;

export interface CmeReminder {
  /** Days until the cycle end (0 = ends today; negative = already ended). */
  daysLeft: number;
  remaining: number;
  /** Hours per month needed to finish on time; null once the cycle has ended. */
  perMonth: number | null;
}

/**
 * A reminder when the cycle ends within REMINDER_DAYS and the target is not
 * met yet, or when the cycle ended short. Null when there is no target, no
 * end date, the target is met, or the deadline is still far off.
 */
export function cmeReminder(activities: CmeActivity[], t: CmeTarget, today: string): CmeReminder | null {
  if (!(t.hours > 0) || !t.cycleEnd) return null;
  const { remaining } = summarise(activities, t);
  if (!remaining) return null;
  const daysLeft = Math.round(
    (new Date(`${t.cycleEnd}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000,
  );
  if (daysLeft > REMINDER_DAYS) return null;
  const months = (daysLeft + 1) / 30.44;
  return { daysLeft, remaining, perMonth: daysLeft >= 0 ? r1(remaining / Math.max(months, 1)) : null };
}

/** One CSV field: quoted when needed, and a leading = + - @ neutralised so Excel won't run it as a formula. */
function csvField(v: string | number): string {
  let s = String(v);
  if (typeof v === 'string' && /^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * The cycle's activities as a CSV spreadsheet (opens in Excel / Numbers), for
 * copying into a licensing body's CPD portal. Starts with a BOM so Excel reads
 * Arabic titles as UTF-8.
 */
export function toCsv(activities: CmeActivity[], t: CmeTarget, hasCertificate: (id: string) => boolean): string {
  const head = ['Date', 'Activity', 'Provider', 'Type', 'Hours', 'Accredited', 'Reference', 'Certificate'];
  const rows = activities
    .filter((a) => inCycle(a, t))
    .sort((x, y) => x.date.localeCompare(y.date))
    .map((a) => [
      a.date,
      a.title,
      a.provider,
      CME_TYPE_LABEL[a.type],
      a.hours,
      a.accredited ? 'Yes' : 'No',
      a.reference,
      hasCertificate(a.id) ? 'Attached' : '',
    ]);
  return '﻿' + [head, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';
}
