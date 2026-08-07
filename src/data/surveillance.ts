/**
 * Surveillance schedule protocols — risk-stratified follow-up calendars.
 *
 * Intervals are summarised in our own words from the cited AUA guideline (never
 * reproduced verbatim) and each protocol carries its source. Where a guideline
 * gives a range (e.g. "every 3–6 months"), the schedule is generated at the
 * SHORTER interval and the range is stated in the notes, so the calendar is
 * never laxer than the guideline.
 *
 * DECISION SUPPORT ONLY — the treating clinician sets the actual follow-up.
 */

export interface SurveillanceVisit {
  /** Months after the index date (surgery / treatment start). */
  month: number;
  /** What is done at this visit. */
  tests: string[];
}

export interface SurveillanceProtocol {
  id: string;
  /** Risk group or variant name. */
  label: string;
  description: string;
  visits: SurveillanceVisit[];
  /** What happens once the tabulated schedule ends. */
  thereafter: string;
  notes: string[];
  source: { label: string; url: string };
}

export interface SurveillanceDiagnosis {
  id: string;
  name: string;
  blurb: string;
  /** Label for the index date, e.g. "Date of TURBT". */
  indexLabel: string;
  protocols: SurveillanceProtocol[];
}

const AUA_NMIBC = {
  label: 'AUA NMIBC Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
};
const AUA_RENAL = {
  label: 'AUA Renal Mass & Localized Renal Cancer Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
};
const AUA_STONES = {
  label: 'AUA Medical Management of Kidney Stones Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
};
const EAU_PROSTATE = {
  label: 'EAU Prostate Cancer Guideline',
  url: 'https://uroweb.org/guidelines/prostate-cancer',
};

const AUA_TESTIS = {
  label: 'AUA Testicular Cancer Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testicular-cancer-guideline',
};
const AUA_UTUC = {
  label: 'AUA Upper Tract Urothelial Carcinoma Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/non-metastatic-upper-tract-urothelial-carcinoma',
};

const AUA_MIBC = {
  label: 'AUA Non-Metastatic Muscle-Invasive Bladder Cancer Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-metastatic-muscle-invasive-guideline',
};
const AUA_TESTOSTERONE = {
  label: 'AUA Testosterone Deficiency Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
};

const PSA = 'PSA';
const DRE = 'Digital rectal examination';
const LABS = 'Laboratory assessment (renal function + metabolic panel)';
const TESTO = 'Total testosterone';
const HB_HCT = 'Haemoglobin + haematocrit';
const MARKERS = 'Serum tumour markers (AFP, hCG ± LDH)';
const HP = 'History and physical examination';
const CT_AP = 'Cross-sectional imaging, abdomen ± pelvis (CT or MRI)';
const CXR = 'Chest X-ray';
const CTU = 'CT urography (multiphasic, contrast-enhanced)';
const UT_ENDO = 'Upper tract endoscopy + imaging';
const CHEST_IMG = 'Chest imaging';

const CYSTO = 'Cystoscopy';
const CYSTO_CYTOL = 'Cystoscopy + urine cytology';
const UPPER_TRACT = 'Upper urinary tract imaging';

/** Build visits at a fixed cadence over a month range (inclusive of `to`). */
function every(from: number, to: number, step: number, tests: string[]): SurveillanceVisit[] {
  const out: SurveillanceVisit[] = [];
  for (let m = from; m <= to; m += step) out.push({ month: m, tests: [...tests] });
  return out;
}

/** Merge visits that fall in the same month, combining their tests. */
function merge(...groups: SurveillanceVisit[][]): SurveillanceVisit[] {
  const byMonth = new Map<number, Set<string>>();
  for (const g of groups) {
    for (const v of g) {
      const set = byMonth.get(v.month) ?? new Set<string>();
      v.tests.forEach((t) => set.add(t));
      byMonth.set(v.month, set);
    }
  }
  return [...byMonth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([month, tests]) => ({ month, tests: [...tests] }));
}

export const SURVEILLANCE: SurveillanceDiagnosis[] = [
  {
    id: 'nmibc',
    name: 'NMIBC — non-muscle-invasive bladder cancer',
    blurb: 'Post-TURBT surveillance, stratified by AUA risk group.',
    indexLabel: 'Date of TURBT',
    protocols: [
      {
        id: 'nmibc-low',
        label: 'Low risk',
        description:
          'Solitary low-grade Ta ≤3 cm, no CIS. Least intensive schedule; routine cytology and upper-tract imaging are not recommended.',
        visits: merge(
          [{ month: 3, tests: [`${CYSTO} (first surveillance, at 3–4 months)`] }],
          [{ month: 9, tests: [`${CYSTO} (6–9 months after the first)`] }],
          every(21, 57, 12, [CYSTO]),
        ),
        thereafter:
          'Beyond 5 years without recurrence, continued surveillance is a shared decision with the patient.',
        notes: [
          'AUA advises against routine urinary biomarkers or cytology during surveillance when cystoscopy is normal in low-risk disease.',
          'Routine surveillance upper-tract imaging is not recommended in asymptomatic low-risk patients.',
        ],
        source: AUA_NMIBC,
      },
      {
        id: 'nmibc-intermediate',
        label: 'Intermediate risk',
        description:
          'E.g. recurrent or multifocal low-grade Ta, or solitary low-grade Ta >3 cm. Cystoscopy with cytology, plus periodic upper-tract imaging.',
        visits: merge(
          every(3, 24, 3, [CYSTO_CYTOL]),
          every(30, 48, 6, [CYSTO_CYTOL]),
          [{ month: 60, tests: [CYSTO_CYTOL] }],
          every(12, 60, 12, [UPPER_TRACT]),
        ),
        thereafter: 'Annual cystoscopy with cytology thereafter.',
        notes: [
          'AUA interval is every 3–6 months for the first 2 years, then 6–12 months in years 3–4, then annually — generated here at the shorter end.',
          'Consider upper-tract imaging at 1–2 year intervals; shown annually here.',
        ],
        source: AUA_NMIBC,
      },
      {
        id: 'nmibc-high',
        label: 'High risk',
        description:
          'E.g. any high-grade disease, T1, or CIS. Most intensive schedule, with cytology and periodic upper-tract imaging.',
        visits: merge(
          every(3, 24, 3, [CYSTO_CYTOL]),
          every(30, 48, 6, [CYSTO_CYTOL]),
          [{ month: 60, tests: [CYSTO_CYTOL] }],
          every(12, 60, 12, [UPPER_TRACT]),
        ),
        thereafter: 'Annual cystoscopy with cytology thereafter.',
        notes: [
          'AUA interval is every 3–4 months for the first 2 years, then every 6 months in years 3–4, then annually.',
          'Consider upper-tract imaging at 1–2 year intervals; shown annually here.',
          'A repeat TURBT within 6 weeks is separately indicated for T1 disease, high-grade Ta, or when the initial resection was incomplete or lacked detrusor muscle.',
        ],
        source: AUA_NMIBC,
      },
    ],
  },

  {
    id: 'prostate',
    name: 'Prostate cancer',
    blurb: 'Active surveillance of low-risk disease, and PSA follow-up after treatment with curative intent.',
    indexLabel: 'Index date',
    protocols: [
      {
        id: 'prostate-active-surveillance',
        label: 'Active surveillance (low risk)',
        description:
          'Low-risk localised disease: ISUP Grade Group 1, cT1c–cT2a, PSA <10 ng/mL and PSA density <0.15 ng/mL/cc. Patients with cribriform or intraductal histology on biopsy are excluded from active surveillance.',
        visits: merge(
          every(6, 84, 6, [PSA]),
          every(12, 84, 12, [DRE]),
          [12, 48, 84].map((month) => ({
            month,
            tests: ['MRI (repeat before biopsy)', 'Surveillance prostate biopsy'],
          })),
        ),
        thereafter:
          'Continue PSA at least 6-monthly and DRE at least yearly, with further biopsies individualised to MRI and PSA-density stability.',
        notes: [
          'EAU protocol: PSA at least every 6 months and DRE at least once yearly.',
          'Repeat biopsy at roughly 1, 4 and 7 years is a commonly applied schedule; shown here at 12, 48 and 84 months.',
          'Perform MRI before a confirmatory biopsy if MRI was not done before the initial biopsy. A confirmatory biopsy is not needed if the patient had upfront MRI with targeted and perilesional biopsies; otherwise perform it within 6–12 months.',
          'Take targeted and perilesional cores of any PI-RADS ≥3 lesion when a confirmatory or repeat biopsy is done.',
          'A patient with stable MRI (PRECISE 3) and stable PSA density <0.15 may be spared a repeat biopsy when MRI is repeated first.',
          'Trigger earlier MRI and repeat biopsy if PSA is rising with a doubling time under 3 years.',
        ],
        source: EAU_PROSTATE,
      },
      {
        id: 'prostate-post-rp',
        label: 'After radical prostatectomy',
        description:
          'PSA follow-up after radical prostatectomy. An undetectable PSA is expected within about 2 months of surgery.',
        visits: merge(
          [{ month: 3, tests: [`${PSA} — confirm the expected undetectable nadir`] }],
          every(6, 36, 6, [PSA]),
          every(48, 120, 12, [PSA]),
        ),
        thereafter:
          'Annual PSA is considered adequate after 3 years. Follow-up may be stopped once life expectancy falls below 10 years.',
        notes: [
          'EAU schedule: PSA every 6 months for 3 years, then yearly — the guideline notes the evidence for any specific interval is low.',
          'After radical prostatectomy, PSA alone may be the most efficient test; DRE adds little in the absence of a rising PSA.',
          'Imaging has no role in routine follow-up while PSA is not rising and the patient is asymptomatic — reserve it for biochemical recurrence or symptoms.',
          'Biochemical recurrence (AUA): a detectable or rising PSA ≥0.2 ng/mL with a confirmatory value >0.2 ng/mL. EAU notes the threshold best predicting later metastases is >0.4 ng/mL.',
          'Most treatment failures occur within 7 years of local therapy, though recurrence can appear much later in higher-risk disease.',
        ],
        source: EAU_PROSTATE,
      },
      {
        id: 'prostate-post-rt',
        label: 'After radiotherapy',
        description:
          'PSA follow-up after radiotherapy with curative intent. PSA falls more slowly than after surgery and the nadir may take 3 years or more.',
        visits: merge(
          every(6, 36, 6, [PSA]),
          every(48, 120, 12, [PSA]),
          every(12, 120, 12, [DRE]),
        ),
        thereafter:
          'Annual PSA thereafter. Follow-up may be stopped once life expectancy falls below 10 years.',
        notes: [
          'EAU schedule: PSA every 6 months for 3 years, then yearly.',
          'PSA and DRE together are the most useful first-line combination in follow-up after radiotherapy.',
          'Imaging is not part of routine follow-up — reserve it for biochemical recurrence or symptoms.',
          'Biochemical recurrence after radiotherapy (Phoenix definition): a rise of ≥2 ng/mL above the post-treatment PSA nadir, with no metastatic disease on conventional imaging.',
        ],
        source: EAU_PROSTATE,
      },
    ],
  },

  {
    id: 'rcc-postop',
    name: 'Renal cancer — after surgery',
    blurb: 'Follow-up after partial or radical nephrectomy, stratified by pathological risk.',
    indexLabel: 'Date of surgery',
    protocols: [
      {
        id: 'rcc-low-intermediate',
        label: 'Low / intermediate risk',
        description:
          'Low risk = pT1 grade 1–2; intermediate = pT1 grade 3–4 or pT2 any grade. Abdominal imaging plus chest X-ray.',
        visits: merge(
          [3, 6, 9, 12, 18, 24].map((month) => ({
            month,
            tests: ['Abdominal imaging (CT or MRI with and without contrast preferred)', 'Chest X-ray'],
          })),
          [3, 6, 9, 12, 18, 24].map((month) => ({
            month,
            tests: ['Serum creatinine + eGFR', 'Urinalysis'],
          })),
        ),
        thereafter:
          'After 2 years, abdominal ultrasound alternating with cross-sectional imaging may be used at the clinician’s discretion; beyond 5 years, further imaging is a shared decision.',
        notes: [
          'Each follow-up visit should include history, examination, laboratory testing, and abdominal and chest imaging.',
          'Refer to nephrology for progressive renal insufficiency or proteinuria.',
          'About 30% of renal-cancer recurrences are diagnosed beyond 60 months, so do not assume 5 years is a discharge point.',
        ],
        source: AUA_RENAL,
      },
      {
        id: 'rcc-high',
        label: 'High risk (pT3)',
        description: 'pT3, any grade. Extended schedule with chest CT preferred over plain film.',
        visits: merge(
          [3, 6, 9, 12, 18, 24, 30, 36, 48, 60].map((month) => ({
            month,
            tests: ['Abdominal imaging (CT or MRI with and without contrast preferred)', 'Chest CT'],
          })),
          [3, 6, 9, 12, 18, 24, 30, 36, 48, 60].map((month) => ({
            month,
            tests: ['Serum creatinine + eGFR', 'Urinalysis'],
          })),
        ),
        thereafter:
          'Beyond 5 years, further abdominal imaging is a shared decision, and chest X-ray may replace chest CT.',
        notes: [
          'Refer to nephrology for progressive renal insufficiency or proteinuria.',
          'About 30% of recurrences are diagnosed beyond 60 months.',
        ],
        source: AUA_RENAL,
      },
      {
        id: 'rcc-very-high',
        label: 'Very high risk',
        description:
          'pT4, pN1, sarcomatoid/rhabdoid dedifferentiation, or a macroscopic positive margin. Longest schedule, extending to 10 years.',
        visits: merge(
          [3, 6, 9, 12, 18, 24, 30, 36, 48, 60, 84, 120].map((month) => ({
            month,
            tests: ['Abdominal imaging (CT or MRI with and without contrast preferred)', 'Chest CT'],
          })),
          [3, 6, 9, 12, 18, 24, 30, 36, 48, 60].map((month) => ({
            month,
            tests: ['Serum creatinine + eGFR', 'Urinalysis'],
          })),
        ),
        thereafter:
          'Imaging continues to roughly 10 years (the 72–84 and 96–120 month windows are shown here at 84 and 120 months).',
        notes: [
          'The guideline expresses the last two intervals as ranges (72–84 and 96–120 months); fixed points are shown so the calendar produces dates.',
          'Beyond 5 years, chest X-ray may replace chest CT.',
        ],
        source: AUA_RENAL,
      },
      {
        id: 'rcc-active-surveillance',
        label: 'Active surveillance (untreated mass)',
        description:
          'A renal mass managed conservatively. The schedule is driven by growth rate rather than a fixed table.',
        visits: [
          { month: 3, tests: ['Repeat cross-sectional imaging to assess interval growth'] },
          { month: 9, tests: ['Cross-sectional imaging', 'Serum creatinine + eGFR'] },
          { month: 15, tests: ['Cross-sectional imaging', 'Serum creatinine + eGFR'] },
          { month: 24, tests: ['Cross-sectional imaging', 'Serum creatinine + eGFR'] },
        ],
        thereafter:
          'Continue periodic clinical and imaging surveillance, with the interval set by the observed growth rate and shared decision-making.',
        notes: [
          'AUA specifies repeat cross-sectional imaging approximately 3–6 months after the decision to survey; subsequent visits here are indicative, not a fixed guideline table.',
          'Consider a renal-mass biopsy where the risk/benefit of treatment is equivocal.',
          'Recommend intervention if substantial interval growth is observed.',
        ],
        source: AUA_RENAL,
      },
    ],
  },

  {
    id: 'cystectomy',
    name: 'Bladder cancer — after radical cystectomy',
    blurb: 'Follow-up after radical cystectomy for muscle-invasive disease.',
    indexLabel: 'Date of cystectomy',
    protocols: [
      {
        id: 'cystectomy-postop',
        label: 'After radical cystectomy',
        description:
          'Post-cystectomy follow-up for non-metastatic muscle-invasive bladder cancer. AUA applies the same schedule regardless of pathological stage.',
        visits: merge(
          every(3, 36, 3, [LABS]),
          every(6, 36, 6, [CHEST_IMG, 'Cross-sectional abdomen + pelvis (CT or MRI)']),
          every(48, 60, 12, [LABS, CHEST_IMG, 'Cross-sectional abdomen + pelvis (CT or MRI)']),
        ),
        thereafter:
          'Imaging and laboratory assessment may continue annually beyond 5 years, individualised to risk and diversion type.',
        notes: [
          'AUA: chest imaging and cross-sectional abdomen/pelvis imaging at 6–12 month intervals for 2–3 years, then annually — generated here at the shorter interval and carried to 3 years.',
          'AUA: laboratory assessment at 3–6 month intervals for 2–3 years, then annually — generated at the shorter end.',
          'Monitor the urethral remnant for recurrence in patients with a retained urethra; the guideline does not specify the method or interval.',
          'The guideline does not vary surveillance intensity by pathological stage (pT2 vs pT3/pT4 vs node-positive).',
          'The guideline text reviewed does not specify vitamin B12 or metabolic-acidosis monitoring for urinary diversions — follow local protocol for long-term diversion care.',
        ],
        source: AUA_MIBC,
      },
    ],
  },

  {
    id: 'utuc',
    name: 'UTUC — upper tract urothelial carcinoma',
    blurb: 'Surveillance after nephroureterectomy or kidney-sparing management, stratified by risk.',
    indexLabel: 'Date of surgery',
    protocols: [
      {
        id: 'utuc-nu-low',
        label: 'After nephroureterectomy — low risk (<pT2 N0/M0)',
        description:
          'Low-risk disease after radical nephroureterectomy. Bladder recurrence is the dominant concern, so cystoscopic surveillance continues long after the kidney is out.',
        visits: merge(
          every(6, 24, 6, [CYSTO_CYTOL]),
          every(36, 60, 12, [CYSTO_CYTOL]),
          [{ month: 6, tests: ['Cross-sectional abdominopelvic imaging (within 6 months of surgery)'] }],
          every(12, 60, 12, ['Cross-sectional abdominopelvic imaging', 'Upper tract imaging (contralateral kidney)']),
        ),
        thereafter:
          'Continue at least annual cystoscopy; upper-tract imaging for a minimum of 5 years and longer if the contralateral kidney remains at risk.',
        notes: [
          'AUA: cystoscopy and cytology at least every 6–9 months for the first 2 years, then at least annually — generated here at the shorter (6-month) end.',
          'For a high-grade tumour, step up to every 3–6 months for the first 3 years (use the high-risk protocol).',
          'Cross-sectional imaging within 6 months of surgery, then at least annually for a minimum of 5 years.',
          'There is roughly a 5% risk of disease developing in the contralateral upper tract, so the remaining kidney must stay under imaging surveillance.',
        ],
        source: AUA_UTUC,
      },
      {
        id: 'utuc-nu-high',
        label: 'After nephroureterectomy — high risk (≥pT2)',
        description:
          'High-risk disease after radical nephroureterectomy. Intensive cystoscopic, upper-tract and chest surveillance.',
        visits: merge(
          every(3, 36, 3, [CYSTO_CYTOL]),
          every(48, 60, 12, [CYSTO_CYTOL]),
          every(3, 24, 3, [CTU]),
          every(30, 36, 6, [CTU]),
          every(48, 60, 12, [CTU]),
          every(6, 60, 6, [CHEST_IMG]),
        ),
        thereafter: 'Annual cystoscopy and upper-tract imaging thereafter.',
        notes: [
          'AUA: cystoscopy and cytology every 3–6 months for 3 years, then annually — generated at the shorter end.',
          'Upper-tract imaging by multiphasic contrast-enhanced CT urography every 3–6 months in years 1–2, every 6 months in year 3, then annually to year 5.',
          'Chest imaging every 6–12 months for the first 5 years — shown 6-monthly here.',
          'Roughly a 5% risk of contralateral upper-tract disease keeps the remaining kidney under surveillance.',
        ],
        source: AUA_UTUC,
      },
      {
        id: 'utuc-ksm-low',
        label: 'Kidney-sparing management — low risk',
        description:
          'Endoscopically managed low-risk, favourable disease. The retained upper tract needs endoscopic as well as cystoscopic follow-up.',
        visits: merge(
          [{ month: 3, tests: ['Cystoscopy (first look, within 1–3 months)'] }],
          every(6, 24, 6, [CYSTO_CYTOL, UT_ENDO]),
          every(36, 60, 12, [CYSTO_CYTOL, UT_ENDO]),
        ),
        thereafter: 'At least annual cystoscopy, with upper-tract endoscopy/imaging to 5 years and beyond as risk dictates.',
        notes: [
          'AUA: cystoscopy within 1–3 months, then at least every 6–9 months for 2 years, then at least annually.',
          'Upper-tract endoscopy and imaging every 6–9 months for 2 years, then annually up to 5 years — generated at the shorter end.',
          'The ipsilateral tract remains in situ, so recurrence there is an ongoing risk as well as in the bladder.',
        ],
        source: AUA_UTUC,
      },
      {
        id: 'utuc-ksm-high',
        label: 'Kidney-sparing management — high risk',
        description:
          'Endoscopically managed high-risk disease — the most intensive schedule, because the at-risk tract is retained.',
        visits: merge(
          every(3, 36, 3, [CYSTO_CYTOL, UT_ENDO]),
          every(48, 60, 12, [CYSTO_CYTOL, UT_ENDO]),
        ),
        thereafter: 'At least annual cystoscopy and upper-tract surveillance thereafter.',
        notes: [
          'AUA: cystoscopy at least every 3–6 months for the first 3 years, then at least annually.',
          'Upper-tract endoscopy and imaging every 3–6 months for 3 years, then annually up to 5 years.',
          'Counsel that nephroureterectomy remains the fallback if high-risk disease recurs or progresses.',
        ],
        source: AUA_UTUC,
      },
    ],
  },

  {
    id: 'testis',
    name: 'Testicular cancer — clinical stage I',
    blurb: 'Post-orchiectomy surveillance, which is the default management for stage I disease.',
    indexLabel: 'Date of orchiectomy',
    protocols: [
      {
        id: 'testis-seminoma-1',
        label: 'Stage I seminoma — surveillance',
        description:
          'Clinical stage I seminoma managed by surveillance after radical inguinal orchiectomy. Imaging-led, with markers and chest imaging used as clinically indicated rather than on a fixed schedule.',
        visits: merge(
          every(6, 24, 6, [HP, CT_AP]),
          every(30, 60, 6, [HP, CT_AP]),
        ),
        thereafter:
          'Surveillance may be relaxed after 5 years; late relapse is uncommon but not impossible.',
        notes: [
          'AUA: cross-sectional imaging of the abdomen ± pelvis every 6 months for the first 2 years, then every 6–12 months in years 3–5 — generated at the shorter (6-month) end.',
          'Routine chest imaging and serum tumour markers are obtained as clinically indicated in stage I seminoma rather than at fixed intervals.',
          'History and examination accompany each imaging visit.',
          'Markers are often normal in pure seminoma, so a normal AFP/hCG does not exclude relapse — imaging carries the surveillance.',
        ],
        source: AUA_TESTIS,
      },
      {
        id: 'testis-nsgct-1',
        label: 'Stage I NSGCT — surveillance',
        description:
          'Clinical stage I non-seminomatous germ cell tumour on surveillance. Marker-led and front-loaded, because most relapses occur in the first 2 years.',
        visits: merge(
          every(2, 12, 2, [MARKERS, HP]),
          every(14, 24, 2, [MARKERS, HP]),
          every(28, 36, 4, [MARKERS, HP]),
          every(42, 60, 6, [MARKERS, HP]),
          every(3, 12, 3, [CT_AP, CXR]),
          every(16, 24, 4, [CT_AP, CXR]),
          [36, 48, 60].map((month) => ({ month, tests: [CT_AP, CXR] })),
        ),
        thereafter:
          'Relapse after 5 years is rare; continued follow-up is individualised.',
        notes: [
          'AUA marker intervals: every 2–3 months in year 1, every 2–4 months in year 2, every 4–6 months in year 3, then every 6–12 months in years 4–5 — generated at the shorter end.',
          'Abdominal ± pelvic imaging every 3–6 months in year 1 starting at 3 months, every 4–12 months in year 2, then once in year 3 and once in each of years 4 and 5.',
          'Chest X-ray is the chest imaging modality specified for stage I NSGCT.',
          'A rising AFP or hCG during surveillance indicates relapse and warrants imaging and oncology referral, even if imaging was recently normal.',
        ],
        source: AUA_TESTIS,
      },
    ],
  },

  {
    id: 'stones',
    name: 'Kidney stones — metabolic follow-up',
    blurb: 'Metabolic evaluation and monitoring for the recurrent or high-risk stone former.',
    indexLabel: 'Date treatment started',
    protocols: [
      {
        id: 'stones-metabolic',
        label: 'Recurrent / high-risk stone former',
        description:
          'For recurrent stone formers and high-risk or interested first-time formers — family history, malabsorptive disease, recurrent UTI, obesity, solitary kidney, RTA type 1, hyperparathyroidism, gout or diabetes.',
        visits: [
          {
            month: 0,
            tests: [
              'Metabolic evaluation: one or two 24-hour urine collections on a random diet (two preferred) — volume, pH, calcium, oxalate, uric acid, citrate, sodium, potassium, creatinine',
              'Serum chemistries: electrolytes, calcium, creatinine, uric acid (add intact PTH if primary hyperparathyroidism is suspected)',
              'Stone analysis when a stone is available (at least once)',
            ],
          },
          {
            month: 6,
            tests: [
              'Single 24-hour urine to assess response to dietary and/or medical therapy (within 6 months of starting treatment)',
            ],
          },
          ...every(18, 60, 12, [
            'Single 24-hour urine (annually, or more often if stone activity is high)',
            'Periodic blood testing for adverse effects of drug therapy',
            'Follow-up imaging for stone growth or new stones (plain film, ultrasound or low-dose CT)',
          ]),
        ],
        thereafter:
          'Continue annual 24-hour urine and periodic imaging indefinitely, adjusting frequency to stone activity and adherence.',
        notes: [
          'Imaging interval is not fixed by the guideline — it is driven by stone activity; shown annually here as a default.',
          'Obtain a repeat stone analysis when available, especially if the patient is not responding to treatment.',
        ],
        source: AUA_STONES,
      },
    ],
  },

  {
    id: 'testosterone',
    name: 'Testosterone therapy — monitoring',
    blurb: 'Safety and response monitoring for men on testosterone replacement.',
    indexLabel: 'Date therapy started',
    protocols: [
      {
        id: 'testosterone-monitoring',
        label: 'Men on testosterone therapy',
        description:
          'Monitoring for men started on testosterone replacement — confirming the target level is reached, checking response, and watching for polycythaemia.',
        visits: merge(
          [
            {
              month: 0,
              tests: [
                `${TESTO} — baseline (confirmed on two early-morning samples)`,
                `${HB_HCT} — baseline, before starting`,
                `${PSA} — baseline in men over 40, to exclude prostate cancer`,
              ],
            },
            {
              month: 3,
              tests: [
                `${TESTO} — confirm the target level has been achieved`,
                'Review symptom/sign response; discuss stopping if levels are normal but symptoms have not improved',
              ],
            },
          ],
          every(6, 60, 6, [TESTO, HB_HCT]),
        ),
        thereafter:
          'Continue testosterone every 6–12 months while therapy continues, with haematological monitoring per local protocol.',
        notes: [
          'AUA: adjust dosing to reach a total testosterone in the middle tertile of the normal reference range — around 450–600 ng/dL in most laboratories.',
          'AUA: measure testosterone every 6–12 months while on therapy — generated here 6-monthly.',
          'Measure haemoglobin and haematocrit before starting and counsel on the increased risk of polycythaemia. The guideline text reviewed does not fix a follow-up interval or a haematocrit threshold for stopping — follow local protocol and the product labelling.',
          'PSA before starting in men over 40; the guideline reviewed does not specify on-therapy PSA intervals, so follow local prostate-cancer screening practice.',
          'AUA: discuss cessation 3–6 months in for men whose testosterone has normalised but who have had no improvement in symptoms or signs.',
        ],
        source: AUA_TESTOSTERONE,
      },
    ],
  },
];
