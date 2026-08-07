/**
 * Semen analysis interpreter — pure logic (WHO 6th edition 2021).
 * Flags parameters below lower limit of normal (LLN) from fertile male reference population.
 */

export interface SemenParameters {
  volumeMl: number | null;
  concentrationMillionPerMl: number | null;
  totalMotilityPercent: number | null;
  progressiveMotilityPercent: number | null;
  morphologyNormalPercent: number | null;
  vitalityLivePercent: number | null;
  pH: number | null;
}

export interface SemenFlag {
  parameter: string;
  value: number;
  lln: number;
  status: 'normal' | 'low';
}

export interface SemenAnalysisResult {
  flags: SemenFlag[];
  interpretation: string;
}

// WHO 2021 Lower Limit of Normal (5th centile, fertile men)
const LLN = {
  volumeMl: 1.5,
  concentrationMillionPerMl: 16,
  totalMotilityPercent: 42,
  progressiveMotilityPercent: 30,
  morphologyNormalPercent: 4,
  vitalityLivePercent: 54, // for azoospermia cases
  pH: 7.2,
};

export function interpretSemenAnalysis(params: SemenParameters): SemenAnalysisResult {
  const flags: SemenFlag[] = [];

  if (params.volumeMl !== null) {
    flags.push({
      parameter: 'Volume (mL)',
      value: params.volumeMl,
      lln: LLN.volumeMl,
      status: params.volumeMl < LLN.volumeMl ? 'low' : 'normal',
    });
  }

  if (params.concentrationMillionPerMl !== null) {
    flags.push({
      parameter: 'Concentration (M/mL)',
      value: params.concentrationMillionPerMl,
      lln: LLN.concentrationMillionPerMl,
      status: params.concentrationMillionPerMl < LLN.concentrationMillionPerMl ? 'low' : 'normal',
    });
  }

  if (params.totalMotilityPercent !== null) {
    flags.push({
      parameter: 'Total motility (%)',
      value: params.totalMotilityPercent,
      lln: LLN.totalMotilityPercent,
      status: params.totalMotilityPercent < LLN.totalMotilityPercent ? 'low' : 'normal',
    });
  }

  if (params.progressiveMotilityPercent !== null) {
    flags.push({
      parameter: 'Progressive motility (%)',
      value: params.progressiveMotilityPercent,
      lln: LLN.progressiveMotilityPercent,
      status: params.progressiveMotilityPercent < LLN.progressiveMotilityPercent ? 'low' : 'normal',
    });
  }

  if (params.morphologyNormalPercent !== null) {
    flags.push({
      parameter: 'Normal morphology (%)',
      value: params.morphologyNormalPercent,
      lln: LLN.morphologyNormalPercent,
      status: params.morphologyNormalPercent < LLN.morphologyNormalPercent ? 'low' : 'normal',
    });
  }

  if (params.vitalityLivePercent !== null) {
    flags.push({
      parameter: 'Vitality — live sperm (%)',
      value: params.vitalityLivePercent,
      lln: LLN.vitalityLivePercent,
      status: params.vitalityLivePercent < LLN.vitalityLivePercent ? 'low' : 'normal',
    });
  }

  if (params.pH !== null) {
    flags.push({
      parameter: 'pH',
      value: params.pH,
      lln: LLN.pH,
      status: params.pH < LLN.pH ? 'low' : 'normal',
    });
  }

  const lowCount = flags.filter((f) => f.status === 'low').length;
  const interpretation =
    lowCount === 0
      ? 'All parameters within normal limits'
      : lowCount === 1
        ? '1 parameter below reference limit'
        : `${lowCount} parameters below reference limits`;

  return { flags, interpretation };
}
