import { describe, expect, it } from 'vitest';
import { addDays, daysBetween } from './date';
import { planStentAlerts } from './notifications';
import {
  dueText,
  dwellDays,
  looksLikeIdentifier,
  normalizeStents,
  shortcutDate,
  sortStents,
  stentStatus,
  type Stent,
} from './stents';

const stent = (over: Partial<Stent> = {}): Stent => ({
  id: 'a',
  label: 'AM',
  note: 'post-URS',
  side: 'left',
  size: '',
  inserted: '2026-11-01',
  removeBy: '2026-11-29',
  removed: '',
  setOn: '2026-11-01',
  ...over,
});

describe('dates', () => {
  it('adds and counts calendar days', () => {
    expect(addDays('2026-11-28', 7)).toBe('2026-12-05');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-11-01', '2026-11-29')).toBe(28);
    expect(daysBetween('2026-11-29', '2026-11-01')).toBe(-28);
    expect(daysBetween('bad', '2026-11-01')).toBeNaN();
  });

  it('remove-by shortcuts count from insertion; months are calendar months', () => {
    expect(shortcutDate('2026-11-01', { days: 14 })).toBe('2026-11-15');
    expect(shortcutDate('2026-11-30', { months: 3 })).toBe('2027-02-28');
  });
});

describe('status', () => {
  it('is overdue, due within the week, or simply in', () => {
    expect(stentStatus(stent(), '2026-11-30')).toBe('overdue');
    expect(stentStatus(stent(), '2026-11-29')).toBe('due-soon');
    expect(stentStatus(stent(), '2026-11-22')).toBe('due-soon');
    expect(stentStatus(stent(), '2026-11-21')).toBe('in');
    expect(stentStatus(stent({ removed: '2026-11-20' }), '2026-12-30')).toBe('removed');
  });

  it('words the due date', () => {
    expect(dueText(stent(), '2026-12-02')).toBe('Overdue by 3 days');
    expect(dueText(stent(), '2026-11-30')).toBe('Overdue by 1 day');
    expect(dueText(stent(), '2026-11-29')).toBe('Due today');
    expect(dueText(stent(), '2026-11-28')).toBe('Due in 1 day');
    expect(dueText(stent(), '2026-11-01')).toMatch(/^Due 29 Nov 2026$/);
  });

  it('counts days in situ from insertion (day 1), stopping at removal', () => {
    expect(dwellDays(stent(), '2026-11-01')).toBe(1);
    expect(dwellDays(stent(), '2026-11-10')).toBe(10);
    expect(dwellDays(stent({ removed: '2026-11-05' }), '2026-12-25')).toBe(5);
    expect(dwellDays(stent({ inserted: '' }), '2026-11-10')).toBeNull();
  });

  it('lists the most urgent first, removed ones apart', () => {
    const { active, removed } = sortStents([
      stent({ id: 'late', removeBy: '2027-01-10' }),
      stent({ id: 'gone', removed: '2026-11-03' }),
      stent({ id: 'soon', removeBy: '2026-11-10' }),
    ]);
    expect(active.map((s) => s.id)).toEqual(['soon', 'late']);
    expect(removed.map((s) => s.id)).toEqual(['gone']);
  });
});

describe('no identifiers', () => {
  it('flags record-number-like text', () => {
    expect(looksLikeIdentifier('AM')).toBe(false);
    expect(looksLikeIdentifier('6 Fr 26 cm, 8 mm stone')).toBe(false);
    expect(looksLikeIdentifier('MRN 1234567')).toBe(true);
    expect(looksLikeIdentifier('12-345-678')).toBe(true);
  });

  it('keeps stored text within limits and drops broken rows', () => {
    const [s] = normalizeStents([
      { id: 'x', label: 'ABCDEFGHIJKLMNOP', side: 'top', removeBy: '2026-12-01', inserted: '1/11/2026' },
      { id: 'no-date', label: 'AB' },
      null,
    ]);
    expect(s).toMatchObject({ id: 'x', label: 'ABCDEFGHIJKL', side: 'left', inserted: '', removed: '', setOn: '' });
    expect(normalizeStents('nope')).toEqual([]);
  });
});

describe('reminders', () => {
  const at9 = (iso: string) => new Date(`${iso}T09:00:00`).getTime();

  it('fires once, at 09:00 a week before the remove-by date', () => {
    const [a, ...rest] = planStentAlerts([stent()], new Date('2026-11-05T12:00:00'));
    expect(rest).toEqual([]);
    expect(a!.at.getTime()).toBe(at9('2026-11-22'));
    expect(a!.title).toBe('Patient AM: stent due out in 1 week');
    expect(a!.body).toBe('Left stent, remove by 29 Nov 2026. Book the removal.');
    expect(a!.link).toEqual({ residency: { section: 'or', orTab: 'stents' } });
  });

  it('never puts the free-text note on the lock screen', () => {
    const [a] = planStentAlerts([stent({ note: 'secret detail' })], new Date('2026-11-05T12:00:00'));
    expect(`${a!.title} ${a!.body}`).not.toContain('secret');
  });

  it('a date set less than a week ahead is reminded on the day instead', () => {
    const late = stent({ removeBy: '2026-11-29', setOn: '2026-11-25' });
    const [a] = planStentAlerts([late], new Date('2026-11-25T10:00:00'));
    expect(a!.at.getTime()).toBe(at9('2026-11-29'));
    expect(a!.title).toBe('Patient AM: stent due out today');
  });

  it('does not add a second, on-the-day alert after the 1-week one has fired', () => {
    expect(planStentAlerts([stent()], new Date('2026-11-23T10:00:00'))).toEqual([]);
  });

  it('skips removed and past-due stents', () => {
    expect(planStentAlerts([stent({ removed: '2026-11-10' })], new Date('2026-11-05T12:00:00'))).toEqual([]);
    expect(planStentAlerts([stent({ setOn: '2026-11-29' })], new Date('2026-11-30T08:00:00'))).toEqual([]);
  });
});
