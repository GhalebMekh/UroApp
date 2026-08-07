/**
 * OABSS (Overactive Bladder Symptom Score) — pure logic (Homma 2006, PMID 16904444).
 * 4 questions with 2:3:5:5 weighting (daytime freq, nocturia, urgency, urgency incontinence).
 * Total range 0–15.
 */

export interface OabssScores {
  daytimeFreq: number | null;
  nocturia: number | null;
  urgency: number | null;
  urgencyIncontinence: number | null;
}

export type OabssBand = 'low' | 'moderate' | 'high';

export interface OabssResult {
  total: number;
  band: OabssBand;
}

function band(total: number): OabssBand {
  if (total <= 5) return 'low';
  if (total <= 10) return 'moderate';
  return 'high';
}

export function oabssScore(scores: OabssScores): OabssResult | null {
  if (scores.daytimeFreq === null || scores.nocturia === null || scores.urgency === null || scores.urgencyIncontinence === null) {
    return null;
  }
  const total = scores.daytimeFreq + scores.nocturia + scores.urgency + scores.urgencyIncontinence;
  return { total, band: band(total) };
}
