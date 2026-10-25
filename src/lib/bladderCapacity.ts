/**
 * Expected bladder capacity (EBC) and the bladder-diary cut-offs that use it.
 *
 *  ICCS formula: (age in years + 1) × 30 mL under 12 years; 390 mL at 12–18 —
 *    table in the 2026 expert consensus (Shen et al., PMID 42432408),
 *    reproduced from Vande Walle et al. 2012 (PMID 22362256). Same table:
 *    nocturnal polyuria = total night urine > 130% EBC; small bladder capacity
 *    = maximum voided volume < 65% EBC.
 *  Campbell ch 35 (citing ICCS) instead describes normal reservoir function
 *    as maximum voided volume > 70% EBC — shown alongside, not merged.
 *  Campbell ch 28 alternatives: infants < 1 year weight (kg) × 7 mL
 *    (Fairhurst 1991); older children (age + 2) × 30 mL (Koff 1983).
 *
 * DVSS (Farhat et al., J Urol 2000; PMID 10958730): 10 items scored 0–3,
 * total 0–30; optimal cut-offs 6.026 for girls and 9.02 for boys. The
 * questionnaire itself is the authors' intellectual property, so the app only
 * interprets a total taken from the published form.
 */

export function iccsEbc(ageYears: number): number | null {
  if (!Number.isFinite(ageYears) || ageYears < 1 || ageYears > 18) return null;
  return ageYears < 12 ? (Math.floor(ageYears) + 1) * 30 : 390;
}

export function koffEbc(ageYears: number): number | null {
  if (!Number.isFinite(ageYears) || ageYears < 1) return null;
  return (Math.floor(ageYears) + 2) * 30;
}

export function infantEbc(weightKg: number): number | null {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 15) return null;
  return Math.round(weightKg * 7);
}

/** Whole-number percentage of EBC. */
export function percentOfEbc(volumeMl: number, ebcMl: number): number | null {
  if (!Number.isFinite(volumeMl) || volumeMl < 0 || !(ebcMl > 0)) return null;
  return Math.round((volumeMl / ebcMl) * 100);
}

export const NOCTURNAL_POLYURIA_PCT = 130;
export const SMALL_CAPACITY_PCT = 65;
export const CAMPBELL_NORMAL_CAPACITY_PCT = 70;

export type Sex = 'female' | 'male';

/** Highest total still in the normal range, from Farhat's optimal cut-offs (6.026 / 9.02). */
export const DVSS_NORMAL_MAX: Record<Sex, number> = { female: 6, male: 9 };

export function isValidDvssTotal(total: number): boolean {
  return Number.isInteger(total) && total >= 0 && total <= 30;
}

export function dvssAbove(total: number, sex: Sex): boolean {
  return total > DVSS_NORMAL_MAX[sex];
}
