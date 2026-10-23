import { describe, expect, it } from 'vitest';
import { COMMON_TOOLS, SITE_TOOLS, emptyCase, normalizeCase, sortCases, type MdtCase } from './mdt';
import { CALCULATORS } from '@/components/calculators/registry';

describe('MDT calculator shortcuts', () => {
  it('only point at calculators that exist', () => {
    // A renamed calculator id would leave a dead shortcut on every case.
    const ids = new Set(CALCULATORS.map((c) => c.id));
    for (const [site, tools] of Object.entries(SITE_TOOLS)) {
      for (const t of tools) expect(ids.has(t), `${site} → ${t}`).toBe(true);
    }
    for (const t of COMMON_TOOLS) expect(ids.has(t), t).toBe(true);
  });
});

describe('normalizeCase', () => {
  it('fills missing fields and rejects an unknown site', () => {
    const c = normalizeCase({ id: 'x', site: 'liver', initials: 'AM' })!;
    expect(c.site).toBe('other');
    expect(c.question).toBe('');
    expect(c.initials).toBe('AM');
  });

  it('rejects junk', () => {
    expect(normalizeCase(null)).toBeNull();
    expect(normalizeCase({ site: 'prostate' })).toBeNull();
  });
});

describe('sortCases', () => {
  const c = (over: Partial<MdtCase>): MdtCase => ({ ...emptyCase('2026-11-01'), ...over });

  it('orders by meeting date, then by site in list order', () => {
    const sorted = sortCases([
      c({ id: '1', mdtDate: '2026-11-08', site: 'prostate' }),
      c({ id: '2', mdtDate: '2026-11-01', site: 'kidney' }),
      c({ id: '3', mdtDate: '2026-11-01', site: 'prostate' }),
    ]);
    expect(sorted.map((x) => x.id)).toEqual(['3', '2', '1']);
  });
});
