import { describe, expect, it } from 'vitest';
import { TNM_CANCERS } from './tnm';

function cancer(id: string) {
  const c = TNM_CANCERS.find((x) => x.id === id);
  if (!c) throw new Error(`cancer ${id} not found`);
  return c;
}

describe('prostate TNM staging (AJCC 8th prognostic groups)', () => {
  const prostate = cancer('prostate');
  it.each([
    [{ T: 'T1', N: 'N0', M: 'M0', PSA: 'lt10', GG: '1' }, 'I'],
    [{ T: 'T2b', N: 'N0', M: 'M0', PSA: 'lt10', GG: '1' }, 'IIA'],
    [{ T: 'T2a', N: 'N0', M: 'M0', PSA: 'ge20', GG: '4' }, 'IIIA'],
    [{ T: 'T2a', N: 'N0', M: 'M0', PSA: '10to20', GG: '5' }, 'IIIC'],
    [{ T: 'T1', N: 'N1', M: 'M0', PSA: 'lt10', GG: '1' }, 'IVA'],
    [{ T: 'T1', N: 'N0', M: 'M1', PSA: 'lt10', GG: '1' }, 'IVB'],
  ])('%o -> stage %s', (sel, expected) => {
    expect(prostate.stage(sel)?.code).toBe(expected);
  });

  it('returns null until every axis is selected', () => {
    expect(prostate.stage({ T: 'T1' })).toBeNull();
  });
});

describe('kidney (RCC) TNM staging', () => {
  const kidney = cancer('kidney');
  it.each([
    [{ T: 'T1', N: 'N0', M: 'M0' }, 'I'],
    [{ T: 'T2', N: 'N0', M: 'M0' }, 'II'],
    [{ T: 'T1', N: 'N1', M: 'M0' }, 'III'],
    [{ T: 'T3', N: 'N0', M: 'M0' }, 'III'],
    [{ T: 'T4', N: 'N0', M: 'M0' }, 'IV'],
    [{ T: 'T1', N: 'N0', M: 'M1' }, 'IV'],
  ])('%o -> stage %s', (sel, expected) => {
    expect(kidney.stage(sel)?.code).toBe(expected);
  });
});

describe('bladder TNM staging', () => {
  const bladder = cancer('bladder');
  it.each([
    [{ T: 'Ta', N: 'N0', M: 'M0' }, '0a'],
    [{ T: 'Tis', N: 'N0', M: 'M0' }, '0is'],
    [{ T: 'T1', N: 'N0', M: 'M0' }, 'I'],
    [{ T: 'T2a', N: 'N0', M: 'M0' }, 'II'],
    [{ T: 'T4a', N: 'N0', M: 'M0' }, 'IIIA'],
    [{ T: 'T1', N: 'N1', M: 'M0' }, 'IIIA'],
    [{ T: 'T1', N: 'N2', M: 'M0' }, 'IIIB'],
    [{ T: 'T4b', N: 'N0', M: 'M0' }, 'IVA'],
    [{ T: 'T1', N: 'N0', M: 'M1a' }, 'IVA'],
    [{ T: 'T1', N: 'N0', M: 'M1b' }, 'IVB'],
  ])('%o -> stage %s', (sel, expected) => {
    expect(bladder.stage(sel)?.code).toBe(expected);
  });
});

describe('testis TNM staging (with S serum markers)', () => {
  const testis = cancer('testis');
  it.each([
    [{ T: 'pT1', N: 'N0', M: 'M0', S: 'S0' }, 'IA'],
    [{ T: 'pTis', N: 'N0', M: 'M0', S: 'S1' }, 'IS'],
    [{ T: 'pT2', N: 'N2', M: 'M0', S: 'S2' }, 'IIIB'],
    [{ T: 'pT2', N: 'N1', M: 'M0', S: 'S0' }, 'IIA'],
    [{ T: 'pT2', N: 'N0', M: 'M1a', S: 'S3' }, 'IIIC'],
    [{ T: 'pT2', N: 'N0', M: 'M1b', S: 'S0' }, 'IIIC'],
  ])('%o -> stage %s', (sel, expected) => {
    expect(testis.stage(sel)?.code).toBe(expected);
  });
});
