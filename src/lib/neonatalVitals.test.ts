import { describe, expect, it } from 'vitest';
import {
  bloodPressureRow,
  bpFlag,
  cchdScreen,
  flagValue,
  pmaWeeks,
  pretermHeartRate,
  temperatureStatus,
  urineOutputStatus,
} from './neonatalVitals';

describe('pmaWeeks', () => {
  it('adds completed postnatal weeks to GA', () => {
    expect(pmaWeeks(30, 0)).toBe(30);
    expect(pmaWeeks(30, 13)).toBe(31);
    expect(pmaWeeks(30.6, 14)).toBe(32);
  });
  it('rejects invalid input', () => {
    expect(pmaWeeks(20, 3)).toBeNull();
    expect(pmaWeeks(30, -1)).toBeNull();
    expect(pmaWeeks(Number.NaN, 1)).toBeNull();
  });
});

describe('pretermHeartRate (Alonzo 2018, Table 2)', () => {
  it('reads the corners of the table', () => {
    expect(pretermHeartRate(23, 23)).toEqual({ p5: 135, p95: 177 });
    expect(pretermHeartRate(23, 38)).toEqual({ p5: 129, p95: 189 });
    expect(pretermHeartRate(34, 34)).toEqual({ p5: 117, p95: 172 });
    expect(pretermHeartRate(34, 38)).toEqual({ p5: 129, p95: 185 });
    expect(pretermHeartRate(31, 38)).toEqual({ p5: 113, p95: 185 });
  });
  it('returns null outside GA 23–34 or past PMA 38', () => {
    expect(pretermHeartRate(35, 36)).toBeNull();
    expect(pretermHeartRate(22, 23)).toBeNull();
    expect(pretermHeartRate(30, 39)).toBeNull();
  });
});

describe('bloodPressureRow (Dionne 2012)', () => {
  it('needs 2 weeks of age', () => {
    expect(bloodPressureRow(40, 13).kind).toBe('too-young');
  });
  it('uses the even row at or below the PMA', () => {
    const r = bloodPressureRow(41, 20);
    expect(r.kind === 'row' && r.row.pma).toBe(40);
    const r2 = bloodPressureRow(26, 14);
    expect(r2.kind === 'row' && r2.row.sbp.p95).toBe(72);
  });
  it('stops outside 26–44 weeks', () => {
    expect(bloodPressureRow(25, 30).kind).toBe('out-of-range');
    expect(bloodPressureRow(46, 30).kind).toBe('out-of-range');
  });
  it('flags above the 95th and 99th centiles', () => {
    const c = { p50: 80, p95: 95, p99: 100 };
    expect(bpFlag(95, c)).toBe('normal');
    expect(bpFlag(96, c)).toBe('above-95');
    expect(bpFlag(101, c)).toBe('above-99');
  });
});

describe('urine, temperature and SpO2', () => {
  it('applies the AWAKEN urine criterion on days 2–7 only', () => {
    expect(urineOutputStatus(0.5, 0)).toBe('day-1');
    expect(urineOutputStatus(1, 1)).toBe('aki');
    expect(urineOutputStatus(1.2, 6)).toBe('above-threshold');
    expect(urineOutputStatus(0.5, 7)).toBe('after-day-7');
  });
  it('grades temperature', () => {
    expect(temperatureStatus(31.9)).toBe('severe');
    expect(temperatureStatus(35.9)).toBe('moderate');
    expect(temperatureStatus(36.4)).toBe('mild');
    expect(temperatureStatus(36.5)).toBe('normal');
    expect(temperatureStatus(37.5)).toBe('normal');
    expect(temperatureStatus(37.6)).toBe('above');
  });
  it('checks SpO2 targets and the CCHD screen', () => {
    expect(flagValue(89, 90, 94)).toBe('below');
    expect(flagValue(92, 90, 94)).toBe('within');
    expect(cchdScreen(95, 95)).toBe('pass');
    expect(cchdScreen(98, 94)).toBe('not-passed');
  });
});
