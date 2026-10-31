import { describe, expect, it } from 'vitest';
import { cmeReminder, inCycle,normalizeActivity, normalizeTarget, summarise, toCsv, type CmeActivity, type CmeTarget } from './cme';

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

describe('toCsv', () => {
  const t: CmeTarget = { hours: 0, cycleStart: '2026-01-01', cycleEnd: '' };
  const rows = [
    act({ id: 'a', date: '2026-06-01', title: 'SUA, "annual" meeting', hours: 6 }),
    act({ id: 'b', date: '2026-02-01', title: '=HYPERLINK("x")', accredited: false }),
    act({ id: 'c', date: '2025-12-31', title: 'old' }),
  ];
  const csv = toCsv(rows, t, (id) => id === 'a');
  const lines = csv.slice(1).trim().split('\r\n');

  it('starts with a BOM, keeps only the cycle, oldest first', () => {
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('Date,Activity,Provider,Type,Hours,Accredited,Reference,Certificate');
    expect(lines[1]!.startsWith('2026-02-01')).toBe(true);
  });

  it('quotes commas and quotes, and marks certificates', () => {
    expect(lines[2]).toContain('"SUA, ""annual"" meeting"');
    expect(lines[2]!.endsWith('Attached')).toBe(true);
  });

  it('neutralises spreadsheet formulas', () => {
    expect(lines[1]).toContain(`"'=HYPERLINK(""x"")"`);
  });
});

describe('cmeReminder', () => {
  const t: CmeTarget = { hours: 30, cycleStart: '2026-01-01', cycleEnd: '2026-12-31' };
  const done = [act({ date: '2026-03-01', hours: 18 })];

  it('stays quiet without a target or end date, or when far off', () => {
    expect(cmeReminder(done, { ...t, hours: 0 }, '2026-11-01')).toBeNull();
    expect(cmeReminder(done, { ...t, cycleEnd: '' }, '2026-11-01')).toBeNull();
    expect(cmeReminder(done, t, '2026-06-01')).toBeNull();
  });

  it('stays quiet once the target is met', () => {
    expect(cmeReminder([act({ date: '2026-03-01', hours: 30 })], t, '2026-12-01')).toBeNull();
  });

  it('gives days left and the monthly pace inside the window', () => {
    const r = cmeReminder(done, t, '2026-10-31')!;
    expect(r.daysLeft).toBe(61);
    expect(r.remaining).toBe(12);
    expect(r.perMonth).toBe(5.9); // 12 h over 62 days (≈2.04 months)
  });

  it('reports an ended cycle with no pace', () => {
    const r = cmeReminder(done, t, '2027-01-05')!;
    expect(r.daysLeft).toBeLessThan(0);
    expect(r.perMonth).toBeNull();
  });
});
