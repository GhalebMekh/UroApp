/**
 * Radiology reporting references — PI-RADS v2.1, Bosniak 2019, VI-RADS.
 *
 * LICENSING (CLAUDE.md, NON-NEGOTIABLE): every category below is a *summary in
 * our own words* of the published criteria, with a primary-source citation —
 * NOT a verbatim reproduction of the ACR / journal tables. Management lines are
 * decision-support framing for a clinician, never patient-specific directives.
 * Verify against the cited primary source before clinical use.
 */
import type { Citation } from './citations';
import { CITATIONS } from './citations';

/** Qualitative malignancy / invasion risk → drives the colour coding. */
export type RadRisk = 'low' | 'moderate' | 'high';

export interface RadCategory {
  /** Short code shown in the badge, e.g. "3" or "IIF". */
  code: string;
  /** Human label for the category. */
  label: string;
  risk: RadRisk;
  /** Summarised imaging criteria (our wording). */
  criteria: string;
  /** What the category typically implies for management (decision support). */
  management: string;
}

export interface RadSystem {
  id: 'pirads' | 'bosniak' | 'virads';
  /** Tab label. */
  short: string;
  name: string;
  /** Modality + body region. */
  modality: string;
  /** What the score estimates. */
  outcome: string;
  citation: Citation;
  categories: RadCategory[];
}

export const RAD_SYSTEMS: RadSystem[] = [
  {
    id: 'pirads',
    short: 'PI-RADS',
    name: 'PI-RADS v2.1',
    modality: 'Prostate multiparametric MRI',
    outcome: 'Likelihood of clinically significant prostate cancer (csPCa)',
    citation: CITATIONS.pirads,
    categories: [
      {
        code: '1',
        label: 'Very low',
        risk: 'low',
        criteria: 'Clinically significant cancer is highly unlikely; no suspicious features on the dominant sequence (DWI in the peripheral zone, T2W in the transition zone).',
        management: 'Imaging does not support targeted biopsy; manage by overall clinical risk (PSA, DRE, PSA density).',
      },
      {
        code: '2',
        label: 'Low',
        risk: 'low',
        criteria: 'Clinically significant cancer unlikely; minor or non-focal findings only.',
        management: 'Targeted biopsy generally not warranted on MRI grounds alone; weigh clinical factors.',
      },
      {
        code: '3',
        label: 'Intermediate',
        risk: 'moderate',
        criteria: 'Equivocal — the presence of clinically significant cancer is uncertain.',
        management: 'Decision individualised; PSA density and clinical context help decide biopsy vs. monitoring.',
      },
      {
        code: '4',
        label: 'High',
        risk: 'high',
        criteria: 'Clinically significant cancer is likely; a focal suspicious lesion < 1.5 cm confined to the prostate.',
        management: 'Targeted biopsy of the lesion is generally recommended.',
      },
      {
        code: '5',
        label: 'Very high',
        risk: 'high',
        criteria: 'Clinically significant cancer highly likely; suspicious lesion ≥ 1.5 cm or with definite extraprostatic extension.',
        management: 'Targeted biopsy recommended; assess for staging implications.',
      },
    ],
  },
  {
    id: 'bosniak',
    short: 'Bosniak',
    name: 'Bosniak 2019',
    modality: 'Renal cystic mass — CT or MRI',
    outcome: 'Likelihood that a cystic renal mass is malignant',
    citation: CITATIONS.bosniak,
    categories: [
      {
        code: 'I',
        label: 'Simple cyst',
        risk: 'low',
        criteria: 'Well-defined, thin (≤ 2 mm) smooth wall; no septa, calcification, or enhancement; homogeneous fluid density/intensity.',
        management: 'Benign — no follow-up imaging required.',
      },
      {
        code: 'II',
        label: 'Minimally complex',
        risk: 'low',
        criteria: 'A few thin septa, fine/short-segment calcification, or other minimal features that remain benign.',
        management: 'Considered benign — no follow-up required.',
      },
      {
        code: 'IIF',
        label: 'Follow-up',
        risk: 'moderate',
        criteria: 'Features beyond class II but short of class III (e.g. more numerous or minimally thickened smooth septa/wall).',
        management: 'Low but non-zero malignancy risk — imaging surveillance (serial CT/MRI).',
      },
      {
        code: 'III',
        label: 'Indeterminate',
        risk: 'moderate',
        criteria: 'One or more thick or irregular enhancing walls or septa.',
        management: 'Intermediate malignancy risk — urology referral; surgery/ablation or surveillance per patient.',
      },
      {
        code: 'IV',
        label: 'Malignant features',
        risk: 'high',
        criteria: 'Enhancing soft-tissue (nodular) component independent of wall/septa.',
        management: 'High malignancy risk — treatment (surgery or ablation) generally indicated.',
      },
    ],
  },
  {
    id: 'virads',
    short: 'VI-RADS',
    name: 'VI-RADS',
    modality: 'Bladder multiparametric MRI',
    outcome: 'Likelihood of detrusor (muscle) invasion in bladder cancer',
    citation: CITATIONS.virads,
    categories: [
      {
        code: '1',
        label: 'Highly unlikely',
        risk: 'low',
        criteria: 'Muscle invasion highly unlikely; lesion ≤ submucosa with an intact muscle layer across T2W, DWI and DCE.',
        management: 'Consistent with non-muscle-invasive disease; supports organ-preserving management.',
      },
      {
        code: '2',
        label: 'Unlikely',
        risk: 'low',
        criteria: 'Muscle invasion unlikely; preserved low-signal muscle line, no clear disruption.',
        management: 'Favours non-muscle-invasive disease; correlate with TURBT.',
      },
      {
        code: '3',
        label: 'Equivocal',
        risk: 'moderate',
        criteria: 'Findings are equivocal for muscle invasion across the sequences.',
        management: 'Indeterminate — correlate with restaging TURBT and multidisciplinary review.',
      },
      {
        code: '4',
        label: 'Likely',
        risk: 'high',
        criteria: 'Muscle invasion likely; disruption of the muscle layer by tumour signal.',
        management: 'High suspicion of muscle-invasive disease; informs staging and treatment pathway.',
      },
      {
        code: '5',
        label: 'Highly likely',
        risk: 'high',
        criteria: 'Invasion of muscle and beyond likely; extension into perivesical fat.',
        management: 'Strongly suggests muscle-invasive (± extravesical) disease.',
      },
    ],
  },
];
