/**
 * Charlson Comorbidity Index.
 *
 * SOURCES (CLAUDE.md: no numbers from memory):
 *  - Charlson ME et al. J Chronic Dis 1987;40(5):373-83. PMID 3558716 — the index.
 *  - Charlson M et al. J Clin Epidemiol 1994;47(11):1245-51. PMID 7722560 —
 *    combined age-comorbidity validation after elective surgery.
 *  - Weights as reproduced in Campbell-Walsh-Wein ch. 23 (Assessment of
 *    Urologic Outcomes).
 *
 * Deliberately NOT included: an age-adjusted score and survival estimates.
 * The 1994 abstract gives the relationship (one comorbidity point carried
 * about the same relative risk of death as one extra decade of age, ~1.4
 * each) but not the age-point table, and no verified survival figures are on
 * hand. Neither is written from memory.
 */

/** Stand-alone conditions and their weights. */
export const CHARLSON_CONDITIONS = [
  { key: 'mi', label: 'Myocardial infarction', weight: 1 },
  { key: 'chf', label: 'Congestive heart failure', weight: 1 },
  { key: 'pvd', label: 'Peripheral vascular disease', weight: 1 },
  { key: 'cvd', label: 'Cerebrovascular disease', weight: 1 },
  { key: 'dementia', label: 'Dementia', weight: 1 },
  { key: 'copd', label: 'Chronic pulmonary disease', weight: 1 },
  { key: 'ctd', label: 'Connective tissue disease', weight: 1 },
  { key: 'pud', label: 'Peptic ulcer disease', weight: 1 },
  { key: 'hemiplegia', label: 'Hemiplegia', weight: 2 },
  { key: 'renal', label: 'Moderate or severe renal disease', weight: 2 },
  { key: 'aids', label: 'AIDS', weight: 6 },
] as const;

export type ConditionKey = (typeof CHARLSON_CONDITIONS)[number]['key'];

/**
 * Conditions that come in two severities are a single choice, so a patient
 * can't score both "diabetes" and "diabetes with end-organ damage".
 */
export const DIABETES = { none: 0, uncomplicated: 1, endOrgan: 2 } as const;
export const LIVER = { none: 0, mild: 1, moderateSevere: 3 } as const;
export const MALIGNANCY = { none: 0, any: 2, metastatic: 6 } as const;

export interface CharlsonInput {
  conditions: Partial<Record<ConditionKey, boolean>>;
  diabetes: keyof typeof DIABETES;
  liver: keyof typeof LIVER;
  malignancy: keyof typeof MALIGNANCY;
}

export function charlsonScore(i: CharlsonInput): number {
  const standalone = CHARLSON_CONDITIONS.reduce((s, c) => s + (i.conditions[c.key] ? c.weight : 0), 0);
  return standalone + DIABETES[i.diabetes] + LIVER[i.liver] + MALIGNANCY[i.malignancy];
}
