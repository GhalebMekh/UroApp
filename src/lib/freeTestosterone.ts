/**
 * Calculated free and bioavailable testosterone — Vermeulen method.
 *
 * PRIMARY SOURCE (CLAUDE.md: no numbers from memory):
 *   Vermeulen A, Verdonck L, Kaufman JM. "A critical evaluation of simple
 *   methods for the estimation of free testosterone in serum."
 *   J Clin Endocrinol Metab 1999;84(10):3666-72. PMID 10523012.
 *
 * Constants are read directly off that paper, which states the SHBG
 * association constant as 1 x 10^9 L/mol at 37 C and albumin's as
 * 3.6 x 10^4 L/mol. Several online calculators quote 1 x 10^10 for SHBG —
 * a tenfold error against the source, which would badly distort the result.
 *
 * From the paper:
 *   Eq III  AT = FT * Ka * Ca         (albumin-bound T is linear in free T)
 *   Eq IV   FT = ([T] - N[FT]) / (Kt * {SHBG - [T] + N[FT]}),  N = Ka*Ca + 1
 * which is a second-degree equation in FT.
 *
 * Rearranging Eq IV into standard quadratic form:
 *   (Kt*N) * FT^2  +  (Kt*(S - T) + N) * FT  -  T  =  0
 * so with a = Kt*N and b = Kt*(S - T) + N:
 *   FT = (-b + sqrt(b^2 + 4*a*T)) / (2a)
 *
 * Bioavailable T = free + albumin-bound = FT * (1 + Ka*Ca) = FT * N.
 */

/** SHBG association constant for testosterone at 37 C, L/mol (Vermeulen 1999). */
export const K_SHBG = 1.0e9;
/** Albumin association constant for testosterone, L/mol (Vermeulen 1999). */
export const K_ALBUMIN = 3.6e4;
/** Albumin molecular weight, g/mol (Vermeulen 1999 states 69,000). */
export const ALBUMIN_MW = 69_000;
/** Vermeulen's assumed albumin concentration when none is measured, g/L. */
export const DEFAULT_ALBUMIN_G_L = 43;

/**
 * ng/dL -> nmol/L for testosterone.
 * 1 ng/dL = 1e-8 g/L; divided by the molar mass of testosterone
 * (C19H28O2 = 288.4 g/mol from standard atomic weights) gives 3.467e-11 mol/L,
 * i.e. 0.03467 nmol/L.
 */
export const TESTOSTERONE_MW = 288.4;
export const NG_DL_TO_NMOL_L = 1e-8 / TESTOSTERONE_MW * 1e9;

export interface FreeTInput {
  /** Total testosterone, nmol/L. */
  totalT: number;
  /** SHBG, nmol/L. */
  shbg: number;
  /** Albumin, g/L. Defaults to Vermeulen's 43 g/L when not measured. */
  albuminGL?: number;
}

export interface FreeTResult {
  /** Free testosterone, nmol/L. */
  freeT: number;
  /** Free testosterone, pmol/L — the unit most labs report. */
  freeTPmol: number;
  /** Bioavailable (free + albumin-bound) testosterone, nmol/L. */
  bioavailableT: number;
  /** Free fraction as a percentage of total. */
  freePercent: number;
  /** Bioavailable fraction as a percentage of total. */
  bioavailablePercent: number;
}

/** Convert a total testosterone reported in ng/dL to nmol/L. */
export function ngDlToNmolL(ngDl: number): number {
  return ngDl * NG_DL_TO_NMOL_L;
}

/** Convert nmol/L back to ng/dL. */
export function nmolLToNgDl(nmol: number): number {
  return nmol / NG_DL_TO_NMOL_L;
}

/**
 * Solve Vermeulen's second-degree equation for free testosterone.
 * Returns null if the inputs are not usable (non-finite or non-positive).
 */
export function calculateFreeT({
  totalT,
  shbg,
  albuminGL = DEFAULT_ALBUMIN_G_L,
}: FreeTInput): FreeTResult | null {
  if (![totalT, shbg, albuminGL].every((v) => Number.isFinite(v) && v > 0)) return null;

  // Work in mol/L, as the association constants are L/mol.
  const T = totalT * 1e-9;
  const S = shbg * 1e-9;
  const Ca = albuminGL / ALBUMIN_MW;

  const N = K_ALBUMIN * Ca + 1;

  const a = K_SHBG * N;
  const b = K_SHBG * (S - T) + N;
  const discriminant = b * b + 4 * a * T;
  if (discriminant < 0) return null;

  const freeMol = (-b + Math.sqrt(discriminant)) / (2 * a);
  if (!Number.isFinite(freeMol) || freeMol <= 0) return null;

  const freeT = freeMol * 1e9; // nmol/L
  const bioavailableT = freeT * N;

  return {
    freeT,
    freeTPmol: freeT * 1000,
    bioavailableT,
    freePercent: (freeT / totalT) * 100,
    bioavailablePercent: (bioavailableT / totalT) * 100,
  };
}

/**
 * Free androgen index — included only so it can be labelled as unreliable.
 * Vermeulen found the FAI/AFTC ratio varies with SHBG, concluding that
 * neither FAI nor analog-ligand free T is a reliable index of bioavailable T.
 */
export function freeAndrogenIndex(totalT: number, shbg: number): number | null {
  if (!Number.isFinite(totalT) || !Number.isFinite(shbg) || shbg <= 0) return null;
  return (100 * totalT) / shbg;
}
