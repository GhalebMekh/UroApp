import { describe, expect, it } from 'vitest';
import {
  DST_CUTOFF,
  dstResult,
  huBand,
  imagingCategory,
  needsAldosteroneRenin,
  needsMetanephrines,
  type Appearance,
  type ImagingCategory,
  type SizeBand,
} from './adrenalWorkup';

const cat = (hu: number | null, size: SizeBand, appearance: Appearance) =>
  imagingCategory({ hu, size, appearance });

describe('huBand — the guideline\'s ≤10 / 11–20 / >20 bands', () => {
  it('places the boundaries where the guideline does', () => {
    expect(huBand(10)).toBe('le10');
    expect(huBand(11)).toBe('11to20');
    expect(huBand(20)).toBe('11to20');
    expect(huBand(21)).toBe('gt20');
    expect(huBand(-5)).toBe('le10');
  });

  it('does not call a fractional value between 10 and 11 benign', () => {
    expect(huBand(10.4)).toBe('11to20');
  });
});

describe('imagingCategory — ESE 2023 R.2.3 to R.2.6', () => {
  it('R.2.3: homogeneous ≤10 HU is benign at ANY size', () => {
    expect(cat(5, 'lt4', 'homogeneous')).toBe('benign');
    expect(cat(10, 'ge4', 'homogeneous')).toBe('benign');
  });

  it('R.2.4: homogeneous 11–20 HU under 4 cm', () => {
    expect(cat(15, 'lt4', 'homogeneous')).toBe('r2.4');
  });

  it('R.2.5: ≥4 cm and heterogeneous, or ≥4 cm and >20 HU', () => {
    expect(cat(30, 'ge4', 'homogeneous')).toBe('r2.5');
    expect(cat(5, 'ge4', 'heterogeneous')).toBe('r2.5');
    expect(cat(15, 'ge4', 'heterogeneous')).toBe('r2.5');
  });

  it('R.2.6: the guideline\'s own three examples of "not in a category above"', () => {
    // "tumor size ≥ 4 cm with unenhanced HU 11-20"
    expect(cat(15, 'ge4', 'homogeneous')).toBe('r2.6');
    // "tumor size < 4 cm with unenhanced HU > 20"
    expect(cat(30, 'lt4', 'homogeneous')).toBe('r2.6');
    // "tumor size < 4 cm with heterogeneous appearance"
    expect(cat(15, 'lt4', 'heterogeneous')).toBe('r2.6');
  });

  it('never calls a heterogeneous lesion benign, even at ≤10 HU', () => {
    expect(cat(5, 'lt4', 'heterogeneous')).toBe('r2.6');
  });

  it('asks for unenhanced CT first when there is none (R.2.2)', () => {
    expect(cat(null, 'lt4', 'homogeneous')).toBe('no-ct');
    expect(cat(Number.NaN, 'ge4', 'heterogeneous')).toBe('no-ct');
  });

  it('assigns every combination to exactly one category', () => {
    const seen = new Set<ImagingCategory>();
    for (const hu of [null, 0, 10, 15, 20, 25])
      for (const size of ['lt4', 'ge4'] as SizeBand[])
        for (const appearance of ['homogeneous', 'heterogeneous'] as Appearance[])
          seen.add(cat(hu, size, appearance));
    expect([...seen].sort()).toEqual(['benign', 'no-ct', 'r2.4', 'r2.5', 'r2.6']);
  });
});

describe('hormonal screen', () => {
  it('R.3.9: metanephrines for anything not typical of a benign adenoma', () => {
    expect(needsMetanephrines('benign')).toBe(false);
    for (const c of ['no-ct', 'r2.4', 'r2.5', 'r2.6'] as ImagingCategory[]) {
      expect(needsMetanephrines(c), c).toBe(true);
    }
  });

  it('R.3.10: aldosterone/renin ratio with hypertension or unexplained hypokalaemia', () => {
    expect(needsAldosteroneRenin(false, false)).toBe(false);
    expect(needsAldosteroneRenin(true, false)).toBe(true);
    expect(needsAldosteroneRenin(false, true)).toBe(true);
  });

  it('R.3.3: uses 50 nmol/L ≡ 1.8 µg/dL as the exclusion cut-off', () => {
    expect(DST_CUTOFF).toEqual({ nmol: 50, ugdl: 1.8 });
    expect(dstResult(50, 'nmol', false)).toBe('excluded');
    expect(dstResult(1.8, 'ugdl', false)).toBe('excluded');
  });

  it('R.3.4: above the cut-off without overt features is MACS', () => {
    expect(dstResult(51, 'nmol', false)).toBe('macs');
    expect(dstResult(2.4, 'ugdl', false)).toBe('macs');
  });

  it('does not label MACS when overt Cushing\'s features are present', () => {
    expect(dstResult(200, 'nmol', true)).toBe('overt');
  });

  it('rejects unusable input', () => {
    expect(dstResult(Number.NaN, 'nmol', false)).toBeNull();
    expect(dstResult(-1, 'nmol', false)).toBeNull();
  });
});
