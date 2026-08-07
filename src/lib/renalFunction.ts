/**
 * Renal-function estimates — pure functions, no UI.
 *  - eGFR: 2021 CKD-EPI creatinine, race-free (Inker 2021, NEJM)
 *  - CrCl: Cockcroft-Gault (Cockcroft & Gault 1976, Nephron) — for drug dosing
 *  - CKD G-stage thresholds: KDIGO
 * Serum creatinine is handled in mg/dL internally; callers convert from µmol/L.
 */

export type Sex = 'male' | 'female';
export type CrUnit = 'mgdl' | 'umol';

/** 1 mg/dL = 88.42 µmol/L. */
export const UMOL_PER_MGDL = 88.42;

export function creatinineToMgDl(value: number, unit: CrUnit): number {
  return unit === 'umol' ? value / UMOL_PER_MGDL : value;
}

/** 2021 CKD-EPI creatinine eGFR in mL/min/1.73m², or null on invalid input. */
export function ckdEpi2021(scrMgDl: number, age: number, sex: Sex): number | null {
  if (!(scrMgDl > 0) || !(age > 0)) return null;
  const kappa = sex === 'female' ? 0.7 : 0.9;
  const alpha = sex === 'female' ? -0.241 : -0.302;
  const ratio = scrMgDl / kappa;
  return (
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, age) *
    (sex === 'female' ? 1.012 : 1)
  );
}

/** Cockcroft-Gault creatinine clearance in mL/min, or null on invalid input. */
export function cockcroftGault(
  scrMgDl: number,
  age: number,
  weightKg: number,
  sex: Sex,
): number | null {
  if (!(scrMgDl > 0) || !(age > 0) || !(weightKg > 0)) return null;
  const crcl = ((140 - age) * weightKg * (sex === 'female' ? 0.85 : 1)) / (72 * scrMgDl);
  return Math.max(crcl, 0);
}

export type RenalBand = 'low' | 'moderate' | 'high';

/** KDIGO CKD G-stage for an eGFR value. */
export function ckdStage(egfr: number): { stage: string; label: string; band: RenalBand } {
  if (egfr >= 90) return { stage: 'G1', label: 'Normal or high', band: 'low' };
  if (egfr >= 60) return { stage: 'G2', label: 'Mildly decreased', band: 'low' };
  if (egfr >= 45) return { stage: 'G3a', label: 'Mild–moderate decrease', band: 'moderate' };
  if (egfr >= 30) return { stage: 'G3b', label: 'Moderate–severe decrease', band: 'moderate' };
  if (egfr >= 15) return { stage: 'G4', label: 'Severely decreased', band: 'high' };
  return { stage: 'G5', label: 'Kidney failure', band: 'high' };
}

/** Qualitative band for a Cockcroft-Gault CrCl (drug-dosing context). */
export function crclBand(crcl: number): RenalBand {
  if (crcl >= 60) return 'low';
  if (crcl >= 30) return 'moderate';
  return 'high';
}
