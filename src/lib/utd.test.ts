import { describe, expect, it } from 'vitest';
import { classifyPostnatal, classifyPrenatal, type PostnatalInput, type PrenatalInput } from './utd';

const pre = (o: Partial<PrenatalInput>): PrenatalInput => ({
  gaWeeks: 22,
  apdMm: 0,
  calyces: 'none',
  otherAbnormal: false,
  ...o,
});
const post = (o: Partial<PostnatalInput>): PostnatalInput => ({
  apdMm: 0,
  calyces: 'none',
  ureterDilated: false,
  parenchymaAbnormal: false,
  bladderAbnormal: false,
  ...o,
});

describe('classifyPrenatal (Campbell ch 22 thresholds)', () => {
  it('uses 4 / 7 mm before 28 weeks', () => {
    expect(classifyPrenatal(pre({ apdMm: 3.9 }))).toBe('normal');
    expect(classifyPrenatal(pre({ apdMm: 4 }))).toBe('A1');
    expect(classifyPrenatal(pre({ apdMm: 6.9 }))).toBe('A1');
    expect(classifyPrenatal(pre({ apdMm: 7 }))).toBe('A2-3');
  });

  it('uses 7 / 10 mm from 28 weeks', () => {
    expect(classifyPrenatal(pre({ gaWeeks: 28, apdMm: 6.9 }))).toBe('normal');
    expect(classifyPrenatal(pre({ gaWeeks: 32, apdMm: 7 }))).toBe('A1');
    expect(classifyPrenatal(pre({ gaWeeks: 32, apdMm: 9.9 }))).toBe('A1');
    expect(classifyPrenatal(pre({ gaWeeks: 32, apdMm: 10 }))).toBe('A2-3');
  });

  it('allows central calyceal dilation in A1 but not peripheral', () => {
    expect(classifyPrenatal(pre({ calyces: 'central' }))).toBe('A1');
    expect(classifyPrenatal(pre({ apdMm: 5, calyces: 'peripheral' }))).toBe('A2-3');
  });

  it('makes any other abnormal parameter A2–3 whatever the APD', () => {
    expect(classifyPrenatal(pre({ apdMm: 2, otherAbnormal: true }))).toBe('A2-3');
  });
});

describe('classifyPostnatal', () => {
  it('splits on 10 and 15 mm', () => {
    expect(classifyPostnatal(post({ apdMm: 9.9 }))).toBe('normal');
    expect(classifyPostnatal(post({ apdMm: 10 }))).toBe('P1');
    expect(classifyPostnatal(post({ apdMm: 14.9 }))).toBe('P1');
    expect(classifyPostnatal(post({ apdMm: 15 }))).toBe('P2');
  });

  it('grades calyces and ureter', () => {
    expect(classifyPostnatal(post({ calyces: 'central' }))).toBe('P1');
    expect(classifyPostnatal(post({ calyces: 'peripheral' }))).toBe('P2');
    expect(classifyPostnatal(post({ apdMm: 5, ureterDilated: true }))).toBe('P2');
  });

  it('makes parenchymal or bladder abnormality P3 at any APD', () => {
    expect(classifyPostnatal(post({ apdMm: 8, parenchymaAbnormal: true }))).toBe('P3');
    expect(classifyPostnatal(post({ bladderAbnormal: true }))).toBe('P3');
  });
});
