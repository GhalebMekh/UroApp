import { describe, expect, it } from 'vitest';
import { CHARLSON_CONDITIONS, DIABETES, LIVER, MALIGNANCY, charlsonScore, type CharlsonInput } from './charlson';

const base: CharlsonInput = { conditions: {}, diabetes: 'none', liver: 'none', malignancy: 'none' };

describe('Charlson weights (Charlson 1987, as in Campbell ch. 23)', () => {
  const w = (key: string) => CHARLSON_CONDITIONS.find((c) => c.key === key)!.weight;

  it('weights the eight 1-point conditions at 1', () => {
    for (const k of ['mi', 'chf', 'pvd', 'cvd', 'dementia', 'copd', 'ctd', 'pud']) expect(w(k), k).toBe(1);
  });

  it('weights hemiplegia and moderate/severe renal disease at 2, AIDS at 6', () => {
    expect([w('hemiplegia'), w('renal'), w('aids')]).toEqual([2, 2, 6]);
  });

  it('scores the graded conditions 1/2, 1/3 and 2/6', () => {
    expect([DIABETES.uncomplicated, DIABETES.endOrgan]).toEqual([1, 2]);
    expect([LIVER.mild, LIVER.moderateSevere]).toEqual([1, 3]);
    expect([MALIGNANCY.any, MALIGNANCY.metastatic]).toEqual([2, 6]);
  });
});

describe('charlsonScore', () => {
  it('is 0 with no comorbidity', () => {
    expect(charlsonScore(base)).toBe(0);
  });

  it('sums a typical urology patient', () => {
    // MI (1) + diabetes with end-organ damage (2) + prostate cancer, localised (2) = 5
    expect(charlsonScore({ ...base, conditions: { mi: true }, diabetes: 'endOrgan', malignancy: 'any' })).toBe(5);
  });

  it('counts metastatic disease as 6, not 6 + 2', () => {
    expect(charlsonScore({ ...base, malignancy: 'metastatic' })).toBe(6);
  });

  it('ignores conditions marked false', () => {
    expect(charlsonScore({ ...base, conditions: { mi: false, chf: true } })).toBe(1);
  });
});
