/**
 * IMDC (Heng) risk model for metastatic renal cell carcinoma — pure logic
 * (Heng et al. 2009, PMID 19826129). Six adverse factors; risk group is set
 * by how many are present.
 */

export interface ImdcFactors {
  kpsBelow80: boolean;
  lessThanOneYearToTreatment: boolean;
  lowHaemoglobin: boolean;
  highCorrectedCalcium: boolean;
  highNeutrophils: boolean;
  highPlatelets: boolean;
}

export type ImdcRisk = 'favorable' | 'intermediate' | 'poor';

export interface ImdcResult {
  count: number;
  risk: ImdcRisk;
}

/** Counts adverse factors and returns the IMDC/Heng risk group. */
export function imdcRisk(factors: ImdcFactors): ImdcResult {
  const count = Object.values(factors).filter(Boolean).length;
  const risk: ImdcRisk = count === 0 ? 'favorable' : count <= 2 ? 'intermediate' : 'poor';
  return { count, risk };
}
