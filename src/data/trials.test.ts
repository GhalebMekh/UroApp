import { describe, expect, it } from 'vitest';
import { TRIALS, TRIAL_AREAS } from './trials';

describe('landmark trials digest', () => {
  it('holds about 20 trials across all four areas', () => {
    expect(TRIALS.length).toBeGreaterThanOrEqual(18);
    for (const a of TRIAL_AREAS) expect(TRIALS.some((t) => t.area === a.id), a.id).toBe(true);
  });

  it('gives every trial a unique id and a PubMed source', () => {
    expect(new Set(TRIALS.map((t) => t.id)).size).toBe(TRIALS.length);
    for (const t of TRIALS) {
      expect(t.source.pmid, t.id).toMatch(/^\d{6,9}$/);
      if (t.later) {
        expect(t.later.source.pmid, `${t.id} later`).toMatch(/^\d{6,9}$/);
        expect(t.later.source.year, `${t.id} later`).toBeGreaterThan(t.source.year);
      }
    }
  });

  it('fills every field and avoids em dashes in our own wording', () => {
    for (const t of TRIALS) {
      for (const field of [t.question, t.design, t.size, t.result, t.practice]) {
        expect(field.trim().length, t.id).toBeGreaterThan(0);
        expect(field, t.id).not.toContain('—');
      }
    }
  });
});
