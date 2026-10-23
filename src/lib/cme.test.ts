import { describe, expect, it } from 'vitest';
import { inCycle, normalizeActivity, normalizeTarget, summarise, type CmeActivity, type CmeTarget } from './cme';

const act = (over: Partial<CmeActivity>): CmeActivity => ({
  id: Math.random().toString(36).slice(2),
  date: '2026-05-01',
  title: 'x',
  provider: '',
  hours: 1,
  type: 'conference',
  accredited: true,
  reference: '',
  ...over,
});

const target: CmeTarget = { hours: 30, cycleStart: '2026-01-01', cycleEnd: '2026-12-31' };

describe('inCycle', () => {
  it('includes both boundary dates', () => {
    expect(inCycle(act({ date: '2026-01-01' }), target)).toBe(true);
    expect(inCycle(act({ date: '2026-12-31' }), target)).toBe(true);
  });

  it('excludes activity outside the cycle', () => {
    expect(inCycle(act({ date: '2025-12-31' }), target)).toBe(false);
    expect(inCycle(act({ date: '2027-01-01' }), target)).toBe(false);
  });

  it('counts everything when no cycle is set', () => {
    expect(inCycle(act({ date: '1999-01-01' }), { hours: 0, cycleStart: '', cycleEnd: '' })).toBe(true);
  });
});

describe('summarise', () => {
  it('totals hours in the cycle, splitting accredited and by type', () => {
    const s = summarise(
      [
        act({ hours: 6, type: 'conference' }),
        act({ hours: 1.5, type: 'online', accredited: false }),
        act({ hours: 10, date: '2025-06-01' }), // previous cycle — ignored
      ],
      target,
    );
    expect(s.total).toBe(7.5);
    expect(s.accredited).toBe(6);
    expect(s.byType).toEqual({ conference: 6, online: 1.5 });
    expect(s.percent).toBe(25);
    expect(s.remaining).toBe(22.5);
  });

  it('caps progress at 100% and remaining at 0', () => {
    const s = summarise([act({ hours: 40 })], target);
    expect(s.percent).toBe(100);
    expect(s.remaining).toBe(0);
  });

  it('avoids floating-point noise', () => {
    const s = summarise([act({ hours: 0.1 }), act({ hours: 0.2 })], target);
    expect(s.total).toBe(0.3);
  });

  it('reports no progress figures when no target is set', () => {
    const s = summarise([act({})], { hours: 0, cycleStart: '', cycleEnd: '' });
    expect(s.percent).toBeNull();
    expect(s.remaining).toBeNull();
  });
});

describe('normalize', () => {
  it('rejects junk and repairs bad fields', () => {
    expect(normalizeActivity(null)).toBeNull();
    expect(normalizeActivity({ id: 'a' })).toBeNull();
    const a = normalizeActivity({ id: 'a', title: 't', hours: -3, type: 'party' })!;
    expect(a.hours).toBe(0);
    expect(a.type).toBe('other');
  });

  it('gives an empty target for missing storage', () => {
    expect(normalizeTarget(undefined)).toEqual({ hours: 0, cycleStart: '', cycleEnd: '' });
  });
});
