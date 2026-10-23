/**
 * CAPRA-S — post-prostatectomy recurrence risk.
 *
 * PRIMARY SOURCE (CLAUDE.md: no numbers from memory):
 *   Cooperberg MR, Hilton JF, Carroll PR. "The CAPRA-S score: a straightforward
 *   tool for improved prediction of outcomes after radical prostatectomy."
 *   Cancer 2011;117(22):5039-46. PMID 21647869. PMC3170662.
 *
 * The paper states its own method: points = Cox log-hazard (β) / 0.45, rounded
 * to the nearest integer. The β values below are Table 1 of the paper, and the
 * test suite re-derives every point value from them — so the points table
 * cannot silently drift from the source.
 *
 * Note: Gleason 4+3 scores 2, not 3. That differs from pre-treatment CAPRA
 * (Cooperberg 2005), where any primary pattern 4/5 scores 3 — two different
 * instruments, two different tables.
 */

export type PsaBand = 'le6' | '6to10' | '10to20' | 'gt20';
export type PathGleason = '2-6' | '3+4' | '4+3' | '8-10';

/** Table 1 log-hazard (β) estimates. The reference level of each axis has β 0. */
export const CAPRA_S_BETA = {
  psa: { le6: 0, '6to10': 0.4, '10to20': 1.06, gt20: 1.32 },
  gleason: { '2-6': 0, '3+4': 0.37, '4+3': 0.74, '8-10': 1.21 },
  margin: 0.85,
  ece: 0.4,
  svi: 0.83,
  lni: 0.54,
} as const;

/** The paper's divisor: "dividing each β by 0.45 and rounding to the nearest integer". */
export const BETA_DIVISOR = 0.45;

export const CAPRA_S_POINTS = {
  psa: { le6: 0, '6to10': 1, '10to20': 2, gt20: 3 },
  gleason: { '2-6': 0, '3+4': 1, '4+3': 2, '8-10': 3 },
  margin: 2,
  ece: 1,
  svi: 2,
  lni: 1,
} as const satisfies {
  psa: Record<PsaBand, number>;
  gleason: Record<PathGleason, number>;
  margin: number;
  ece: number;
  svi: number;
  lni: number;
};

export const PSA_LABELS: Record<PsaBand, string> = {
  le6: '≤ 6',
  '6to10': '6.01 – 10',
  '10to20': '10.01 – 20',
  gt20: '> 20',
};

export interface CapraSInput {
  psa: PsaBand;
  gleason: PathGleason;
  marginPositive: boolean;
  ece: boolean;
  svi: boolean;
  lni: boolean;
}

export function capraSTotal(i: CapraSInput): number {
  const p = CAPRA_S_POINTS;
  return (
    p.psa[i.psa] +
    p.gleason[i.gleason] +
    (i.marginPositive ? p.margin : 0) +
    (i.ece ? p.ece : 0) +
    (i.svi ? p.svi : 0) +
    (i.lni ? p.lni : 0)
  );
}

export type CapraSRisk = 'low' | 'intermediate' | 'high';

/** Low 0–2, intermediate 3–5, high ≥ 6 — the paper's own grouping. */
export function capraSRisk(total: number): CapraSRisk {
  if (total <= 2) return 'low';
  if (total <= 5) return 'intermediate';
  return 'high';
}

export interface Pfp {
  /** Score as reported; 9 stands for the paper's pooled "≥ 9" row. */
  score: number;
  /** Patients at this score in the derivation cohort. */
  n: number;
  /** Progression-free probability, %. */
  threeYear: number;
  fiveYear: number;
}

/**
 * Table 2: progression-free probability by CAPRA-S score in the CaPSURE
 * derivation cohort. The per-score rows sum to 3837, matching the abstract's
 * cohort size (Table 2's "continuous" row prints 3787, an apparent typo in the
 * paper). Scores above 9 were pooled with 9 in the paper.
 */
export const CAPRA_S_PFP: Pfp[] = [
  { score: 0, n: 1042, threeYear: 96.3, fiveYear: 94.5 },
  { score: 1, n: 826, threeYear: 95.3, fiveYear: 91.0 },
  { score: 2, n: 669, threeYear: 89.8, fiveYear: 83.3 },
  { score: 3, n: 499, threeYear: 80.7, fiveYear: 72.8 },
  { score: 4, n: 336, threeYear: 74.9, fiveYear: 70.2 },
  { score: 5, n: 213, threeYear: 63.1, fiveYear: 42.5 },
  { score: 6, n: 103, threeYear: 49.2, fiveYear: 25.9 },
  { score: 7, n: 70, threeYear: 50.9, fiveYear: 26.9 },
  { score: 8, n: 40, threeYear: 26.9, fiveYear: 12.3 },
  { score: 9, n: 39, threeYear: 7.3, fiveYear: 0 },
];

/** The Table 2 row for a total; anything ≥ 9 maps to the pooled row. */
export function pfpFor(total: number): Pfp {
  const s = Math.min(Math.max(Math.round(total), 0), 9);
  return CAPRA_S_PFP.find((r) => r.score === s)!;
}
