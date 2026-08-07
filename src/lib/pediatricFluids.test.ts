import { describe, expect, it } from 'vitest';
import { bolusVolume, maintenanceFluids } from './pediatricFluids';

describe('maintenanceFluids (Holliday-Segar 4-2-1 / 100-50-20)', () => {
  it('reproduces the verified worked example (14kg -> 48 mL/hr, 1200 mL/day)', () => {
    const r = maintenanceFluids(14)!;
    expect(r.perHour).toBeCloseTo(48, 6);
    expect(r.perDay).toBeCloseTo(1200, 6);
  });

  it('reproduces the second verified worked example (25kg -> 65 mL/hr, 1600 mL/day)', () => {
    const r = maintenanceFluids(25)!;
    expect(r.perHour).toBeCloseTo(65, 6);
    expect(r.perDay).toBeCloseTo(1600, 6);
  });

  it('boundary: exactly 10kg uses only the first tier (4 mL/kg/hr, 100 mL/kg/day)', () => {
    const r = maintenanceFluids(10)!;
    expect(r.perHour).toBe(40);
    expect(r.perDay).toBe(1000);
  });

  it('boundary: exactly 20kg uses the first two tiers', () => {
    const r = maintenanceFluids(20)!;
    expect(r.perHour).toBe(60);
    expect(r.perDay).toBe(1500);
  });

  it('rejects garbage input (zero, negative, non-finite weight)', () => {
    expect(maintenanceFluids(0)).toBeNull();
    expect(maintenanceFluids(-5)).toBeNull();
    expect(maintenanceFluids(NaN)).toBeNull();
  });
});

describe('bolusVolume', () => {
  it('computes a 10 and 20 mL/kg bolus for the verified 14kg case', () => {
    expect(bolusVolume(14, 10)).toBe(140);
    expect(bolusVolume(14, 20)).toBe(280);
  });

  it('rejects garbage weight', () => {
    expect(bolusVolume(0, 10)).toBeNull();
    expect(bolusVolume(-1, 10)).toBeNull();
  });
});
