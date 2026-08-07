import { describe, expect, it } from 'vitest';
import { interpretSemenAnalysis, type SemenParameters } from './semenAnalysis';

const empty: SemenParameters = {
  volumeMl: null,
  concentrationMillionPerMl: null,
  totalMotilityPercent: null,
  progressiveMotilityPercent: null,
  morphologyNormalPercent: null,
  vitalityLivePercent: null,
  pH: null,
};

describe('semenAnalysis', () => {
  it('all parameters at LLN → all normal', () => {
    const result = interpretSemenAnalysis({
      volumeMl: 1.5,
      concentrationMillionPerMl: 16,
      totalMotilityPercent: 42,
      progressiveMotilityPercent: 30,
      morphologyNormalPercent: 4,
      vitalityLivePercent: 54,
      pH: 7.2,
    });
    expect(result.flags.every((f) => f.status === 'normal')).toBe(true);
    expect(result.interpretation).toBe('All parameters within normal limits');
  });

  it('all parameters below LLN → all low', () => {
    const result = interpretSemenAnalysis({
      volumeMl: 1.0,
      concentrationMillionPerMl: 10,
      totalMotilityPercent: 30,
      progressiveMotilityPercent: 20,
      morphologyNormalPercent: 2,
      vitalityLivePercent: 40,
      pH: 7.0,
    });
    expect(result.flags.every((f) => f.status === 'low')).toBe(true);
    expect(result.interpretation).toContain('7 parameters below');
  });

  it('volume boundary: 1.5 is normal, 1.4 is low', () => {
    const atLln = interpretSemenAnalysis({ ...empty, volumeMl: 1.5 });
    const belowLln = interpretSemenAnalysis({ ...empty, volumeMl: 1.4 });
    expect(atLln.flags[0]?.status).toBe('normal');
    expect(belowLln.flags[0]?.status).toBe('low');
  });

  it('concentration boundary: 16 is normal, 15 is low', () => {
    const atLln = interpretSemenAnalysis({ ...empty, concentrationMillionPerMl: 16 });
    const belowLln = interpretSemenAnalysis({ ...empty, concentrationMillionPerMl: 15 });
    expect(atLln.flags[0]?.status).toBe('normal');
    expect(belowLln.flags[0]?.status).toBe('low');
  });

  it('motility boundaries: 42% total and 30% progressive are normal thresholds', () => {
    const totalAtLln = interpretSemenAnalysis({ ...empty, totalMotilityPercent: 42 });
    const progAtLln = interpretSemenAnalysis({ ...empty, progressiveMotilityPercent: 30 });
    expect(totalAtLln.flags[0]?.status).toBe('normal');
    expect(progAtLln.flags[0]?.status).toBe('normal');
  });

  it('morphology boundary: 4% is normal, 3% is low', () => {
    const atLln = interpretSemenAnalysis({ ...empty, morphologyNormalPercent: 4 });
    const belowLln = interpretSemenAnalysis({ ...empty, morphologyNormalPercent: 3 });
    expect(atLln.flags[0]?.status).toBe('normal');
    expect(belowLln.flags[0]?.status).toBe('low');
  });

  it('omitted parameters are not flagged', () => {
    const result = interpretSemenAnalysis({ ...empty, volumeMl: 1.5 });
    expect(result.flags).toHaveLength(1);
    expect(result.flags[0]?.parameter).toBe('Volume (mL)');
  });
});
