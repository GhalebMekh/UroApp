import type { ComponentType } from 'react';
import { PediatricFluids } from '@/components/calculators/PediatricFluids';
import { PediatricAntibiotics } from './PediatricAntibiotics';
import { SfuHydronephrosis } from './SfuHydronephrosis';
import { UtiWorkup } from './UtiWorkup';
import { VurGrading } from './VurGrading';
import { UtdClassification } from './UtdClassification';
import { HydroUpjPuv } from './HydroUpjPuv';
import { VoidingDysfunctionKit } from './VoidingDysfunctionKit';
import { EnuresisPathway } from './EnuresisPathway';
import { UdtPathway } from './UdtPathway';
import { GmsScore } from './GmsScore';
import { ScrotalPain } from './ScrotalPain';

export type PediatricSection = 'hydro' | 'bladder' | 'genitalia' | 'ward';

export interface PediatricTool {
  id: string;
  title: string;
  section: PediatricSection;
  Component: ComponentType;
}

/** Section headings, in display order. */
export const PEDIATRIC_SECTIONS: { section: PediatricSection; label: string }[] = [
  { section: 'hydro', label: 'Hydronephrosis & reflux' },
  { section: 'bladder', label: 'Bladder, bowel & infection' },
  { section: 'genitalia', label: 'Genitalia' },
  { section: 'ward', label: 'Ward essentials' },
];

/** The Pediatrics workspace, in display order within each section. */
export const PEDIATRIC_TOOLS: PediatricTool[] = [
  { id: 'utd', title: 'UTD classification', section: 'hydro', Component: UtdClassification },
  { id: 'upj-megaureter-puv', title: 'UPJO, megaureter & valves', section: 'hydro', Component: HydroUpjPuv },
  { id: 'sfu', title: 'SFU hydronephrosis grade', section: 'hydro', Component: SfuHydronephrosis },
  { id: 'vur', title: 'VUR grading', section: 'hydro', Component: VurGrading },
  { id: 'voiding', title: 'Voiding dysfunction kit', section: 'bladder', Component: VoidingDysfunctionKit },
  { id: 'enuresis', title: 'Nocturnal enuresis', section: 'bladder', Component: EnuresisPathway },
  { id: 'uti', title: 'UTI work-up pathway', section: 'bladder', Component: UtiWorkup },
  { id: 'scrotal-pain', title: 'Scrotal pain in children', section: 'genitalia', Component: ScrotalPain },
  { id: 'udt', title: 'Undescended testis', section: 'genitalia', Component: UdtPathway },
  { id: 'gms', title: 'GMS hypospadias score', section: 'genitalia', Component: GmsScore },
  { id: 'fluids', title: 'Maintenance fluids', section: 'ward', Component: PediatricFluids },
  { id: 'antibiotics', title: 'Antibiotic dosing', section: 'ward', Component: PediatricAntibiotics },
];

export function sectionLabel(section: PediatricSection): string {
  return PEDIATRIC_SECTIONS.find((s) => s.section === section)?.label ?? '';
}
