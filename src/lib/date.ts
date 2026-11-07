/**
 * Local-time date helpers.
 *
 * Never use `new Date().toISOString().slice(0, 10)` for a calendar date: it
 * converts to UTC and returns the PREVIOUS day in any timezone ahead of UTC
 * (e.g. UTC+3 in Jeddah during the early hours), which silently skews date
 * inputs and generated schedules.
 */

/** Format a Date as yyyy-mm-dd using the LOCAL calendar day. */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's local calendar date as yyyy-mm-dd. */
export function todayISO(): string {
  return toLocalISODate(new Date());
}

/** Add whole days to an ISO date (negative goes back); '' for an invalid date. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
}

/** Whole calendar days from `from` to `to` (both yyyy-mm-dd); negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(from);
  const b = /^(\d{4})-(\d{2})-(\d{2})$/.exec(to);
  if (!a || !b) return Number.NaN;
  // Epoch arithmetic over the calendar components sidesteps DST and time zones.
  const day = (m: RegExpExecArray) => Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Math.round((day(b) - day(a)) / 86_400_000);
}

/** Add whole months to an ISO date, clamping to the end of the target month. */
export function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return toLocalISODate(d);
}
