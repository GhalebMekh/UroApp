import { describe, expect, it } from 'vitest';
import {
  QSOFA_CRITERIA,
  SOURCE_CONTROL,
  UROSEPSIS_CITATIONS,
  assess,
  isSepticShock,
} from './urosepsis';

describe('qSOFA', () => {
  it('has the three Sepsis-3 criteria', () => {
    expect(QSOFA_CRITERIA.map((c) => c.key)).toEqual(['rr', 'mentation', 'sbp']);
  });

  it('preserves the Sepsis-3 thresholds verbatim in the labels', () => {
    const labels = QSOFA_CRITERIA.map((c) => c.label).join(' | ');
    expect(labels).toContain('≥22');
    expect(labels).toContain('≤100 mmHg');
  });

  it('is positive at 2 or more criteria, negative below', () => {
    expect(assess({}, false, false).qsofaPositive).toBe(false);
    expect(assess({ rr: true }, false, false).qsofaPositive).toBe(false);
    expect(assess({ rr: true, sbp: true }, false, false).qsofaPositive).toBe(true);
    expect(assess({ rr: true, sbp: true, mentation: true }, false, false).qsofaScore).toBe(3);
  });
});

describe('septic shock (Sepsis-3)', () => {
  it('requires BOTH vasopressors and lactate >2', () => {
    expect(isSepticShock(true, true)).toBe(true);
    expect(isSepticShock(true, false)).toBe(false);
    expect(isSepticShock(false, true)).toBe(false);
    expect(isSepticShock(false, false)).toBe(false);
  });
});

describe('first-hour actions', () => {
  it('demands antimicrobials within 1 h in septic shock', () => {
    const r = assess({}, true, true);
    expect(r.shock).toBe(true);
    expect(r.urgency).toBe('immediate');
    expect(r.antimicrobial.timing).toBe('within 1 h');
  });

  it('demands antimicrobials within 1 h when qSOFA positive without shock', () => {
    const r = assess({ rr: true, sbp: true }, false, false);
    expect(r.shock).toBe(false);
    expect(r.urgency).toBe('immediate');
    expect(r.antimicrobial.timing).toBe('within 1 h');
  });

  it('allows 3 h for possible sepsis without shock', () => {
    expect(assess({}, false, false).antimicrobial.timing).toBe('within 3 h');
    expect(assess({ rr: true }, false, false).antimicrobial.timing).toBe('within 3 h');
  });

  it('escalates urgency as criteria accumulate', () => {
    expect(assess({}, false, false).urgency).toBe('monitor');
    expect(assess({ rr: true }, false, false).urgency).toBe('urgent');
    expect(assess({ rr: true, sbp: true }, false, false).urgency).toBe('immediate');
  });

  it('surfaces decompression as source control whenever sepsis is likely', () => {
    for (const r of [assess({}, true, true), assess({ rr: true, sbp: true }, false, false)]) {
      expect(r.steps).toContainEqual(SOURCE_CONTROL);
    }
    expect(SOURCE_CONTROL.text).toMatch(/nephrostomy/i);
  });

  it('steers a negative qSOFA back to NEWS2 rather than reassuring', () => {
    const r = assess({}, false, false);
    expect(r.headline).toMatch(/NEWS2/);
    expect(r.steps.some((s) => /NEWS2/.test(s.text))).toBe(true);
  });
});

describe('citations', () => {
  it('cites Sepsis-3 for the definitions and SSC 2021 for management', () => {
    expect(UROSEPSIS_CITATIONS.definitions.pmid).toBe('26903338');
    expect(UROSEPSIS_CITATIONS.definitions.year).toBe(2016);
    expect(UROSEPSIS_CITATIONS.management.year).toBe(2021);
    expect(UROSEPSIS_CITATIONS.management.url).toContain('doi.org/10.1097/CCM.0000000000005337');
  });
});
