/**
 * Flat, in-app search index assembled from the existing registries so it never
 * drifts. Each item maps a searchable label to the screen that contains it.
 */
import type { Screen } from '@/navigation';
import { CALCULATORS } from '@/components/calculators/registry';
import { PROCEDURES } from './procedures';
import { EMERGENCIES } from './oncall';
import { RAD_SYSTEMS } from './radiology';
import { GUIDELINES } from './guidelines';

export interface SearchItem {
  label: string;
  sub: string;
  screen: Screen;
  /** Lower-cased haystack for matching. */
  keywords: string;
}

const kw = (...parts: string[]) => parts.join(' ').toLowerCase();

export const SEARCH_INDEX: SearchItem[] = [
  ...CALCULATORS.map((c) => ({
    label: c.title,
    sub: `Calculator · ${c.category === 'oncological' ? 'Oncological' : 'Non-oncological'}`,
    screen: 'calculators' as Screen,
    keywords: kw(c.title, c.id),
  })),
  ...PROCEDURES.map((p) => ({
    label: p.name,
    sub: `Procedure · ${p.category}`,
    screen: 'residency' as Screen,
    keywords: kw(p.name, p.category, p.summary),
  })),
  ...EMERGENCIES.map((e) => ({
    label: e.name,
    sub: 'On-call emergency',
    screen: 'residency' as Screen,
    keywords: kw(e.name, e.oneLiner),
  })),
  ...RAD_SYSTEMS.map((s) => ({
    label: s.name,
    sub: `Imaging · ${s.modality}`,
    screen: 'imaging' as Screen,
    keywords: kw(s.name, s.short, s.modality, s.outcome),
  })),
  ...GUIDELINES.map((g) => ({
    label: g.title,
    sub: `Guideline · ${g.condition}`,
    screen: 'guidelines' as Screen,
    keywords: kw(g.title, g.condition, g.id),
  })),
  { label: 'Paediatric maintenance fluids', sub: 'Pediatrics', screen: 'pediatrics', keywords: kw('paediatric fluids holliday segar maintenance bolus weight') },
  { label: 'Paediatric antibiotic dosing', sub: 'Pediatrics', screen: 'pediatrics', keywords: kw('antibiotic uti spids dosing amoxicillin ceftriaxone gentamicin') },
  { label: 'SFU hydronephrosis grade', sub: 'Pediatrics', screen: 'pediatrics', keywords: kw('sfu hydronephrosis grading fernbach') },
  { label: 'UTI workup pathway', sub: 'Pediatrics', screen: 'pediatrics', keywords: kw('uti workup pathway vcug dmsa prophylaxis') },
  { label: 'TWIST score', sub: 'On-call · torsion', screen: 'residency', keywords: kw('twist testicular torsion score barbosa') },
  { label: 'Operative logbook', sub: 'OR · Logbook', screen: 'residency', keywords: kw('logbook surgical cases log role') },
  { label: 'Rounding list', sub: 'Inpatient', screen: 'residency', keywords: kw('rounding ward round patient list progress plan') },
  { label: 'Surveillance schedule', sub: 'Follow-up calendar', screen: 'surveillance', keywords: kw('surveillance schedule follow-up calendar nmibc cystoscopy rcc renal mass stone metabolic 24-hour urine') },
  { label: 'Conferences', sub: 'Calendar', screen: 'conferences', keywords: kw('conferences congress meeting aua eau siu wcet arab association urology dates calendar ics jeddah') },
  { label: 'Operative rehearsal', sub: 'OR drill', screen: 'rehearsal', keywords: kw('operative rehearsal simulator surgery steps sequence order drill viva or training procedure') },
  { label: 'Intra-op scenarios', sub: 'Decision case', screen: 'scenarios', keywords: kw('intraoperative scenario decision case simulator turbt branching complications management or training') },
  { label: 'Drug interactions', sub: 'Pharmacology', screen: 'drugs', keywords: kw('drug interactions pde5i nitrates alpha-blocker antimuscarinic mirabegron testosterone warfarin fluoroquinolone tmp-smx interaction') },
  { label: 'Consent generator', sub: 'OR · bilingual', screen: 'residency', keywords: kw('consent generator bilingual arabic english surgical complications turp vasectomy nephrectomy موافقة') },
  { label: 'Evidence AI', sub: 'Home', screen: 'home', keywords: kw('evidence ai assistant question') },
];
