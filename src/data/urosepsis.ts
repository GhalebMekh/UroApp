/**
 * Urosepsis recognition and the first hour.
 *
 * Sources (CLAUDE.md: primary source + working link, no numbers from memory):
 *  - Sepsis-3 definitions and qSOFA: Singer M et al., JAMA 2016;315(8):801-810
 *    (PMID 26903338).
 *  - Timings, targets and source control: Surviving Sepsis Campaign 2021,
 *    Evans L et al., Crit Care Med 2021;49(11):e1063-e1143
 *    (DOI 10.1097/CCM.0000000000005337).
 *  - Screening tool: NICE NG51 recommends NEWS2 in acute hospital settings.
 *
 * IMPORTANT — why this is not a bare qSOFA calculator:
 * SSC 2021 recommendation 2 is a STRONG recommendation AGAINST using qSOFA
 * compared with SIRS, NEWS or MEWS as a single screening tool for sepsis
 * (moderate-quality evidence). qSOFA was derived to predict death and
 * prolonged ICU stay in patients with known or suspected infection; the SSC
 * rationale notes "no analysis was performed to support its use as a screening
 * tool". It is therefore presented here as an escalation prompt, not a screen.
 */
import { CITATIONS } from '@/data/citations';

export interface QsofaCriterion {
  key: 'rr' | 'mentation' | 'sbp';
  label: string;
  detail: string;
}

/** qSOFA — ≥2 present simultaneously is qSOFA positive (Singer 2016). */
export const QSOFA_CRITERIA: QsofaCriterion[] = [
  { key: 'rr', label: 'Respiratory rate ≥22 /min', detail: 'Counted over a full minute' },
  { key: 'mentation', label: 'Altered mentation', detail: 'GCS <15 — any new confusion counts' },
  { key: 'sbp', label: 'Systolic BP ≤100 mmHg', detail: 'Before fluid resuscitation' },
];

export type Urgency = 'immediate' | 'urgent' | 'monitor';

export interface ActionStep {
  text: string;
  /** Shown as a timing chip, e.g. "within 1 h". */
  timing?: string;
}

export interface UrosepsisAssessment {
  qsofaScore: number;
  qsofaPositive: boolean;
  /** Septic shock by Sepsis-3 criteria. */
  shock: boolean;
  urgency: Urgency;
  headline: string;
  antimicrobial: ActionStep;
  steps: ActionStep[];
}

/**
 * Sepsis-3 septic shock: a vasopressor requirement to maintain MAP ≥65 mmHg
 * AND serum lactate >2 mmol/L, in the absence of hypovolaemia.
 * Associated with hospital mortality >40%.
 */
export function isSepticShock(onVasopressors: boolean, lactateOver2: boolean): boolean {
  return onVasopressors && lactateOver2;
}

/** The urological imperative — this is what makes urosepsis different. */
export const SOURCE_CONTROL: ActionStep = {
  text:
    'Decompress an obstructed, infected kidney — retrograde stent or percutaneous nephrostomy. ' +
    'SSC names pyelonephritis with obstruction as a focus requiring source control; antibiotics ' +
    'alone will not treat an obstructed system.',
  timing: 'as soon as practical (data favour 6–12 h)',
};

export function assess(
  qsofa: Partial<Record<QsofaCriterion['key'], boolean>>,
  onVasopressors: boolean,
  lactateOver2: boolean,
): UrosepsisAssessment {
  const qsofaScore = QSOFA_CRITERIA.reduce((n, c) => n + (qsofa[c.key] ? 1 : 0), 0);
  const qsofaPositive = qsofaScore >= 2;
  const shock = isSepticShock(onVasopressors, lactateOver2);

  // SSC 2021 rec 12: antimicrobials immediately, ideally within 1 h, for septic
  // shock and for confirmed/very likely sepsis. Rec 14: within 3 h for possible
  // sepsis without shock. Rec 15: defer and monitor if infection unlikely.
  if (shock) {
    return {
      qsofaScore,
      qsofaPositive,
      shock: true,
      urgency: 'immediate',
      headline: 'Septic shock — resuscitate and decompress now',
      antimicrobial: {
        text: 'Broad-spectrum antimicrobials immediately, per local urosepsis protocol.',
        timing: 'within 1 h',
      },
      steps: [
        { text: 'Cultures before antibiotics if it does not delay them; blood and urine.' },
        { text: 'At least 30 mL/kg IV crystalloid for hypoperfusion.', timing: 'within 3 h' },
        { text: 'Vasopressors to an initial MAP target of 65 mmHg.' },
        SOURCE_CONTROL,
        { text: 'Call your senior and critical care now. Escalate early — mortality exceeds 40%.' },
      ],
    };
  }

  if (qsofaPositive) {
    return {
      qsofaScore,
      qsofaPositive,
      shock: false,
      urgency: 'immediate',
      headline: 'qSOFA positive — high risk of deterioration',
      antimicrobial: {
        text: 'Treat as very likely sepsis: broad-spectrum antimicrobials immediately.',
        timing: 'within 1 h',
      },
      steps: [
        { text: 'Blood and urine cultures before antibiotics where possible.' },
        { text: 'Measure blood lactate; repeat if the first is raised.' },
        { text: 'Urgent imaging (CT or ultrasound) to find or exclude obstruction.' },
        SOURCE_CONTROL,
        { text: 'Escalate to your senior; involve critical care if lactate is rising or BP is falling.' },
      ],
    };
  }

  return {
    qsofaScore,
    qsofaPositive,
    shock: false,
    urgency: qsofaScore === 1 ? 'urgent' : 'monitor',
    headline:
      qsofaScore === 1
        ? 'One qSOFA criterion — do not be reassured'
        : 'qSOFA negative — screen with NEWS2, not qSOFA',
    antimicrobial: {
      text:
        'Possible sepsis without shock: rapid assessment of infectious versus non-infectious ' +
        'causes, then antimicrobials if concern persists.',
      timing: 'within 3 h',
    },
    steps: [
      { text: 'Score with NEWS2 — qSOFA is not a screening tool and misses early sepsis.' },
      { text: 'Measure blood lactate; take blood and urine cultures.' },
      { text: 'Image to exclude obstruction if there is loin pain, a known stone, or a single kidney.' },
      { text: 'Reassess frequently — deterioration can be rapid once obstruction is present.' },
    ],
  };
}

export const UROSEPSIS_CITATIONS = {
  definitions: CITATIONS.sepsis3,
  management: CITATIONS.survivingSepsis,
} as const;
