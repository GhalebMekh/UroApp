import { describe, expect, it } from 'vitest';
import { normalizeFollowUps, planFollowUpAlerts, planWardAlerts } from './notifications';

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
    expect(alerts[0]!.body).toBe('Repeat Hb');
    expect(alerts[0]!.at.getHours()).toBe(18);
    // The patient label never reaches the lock screen.
    expect(JSON.stringify(alerts)).not.toContain('AB');
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
