/**
 * Adrenal incidentaloma work-up — imaging category and hormonal screen.
 *
 * PRIMARY SOURCE (CLAUDE.md: no numbers from memory):
 *   Fassnacht M et al. European Society of Endocrinology clinical practice
 *   guidelines on the management of adrenal incidentalomas, in collaboration
 *   with ENSAT. Eur J Endocrinol 2023;189(1):G1-G42. PMID 37318239,
 *   DOI 10.1093/ejendo/lvad066 (CC BY). Recommendation numbers below are the
 *   guideline's own (R.2.x imaging, R.3.x hormones).
 *
 * DELIBERATELY ABSENT: a washout calculator that calls a lesion benign. The
 * 2023 guideline states the familiar cut-offs (absolute 60%, relative 40%),
 * which its own 2016 edition used, have very low evidence in incidentalomas —
 * one study found they missed 22% and 8% of malignant tumours respectively.
 */

export type Appearance = 'homogeneous' | 'heterogeneous';
export type SizeBand = 'lt4' | 'ge4';

export interface ImagingInput {
  /** Unenhanced (non-contrast) CT attenuation in HU; null if not yet done. */
  hu: number | null;
  size: SizeBand;
  appearance: Appearance;
}

export type HuBand = 'le10' | '11to20' | 'gt20';

/**
 * The guideline's bands are ≤10, 11–20 and >20 HU. A fractional mean between
 * 10 and 11 (e.g. 10.4) has no stated home; it is placed in the 11–20 band,
 * i.e. NOT called benign — the conservative reading.
 */
export function huBand(hu: number): HuBand {
  if (hu <= 10) return 'le10';
  if (hu <= 20) return '11to20';
  return 'gt20';
}

export type ImagingCategory =
  /** No unenhanced CT yet — R.2.2 makes it the first test. */
  | 'no-ct'
  /** R.2.3: homogeneous, ≤10 HU — benign, no further imaging at any size. */
  | 'benign'
  /** R.2.4: homogeneous, 11–20 HU, <4 cm. */
  | 'r2.4'
  /** R.2.5: ≥4 cm AND (heterogeneous OR >20 HU) — relevant malignancy risk. */
  | 'r2.5'
  /** R.2.6: everything else — indeterminate, malignancy still unlikely. */
  | 'r2.6';

export function imagingCategory({ hu, size, appearance }: ImagingInput): ImagingCategory {
  if (hu === null || !Number.isFinite(hu)) return 'no-ct';
  const band = huBand(hu);
  if (appearance === 'homogeneous' && band === 'le10') return 'benign';
  if (appearance === 'homogeneous' && band === '11to20' && size === 'lt4') return 'r2.4';
  if (size === 'ge4' && (appearance === 'heterogeneous' || band === 'gt20')) return 'r2.5';
  return 'r2.6';
}

/**
 * R.3.9: exclude phaeochromocytoma with plasma free or urinary fractionated
 * metanephrines in every lesion with features not typical of a benign
 * adenoma. The guideline also advises measuring them when no unenhanced CT
 * has been done.
 */
export function needsMetanephrines(category: ImagingCategory): boolean {
  return category !== 'benign';
}

/** R.3.10: aldosterone/renin ratio with hypertension or unexplained hypokalaemia. */
export function needsAldosteroneRenin(hypertension: boolean, hypokalaemia: boolean): boolean {
  return hypertension || hypokalaemia;
}

export type DstUnit = 'nmol' | 'ugdl';

/** R.3.3 cut-off, as the guideline states it in both units. */
export const DST_CUTOFF: Record<DstUnit, number> = { nmol: 50, ugdl: 1.8 };

export type DstResult =
  /** ≤ cut-off: autonomous cortisol secretion excluded (R.3.3). */
  | 'excluded'
  /** > cut-off, no overt Cushing's features: mild autonomous cortisol secretion (R.3.4). */
  | 'macs'
  /** > cut-off WITH overt Cushing's features: not MACS by definition — overt disease suspected. */
  | 'overt';

export function dstResult(cortisol: number, unit: DstUnit, overtCushingFeatures: boolean): DstResult | null {
  if (!Number.isFinite(cortisol) || cortisol < 0) return null;
  if (cortisol <= DST_CUTOFF[unit]) return 'excluded';
  return overtCushingFeatures ? 'overt' : 'macs';
}
