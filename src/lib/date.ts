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
