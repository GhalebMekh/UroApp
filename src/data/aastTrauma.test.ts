import { describe, expect, it } from 'vitest';
import { AAST_SCALES, ROMAN, gradeBand, type AastGrade } from './aastTrauma';

describe('AAST organ injury scales', () => {
  it('covers exactly the four genitourinary organs', () => {
    expect(AAST_SCALES.map((s) => s.organ)).toEqual([
      'kidney',
      'ureter',
      'bladder',
      'urethra',
    ]);
  });

  it('has grades I–V exactly once each, in ascending order', () => {
    for (const scale of AAST_SCALES) {
      expect(scale.grades.map((g) => g.grade)).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('gives every grade at least one criterion and an implication', () => {
    for (const scale of AAST_SCALES) {
      for (const entry of scale.grades) {
        expect(entry.criteria.length).toBeGreaterThan(0);
        for (const c of entry.criteria) {
          expect(c.label.trim()).not.toBe('');
        }
        expect(entry.implication.trim()).not.toBe('');
      }
    }
  });

  it('states grading rules for every organ', () => {
    for (const scale of AAST_SCALES) {
      expect(scale.rules.length).toBeGreaterThan(0);
    }
  });

  it('cites a resolvable PubMed source for every scale', () => {
    for (const scale of AAST_SCALES) {
      expect(scale.citation.url).toMatch(/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/);
      expect(scale.citation.pmid).toMatch(/^\d+$/);
    }
  });

  it('uses the 2018 revision for the kidney, not the superseded 1989 scale', () => {
    const kidney = AAST_SCALES.find((s) => s.organ === 'kidney')!;
    expect(kidney.citation.year).toBe(2018);
    expect(kidney.citation.pmid).toBe('30462622');
    // The 2018 revision's defining change: CT vascular injury folded into grade III.
    const g3 = kidney.grades.find((g) => g.grade === 3)!;
    expect(g3.criteria.some((c) => /vascular injury/i.test(c.label))).toBe(true);
  });

  it('preserves the kidney parenchymal-laceration depth threshold at 1 cm', () => {
    const kidney = AAST_SCALES.find((s) => s.organ === 'kidney')!;
    const g2 = kidney.grades.find((g) => g.grade === 2)!;
    const g3 = kidney.grades.find((g) => g.grade === 3)!;
    expect(g2.criteria.some((c) => c.label.includes('≤1 cm'))).toBe(true);
    expect(g3.criteria.some((c) => c.label.includes('>1 cm'))).toBe(true);
  });

  it('bands grades as low (I–II), moderate (III), high (IV–V)', () => {
    const bands = ([1, 2, 3, 4, 5] as AastGrade[]).map(gradeBand);
    expect(bands).toEqual(['low', 'low', 'moderate', 'high', 'high']);
  });

  it('renders every grade as a roman numeral', () => {
    expect(ROMAN).toEqual({ 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' });
  });
});
