import { describe, expect, it } from 'vitest';
import {
  ALBUMIN_MW,
  DEFAULT_ALBUMIN_G_L,
  K_ALBUMIN,
  K_SHBG,
  calculateFreeT,
  freeAndrogenIndex,
  ngDlToNmolL,
  nmolLToNgDl,
} from './freeTestosterone';

describe('constants match Vermeulen 1999', () => {
  it('uses 1e9 for SHBG, not the 1e10 many online calculators quote', () => {
    expect(K_SHBG).toBe(1.0e9);
  });

  it('uses 3.6e4 for albumin and 69,000 for albumin molecular weight', () => {
    expect(K_ALBUMIN).toBe(3.6e4);
    expect(ALBUMIN_MW).toBe(69_000);
  });

  it('reproduces the paper\'s stated Ka*Ca of about 22 at 43 g/L albumin', () => {
    // The paper gives albumin ~43 g/L => ~6.2e-4 mol/L, and states Ka*Ca ~= 22.
    // This is an independent check that the constants and units line up.
    const Ca = DEFAULT_ALBUMIN_G_L / ALBUMIN_MW;
    expect(Ca).toBeCloseTo(6.2e-4, 5);
    expect(K_ALBUMIN * Ca).toBeCloseTo(22, 0);
  });
});

describe('calculateFreeT', () => {
  // A healthy man: total T 20 nmol/L (~577 ng/dL), SHBG 30 nmol/L.
  const normal = { totalT: 20, shbg: 30 };

  it('puts the free fraction near 2% of total, as the physiology requires', () => {
    const r = calculateFreeT(normal)!;
    expect(r.freePercent).toBeGreaterThan(1);
    expect(r.freePercent).toBeLessThan(3);
  });

  it('puts the bioavailable fraction near half of total', () => {
    // AUA describes ~50% albumin-bound plus ~2% free as the bioavailable pool.
    const r = calculateFreeT(normal)!;
    expect(r.bioavailablePercent).toBeGreaterThan(40);
    expect(r.bioavailablePercent).toBeLessThan(65);
  });

  it('always yields bioavailable greater than free', () => {
    const r = calculateFreeT(normal)!;
    expect(r.bioavailableT).toBeGreaterThan(r.freeT);
  });

  it('reports free T in pmol/L as well as nmol/L', () => {
    const r = calculateFreeT(normal)!;
    expect(r.freeTPmol).toBeCloseTo(r.freeT * 1000, 6);
  });

  it('falls as SHBG rises, at identical total testosterone', () => {
    // The entire clinical point: total T can look normal while free T is low.
    const lowShbg = calculateFreeT({ totalT: 15, shbg: 15 })!;
    const highShbg = calculateFreeT({ totalT: 15, shbg: 80 })!;
    expect(highShbg.freeT).toBeLessThan(lowShbg.freeT);
  });

  it('rises as albumin rises, at identical total testosterone and SHBG', () => {
    const low = calculateFreeT({ totalT: 20, shbg: 30, albuminGL: 30 })!;
    const high = calculateFreeT({ totalT: 20, shbg: 30, albuminGL: 50 })!;
    expect(high.bioavailableT).toBeGreaterThan(low.bioavailableT);
  });

  it('defaults albumin to the 43 g/L the paper assumes', () => {
    const implicit = calculateFreeT({ totalT: 20, shbg: 30 })!;
    const explicit = calculateFreeT({ totalT: 20, shbg: 30, albuminGL: 43 })!;
    expect(implicit.freeT).toBeCloseTo(explicit.freeT, 12);
  });

  it('rejects unusable input rather than returning a misleading number', () => {
    expect(calculateFreeT({ totalT: 0, shbg: 30 })).toBeNull();
    expect(calculateFreeT({ totalT: 20, shbg: 0 })).toBeNull();
    expect(calculateFreeT({ totalT: Number.NaN, shbg: 30 })).toBeNull();
    expect(calculateFreeT({ totalT: 20, shbg: 30, albuminGL: -5 })).toBeNull();
  });
});

describe('unit conversion', () => {
  it('converts 300 ng/dL — the AUA cut-off — to about 10.4 nmol/L', () => {
    expect(ngDlToNmolL(300)).toBeCloseTo(10.4, 1);
  });

  it('round-trips', () => {
    expect(nmolLToNgDl(ngDlToNmolL(577))).toBeCloseTo(577, 6);
  });
});

describe('free androgen index', () => {
  it('is 100 * T / SHBG, both in nmol/L', () => {
    expect(freeAndrogenIndex(20, 30)).toBeCloseTo(66.67, 2);
  });

  it('guards against divide-by-zero', () => {
    expect(freeAndrogenIndex(20, 0)).toBeNull();
  });
});
