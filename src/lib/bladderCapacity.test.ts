import { describe, expect, it } from 'vitest';
import { dvssAbove, iccsEbc, infantEbc, isValidDvssTotal, koffEbc, percentOfEbc } from './bladderCapacity';

describe('iccsEbc', () => {
  it('matches the consensus table (5 y 180 mL … 11 y 360 mL, 12–18 y 390 mL)', () => {
    expect(iccsEbc(5)).toBe(180);
    expect(iccsEbc(8)).toBe(270);
    expect(iccsEbc(11)).toBe(360);
    expect(iccsEbc(12)).toBe(390);
    expect(iccsEbc(18)).toBe(390);
  });

  it('uses completed years and rejects out-of-range ages', () => {
    expect(iccsEbc(7.9)).toBe(240);
    expect(iccsEbc(0.5)).toBeNull();
    expect(iccsEbc(19)).toBeNull();
  });
});

describe('Campbell alternatives', () => {
  it('Koff: (age + 2) × 30', () => {
    expect(koffEbc(5)).toBe(210);
  });
  it('infants: weight × 7', () => {
    expect(infantEbc(6)).toBe(42);
    expect(infantEbc(0)).toBeNull();
  });
});

describe('percentOfEbc', () => {
  it('reproduces the table cut-offs at 8 years (130% ≈ 351, 65% ≈ 176)', () => {
    expect(percentOfEbc(351, 270)).toBe(130);
    expect(percentOfEbc(176, 270)).toBe(65);
  });
});

describe('DVSS', () => {
  it('flags totals above 6 in girls and above 9 in boys', () => {
    expect(dvssAbove(6, 'female')).toBe(false);
    expect(dvssAbove(7, 'female')).toBe(true);
    expect(dvssAbove(9, 'male')).toBe(false);
    expect(dvssAbove(10, 'male')).toBe(true);
  });

  it('accepts whole totals 0–30 only', () => {
    expect(isValidDvssTotal(0)).toBe(true);
    expect(isValidDvssTotal(30)).toBe(true);
    expect(isValidDvssTotal(31)).toBe(false);
    expect(isValidDvssTotal(4.5)).toBe(false);
  });
});
