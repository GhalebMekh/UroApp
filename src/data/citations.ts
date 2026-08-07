/**
 * Primary-source citations for every clinical score in the app.
 * CLAUDE.md (NON-NEGOTIABLE): every score/threshold cites its primary source
 * with a working link. Add the citation here before shipping the calculator.
 */
export interface Citation {
  /** e.g. "Barry et al." */
  authors: string;
  /** Journal abbreviation, e.g. "J Urol". */
  journal: string;
  year: number;
  /** PubMed ID — preferred, gives a stable working link. */
  pmid?: string;
  doi?: string;
  /** Resolved link (PubMed/DOI/guideline). Always present. */
  url: string;
  /** Optional link text for sources without a PMID/DOI (e.g. a book/manual). */
  label?: string;
}

export const CITATIONS = {
  ipss: {
    authors: 'Barry et al.',
    journal: 'J Urol',
    year: 1992,
    pmid: '1279218',
    url: 'https://pubmed.ncbi.nlm.nih.gov/1279218/',
  },
  renal: {
    authors: 'Kutikov & Uzzo',
    journal: 'J Urol',
    year: 2009,
    pmid: '19616235',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19616235/',
  },
  shim: {
    authors: 'Rosen et al.',
    journal: 'Int J Impot Res',
    year: 1999,
    pmid: '10637462',
    url: 'https://pubmed.ncbi.nlm.nih.gov/10637462/',
  },
  // PSA toolkit — original derivation papers (CLAUDE.md: cite the primary source).
  psaDensity: {
    authors: 'Benson et al.',
    journal: 'J Urol',
    year: 1992,
    pmid: '1371554',
    url: 'https://pubmed.ncbi.nlm.nih.gov/1371554/',
  },
  psaVelocity: {
    authors: 'Carter et al.',
    journal: 'JAMA',
    year: 1992,
    pmid: '1372942',
    url: 'https://pubmed.ncbi.nlm.nih.gov/1372942/',
  },
  psaDoublingTime: {
    authors: 'Freedland et al.',
    journal: 'JAMA',
    year: 2005,
    pmid: '16046649',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16046649/',
  },
  psaFreeRatio: {
    authors: 'Catalona et al.',
    journal: 'JAMA',
    year: 1998,
    pmid: '9605898',
    url: 'https://pubmed.ncbi.nlm.nih.gov/9605898/',
  },
  // Radiology reporting systems — summarise criteria, never reproduce verbatim.
  pirads: {
    authors: 'Turkbey et al.',
    journal: 'Eur Urol',
    year: 2019,
    pmid: '30898406',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30898406/',
  },
  bosniak: {
    authors: 'Silverman et al.',
    journal: 'Radiology',
    year: 2019,
    pmid: '31210616',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31210616/',
  },
  virads: {
    authors: 'Panebianco et al.',
    journal: 'Eur Urol',
    year: 2018,
    doi: '10.1016/j.eururo.2018.04.029',
    url: 'https://doi.org/10.1016/j.eururo.2018.04.029',
  },
  // TNM staging — AJCC Cancer Staging Manual, 8th ed. (Amin MB et al., Springer 2017).
  // Stage-group logic verified against the American Cancer Society's AJCC 8th summaries.
  tnmProstate: {
    authors: 'AJCC 8th ed. (Amin et al.)',
    journal: 'AJCC Cancer Staging Manual',
    year: 2017,
    url: 'https://www.cancer.org/cancer/types/prostate-cancer/detection-diagnosis-staging/staging.html',
    label: 'AJCC 8th · ACS summary',
  },
  tnmKidney: {
    authors: 'AJCC 8th ed. (Amin et al.)',
    journal: 'AJCC Cancer Staging Manual',
    year: 2017,
    url: 'https://www.cancer.org/cancer/types/kidney-cancer/detection-diagnosis-staging/staging.html',
    label: 'AJCC 8th · ACS summary',
  },
  tnmBladder: {
    authors: 'AJCC 8th ed. (Amin et al.)',
    journal: 'AJCC Cancer Staging Manual',
    year: 2017,
    url: 'https://www.cancer.org/cancer/types/bladder-cancer/detection-diagnosis-staging/staging.html',
    label: 'AJCC 8th · ACS summary',
  },
  tnmTestis: {
    authors: 'AJCC 8th ed. (Amin et al.)',
    journal: 'AJCC Cancer Staging Manual',
    year: 2017,
    url: 'https://www.cancer.org/cancer/types/testicular-cancer/detection-diagnosis-staging/staging.html',
    label: 'AJCC 8th · ACS summary',
  },
  // Renal function — foundational for drug dosing and contrast decisions.
  ckdEpi: {
    authors: 'Inker et al.',
    journal: 'N Engl J Med',
    year: 2021,
    doi: '10.1056/NEJMoa2102953',
    url: 'https://doi.org/10.1056/NEJMoa2102953',
  },
  cockcroftGault: {
    authors: 'Cockcroft & Gault',
    journal: 'Nephron',
    year: 1976,
    pmid: '1244564',
    url: 'https://pubmed.ncbi.nlm.nih.gov/1244564/',
  },
  kdigoCkd: {
    authors: 'KDIGO',
    journal: 'Kidney Int Suppl',
    year: 2013,
    url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/',
    label: 'KDIGO CKD guideline',
  },
  capra: {
    authors: 'Cooperberg et al.',
    journal: 'J Urol',
    year: 2005,
    pmid: '15879786',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15879786/',
  },
  igcccg: {
    authors: 'IGCCCG',
    journal: 'J Clin Oncol',
    year: 1997,
    url: 'https://uroweb.org/guidelines/testicular-cancer/chapter/staging-amp-classification-systems',
    label: 'IGCCCG 1997 · EAU summary',
  },
  guysStone: {
    authors: 'Thomas et al.',
    journal: 'Urology',
    year: 2011,
    pmid: '21333334',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21333334/',
  },
  eortcNmibc: {
    authors: 'Sylvester et al.',
    journal: 'Eur Urol',
    year: 2006,
    url: 'https://www.eortc.be/tools/bladdercalculator/',
    label: 'EORTC risk tables',
  },
  stonePassage: {
    authors: 'Coll et al.',
    journal: 'AJR Am J Roentgenol',
    year: 2002,
    pmid: '11756098',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11756098/',
  },
  hollidaySegar: {
    authors: 'Holliday & Segar',
    journal: 'Pediatrics',
    year: 1957,
    pmid: '13432715',
    url: 'https://pubmed.ncbi.nlm.nih.gov/13432715/',
  },
  spidsUti: {
    authors: 'Albarrak et al. (SPIDS)',
    journal: 'Int J Pediatr Adolesc Med',
    year: 2021,
    doi: '10.1016/j.ijpam.2021.03.001',
    url: 'https://doi.org/10.1016/j.ijpam.2021.03.001',
  },
  sfuHydro: {
    authors: 'Fernbach et al.',
    journal: 'Pediatr Radiol',
    year: 1993,
    pmid: '8255658',
    url: 'https://pubmed.ncbi.nlm.nih.gov/8255658/',
  },
  twist: {
    authors: 'Barbosa et al.',
    journal: 'J Urol',
    year: 2013,
    doi: '10.1016/j.juro.2012.11.056',
    url: 'https://doi.org/10.1016/j.juro.2012.11.056',
  },
  padua: {
    authors: 'Ficarra et al.',
    journal: 'Eur Urol',
    year: 2009,
    pmid: '19665284',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19665284/',
  },
  isupGradeGroup: {
    authors: 'Epstein et al.',
    journal: 'Am J Surg Pathol',
    year: 2016,
    pmid: '26492179',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26492179/',
  },
  imdcHeng: {
    authors: 'Heng et al.',
    journal: 'J Clin Oncol',
    year: 2009,
    pmid: '19826129',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19826129/',
  },
  stoneScore: {
    authors: 'Moore et al.',
    journal: 'BMJ',
    year: 2014,
    pmid: '24671981',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24671981/',
  },
  oabss: {
    authors: 'Homma et al.',
    journal: 'Urology',
    year: 2006,
    pmid: '16904444',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16904444/',
  },
  prostateTreatment: {
    authors: 'EAU / Vela Navarrete et al.',
    journal: 'Eur Urol / J Urol',
    year: 2023,
    pmid: '37202311',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37202311/',
    label: 'EAU 2023 Male LUTS guidelines; Rezum 5-year outcomes PMID 33872051',
  },
  semenAnalysis: {
    authors: 'WHO',
    journal: 'WHO Manual',
    year: 2021,
    url: 'https://www.who.int/publications/i/item/9789240030787',
    label: 'WHO 6th Edition Laboratory Manual for Human Semen Analysis (July 2021)',
  },
  pvrInterpretation: {
    authors: 'EAU',
    journal: 'EAU Guidelines',
    year: 2023,
    pmid: '37202311',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37202311/',
    label: 'EAU 2023 Non-neurogenic Male LUTS guidelines',
  },
} satisfies Record<string, Citation>;
