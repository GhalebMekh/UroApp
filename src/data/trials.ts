/**
 * Landmark trials digest (Academic → Landmark trials, Pro).
 *
 * Owner's brief (2026-11-26): about 20 trials across prostate, bladder/upper
 * tract, kidney, and BPH/stones/functional; each card gives the question,
 * design, size and main result, one line on what it changed, and a flag when
 * later follow-up moved the conclusion.
 *
 * Every figure below was read from the trial's PubMed abstract on 2026-11-26
 * (PMID on each entry). Wording is ours, never the abstract's. The practice
 * line restates the authors' own conclusion; it is not a recommendation.
 * Add a trial only after checking its numbers against the abstract.
 */

export type TrialArea = 'prostate' | 'bladder' | 'kidney' | 'benign';

export const TRIAL_AREAS: { id: TrialArea; label: string }[] = [
  { id: 'prostate', label: 'Prostate' },
  { id: 'bladder', label: 'Bladder & UTUC' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'benign', label: 'BPH, stones, SUI' },
];

export interface TrialSource {
  journal: string;
  year: number;
  pmid: string;
}

export interface Trial {
  id: string;
  name: string;
  area: TrialArea;
  question: string;
  design: string;
  /** Number randomised, as reported. */
  size: string;
  result: string;
  practice: string;
  source: TrialSource;
  later?: { text: string; source: TrialSource };
}

export const pubmedUrl = (pmid: string) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

export const TRIALS: Trial[] = [
  // ── Prostate ─────────────────────────────────────────────────────────────
  {
    id: 'pivot',
    name: 'PIVOT',
    area: 'prostate',
    question: 'Does radical prostatectomy reduce death compared with observation in localized prostate cancer?',
    design: 'RCT, US Veterans Affairs, 1994–2002',
    size: '731 men',
    result:
      'At a median 10 years, all-cause death was 47.0% after surgery vs 49.9% with observation (HR 0.88, 95% CI 0.71–1.08). Prostate cancer or treatment deaths: 5.8% vs 8.4% (HR 0.63, 95% CI 0.36–1.09). Neither difference was significant.',
    practice:
      'For early PSA-era localized disease, surgery did not significantly lower mortality; absolute differences were under 3 percentage points.',
    source: { journal: 'N Engl J Med', year: 2012, pmid: '22808955' },
    later: {
      text: 'At nearly 20 years (median 12.7), mortality was still not significantly lower with surgery (HR 0.84, 95% CI 0.70–1.01). A possible benefit appeared in intermediate-risk disease only, and surgery meant less treatment for progression but more incontinence and sexual dysfunction.',
      source: { journal: 'N Engl J Med', year: 2017, pmid: '28700844' },
    },
  },
  {
    id: 'protect',
    name: 'ProtecT',
    area: 'prostate',
    question: 'How do active monitoring, radical prostatectomy and radiotherapy compare for PSA-detected localized prostate cancer?',
    design: 'Three-arm RCT, UK, men aged 50–69 from PSA testing',
    size: '1,643 men',
    result:
      'At a median 10 years, prostate cancer deaths were few and similar: 8 with monitoring, 5 with surgery, 4 with radiotherapy (P=0.48). Metastases and progression were more frequent with active monitoring.',
    practice:
      'Cancer-specific mortality was low whichever treatment was assigned; radical treatment reduced progression and metastases at the cost of side effects.',
    source: { journal: 'N Engl J Med', year: 2016, pmid: '27626136' },
    later: {
      text: 'At a median 15 years, prostate cancer death was 3.1% monitoring, 2.2% prostatectomy, 2.9% radiotherapy (P=0.53). Metastases were about twice as common with monitoring (9.4% vs 4.7% and 5.0%); 24.4% of the monitoring group were alive without any treatment.',
      source: { journal: 'N Engl J Med', year: 2023, pmid: '36912538' },
    },
  },
  {
    id: 'stampede-docetaxel',
    name: 'STAMPEDE (docetaxel, zoledronic acid)',
    area: 'prostate',
    question: 'Does adding docetaxel, zoledronic acid or both to long-term hormone therapy improve survival?',
    design: 'Multiarm multistage platform RCT, open label; 61% metastatic',
    size: '2,962 men',
    result:
      'Median overall survival 71 months with hormone therapy alone vs 81 months with added docetaxel (HR 0.78, 95% CI 0.66–0.93). Zoledronic acid gave no survival benefit (HR 0.94). Grade 3–5 adverse events rose from 32% to 52% with docetaxel.',
    practice:
      'The authors concluded docetaxel should join standard of care for fit men starting long-term hormone therapy, and zoledronic acid should not.',
    source: { journal: 'Lancet', year: 2016, pmid: '26719232' },
  },
  {
    id: 'precision',
    name: 'PRECISION',
    area: 'prostate',
    question: 'Is MRI first, with targeted biopsy only if suspicious, at least as good as standard TRUS biopsy in biopsy-naive men?',
    design: 'Multicentre non-inferiority RCT',
    size: '500 men',
    result:
      'Clinically significant cancer found in 38% with the MRI pathway vs 26% with 10–12-core TRUS biopsy (difference 12 points, 95% CI 4–20). 28% of the MRI arm avoided biopsy. Insignificant cancer was diagnosed 13 points less often.',
    practice: 'Pre-biopsy MRI with targeted biopsy was superior to standard TRUS biopsy for biopsy-naive men.',
    source: { journal: 'N Engl J Med', year: 2018, pmid: '29552975' },
  },
  {
    id: 'chhip',
    name: 'CHHiP',
    area: 'prostate',
    question: 'Is moderately hypofractionated IMRT non-inferior to conventional 74 Gy in 37 fractions?',
    design: 'Non-inferiority RCT, 3 arms: 74 Gy/37, 60 Gy/20, 57 Gy/19',
    size: '3,216 men',
    result:
      '5-year freedom from biochemical or clinical failure: 88.3% (74 Gy), 90.6% (60 Gy), 85.9% (57 Gy). 60 Gy was non-inferior (HR 0.84); 57 Gy was not shown to be. Late side effects were similar.',
    practice: '60 Gy in 20 fractions was recommended by the authors as a new standard for external-beam radiotherapy.',
    source: { journal: 'Lancet Oncol', year: 2016, pmid: '27339115' },
  },
  {
    id: 'radicals-rt',
    name: 'RADICALS-RT',
    area: 'prostate',
    question: 'After radical prostatectomy with risk factors, is adjuvant radiotherapy better than observation with early salvage?',
    design: 'Phase 3 RCT; salvage triggered at PSA ≥0.1 ng/mL or three rises',
    size: '1,396 men',
    result:
      '5-year biochemical progression-free survival 85% adjuvant vs 88% salvage (HR 1.10, 95% CI 0.81–1.49). Only 33% of the salvage arm had radiotherapy within 8 years. Incontinence at 1 year and grade 3–4 urethral stricture (6% vs 4%) were worse with adjuvant.',
    practice: 'The authors concluded observation with salvage radiotherapy for PSA progression should be the standard.',
    source: { journal: 'Lancet', year: 2020, pmid: '33002429' },
  },

  // ── Bladder & upper tract ────────────────────────────────────────────────
  {
    id: 'swog-8710',
    name: 'SWOG 8710',
    area: 'bladder',
    question: 'Does neoadjuvant MVAC before radical cystectomy improve survival in muscle-invasive bladder cancer?',
    design: 'RCT, T2–T4a, 3 cycles MVAC then cystectomy vs cystectomy alone',
    size: '307 eligible patients',
    result:
      'Median survival 77 months with MVAC vs 46 months with cystectomy alone (P=0.06). No residual cancer at cystectomy in 38% vs 15% (P<0.001).',
    practice: 'Neoadjuvant cisplatin-based chemotherapy raised pathological complete response and was associated with longer survival.',
    source: { journal: 'N Engl J Med', year: 2003, pmid: '12944571' },
  },
  {
    id: 'swog-8507',
    name: 'SWOG 8507 (maintenance BCG)',
    area: 'bladder',
    question: 'Does 3-week maintenance BCG after induction improve outcomes in CIS and high-recurrence-risk Ta/T1 disease?',
    design: 'RCT after 6-week induction; maintenance at 3, 6, 12, 18, 24, 30, 36 months',
    size: '550 randomised (384 disease-free in primary analysis)',
    result:
      'Median recurrence-free survival 76.8 months with maintenance vs 35.7 months without (P<0.0001). Worsening-free survival was also longer (P=0.04). 5-year survival 83% vs 78%.',
    practice: 'Adding 3-week maintenance courses to induction BCG roughly doubled median recurrence-free survival in CIS and selected Ta/T1 disease.',
    source: { journal: 'J Urol', year: 2000, pmid: '10737480' },
  },
  {
    id: 'pout',
    name: 'POUT',
    area: 'bladder',
    question: 'Does adjuvant platinum-gemcitabine after nephroureterectomy improve disease-free survival in locally advanced UTUC?',
    design: 'Phase 3 open-label RCT, UK; pT2–T4 or N+; chemo within 90 days',
    size: '261 patients',
    result:
      'Disease-free survival HR 0.45 (95% CI 0.30–0.68). 3-year event-free: 71% chemotherapy vs 46% surveillance. Grade 3 or worse toxicity in 44% of those starting chemotherapy.',
    practice: 'Adjuvant platinum-based chemotherapy should be considered standard after nephroureterectomy for locally advanced UTUC.',
    source: { journal: 'Lancet', year: 2020, pmid: '32145825' },
  },
  {
    id: 'javelin-bladder-100',
    name: 'JAVELIN Bladder 100',
    area: 'bladder',
    question: 'Does maintenance avelumab improve survival after first-line platinum chemotherapy in advanced urothelial cancer?',
    design: 'Phase 3 RCT, no progression after 4–6 cycles of gemcitabine-platinum',
    size: '700 patients',
    result:
      'Median overall survival 21.4 vs 14.3 months (HR 0.69, 95% CI 0.56–0.86); 1-year survival 71.3% vs 58.4%. Grade 3 or worse adverse events 47.4% vs 25.2%.',
    practice: 'Maintenance avelumab after non-progression on first-line chemotherapy prolonged survival.',
    source: { journal: 'N Engl J Med', year: 2020, pmid: '32945632' },
  },
  {
    id: 'checkmate-274',
    name: 'CheckMate 274',
    area: 'bladder',
    question: 'Does adjuvant nivolumab after radical surgery for high-risk muscle-invasive urothelial carcinoma improve disease-free survival?',
    design: 'Phase 3 double-blind RCT, nivolumab vs placebo up to 1 year',
    size: '709 patients',
    result:
      'Median disease-free survival 20.8 vs 10.8 months (HR 0.70). In PD-L1 ≥1%, HR 0.55. Grade 3 or worse treatment-related events 17.9% vs 7.2%.',
    practice: 'Adjuvant nivolumab lengthened disease-free survival after radical surgery, overall and in PD-L1 ≥1%.',
    source: { journal: 'N Engl J Med', year: 2021, pmid: '34077643' },
    later: {
      text: 'At 5 years, the disease-free survival benefit held (HR 0.74). Median overall survival was 75.0 vs 50.1 months, but the overall survival difference was not significant (HR 0.83, 95% CI 0.67–1.02).',
      source: { journal: 'Ann Oncol', year: 2026, pmid: '41110694' },
    },
  },

  // ── Kidney ───────────────────────────────────────────────────────────────
  {
    id: 'carmena',
    name: 'CARMENA',
    area: 'kidney',
    question: 'Is sunitinib alone non-inferior to cytoreductive nephrectomy then sunitinib in metastatic clear-cell RCC?',
    design: 'Phase 3 non-inferiority RCT, MSKCC intermediate or poor risk',
    size: '450 patients',
    result:
      'Sunitinib alone was non-inferior for overall survival (HR 0.89, 95% CI 0.71–1.10). Median survival 18.4 months sunitinib alone vs 13.9 months with nephrectomy first.',
    practice: 'Upfront cytoreductive nephrectomy was not needed before sunitinib in intermediate- and poor-risk metastatic RCC.',
    source: { journal: 'N Engl J Med', year: 2018, pmid: '29860937' },
  },
  {
    id: 'keynote-564',
    name: 'KEYNOTE-564',
    area: 'kidney',
    question: 'Does adjuvant pembrolizumab after nephrectomy improve disease-free survival in high-risk clear-cell RCC?',
    design: 'Phase 3 double-blind RCT, pembrolizumab vs placebo for about 1 year',
    size: '994 patients',
    result:
      '24-month disease-free survival 77.3% vs 68.1% (HR 0.68, 95% CI 0.53–0.87). Grade 3 or worse adverse events 32.4% vs 17.7%.',
    practice: 'Adjuvant pembrolizumab improved disease-free survival after nephrectomy in high-risk clear-cell RCC.',
    source: { journal: 'N Engl J Med', year: 2021, pmid: '34407342' },
    later: {
      text: 'At a median 57.2 months, overall survival was significantly better (HR 0.62, 95% CI 0.44–0.87); 48-month survival 91.2% vs 86.0%.',
      source: { journal: 'N Engl J Med', year: 2024, pmid: '38631003' },
    },
  },
  {
    id: 'checkmate-214',
    name: 'CheckMate 214',
    area: 'kidney',
    question: 'Is first-line nivolumab plus ipilimumab better than sunitinib in advanced RCC?',
    design: 'Phase 3 open-label RCT; primary analysis in intermediate and poor risk',
    size: '1,096 patients (847 intermediate or poor risk)',
    result:
      'In intermediate and poor risk, 18-month overall survival 75% vs 60% (HR 0.63); objective response 42% vs 27%, complete response 9% vs 1%. Progression-free survival did not meet its threshold.',
    practice: 'Nivolumab plus ipilimumab improved survival and response over sunitinib for untreated intermediate- and poor-risk RCC.',
    source: { journal: 'N Engl J Med', year: 2018, pmid: '29562145' },
  },
  {
    id: 'eortc-30904',
    name: 'EORTC 30904',
    area: 'kidney',
    question: 'Is nephron-sparing surgery oncologically equivalent to radical nephrectomy for small renal tumours?',
    design: 'Non-inferiority RCT, solitary tumour ≤5 cm, normal contralateral kidney; closed early for poor accrual',
    size: '541 patients',
    result:
      '10-year overall survival 81.1% radical vs 75.7% nephron-sparing (HR 1.50) in the whole group; in confirmed RCC the difference was not significant (HR 1.43, P=0.07). Only 12 of 117 deaths were from kidney cancer.',
    practice: 'Both operations gave excellent cancer control; the survival gap could not be explained by kidney cancer deaths.',
    source: { journal: 'Eur Urol', year: 2011, pmid: '21186077' },
  },

  // ── BPH, stones, SUI ─────────────────────────────────────────────────────
  {
    id: 'mtops',
    name: 'MTOPS',
    area: 'benign',
    question: 'Do doxazosin, finasteride or both reduce clinical progression of BPH?',
    design: 'Double-blind RCT, placebo-controlled, mean 4.5 years',
    size: '3,047 men',
    result:
      'Risk of clinical progression fell 39% with doxazosin, 34% with finasteride and 66% with the combination vs placebo. Only finasteride and the combination reduced urinary retention and need for surgery.',
    practice: 'Combination therapy reduced BPH progression more than either drug alone; only the 5-ARI-containing arms cut retention and surgery.',
    source: { journal: 'N Engl J Med', year: 2003, pmid: '14681504' },
  },
  {
    id: 'combat',
    name: 'CombAT',
    area: 'benign',
    question: 'Does dutasteride plus tamsulosin outperform either drug alone over 4 years in men with enlarged prostates?',
    design: 'Double-blind RCT, IPSS ≥12, prostate ≥30 mL, PSA 1.5–10; no placebo arm',
    size: '4,844 men',
    result:
      'The combination cut urinary retention or BPH surgery more than tamsulosin, but not more than dutasteride. It was better than both for clinical progression and symptoms at 4 years.',
    practice: 'Supports long-term combination therapy for moderate-to-severe LUTS with prostatic enlargement.',
    source: { journal: 'Eur Urol', year: 2010, pmid: '19825505' },
  },
  {
    id: 'suspend',
    name: 'SUSPEND',
    area: 'benign',
    question: 'Do tamsulosin or nifedipine reduce the need for intervention in ureteric colic managed expectantly?',
    design: 'Placebo-controlled RCT, 24 UK hospitals, single CT-confirmed stone',
    size: '1,167 adults',
    result:
      'No further intervention needed at 4 weeks: 80% placebo, 81% tamsulosin, 80% nifedipine. No difference between any groups.',
    practice: 'Neither drug reduced the need for stone-clearance intervention within 4 weeks.',
    source: { journal: 'Lancet', year: 2015, pmid: '25998582' },
  },
  {
    id: 'stone',
    name: 'STONE (tamsulosin in the ED)',
    area: 'benign',
    question: 'Does tamsulosin increase passage of symptomatic ureteral stones under 9 mm?',
    design: 'Double-blind placebo-controlled RCT, 6 US emergency departments',
    size: '512 adults',
    result:
      'Stone passage by day 28: 50% tamsulosin vs 47% placebo (RR 1.05, 95% CI 0.87–1.27). No secondary outcome differed. Mean stone size 3.8 mm.',
    practice: 'Did not support tamsulosin for symptomatic stones under 9 mm; the authors suggested guidelines may need revising.',
    source: { journal: 'JAMA Intern Med', year: 2018, pmid: '29913020' },
  },
  {
    id: 'tomus',
    name: 'TOMUS',
    area: 'benign',
    question: 'Are retropubic and transobturator midurethral slings equivalent for stress urinary incontinence?',
    design: 'Multicentre equivalence RCT, women, margin ±12 points',
    size: '597 women',
    result:
      '12-month objective success 80.8% retropubic vs 77.7% transobturator (equivalent). Voiding dysfunction needing surgery 2.7% vs 0%; neurological symptoms 4.0% vs 9.4%.',
    practice: 'Objective success was equivalent; the different complication profiles should guide counselling.',
    source: { journal: 'N Engl J Med', year: 2010, pmid: '20479459' },
  },
];
