/**
 * Flat, in-app search index assembled from the existing registries so it never
 * drifts. Each item maps a searchable label to the screen that contains it.
 */
import type { Screen, ScreenLink } from '@/navigation';
import { CALCULATORS } from '@/components/calculators/registry';
import { PEDIATRIC_TOOLS } from '@/components/pediatrics/registry';
import { PROCEDURES } from './procedures';
import { EMERGENCIES } from './oncall';
import { RAD_SYSTEMS } from './radiology';
import { GUIDELINES } from './guidelines';

export interface SearchItem {
  label: string;
  sub: string;
  screen: Screen;
  /** For calculators: which one to open, so search lands on it rather than the list top. */
  calcId?: string;
  /** For pediatric tools: which one to open. */
  pedsId?: string;
  /** A deeper target than `screen` (e.g. one procedure or on-call pathway). */
  link?: ScreenLink;
  /** Lower-cased haystack for matching. */
  keywords: string;
}

const kw = (...parts: string[]) => parts.join(' ').toLowerCase();

/** Extra search terms for each pediatric tool (by registry id). */
const PEDS_KEYWORDS: Record<string, string> = {
  fluids: 'paediatric fluids holliday segar maintenance bolus weight',
  antibiotics: 'paediatric antibiotic uti spids dosing amoxicillin ceftriaxone gentamicin',
  sfu: 'sfu hydronephrosis grading fernbach',
  vur: 'vur vesicoureteral reflux grade international reflux study',
  uti: 'uti workup pathway vcug dmsa prophylaxis',
  utd: 'utd urinary tract dilation antenatal prenatal postnatal hydronephrosis apd a1 a2 p1 p2 p3',
  'upj-megaureter-puv': 'upjo pyeloplasty megaureter posterior urethral valves puv luto mag3 antenatal hydronephrosis',
  voiding: 'expected bladder capacity ebc iccs koff dvss dysfunctional voiding bladder diary nocturnal polyuria bbd',
  enuresis: 'enuresis bedwetting monosymptomatic alarm desmopressin',
  udt: 'undescended testis cryptorchidism orchidopexy nonpalpable laparoscopy retractile',
  gms: 'gms hypospadias glans meatus shaft chordee severity',
  'scrotal-pain': 'acute scrotum torsion appendix testis blue dot epididymitis orchiectomy hours',
};

export const SEARCH_INDEX: SearchItem[] = [
  ...CALCULATORS.map((c) => ({
    label: c.title,
    sub: `Calculator · ${c.category === 'oncological' ? 'Oncological' : 'Non-oncological'}`,
    screen: 'calculators' as Screen,
    calcId: c.id,
    keywords: kw(c.title, c.id),
  })),
  ...PROCEDURES.map((p) => ({
    label: p.name,
    sub: `Procedure · ${p.category}`,
    screen: 'residency' as Screen,
    link: { residency: { section: 'or', orTab: 'procedures', procedure: p.id } } as ScreenLink,
    keywords: kw(p.name, p.category, p.summary),
  })),
  ...EMERGENCIES.map((e) => ({
    label: e.name,
    sub: 'On-call emergency',
    screen: 'residency' as Screen,
    link: { residency: { section: 'oncall', emergency: e.id } } as ScreenLink,
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
  ...PEDIATRIC_TOOLS.map((t) => ({
    label: t.title,
    sub: 'Pediatrics',
    screen: 'pediatrics' as Screen,
    pedsId: t.id,
    keywords: kw(t.title, PEDS_KEYWORDS[t.id] ?? ''),
  })),
  { label: 'TWIST score', sub: 'On-call · torsion', screen: 'residency', link: { residency: { section: 'oncall', emergency: 'torsion' } }, keywords: kw('twist testicular torsion score barbosa') },
  { label: 'Operative logbook', sub: 'OR · Logbook', screen: 'residency', link: { residency: { section: 'or', orTab: 'logbook' } }, keywords: kw('logbook surgical cases log role') },
  { label: 'Rounding list', sub: 'Inpatient', screen: 'residency', link: { residency: { section: 'inpatient' } }, keywords: kw('rounding ward round patient list progress plan') },
  { label: 'Surveillance schedule', sub: 'Follow-up calendar', screen: 'surveillance', keywords: kw('surveillance schedule follow-up calendar nmibc cystoscopy rcc renal mass stone metabolic 24-hour urine') },
  { label: 'Conferences', sub: 'Calendar', screen: 'conferences', keywords: kw('conferences congress meeting aua eau siu wcet arab association urology dates calendar ics jeddah') },
  { label: 'Operative rehearsal', sub: 'OR drill', screen: 'rehearsal', keywords: kw('operative rehearsal simulator surgery steps sequence order drill viva or training procedure') },
  { label: 'Intra-op scenarios', sub: 'Decision case', screen: 'scenarios', keywords: kw('intraoperative scenario decision case simulator turbt branching complications management or training') },
  { label: 'Drug interactions', sub: 'Pharmacology', screen: 'drugs', keywords: kw('drug interactions pde5i nitrates alpha-blocker antimuscarinic mirabegron testosterone warfarin fluoroquinolone tmp-smx interaction') },
  { label: 'Consent generator', sub: 'OR · bilingual', screen: 'residency', link: { residency: { section: 'or', orTab: 'consent' } }, keywords: kw('consent generator bilingual arabic english surgical complications turp vasectomy nephrectomy circumcision hypospadias pyeloplasty orchidopexy pediatric موافقة ختان') },
];
