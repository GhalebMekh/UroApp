import type { ComponentType } from 'react';
import { PsaToolkit } from './PsaToolkit';
import { CapraScore } from './CapraScore';
import { EortcNmibc } from './EortcNmibc';
import { TnmStaging } from './TnmStaging';
import { IgcccgClassifier } from './IgcccgClassifier';
import { PaduaScore } from './PaduaScore';
import { IsupGradeGroupConverter } from './IsupGradeGroupConverter';
import { ImdcHengRisk } from './ImdcHengRisk';
import { RenalFunction } from './RenalFunction';
import { GuysStoneScore } from './GuysStoneScore';
import { StonePassage } from './StonePassage';
import { IpssCalculator } from './IpssCalculator';
import { RenalCalculator } from './RenalCalculator';
import { ShimCalculator } from './ShimCalculator';
import { StoneScore } from './StoneScore';
import { OabssCalculator } from './OabssCalculator';
import { PvrInterpretation } from './PvrInterpretation';
import { ProstateTreatmentEligibility } from './ProstateTreatmentEligibility';
import { SemenAnalysisInterpreter } from './SemenAnalysisInterpreter';

/** Every calculator is either an oncology tool or a benign/functional one. */
export type CalcCategory = 'oncological' | 'non-oncological';

/** Organ system for oncology calculators (groups under Oncological category). */
export type OncologyOrgan = 'prostate' | 'bladder' | 'kidney' | 'testis' | 'general';

export interface CalcEntry {
  id: string;
  title: string;
  category: CalcCategory;
  /** Organ system (oncology calculators only). */
  organ?: OncologyOrgan;
  Component: ComponentType;
}

/** The calculators workspace, in display order within each group. */
export const CALCULATORS: CalcEntry[] = [
  // Prostate oncology
  { id: 'psa', title: 'PSA toolkit', category: 'oncological', organ: 'prostate', Component: PsaToolkit },
  { id: 'capra', title: 'UCSF-CAPRA', category: 'oncological', organ: 'prostate', Component: CapraScore },
  { id: 'isup-grade-group', title: 'ISUP Grade Group converter', category: 'oncological', organ: 'prostate', Component: IsupGradeGroupConverter },
  // Bladder oncology
  { id: 'eortc', title: 'EORTC NMIBC risk', category: 'oncological', organ: 'bladder', Component: EortcNmibc },
  // Kidney/Renal oncology
  { id: 'imdc-heng', title: 'IMDC (Heng) risk', category: 'oncological', organ: 'kidney', Component: ImdcHengRisk },
  { id: 'renal', title: 'R.E.N.A.L. Nephrometry', category: 'oncological', organ: 'kidney', Component: RenalCalculator },
  { id: 'padua', title: 'PADUA score', category: 'oncological', organ: 'kidney', Component: PaduaScore },
  // Testis oncology
  { id: 'igcccg', title: 'IGCCCG germ cell prognosis', category: 'oncological', organ: 'testis', Component: IgcccgClassifier },
  // General/multi-organ
  { id: 'tnm', title: 'TNM quick staging', category: 'oncological', organ: 'general', Component: TnmStaging },
  { id: 'renal-function', title: 'Renal function (eGFR / CrCl)', category: 'non-oncological', Component: RenalFunction },
  { id: 'guys-stone', title: "Guy's Stone Score", category: 'non-oncological', Component: GuysStoneScore },
  { id: 'stone-passage', title: 'Ureteral stone passage', category: 'non-oncological', Component: StonePassage },
  { id: 'stone', title: 'STONE score (ER prediction)', category: 'non-oncological', Component: StoneScore },
  { id: 'oabss', title: 'OABSS', category: 'non-oncological', Component: OabssCalculator },
  { id: 'pvr', title: 'PVR Interpretation', category: 'non-oncological', Component: PvrInterpretation },
  { id: 'prostate-volume', title: 'Prostate volume → BPH treatment', category: 'non-oncological', Component: ProstateTreatmentEligibility },
  { id: 'ipss', title: 'IPSS + QoL', category: 'non-oncological', Component: IpssCalculator },
  { id: 'shim', title: 'IIEF-5 (SHIM)', category: 'non-oncological', Component: ShimCalculator },
  { id: 'semen-analysis', title: 'Semen analysis (WHO 2021)', category: 'non-oncological', Component: SemenAnalysisInterpreter },
];

export interface CalcGroup {
  category: CalcCategory;
  label: string;
  blurb: string;
  /** Tailwind text colour for the group heading (violet = oncology). */
  accent: string;
}

export interface OncologyOrganGroup {
  organ: OncologyOrgan;
  label: string;
  /** Icon key, mapped to an SVG component in CalculatorsScreen. */
  icon: OncologyOrgan;
}

/** Oncology organ system headers, in display order. */
export const ONCOLOGY_ORGANS: OncologyOrganGroup[] = [
  { organ: 'prostate', label: 'Prostate', icon: 'prostate' },
  { organ: 'bladder', label: 'Bladder', icon: 'bladder' },
  { organ: 'kidney', label: 'Kidney & renal mass', icon: 'kidney' },
  { organ: 'testis', label: 'Testis', icon: 'testis' },
  { organ: 'general', label: 'General staging', icon: 'general' },
];

/** Group headers, in display order. Oncology first, accented violet. */
export const CALC_GROUPS: CalcGroup[] = [
  {
    category: 'oncological',
    label: 'Oncological',
    blurb: 'Cancer detection, risk and surgical-planning tools — organized by organ system.',
    accent: 'text-violet-soft',
  },
  {
    category: 'non-oncological',
    label: 'Non-oncological',
    blurb: 'Benign and functional urology scores.',
    accent: 'text-teal',
  },
];
