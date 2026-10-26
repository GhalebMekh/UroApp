import { describe, expect, it } from 'vitest';
import { BENIGN_TOPICS, CALCULATORS, ONCOLOGY_ORGANS, groupLabel, siblingsOf } from './registry';

describe('calculator registry', () => {
  it('has unique ids', () => {
    const ids = CALCULATORS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('files every calculator under a heading, so none drops out of the list', () => {
    const organs = new Set(ONCOLOGY_ORGANS.map((o) => o.organ));
    const topics = new Set(BENIGN_TOPICS.map((t) => t.topic));
    for (const c of CALCULATORS) {
      if (c.category === 'oncological') {
        expect(c.organ && organs.has(c.organ), `${c.id} needs an oncology organ`).toBeTruthy();
      } else {
        expect(c.topic && topics.has(c.topic), `${c.id} needs a benign topic`).toBeTruthy();
      }
      expect(groupLabel(c), `${c.id} heading`).not.toBe('');
    }
  });

  it('links siblings within the same heading only', () => {
    const capra = CALCULATORS.find((c) => c.id === 'capra')!;
    const sibs = siblingsOf(capra).map((c) => c.id);
    expect(sibs).toContain('capra-s');
    expect(sibs).not.toContain('capra');
    expect(sibs).not.toContain('eortc');
  });
});
