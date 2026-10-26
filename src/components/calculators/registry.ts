import type { ComponentType } from 'react';
import { PsaToolkit } from './PsaToolkit';
import { CapraScore } from './CapraScore';
import { CapraSScore } from './CapraSScore';
import { AdrenalIncidentaloma } from './AdrenalIncidentaloma';
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
import { FreeTestosterone } from './FreeTestosterone';
import { ClavienDindo } from './ClavienDindo';
import { CharlsonIndex } from './CharlsonIndex';

/** Every calculator is either an oncology tool or a benign/functional one. */
export type CalcCategory = 'oncological' | 'non-oncological';

/** Organ system for oncology calculators (groups under Oncological category). */
export type OncologyOrgan = 'prostate' | 'bladder' | 'kidney' | 'adrenal' | 'testis' | 'general';

/** Topic for benign/functional calculators (groups under Non-oncological). */
export type BenignTopic = 'luts' | 'stones' | 'andrology' | 'kidney-function' | 'periop';

export interface CalcEntry {
  id: string;
  title: string;
  category: CalcCategory;
  /** Organ system (oncology calculators only). */
  organ?: OncologyOrgan;
  /** Topic (non-oncology calculators only). */
  topic?: BenignTopic;
  Component: ComponentType;
}

/** The calculators workspace, in display order within each group. */
export const CALCULATORS: CalcEntry[] = [
  // Prostate oncology
  { id: 'psa', title: 'PSA toolkit', category: 'oncological', organ: 'prostate', Component: PsaToolkit },
  { id: 'capra', title: 'UCSF-CAPRA', category: 'oncological', organ: 'prostate', Component: CapraScore },
  { id: 'capra-s', title: 'CAPRA-S (post-prostatectomy)', category: 'oncological', organ: 'prostate', Component: CapraSScore },
  { id: 'isup-grade-group', title: 'ISUP Grade Group converter', category: 'oncological', organ: 'prostate', Component: IsupGradeGroupConverter },
  // Bladder oncology
  { id: 'eortc', title: 'EORTC NMIBC risk', category: 'oncological', organ: 'bladder', Component: EortcNmibc },
  // Kidney/Renal oncology
  { id: 'imdc-heng', title: 'IMDC (Heng) risk', category: 'oncological', organ: 'kidney', Component: ImdcHengRisk },
  { id: 'renal', title: 'R.E.N.A.L. Nephrometry', category: 'oncological', organ: 'kidney', Component: RenalCalculator },
  { id: 'padua', title: 'PADUA score', category: 'oncological', organ: 'kidney', Component: PaduaScore },
  // Adrenal
  { id: 'adrenal-incidentaloma', title: 'Adrenal incidentaloma (ESE 2023)', category: 'oncological', organ: 'adrenal', Component: AdrenalIncidentaloma },
  // Testis oncology
  { id: 'igcccg', title: 'IGCCCG germ cell prognosis', category: 'oncological', organ: 'testis', Component: IgcccgClassifier },
  // General/multi-organ
  { id: 'tnm', title: 'TNM quick staging', category: 'oncological', organ: 'general', Component: TnmStaging },
  { id: 'renal-function', title: 'Renal function (eGFR / CrCl)', category: 'non-oncological', topic: 'kidney-function', Component: RenalFunction },
  { id: 'guys-stone', title: "Guy's Stone Score", category: 'non-oncological', topic: 'stones', Component: GuysStoneScore },
  { id: 'stone-passage', title: 'Ureteral stone passage', category: 'non-oncological', topic: 'stones', Component: StonePassage },
  { id: 'stone', title: 'STONE score (ER prediction)', category: 'non-oncological', topic: 'stones', Component: StoneScore },
  { id: 'oabss', title: 'OABSS', category: 'non-oncological', topic: 'luts', Component: OabssCalculator },
  { id: 'pvr', title: 'PVR Interpretation', category: 'non-oncological', topic: 'luts', Component: PvrInterpretation },
  { id: 'prostate-volume', title: 'Prostate volume → BPH treatment', category: 'non-oncological', topic: 'luts', Component: ProstateTreatmentEligibility },
  { id: 'ipss', title: 'IPSS + QoL', category: 'non-oncological', topic: 'luts', Component: IpssCalculator },
  { id: 'shim', title: 'IIEF-5 (SHIM)', category: 'non-oncological', topic: 'andrology', Component: ShimCalculator },
  { id: 'semen-analysis', title: 'Semen analysis (WHO 2021)', category: 'non-oncological', topic: 'andrology', Component: SemenAnalysisInterpreter },
  { id: 'free-testosterone', title: 'Free & bioavailable testosterone', category: 'non-oncological', topic: 'andrology', Component: FreeTestosterone },
  { id: 'clavien-dindo', title: 'Clavien–Dindo complication grade', category: 'non-oncological', topic: 'periop', Component: ClavienDindo },
  { id: 'charlson', title: 'Charlson Comorbidity Index', category: 'non-oncological', topic: 'periop', Component: CharlsonIndex },
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
  /** Icon key, mapped to an SVG component in calculators/groupIcons. */
  icon: OncologyOrgan;
}

export interface BenignTopicGroup {
  topic: BenignTopic;
  label: string;
}

/** Non-oncology topic headers, in display order. */
export const BENIGN_TOPICS: BenignTopicGroup[] = [
  { topic: 'luts', label: 'LUTS & BPH' },
  { topic: 'stones', label: 'Stones' },
  { topic: 'andrology', label: 'Andrology' },
  { topic: 'kidney-function', label: 'Kidney function' },
  { topic: 'periop', label: 'Peri-operative' },
];

/** The organ or topic heading a calculator sits under, e.g. "Prostate" or "Stones". */
export function groupLabel(entry: CalcEntry): string {
  if (entry.organ) return ONCOLOGY_ORGANS.find((o) => o.organ === entry.organ)?.label ?? '';
  if (entry.topic) return BENIGN_TOPICS.find((t) => t.topic === entry.topic)?.label ?? '';
  return '';
}

/** Calculators sharing a heading with this one (for "Also in …" links). */
export function siblingsOf(entry: CalcEntry): CalcEntry[] {
  return CALCULATORS.filter(
    (c) => c.id !== entry.id && (entry.organ ? c.organ === entry.organ : c.topic === entry.topic),
  );
}

/** Oncology organ system headers, in display order. */
export const ONCOLOGY_ORGANS: OncologyOrganGroup[] = [
  { organ: 'prostate', label: 'Prostate', icon: 'prostate' },
  { organ: 'bladder', label: 'Bladder', icon: 'bladder' },
  { organ: 'kidney', label: 'Kidney & renal mass', icon: 'kidney' },
  { organ: 'adrenal', label: 'Adrenal', icon: 'adrenal' },
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
