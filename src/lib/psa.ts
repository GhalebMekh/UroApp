/**
 * PSA toolkit math — pure functions, no UI. Thresholds and their meaning live
 * with the calculator components alongside their citations; this module only
 * computes the numbers.
 *
 * Derivations:
 *  - Density  = total PSA / prostate volume         (Benson 1992, PMID 1371554)
 *  - Velocity = least-squares slope of PSA vs years (Carter 1992, PMID 1372942)
 *  - Doubling time = ln(2) / slope of ln(PSA) vs t  (Freedland 2005, PMID 16046649)
 *  - Free ratio = free PSA / total PSA × 100        (Catalona 1998, PMID 9605898)
 */

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export interface PsaReading {
  /** ISO date string from <input type="date">. */
  date: string;
  /** PSA in ng/mL. NaN when the field is blank. */
  psa: number;
}

/** PSA density in ng/mL/cc, or null if inputs are invalid. */
export function psaDensity(psa: number, volumeCc: number): number | null {
  if (!Number.isFinite(psa) || psa < 0) return null;
  if (!Number.isFinite(volumeCc) || volumeCc <= 0) return null;
  return psa / volumeCc;
}

/** Percent free PSA, or null if inputs are invalid (free must be ≤ total). */
export function freeTotalRatioPct(freePsa: number, totalPsa: number): number | null {
  if (!Number.isFinite(totalPsa) || totalPsa <= 0) return null;
  if (!Number.isFinite(freePsa) || freePsa < 0 || freePsa > totalPsa) return null;
  return (freePsa / totalPsa) * 100;
}

interface SeriesPoint {
  /** Years elapsed since the earliest reading. */
  t: number;
  psa: number;
}

/**
 * Sorts/validates a set of dated PSA readings into a time series in years.
 * Returns null unless there are ≥2 valid readings spanning a positive interval.
 */
export function buildSeries(readings: PsaReading[]): SeriesPoint[] | null {
  const valid = readings.filter(
    (r) => r.date !== '' && !Number.isNaN(Date.parse(r.date)) && Number.isFinite(r.psa) && r.psa > 0,
  );
  if (valid.length < 2) return null;

  const sorted = [...valid].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return null;

  const t0 = Date.parse(first.date);
  const points = sorted.map((r) => ({ t: (Date.parse(r.date) - t0) / MS_PER_YEAR, psa: r.psa }));
  const lastPoint = points[points.length - 1];
  if (!lastPoint || lastPoint.t <= 0) return null; // readings must span time
  return points;
}

/** Least-squares slope of y vs t. Returns NaN when t has no variance. */
function slope(points: { t: number; y: number }[]): number {
  const n = points.length;
  const meanT = points.reduce((s, p) => s + p.t, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.t - meanT) * (p.y - meanY);
    den += (p.t - meanT) ** 2;
  }
  return den === 0 ? NaN : num / den;
}

/** PSA velocity in ng/mL/year (linear-regression slope). */
export function psaVelocity(series: SeriesPoint[]): number {
  return slope(series.map((p) => ({ t: p.t, y: p.psa })));
}

/**
 * PSA doubling time in months. Null when PSA is not rising (slope ≤ 0), since
 * a doubling time is only defined for an increasing exponential trend.
 */
export function psaDoublingTimeMonths(series: SeriesPoint[]): number | null {
  const lnSlopePerYear = slope(series.map((p) => ({ t: p.t, y: Math.log(p.psa) })));
  if (!Number.isFinite(lnSlopePerYear) || lnSlopePerYear <= 0) return null;
  return (Math.LN2 / lnSlopePerYear) * 12;
}
