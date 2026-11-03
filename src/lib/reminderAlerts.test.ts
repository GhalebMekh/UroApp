import { describe, expect, it } from 'vitest';
import { applyWardAction, normalizeFollowUps, planFollowUpAlerts, planWardAlerts } from './notifications';

const now = new Date('2026-11-01T12:00:00');

describe('planWardAlerts', () => {
  it('alerts at the due time for open, future reminders only', () => {
    const patients = [
      {
        name: 'AB',
        reminders: [
          { text: 'Repeat Hb', due: '2026-11-01T18:00', done: false },
          { text: 'Past', due: '2026-11-01T08:00', done: false },
          { text: 'Done', due: '2026-11-02T08:00', done: true },
          { text: 'Undated', due: '', done: false },
        ],
      },
    ];
    const alerts = planWardAlerts(patients, now);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.body).toBe('Reminder for: Repeat Hb');
    expect(alerts[0]!.at.getHours()).toBe(18);
    // Owner 2026-11-03: the de-identified initials name the patient.
    expect(alerts[0]!.title).toBe('Patient AB has a reminder');
  });

  it('ignores malformed storage', () => {
    expect(planWardAlerts(null, now)).toEqual([]);
    expect(planWardAlerts([{ reminders: 'x' }], now)).toEqual([]);
  });
});

describe('planFollowUpAlerts', () => {
  it('fires a week before each future visit at 09:00', () => {
    const plans = normalizeFollowUps([
      {
        id: 'p1',
        label: 'Case A',
        title: 'NMIBC — High risk',
        visits: [
          { label: '3 months', due: '2026-11-05' }, // reminder date already passed
          { label: '6 months', due: '2027-02-01' },
          { label: 'bad', due: 'soon' },
        ],
      },
    ]);
    const alerts = planFollowUpAlerts(plans, now);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.at.toDateString()).toBe(new Date('2027-01-25T09:00:00').toDateString());
    expect(alerts[0]!.at.getHours()).toBe(9);
    expect(alerts[0]!.title).toContain('Case A');
  });
});

describe('applyWardAction', () => {
  const ward = [{ id: 'p1', reminders: [{ id: 'r1', text: 'Bloods', due: '2026-11-03T09:00', done: false }, { id: 'r2', done: false }] }];

  it('marks only the named reminder done', () => {
    const out = applyWardAction(ward, 'r1', 'done', new Date(2026, 10, 3, 9, 0)) as typeof ward;
    expect(out[0]!.reminders[0]!.done).toBe(true);
    expect(out[0]!.reminders[1]!.done).toBe(false);
  });

  it('snoozes an hour from now in local time', () => {
    const out = applyWardAction(ward, 'r1', 'snooze', new Date(2026, 10, 3, 23, 30)) as typeof ward;
    expect(out[0]!.reminders[0]!.due).toBe('2026-11-04T00:30');
    expect(out[0]!.reminders[0]!.done).toBe(false);
  });

  it('carries the reminder id onto the planned alert', () => {
    const [a] = planWardAlerts(ward, new Date(2026, 10, 3, 8, 0));
    expect(a?.reminderId).toBe('r1');
  });
});
