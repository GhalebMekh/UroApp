/**
 * MDT / tumour-board case sheets — de-identified, stored on the device.
 * Initials and age only: no names, no medical-record numbers (CLAUDE.md).
 */

export type TumourSite =
  | 'prostate'
  | 'bladder'
  | 'upper-tract'
  | 'kidney'
  | 'testis'
  | 'penis'
  | 'adrenal'
  | 'other';

export const SITE_LABEL: Record<TumourSite, string> = {
  prostate: 'Prostate',
  bladder: 'Bladder',
  'upper-tract': 'Upper tract',
  kidney: 'Kidney',
  testis: 'Testis',
  penis: 'Penis',
  adrenal: 'Adrenal',
  other: 'Other',
};

/**
 * Calculators worth having open when presenting each site. Ids must exist in
 * the calculator registry — a test enforces this.
 */
export const SITE_TOOLS: Record<TumourSite, string[]> = {
  prostate: ['psa', 'capra', 'capra-s', 'isup-grade-group'],
  bladder: ['eortc'],
  'upper-tract': [],
  kidney: ['renal', 'padua', 'imdc-heng'],
  testis: ['igcccg'],
  penis: [],
  adrenal: ['adrenal-incidentaloma'],
  other: [],
};

/** Offered for every site. */
export const COMMON_TOOLS = ['tnm', 'charlson'];

export interface MdtCase {
  id: string;
  /** ISO yyyy-mm-dd of the meeting. */
  mdtDate: string;
  initials: string;
  age: string;
  sex: 'male' | 'female' | '';
  site: TumourSite;
  /** What the MDT is being asked — the one field a case can't be presented without. */
  question: string;
  presentation: string;
  comorbidity: string;
  imaging: string;
  pathology: string;
  stage: string;
  scores: string;
  recommendation: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const SITES = Object.keys(SITE_LABEL) as TumourSite[];

export function emptyCase(mdtDate: string): MdtCase {
  return {
    id: crypto.randomUUID(),
    mdtDate,
    initials: '',
    age: '',
    sex: '',
    site: 'prostate',
    question: '',
    presentation: '',
    comorbidity: '',
    imaging: '',
    pathology: '',
    stage: '',
    scores: '',
    recommendation: '',
  };
}

export function normalizeCase(raw: unknown): MdtCase | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!str(r.id)) return null;
  return {
    id: str(r.id),
    mdtDate: str(r.mdtDate),
    initials: str(r.initials),
    age: str(r.age),
    sex: r.sex === 'male' || r.sex === 'female' ? r.sex : '',
    site: SITES.includes(r.site as TumourSite) ? (r.site as TumourSite) : 'other',
    question: str(r.question),
    presentation: str(r.presentation),
    comorbidity: str(r.comorbidity),
    imaging: str(r.imaging),
    pathology: str(r.pathology),
    stage: str(r.stage),
    scores: str(r.scores),
    recommendation: str(r.recommendation),
  };
}

/** Meeting order: by date, then grouped by site the way an MDT list usually runs. */
export function sortCases(cases: MdtCase[]): MdtCase[] {
  return [...cases].sort(
    (a, b) =>
      a.mdtDate.localeCompare(b.mdtDate) ||
      SITES.indexOf(a.site) - SITES.indexOf(b.site) ||
      a.initials.localeCompare(b.initials),
  );
}
