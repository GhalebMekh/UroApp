/**
 * PADUA nephrometry score — pure logic, no UI (Ficarra 2009, PMID 19665284).
 * Six axes, each contributing 1–3 points; total range 6–14.
 */

export type Longitudinal = 'polar' | 'middle';
export type Exophytic = 'ge50' | 'lt50' | 'endophytic';
export type Rim = 'lateral' | 'medial';
export type SinusInvolvement = 'no' | 'yes';
export type CollectingSystem = 'no' | 'yes';
export type TumourSize = 'le4' | '4to7' | 'gt7';

export interface PaduaSelection {
  longitudinal: Longitudinal | null;
  exophytic: Exophytic | null;
  rim: Rim | null;
  sinus: SinusInvolvement | null;
  collectingSystem: CollectingSystem | null;
  size: TumourSize | null;
}

export type PaduaBand = 'low' | 'moderate' | 'high';

export interface PaduaResult {
  total: number;
  band: PaduaBand;
}

const POINTS = {
  longitudinal: { polar: 1, middle: 2 },
  exophytic: { ge50: 1, lt50: 2, endophytic: 3 },
  rim: { lateral: 1, medial: 2 },
  sinus: { no: 1, yes: 2 },
  collectingSystem: { no: 1, yes: 2 },
  size: { le4: 1, '4to7': 2, gt7: 3 },
} as const;

function band(total: number): PaduaBand {
  if (total <= 7) return 'low';
  if (total <= 9) return 'moderate';
  return 'high';
}

/** Computes the PADUA score, or null until every axis is selected. */
export function paduaScore(sel: PaduaSelection): PaduaResult | null {
  const { longitudinal, exophytic, rim, sinus, collectingSystem, size } = sel;
  if (!longitudinal || !exophytic || !rim || !sinus || !collectingSystem || !size) return null;

  const total =
    POINTS.longitudinal[longitudinal] +
    POINTS.exophytic[exophytic] +
    POINTS.rim[rim] +
    POINTS.sinus[sinus] +
    POINTS.collectingSystem[collectingSystem] +
    POINTS.size[size];

  return { total, band: band(total) };
}
