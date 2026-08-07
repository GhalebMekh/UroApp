import { describe, expect, it } from 'vitest';
import { ckdEpi2021, ckdStage, cockcroftGault, creatinineToMgDl, crclBand } from './renalFunction';

describe('creatinineToMgDl', () => {
  it('converts µmol/L to mg/dL (97 µmol/L ≈ 1.097 mg/dL)', () => {
    expect(creatinineToMgDl(97, 'umol')).toBeCloseTo(1.097, 2);
  });
  it('passes mg/dL through unchanged', () => {
    expect(creatinineToMgDl(1.1, 'mgdl')).toBe(1.1);
  });
});

describe('ckdEpi2021', () => {
  it('reproduces the verified worked example (64yo male, Scr 1.1 mg/dL -> eGFR 75)', () => {
    expect(ckdEpi2021(1.1, 64, 'male')).toBeCloseTo(75, 0);
  });

  it('gives the same eGFR whether creatinine arrives in mg/dL or the µmol/L-converted equivalent', () => {
    const viaMgDl = ckdEpi2021(1.1, 64, 'male')!;
    const viaUmol = ckdEpi2021(creatinineToMgDl(97, 'umol'), 64, 'male')!;
    expect(viaUmol).toBeCloseTo(viaMgDl, 0);
  });

  it('rejects garbage input (zero/negative creatinine or age)', () => {
    expect(ckdEpi2021(0, 64, 'male')).toBeNull();
    expect(ckdEpi2021(-1, 64, 'male')).toBeNull();
    expect(ckdEpi2021(1.1, 0, 'male')).toBeNull();
    expect(ckdEpi2021(1.1, -5, 'male')).toBeNull();
  });
});

describe('cockcroftGault', () => {
  it('reproduces the verified worked example (64yo male, 78kg, Scr 1.1 -> 75 mL/min)', () => {
    expect(cockcroftGault(1.1, 64, 78, 'male')).toBeCloseTo(75, 0);
  });

  it('applies the 0.85 female multiplier', () => {
    const male = cockcroftGault(1.0, 50, 70, 'male')!;
    const female = cockcroftGault(1.0, 50, 70, 'female')!;
    expect(female).toBeCloseTo(male * 0.85, 5);
  });

  it('never returns a negative value even for an elderly patient past the (140-age) term', () => {
    expect(cockcroftGault(1.0, 150, 70, 'male')).toBe(0);
  });

  it('rejects garbage input', () => {
    expect(cockcroftGault(0, 64, 78, 'male')).toBeNull();
    expect(cockcroftGault(1.1, 64, 0, 'male')).toBeNull();
    expect(cockcroftGault(1.1, -1, 78, 'male')).toBeNull();
  });
});

describe('ckdStage boundaries', () => {
  it.each([
    [90, 'G1'],
    [89.9, 'G2'],
    [60, 'G2'],
    [59.9, 'G3a'],
    [45, 'G3a'],
    [44.9, 'G3b'],
    [30, 'G3b'],
    [29.9, 'G4'],
    [15, 'G4'],
    [14.9, 'G5'],
  ])('eGFR %s -> stage %s', (egfr, stage) => {
    expect(ckdStage(egfr).stage).toBe(stage);
  });
});

describe('crclBand boundaries', () => {
  it('bands at the drug-dosing 60/30 cutoffs', () => {
    expect(crclBand(60)).toBe('low');
    expect(crclBand(59.9)).toBe('moderate');
    expect(crclBand(30)).toBe('moderate');
    expect(crclBand(29.9)).toBe('high');
  });
});
