import { describe, expect, it } from 'vitest';
import { addMonths, toLocalISODate, todayISO } from './date';

describe('toLocalISODate', () => {
  it('uses the local calendar day, not the UTC day', () => {
    // Local midnight on 1 Mar. In any timezone ahead of UTC, toISOString()
    // would report 28/29 Feb — the bug this helper exists to prevent.
    const d = new Date(2026, 2, 1, 0, 0, 0);
    expect(toLocalISODate(d)).toBe('2026-03-01');
  });

  it('zero-pads month and day', () => {
    expect(toLocalISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addMonths', () => {
  it('adds whole months', () => {
    expect(addMonths('2026-01-15', 3)).toBe('2026-04-15');
  });

  it('clamps to the end of a shorter target month', () => {
    // 31 Jan + 3 months = 30 April (April has no 31st).
    expect(addMonths('2026-01-31', 3)).toBe('2026-04-30');
  });

  it('keeps the 31st when the target month has one', () => {
    expect(addMonths('2026-01-31', 9)).toBe('2026-10-31');
  });

  it('clamps 31 Jan + 1 month to the end of February', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
  });

  it('handles a leap-year February', () => {
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
  });

  it('rolls over the year boundary', () => {
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
  });

  it('supports long horizons used by the surveillance schedules', () => {
    expect(addMonths('2026-01-15', 120)).toBe('2036-01-15');
  });

  it('returns an empty string for an invalid date', () => {
    expect(addMonths('not-a-date', 3)).toBe('');
  });
});

describe('todayISO', () => {
  it('matches the local calendar date', () => {
    expect(todayISO()).toBe(toLocalISODate(new Date()));
  });

  it('is a yyyy-mm-dd string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
