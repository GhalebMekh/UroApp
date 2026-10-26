import { describe, expect, it } from 'vitest';
import { SEARCH_INDEX } from './searchIndex';
import { CALCULATORS } from '@/components/calculators/registry';
import { PEDIATRIC_TOOLS } from '@/components/pediatrics/registry';
import { PROCEDURES } from './procedures';
import { EMERGENCIES } from './oncall';

describe('search index', () => {
  it('only links to tools, procedures and pathways that exist', () => {
    const calcs = new Set(CALCULATORS.map((c) => c.id));
    const peds = new Set(PEDIATRIC_TOOLS.map((t) => t.id));
    const procs = new Set(PROCEDURES.map((p) => p.id));
    const ems = new Set(EMERGENCIES.map((e) => e.id));
    for (const item of SEARCH_INDEX) {
      if (item.calcId) expect(calcs.has(item.calcId), `${item.label} calcId`).toBe(true);
      if (item.pedsId) expect(peds.has(item.pedsId), `${item.label} pedsId`).toBe(true);
      if (item.link && 'residency' in item.link) {
        const { procedure, emergency } = item.link.residency;
        if (procedure) expect(procs.has(procedure), `${item.label} procedure`).toBe(true);
        if (emergency) expect(ems.has(emergency), `${item.label} emergency`).toBe(true);
      }
    }
  });

  it('lists every pediatric tool', () => {
    const listed = new Set(SEARCH_INDEX.map((i) => i.pedsId).filter(Boolean));
    for (const t of PEDIATRIC_TOOLS) expect(listed.has(t.id), t.id).toBe(true);
  });
});
