/**
 * STONE score — pure logic (Moore et al. 2014, BMJ, PMID 24671981).
 * Predicts uncomplicated ureteral stone in ER patients. Total range 0–13.
 */

export type Sex = 'male' | 'female';
export type PainDuration = 'lt6h' | '6to24h' | 'gt24h';
export type Race = 'black' | 'nonblack';
export type Nausea = 'none' | 'nausea' | 'vomiting';

export interface StoneSelection {
  sex: Sex | null;
  painDuration: PainDuration | null;
  race: Race | null;
  nausea: Nausea | null;
  hematuria: boolean | null;
}

export type StoneBand = 'low' | 'moderate' | 'high';

export interface StoneResult {
  total: number;
  band: StoneBand;
}

const POINTS = {
  sex: { male: 2, female: 0 },
  painDuration: { lt6h: 3, '6to24h': 1, gt24h: 0 },
  race: { black: 0, nonblack: 3 },
  nausea: { none: 0, nausea: 1, vomiting: 2 },
  hematuria: { true: 3, false: 0 },
} as const;

function band(total: number): StoneBand {
  if (total <= 5) return 'low';
  if (total <= 9) return 'moderate';
  return 'high';
}

/** Computes the STONE score, or null until every field is selected. */
export function stoneScore(sel: StoneSelection): StoneResult | null {
  const { sex, painDuration, race, nausea, hematuria } = sel;
  if (!sex || !painDuration || !race || !nausea || hematuria === null) return null;

  const total =
    POINTS.sex[sex] +
    POINTS.painDuration[painDuration] +
    POINTS.race[race] +
    POINTS.nausea[nausea] +
    POINTS.hematuria[hematuria ? 'true' : 'false'];

  return { total, band: band(total) };
}
