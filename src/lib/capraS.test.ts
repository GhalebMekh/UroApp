import { describe, expect, it } from 'vitest';
import {
  BETA_DIVISOR,
  CAPRA_S_BETA,
  CAPRA_S_PFP,
  CAPRA_S_POINTS,
  capraSRisk,
  capraSTotal,
  pfpFor,
  type CapraSInput,
} from './capraS';

const derive = (beta: number) => Math.round(beta / BETA_DIVISOR);

describe('points are re-derived from the paper\'s own β values', () => {
  // Cooperberg 2011: "dividing each β by 0.45 and rounding to the nearest
  // integer". If anyone edits a point value by hand, this fails.
  it('PSA', () => {
    for (const k of Object.keys(CAPRA_S_BETA.psa) as (keyof typeof CAPRA_S_BETA.psa)[]) {
      expect(CAPRA_S_POINTS.psa[k], `PSA ${k}`).toBe(derive(CAPRA_S_BETA.psa[k]));
    }
  });

  it('pathologic Gleason', () => {
    for (const k of Object.keys(CAPRA_S_BETA.gleason) as (keyof typeof CAPRA_S_BETA.gleason)[]) {
      expect(CAPRA_S_POINTS.gleason[k], `Gleason ${k}`).toBe(derive(CAPRA_S_BETA.gleason[k]));
    }
  });

  it('margin, ECE, SVI and LNI', () => {
    expect(CAPRA_S_POINTS.margin).toBe(derive(CAPRA_S_BETA.margin));
    expect(CAPRA_S_POINTS.ece).toBe(derive(CAPRA_S_BETA.ece));
    expect(CAPRA_S_POINTS.svi).toBe(derive(CAPRA_S_BETA.svi));
    expect(CAPRA_S_POINTS.lni).toBe(derive(CAPRA_S_BETA.lni));
  });

  it('scores Gleason 4+3 as 2 — not 3 as in pre-treatment CAPRA', () => {
    expect(CAPRA_S_POINTS.gleason['4+3']).toBe(2);
  });

  it('matches the paper\'s summary: up to 3 PSA, 3 Gleason, 2 SM, 2 SVI, 1 ECE, 1 LNI', () => {
    expect(Math.max(...Object.values(CAPRA_S_POINTS.psa))).toBe(3);
    expect(Math.max(...Object.values(CAPRA_S_POINTS.gleason))).toBe(3);
    expect([CAPRA_S_POINTS.margin, CAPRA_S_POINTS.svi]).toEqual([2, 2]);
    expect([CAPRA_S_POINTS.ece, CAPRA_S_POINTS.lni]).toEqual([1, 1]);
  });
});

const base: CapraSInput = {
  psa: 'le6',
  gleason: '2-6',
  marginPositive: false,
  ece: false,
  svi: false,
  lni: false,
};

describe('capraSTotal', () => {
  it('is 0 for the reference patient', () => {
    expect(capraSTotal(base)).toBe(0);
  });

  it('reaches the theoretical maximum of 12', () => {
    expect(
      capraSTotal({ psa: 'gt20', gleason: '8-10', marginPositive: true, ece: true, svi: true, lni: true }),
    ).toBe(12);
  });

  it('adds a typical case correctly', () => {
    // PSA 8 (1) + 4+3 (2) + positive margin (2) + ECE (1) = 6
    expect(capraSTotal({ ...base, psa: '6to10', gleason: '4+3', marginPositive: true, ece: true })).toBe(6);
  });
});

describe('capraSRisk', () => {
  it('uses the paper\'s 0–2 / 3–5 / ≥6 groups', () => {
    expect([0, 2].map(capraSRisk)).toEqual(['low', 'low']);
    expect([3, 5].map(capraSRisk)).toEqual(['intermediate', 'intermediate']);
    expect([6, 12].map(capraSRisk)).toEqual(['high', 'high']);
  });
});

describe('progression-free probability (Table 2)', () => {
  it('covers 0 to the pooled ≥9 row, and row sizes sum to the 3837-man cohort', () => {
    expect(CAPRA_S_PFP.map((r) => r.score)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    // Catches a mistyped row: the rows must add up to the abstract's 3837.
    expect(CAPRA_S_PFP.reduce((s, r) => s + r.n, 0)).toBe(3837);
  });

  it('maps scores above 9 onto the pooled row', () => {
    expect(pfpFor(11).score).toBe(9);
    expect(pfpFor(4).fiveYear).toBe(70.2);
  });
});
