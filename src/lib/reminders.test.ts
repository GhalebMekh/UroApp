import { describe, expect, it } from 'vitest';
import {
  SOON_HOURS,
  countOutstanding,
  countOverdue,
  dueLabel,
  parseDue,
  reminderStatus,
  sortReminders,
  type Reminder,
} from './reminders';

/** Fixed local "now": 10 Aug 2026, 12:00 local. */
const NOW = new Date(2026, 7, 10, 12, 0);

const make = (over: Partial<Reminder> = {}): Reminder => ({
  id: Math.random().toString(36).slice(2),
  text: 'Chase histology',
  due: '',
  done: false,
  ...over,
});

describe('parseDue', () => {
  it('reads a datetime-local string as LOCAL wall time, not UTC', () => {
    // Regression guard: the catheter dwell counter was wrong because a local
    // date got compared in UTC. A datetime-local value carries no zone, so
    // parsing must land on the same clock time the clinician typed.
    const d = parseDue('2026-08-10T14:30')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(10);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
  });

  it('returns null for empty or unparseable input', () => {
    expect(parseDue('')).toBeNull();
    expect(parseDue('   ')).toBeNull();
    expect(parseDue('not-a-date')).toBeNull();
  });
});

describe('reminderStatus', () => {
  it('marks a past due time overdue', () => {
    expect(reminderStatus(make({ due: '2026-08-10T09:00' }), NOW)).toBe('overdue');
  });

  it('marks anything within the soon window as soon', () => {
    expect(reminderStatus(make({ due: '2026-08-10T14:00' }), NOW)).toBe('soon');
  });

  it('marks beyond the soon window as upcoming', () => {
    const beyond = new Date(NOW.getTime() + (SOON_HOURS + 2) * 3_600_000);
    const due = `2026-08-10T${String(beyond.getHours()).padStart(2, '0')}:00`;
    expect(reminderStatus(make({ due }), NOW)).toBe('upcoming');
  });

  it('marks a reminder with no due time as undated', () => {
    expect(reminderStatus(make({ due: '' }), NOW)).toBe('undated');
  });

  it('marks done regardless of how overdue it was', () => {
    expect(reminderStatus(make({ due: '2026-01-01T09:00', done: true }), NOW)).toBe('done');
  });
});

describe('counts', () => {
  const list = [
    make({ due: '2026-08-10T09:00' }), // overdue
    make({ due: '2026-08-10T10:00' }), // overdue
    make({ due: '2026-08-10T14:00' }), // soon
    make({ due: '2026-08-09T09:00', done: true }), // done, was overdue
    make({ due: '' }), // undated
  ];

  it('counts only outstanding overdue reminders', () => {
    expect(countOverdue(list, NOW)).toBe(2);
  });

  it('counts every not-done reminder as outstanding', () => {
    expect(countOutstanding(list)).toBe(4);
  });
});

describe('sortReminders', () => {
  it('puts overdue first, then soon, upcoming, undated, done last', () => {
    const undated = make({ text: 'undated', due: '' });
    const done = make({ text: 'done', due: '2026-08-10T08:00', done: true });
    const overdue = make({ text: 'overdue', due: '2026-08-10T09:00' });
    const soon = make({ text: 'soon', due: '2026-08-10T14:00' });

    const sorted = sortReminders([done, undated, soon, overdue], NOW);
    expect(sorted.map((r) => r.text)).toEqual(['overdue', 'soon', 'undated', 'done']);
  });

  it('orders the most overdue first within the overdue group', () => {
    const older = make({ text: 'older', due: '2026-08-10T06:00' });
    const newer = make({ text: 'newer', due: '2026-08-10T11:00' });
    expect(sortReminders([newer, older], NOW).map((r) => r.text)).toEqual(['older', 'newer']);
  });

  it('does not mutate the array it is given', () => {
    const list = [make({ text: 'b', due: '2026-08-10T14:00' }), make({ text: 'a', due: '2026-08-10T09:00' })];
    const before = list.map((r) => r.text);
    sortReminders(list, NOW);
    expect(list.map((r) => r.text)).toEqual(before);
  });
});

describe('dueLabel', () => {
  it('reads minutes, hours then days', () => {
    expect(dueLabel(make({ due: '2026-08-10T12:30' }), NOW)).toBe('in 30 min');
    expect(dueLabel(make({ due: '2026-08-10T15:00' }), NOW)).toBe('in 3 h');
    expect(dueLabel(make({ due: '2026-08-12T12:00' }), NOW)).toBe('in 2 d');
  });

  it('says how long something is overdue', () => {
    expect(dueLabel(make({ due: '2026-08-10T10:00' }), NOW)).toBe('2 h overdue');
  });

  it('handles done and undated', () => {
    expect(dueLabel(make({ done: true }), NOW)).toBe('Done');
    expect(dueLabel(make({ due: '' }), NOW)).toBe('No time set');
  });
});
