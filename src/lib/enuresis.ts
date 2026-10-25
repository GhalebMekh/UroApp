/**
 * Nocturnal enuresis — classification and first-line choice, from
 * Campbell-Walsh-Wein 12th ed, ch 35 (Austin & Seth). Reference only: the app
 * deliberately gives no drug doses.
 *
 *  Enuresis = incontinence during sleep after 5 years of age, without a
 *  neurological disorder. Any daytime LUTS → nonmonosymptomatic (NMSE);
 *  none → monosymptomatic (MSE). Wetting returning after ≥ 6 months dry →
 *  secondary. Active treatment usually not before 6 years.
 */

export interface EnuresisInput {
  ageYears: number;
  daytimeSymptoms: boolean;
  /** Was dry for at least 6 months before the wetting returned. */
  previouslyDry: boolean;
}

export type EnuresisType =
  | 'too-young'
  | 'primary-mse'
  | 'secondary-mse'
  | 'primary-nmse'
  | 'secondary-nmse';

export function classifyEnuresis(i: EnuresisInput): EnuresisType {
  if (!(i.ageYears >= 5)) return 'too-young';
  const kind = i.daytimeSymptoms ? 'nmse' : 'mse';
  return `${i.previouslyDry ? 'secondary' : 'primary'}-${kind}`;
}

export const ENURESIS_LABEL: Record<EnuresisType, string> = {
  'too-young': 'Not yet enuresis (under 5 years)',
  'primary-mse': 'Primary monosymptomatic enuresis',
  'secondary-mse': 'Secondary monosymptomatic enuresis',
  'primary-nmse': 'Primary nonmonosymptomatic enuresis',
  'secondary-nmse': 'Secondary nonmonosymptomatic enuresis',
};

/** Active treatment usually starts from 6 years, guided by the child's own motivation. */
export const ACTIVE_TREATMENT_FROM_YEARS = 6;
