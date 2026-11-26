/**
 * Neonatal vital signs reference (Pediatrics → Ward essentials).
 *
 * Every number here was read from its primary source on 2026-11-26. Do not add
 * a range without a verified source; leave the gap and say so in the UI.
 *
 * - Preterm heart rate: Alonzo et al., J Perinatol 2018 (PMID 29925866), Table 2:
 *   5th/95th centiles by gestational age (GA 23–34 wk) × postmenstrual age (to 38 wk).
 *   NICU cohort with no exclusion criteria.
 * - Blood pressure: Dionne, Abitbol & Flynn, Pediatr Nephrol 2012 (PMID 21258818):
 *   50th/95th/99th centiles by PMA for infants 2 weeks of age or older.
 * - Urine output: AWAKEN, Jetton et al., Lancet Child Adolesc Health 2017
 *   (PMID 29732396): urine output ≤1 mL/kg/h averaged over 24 h on days 2–7.
 * - Temperature: target 36.5–37.5 °C (ERC 2025, summarised by Mileder 2026,
 *   PMID 42082138); hypothermia grades from WHO 1997 as quoted by Yitayew 2020
 *   (PMID 33014077).
 * - SpO2: preterm on oxygen 90–94 % (Sweet et al., European RDS guidelines 2022,
 *   PMID 36863329); CCHD screen pass ≥95 % in both upper and lower extremity
 *   (Martin et al., Pediatrics 2020, PMID 32499387).
 */

export type Flag = 'below' | 'within' | 'above';

/** Completed weeks of postmenstrual age. */
export function pmaWeeks(gaWeeks: number, postnatalDays: number): number | null {
  if (!Number.isFinite(gaWeeks) || !Number.isFinite(postnatalDays)) return null;
  if (gaWeeks < 22 || gaWeeks > 44 || postnatalDays < 0) return null;
  return Math.floor(gaWeeks) + Math.floor(postnatalDays / 7);
}

export function flagValue(value: number, low: number, high: number): Flag {
  if (value < low) return 'below';
  if (value > high) return 'above';
  return 'within';
}

// ── Heart rate, preterm (Alonzo 2018, Table 2) ─────────────────────────────
// Row = completed GA week at birth; values run from PMA = GA up to PMA 38.
const ALONZO: Record<number, { p5: number[]; p95: number[] }> = {
  23: {
    p5: [135, 139, 139, 140, 140, 141, 141, 139, 137, 137, 139, 139, 136, 133, 130, 129],
    p95: [177, 179, 180, 180, 181, 180, 181, 184, 183, 182, 186, 185, 187, 188, 187, 189],
  },
  24: {
    p5: [139, 140, 141, 141, 141, 138, 138, 138, 137, 135, 135, 132, 133, 131, 130],
    p95: [175, 181, 181, 181, 183, 182, 182, 184, 185, 184, 184, 185, 186, 184, 185],
  },
  25: {
    p5: [137, 142, 141, 141, 138, 136, 137, 138, 135, 137, 135, 132, 132, 131],
    p95: [176, 180, 180, 181, 181, 181, 181, 182, 184, 184, 184, 184, 182, 182],
  },
  26: {
    p5: [134, 143, 143, 137, 140, 137, 137, 139, 139, 135, 135, 134, 127],
    p95: [176, 182, 183, 181, 181, 183, 184, 184, 183, 182, 182, 184, 182],
  },
  27: {
    p5: [134, 143, 144, 141, 139, 140, 138, 135, 134, 131, 131, 124],
    p95: [178, 182, 184, 182, 183, 184, 183, 184, 185, 183, 184, 184],
  },
  28: {
    p5: [131, 140, 141, 142, 140, 140, 138, 136, 133, 128, 125],
    p95: [176, 184, 184, 184, 185, 185, 185, 186, 185, 184, 183],
  },
  29: {
    p5: [130, 141, 142, 141, 143, 142, 139, 137, 136, 134],
    p95: [177, 182, 182, 183, 185, 185, 186, 186, 185, 185],
  },
  30: {
    p5: [126, 135, 137, 139, 140, 135, 134, 132, 128],
    p95: [176, 179, 180, 182, 184, 184, 183, 176, 172],
  },
  31: {
    p5: [123, 134, 137, 139, 135, 130, 126, 113],
    p95: [176, 180, 182, 185, 186, 185, 188, 185],
  },
  32: {
    p5: [123, 133, 136, 135, 133, 130, 127],
    p95: [175, 178, 182, 183, 185, 184, 178],
  },
  33: {
    p5: [119, 130, 133, 133, 132, 131],
    p95: [172, 179, 184, 186, 185, 182],
  },
  34: {
    p5: [117, 127, 128, 128, 129],
    p95: [172, 179, 183, 184, 185],
  },
};

/** 5th–95th centile heart rate for a preterm baby, or null outside the table (GA 23–34, PMA ≤38). */
export function pretermHeartRate(gaWeeks: number, pma: number): { p5: number; p95: number } | null {
  const ga = Math.floor(gaWeeks);
  const row = ALONZO[ga];
  if (!row) return null;
  const i = pma - ga;
  const p5 = row.p5[i];
  const p95 = row.p95[i];
  if (p5 === undefined || p95 === undefined) return null;
  return { p5, p95 };
}

// ── Blood pressure (Dionne 2012) ───────────────────────────────────────────
export interface Centiles {
  p50: number;
  p95: number;
  p99: number;
}
export interface BpRow {
  pma: number;
  sbp: Centiles;
  dbp: Centiles;
  map: Centiles;
}

const c = (p50: number, p95: number, p99: number): Centiles => ({ p50, p95, p99 });

export const DIONNE_BP: BpRow[] = [
  { pma: 44, sbp: c(88, 105, 110), dbp: c(50, 68, 73), map: c(63, 80, 85) },
  { pma: 42, sbp: c(85, 98, 102), dbp: c(50, 65, 70), map: c(62, 76, 81) },
  { pma: 40, sbp: c(80, 95, 100), dbp: c(50, 65, 70), map: c(60, 75, 80) },
  { pma: 38, sbp: c(77, 92, 97), dbp: c(50, 65, 70), map: c(59, 74, 79) },
  { pma: 36, sbp: c(72, 87, 92), dbp: c(50, 65, 70), map: c(57, 72, 77) },
  { pma: 34, sbp: c(70, 85, 90), dbp: c(40, 55, 60), map: c(50, 65, 70) },
  { pma: 32, sbp: c(68, 83, 88), dbp: c(40, 55, 60), map: c(49, 64, 69) },
  { pma: 30, sbp: c(65, 80, 85), dbp: c(40, 55, 60), map: c(48, 63, 68) },
  { pma: 28, sbp: c(60, 75, 80), dbp: c(38, 50, 54), map: c(45, 58, 63) },
  { pma: 26, sbp: c(55, 72, 77), dbp: c(30, 50, 56), map: c(38, 57, 63) },
];

export type BpLookup =
  | { kind: 'row'; row: BpRow }
  | { kind: 'too-young' }
  | { kind: 'out-of-range' };

/**
 * Dionne's table applies from 2 weeks of age. Rows are every 2 weeks of PMA;
 * an odd week uses the row below it (the lower, more cautious 95th centile).
 */
export function bloodPressureRow(pma: number, postnatalDays: number): BpLookup {
  if (postnatalDays < 14) return { kind: 'too-young' };
  if (pma < 26 || pma > 45) return { kind: 'out-of-range' };
  const even = Math.min(44, pma - (pma % 2));
  const row = DIONNE_BP.find((r) => r.pma === even);
  return row ? { kind: 'row', row } : { kind: 'out-of-range' };
}

export type BpFlag = 'normal' | 'above-95' | 'above-99';
export function bpFlag(value: number, centiles: Centiles): BpFlag {
  if (value > centiles.p99) return 'above-99';
  if (value > centiles.p95) return 'above-95';
  return 'normal';
}

// ── Urine output (AWAKEN) ──────────────────────────────────────────────────
export type UrineStatus = 'day-1' | 'aki' | 'above-threshold' | 'after-day-7';
export const AKI_URINE_THRESHOLD = 1; // mL/kg/h, averaged over 24 h

export function urineOutputStatus(mlKgH: number, postnatalDays: number): UrineStatus {
  const day = postnatalDays + 1; // day of life, birth day = day 1
  if (day < 2) return 'day-1';
  if (day > 7) return 'after-day-7';
  return mlKgH <= AKI_URINE_THRESHOLD ? 'aki' : 'above-threshold';
}

// ── Temperature ────────────────────────────────────────────────────────────
export type TempStatus = 'severe' | 'moderate' | 'mild' | 'normal' | 'above';
export const TEMP_TARGET = { low: 36.5, high: 37.5 };

export function temperatureStatus(celsius: number): TempStatus {
  if (celsius < 32) return 'severe';
  if (celsius < 36) return 'moderate';
  if (celsius < 36.5) return 'mild';
  if (celsius <= 37.5) return 'normal';
  return 'above';
}

// ── SpO2 ───────────────────────────────────────────────────────────────────
export const PRETERM_SPO2_TARGET = { low: 90, high: 94 };
export const CCHD_PASS = 95;

export function cchdScreen(hand: number, foot: number): 'pass' | 'not-passed' {
  return hand >= CCHD_PASS && foot >= CCHD_PASS ? 'pass' : 'not-passed';
}
