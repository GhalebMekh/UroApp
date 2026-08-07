import { describe, expect, it } from 'vitest';
import { imdcRisk, type ImdcFactors } from './imdcHeng';

const none: ImdcFactors = {
  kpsBelow80: false,
  lessThanOneYearToTreatment: false,
  lowHaemoglobin: false,
  highCorrectedCalcium: false,
  highNeutrophils: false,
  highPlatelets: false,
};

describe('imdcRisk', () => {
  it('0 factors -> favorable', () => {
    expect(imdcRisk(none)).toEqual({ count: 0, risk: 'favorable' });
  });

  it('boundary: 1 and 2 factors -> intermediate', () => {
    expect(imdcRisk({ ...none, kpsBelow80: true })).toEqual({ count: 1, risk: 'intermediate' });
    expect(imdcRisk({ ...none, kpsBelow80: true, lowHaemoglobin: true })).toEqual({ count: 2, risk: 'intermediate' });
  });

  it('boundary: 3 factors -> poor', () => {
    expect(imdcRisk({ ...none, kpsBelow80: true, lowHaemoglobin: true, highCorrectedCalcium: true })).toEqual({
      count: 3,
      risk: 'poor',
    });
  });

  it('all 6 factors -> poor', () => {
    const all: ImdcFactors = {
      kpsBelow80: true,
      lessThanOneYearToTreatment: true,
      lowHaemoglobin: true,
      highCorrectedCalcium: true,
      highNeutrophils: true,
      highPlatelets: true,
    };
    expect(imdcRisk(all)).toEqual({ count: 6, risk: 'poor' });
  });
});
