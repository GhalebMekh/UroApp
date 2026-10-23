/**
 * Plan reminders for the inpatient rounding tool.
 *
 * On-device only, alongside the rest of the de-identified tracker — nothing
 * here syncs or leaves the phone.
 *
 * TIME HANDLING: the due value is the raw `<input type="datetime-local">`
 * string, e.g. "2026-08-10T14:30", which is LOCAL wall time with no zone.
 * `new Date(...)` parses that form as local, so comparisons stay in the
 * clinician's own day. Do not "helpfully" convert these to UTC ISO strings —
 * that is what broke the catheter dwell counter (see lib/catheter.ts).
 */

export interface Reminder {
  id: string;
  /** What needs doing, e.g. "Chase histology" or "Repeat Hb". */
  text: string;
  /** Local datetime, "YYYY-MM-DDTHH:mm". Empty means no due time set. */
  due: string;
  done: boolean;
}

export type ReminderStatus = 'done' | 'overdue' | 'soon' | 'upcoming' | 'undated';

/** Anything due within this many hours counts as "soon". */
export const SOON_HOURS = 4;

export function parseDue(due: string): Date | null {
  if (!due.trim()) return null;
  const d = new Date(due);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function reminderStatus(r: Reminder, now: Date = new Date()): ReminderStatus {
  if (r.done) return 'done';
  const due = parseDue(r.due);
  if (!due) return 'undated';
  const msUntil = due.getTime() - now.getTime();
  if (msUntil < 0) return 'overdue';
  if (msUntil <= SOON_HOURS * 3_600_000) return 'soon';
  return 'upcoming';
}

/** Outstanding = not done. Done reminders stop counting immediately. */
export function isOutstanding(r: Reminder): boolean {
  return !r.done;
}

export function countOverdue(reminders: Reminder[], now: Date = new Date()): number {
  return reminders.filter((r) => reminderStatus(r, now) === 'overdue').length;
}

export function countOutstanding(reminders: Reminder[]): number {
  return reminders.filter(isOutstanding).length;
}

/**
 * Sort for display: overdue first (soonest overdue at the top), then due soon,
 * then upcoming, then undated, with completed ones last.
 */
const RANK: Record<ReminderStatus, number> = {
  overdue: 0,
  soon: 1,
  upcoming: 2,
  undated: 3,
  done: 4,
};

export function sortReminders(reminders: Reminder[], now: Date = new Date()): Reminder[] {
  return [...reminders].sort((a, b) => {
    const ra = RANK[reminderStatus(a, now)];
    const rb = RANK[reminderStatus(b, now)];
    if (ra !== rb) return ra - rb;
    const da = parseDue(a.due);
    const db = parseDue(b.due);
    if (da && db) return da.getTime() - db.getTime();
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
}

/** Short relative phrase for the chip, e.g. "2 h overdue" or "in 30 min". */
export function dueLabel(r: Reminder, now: Date = new Date()): string {
  if (r.done) return 'Done';
  const due = parseDue(r.due);
  if (!due) return 'No time set';

  const ms = due.getTime() - now.getTime();
  const overdue = ms < 0;
  const mins = Math.floor(Math.abs(ms) / 60_000);

  let phrase: string;
  if (mins < 60) phrase = `${mins} min`;
  else if (mins < 60 * 24) phrase = `${Math.floor(mins / 60)} h`;
  else phrase = `${Math.floor(mins / (60 * 24))} d`;

  return overdue ? `${phrase} overdue` : `in ${phrase}`;
}
