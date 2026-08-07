import { describe, expect, it } from 'vitest';
import { buildSeries, freeTotalRatioPct, psaDensity, psaDoublingTimeMonths, psaVelocity } from './psa';

describe('psaDensity', () => {
  it('reproduces the classic worked example (PSA 6.5 / 45cc)', () => {
    expect(psaDensity(6.5, 45)).toBeCloseTo(0.1444, 3);
  });

  it('boundary: exactly at the 0.15 threshold', () => {
    expect(psaDensity(0.15 * 40, 40)).toBeCloseTo(0.15, 6);
  });

  it('rejects garbage input (negative, zero volume, non-finite)', () => {
    expect(psaDensity(-1, 40)).toBeNull();
    expect(psaDensity(5, 0)).toBeNull();
    expect(psaDensity(5, -10)).toBeNull();
    expect(psaDensity(NaN, 40)).toBeNull();
  });
});

describe('freeTotalRatioPct', () => {
  it('reproduces a worked example (free 1.0 / total 6.0 -> 16.7%)', () => {
    expect(freeTotalRatioPct(1.0, 6.0)).toBeCloseTo(16.67, 1);
  });

  it('boundary: exactly at the 25% cutoff', () => {
    expect(freeTotalRatioPct(2.5, 10)).toBeCloseTo(25, 6);
  });

  it('rejects garbage input (free > total, negative, zero total)', () => {
    expect(freeTotalRatioPct(11, 10)).toBeNull();
    expect(freeTotalRatioPct(-1, 10)).toBeNull();
    expect(freeTotalRatioPct(1, 0)).toBeNull();
  });
});

describe('buildSeries + psaVelocity + psaDoublingTimeMonths', () => {
  it('computes velocity for a rising series (Carter method)', () => {
    const series = buildSeries([
      { date: '2022-01-01', psa: 4.0 },
      { date: '2023-01-01', psa: 4.75 },
      { date: '2024-01-01', psa: 5.5 },
    ]);
    expect(series).not.toBeNull();
    expect(psaVelocity(series!)).toBeCloseTo(0.75, 1);
  });

  it('doubling time is null (undefined) when PSA is not rising', () => {
    const series = buildSeries([
      { date: '2022-01-01', psa: 5.0 },
      { date: '2023-01-01', psa: 4.5 },
    ]);
    expect(psaDoublingTimeMonths(series!)).toBeNull();
  });

  it('returns null for fewer than 2 valid readings or a zero-span series', () => {
    expect(buildSeries([{ date: '2024-01-01', psa: 5 }])).toBeNull();
    expect(buildSeries([])).toBeNull();
    expect(
      buildSeries([
        { date: '2024-01-01', psa: 5 },
        { date: '2024-01-01', psa: 6 },
      ]),
    ).toBeNull();
  });

  it('ignores garbage rows (blank date, non-positive PSA) when building the series', () => {
    const series = buildSeries([
      { date: '', psa: 5 },
      { date: '2022-01-01', psa: 4.0 },
      { date: '2023-01-01', psa: -1 },
      { date: '2024-01-01', psa: 5.5 },
    ]);
    expect(series).not.toBeNull();
    expect(series).toHaveLength(2);
  });
});
