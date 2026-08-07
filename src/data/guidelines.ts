/**
 * Clinical guidelines: simplified decision trees for rapid review + expandable
 * detailed sections for comprehensive algorithms. Every recommendation cites
 * its source (AUA/EAU/etc.) with a working PubMed/DOI link.
 */

export interface GuidelineStep {
  label: string;
  description: string;
  source?: { label: string; url: string };
}

export interface GuidelineSection {
  title: string;
  steps: GuidelineStep[];
}

export interface Guideline {
  id: string;
  title: string;
  condition: string;
  quickAlgorithm: string;
  sections: GuidelineSection[];
  /** AUA guideline URL */
  auaUrl?: string;
  /** EAU guideline URL (uroweb.org) */
  eauUrl?: string;
  /** AUA PDF download link (in public/guidelines/) */
  pdfUrl?: string;
  /** EAU PDF download link (in public/guidelines/eau/) */
  eauPdfUrl?: string;
}

export type GuidelineCategory = 'oncological' | 'non-oncological';

/** IDs of the oncology guidelines; everything else is non-oncological. */
export const ONCOLOGY_GUIDELINE_IDS: readonly string[] = [
  'renal-mass-surveillance',
  'prostate-cancer',
  'bladder-cancer',
  'testicular-cancer',
  'upper-tract-urothelial',
  'renal-cell-carcinoma',
];

/** Category for a guideline, derived from ONCOLOGY_GUIDELINE_IDS. */
export function guidelineCategory(g: Guideline): GuidelineCategory {
  return ONCOLOGY_GUIDELINE_IDS.includes(g.id) ? 'oncological' : 'non-oncological';
}

export const GUIDELINES: Guideline[] = [
  {
    id: 'renal-mass-surveillance',
    title: 'Renal mass surveillance',
    condition: 'Post-partial nephrectomy & incidental renal masses',
    eauUrl: 'https://uroweb.org/guidelines/renal-cell-carcinoma',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
    quickAlgorithm: `
1. Mass size & imaging features (CT/MRI):
   • <1.0 cm → ultrasound follow-up at 1, 3, 5 years
   • 1.0–2.0 cm, low-risk features → CT/MRI at 3 & 12 months, then annual
   • 1.0–2.0 cm, high-risk features → annual imaging or ablation
   • >2.0 cm → treat (partial nephrectomy preferred; ablation if unfit)

2. Post-PN for RCC (all stages):
   • Monitor contralateral kidney (15–20% develop mets or second primary)
   • Baseline CT chest/abdomen at 3 months post-op
   • Imaging: CT/MRI at 6 months, 12 months, then annual × 5 years
   • If eGFR decline >25% → nephrology referral

3. High-risk morphology on imaging:
   • Fat stranding, heterogeneity, rapid growth (>2 mm/year) → earlier intervention
   • Cystic masses: Bosniak III→IV → ablation or surgery
    `,
    sections: [
      {
        title: 'Mass characterization',
        steps: [
          {
            label: 'Bosniak classification (cystic masses)',
            description:
              'I (benign) → no follow-up. II (likely benign) → 6-month imaging. IIF (follow) → annual ×5 years. III (indeterminate) → ablation/surgery. IV (malignant) → treat.',
            source: {
              label: 'Israel et al., Radiology 2019',
              url: 'https://pubmed.ncbi.nlm.nih.gov/31095489/',
            },
          },
          {
            label: 'Solid masses: size & growth rate',
            description:
              'Slow growth (<2 mm/year, stable ≥2 years) favors benign; rapid growth or enlargement → treat. Enhancement >20 HU post-contrast → malignant features.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
        ],
      },
      {
        title: 'Surveillance protocols',
        steps: [
          {
            label: '<1.0 cm masses',
            description:
              'Ultrasound at 1, 3, 5 years. Malignancy risk <1%; MRI/CT only if growth documented or new high-risk features.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
          {
            label: '1.0–2.0 cm (low-risk)',
            description:
              'MRI/CT at 3 months, 12 months, then every 12–24 months. If stable × 2 years, extend interval to every 2 years.',
            source: {
              label: 'EAU Renal Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/renal-cell-carcinoma/',
            },
          },
          {
            label: '1.0–2.0 cm (high-risk features)',
            description:
              'Enhancement >20 HU, heterogeneity, fat stranding → annual imaging or consider ablation/biopsy for counseling.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
          {
            label: '>2.0 cm',
            description:
              'Offer partial nephrectomy (preferred) or ablation (RFA, cryotherapy, microwave). Surgery if fit; ablation + surveillance if medically unfit.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
        ],
      },
      {
        title: 'Post-partial nephrectomy monitoring',
        steps: [
          {
            label: 'Contralateral kidney surveillance',
            description:
              'Second primary RCC or metastatic disease occurs in 15–20% post-PN. Monitor with imaging at baseline, 3–6 months, then annually ×5 years.',
            source: {
              label: 'EAU Renal Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/renal-cell-carcinoma/',
            },
          },
          {
            label: 'Systemic surveillance',
            description:
              'Chest CT at 3, 6, 12 months post-op (stage pT1b–pT3 or high-grade), then annually. Consider serum creatinine/eGFR trend; CKD common after PN.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
          {
            label: 'Renal function decline',
            description:
              'If eGFR drops >25% from baseline, nephrology referral for CKD management and cardiovascular risk reduction.',
            source: {
              label: 'EAU Renal Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/renal-cell-carcinoma/',
            },
          },
        ],
      },
      {
        title: 'Treatment thresholds',
        steps: [
          {
            label: 'Active surveillance vs. treatment',
            description:
              'Observation alone acceptable for <2 cm masses with slow/no growth if patient informed & eGFR stable. Surgery/ablation offered if growth >4 mm/year or patient preference.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
          {
            label: 'Ablation indications',
            description:
              'Cystic III–IV, solid >1 cm with high-risk features, or medically unfit for surgery. RFA/cryotherapy/microwave; follow with imaging at 3–6 months, then annually.',
            source: {
              label: 'EAU Renal Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/renal-cell-carcinoma/',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'prostate-cancer',
    title: 'Prostate cancer',
    condition: 'Risk stratification and treatment selection',
    eauUrl: 'https://uroweb.org/guidelines/prostate-cancer',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/clinically-localized-prostate-cancer',
    quickAlgorithm: `
1. Risk assessment (D'Amico):
   • Low-risk: PSA <10, Gleason ≤6, cT1c-T2a
   • Intermediate-risk: PSA 10-20, Gleason 7, or T2b-T2c
   • High-risk: PSA >20, Gleason ≥8, or ≥T3a

2. Localized disease treatment:
   • Low-risk → active surveillance (PSA/DRE q6-12 months) OR radiation/surgery if life expectancy >10 yrs
   • Intermediate-risk → external beam RT ± ADT, or RP with pelvic LN staging
   • High-risk → RP (if fit) + pelvic LN dissection + 6 months ADT, OR EBRT + 2-3 yrs ADT

3. Advanced disease (M0 N+ or M1a/M1b):
   • M0 N+ → RT + ADT × 2 years (RTOG 9408)
   • M1a/M1b metastatic → ADT ± docetaxel (if ECOG 0-1 and high-volume)

4. Follow-up: PSA at 6 weeks post-RP; if <0.2 → surveillance q6 months; if ≥0.2 → biochemical recurrence → imaging/ADT
    `,
    sections: [
      {
        title: 'Diagnosis & staging',
        steps: [
          {
            label: 'Screening & diagnosis',
            description:
              'PSA + DRE in men age 55–69 (shared decision-making); biopsy if PSA >4 ng/mL or abnormal DRE. 12-core TRUS-guided or MRI-guided biopsy preferred. Gleason score guides risk stratification.',
            source: {
              label: 'AUA Prostate Cancer Guidelines 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/clinically-localized-prostate-cancer',
            },
          },
          {
            label: 'Risk stratification (D\'Amico)',
            description:
              'Low (PSA <10, Gleason ≤6, cT1c-T2a), Intermediate (PSA 10-20, Gleason 7, T2b-T2c), High (PSA >20, Gleason ≥8, ≥T3a). High-risk disease requires pelvic imaging (CT/MRI) to assess lymph node involvement.',
            source: {
              label: 'D\'Amico et al., J Clin Oncol 1998',
              url: 'https://pubmed.ncbi.nlm.nih.gov/9613532/',
            },
          },
          {
            label: 'Staging imaging',
            description:
              'Bone scan if PSA >20 or Gleason ≥8 (risk >10% for metastatic disease). CT abdomen/pelvis for high-risk disease to assess pelvic lymph node involvement (consider MRI if CT equivocal).',
            source: {
              label: 'EAU Prostate Cancer Guidelines 2024',
              url: 'https://uroweb.org/guidelines/prostate-cancer/',
            },
          },
        ],
      },
      {
        title: 'Localized disease management',
        steps: [
          {
            label: 'Low-risk disease',
            description:
              'Active surveillance (PSA velocity, repeat biopsy at 1 & 4 years if stable) or definitive therapy (RP, EBRT, brachytherapy). Life expectancy >10 years favors definitive therapy; <10 years → surveillance.',
            source: {
              label: 'AUA Prostate Cancer Guidelines 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/clinically-localized-prostate-cancer',
            },
          },
          {
            label: 'Intermediate-risk disease',
            description:
              'Radical prostatectomy (RP) + pelvic lymph node dissection, or external beam radiation therapy (EBRT, 75.6–81 Gy). Consider ADT for 6 months if multiple intermediate-risk factors.',
            source: {
              label: 'Wilt et al., NEJM Prostate Cancer Intervention vs. Observation Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/22423141/',
            },
          },
          {
            label: 'High-risk disease',
            description:
              'RP + extended pelvic LN dissection (if PSA <20 and life expectancy >15 yrs), OR EBRT (77–81 Gy) + ADT (bicalutamide/GnRH agonist) × 2–3 years. Consider neoadjuvant ADT before surgery.',
            source: {
              label: 'RTOG 9406 Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/17761969/',
            },
          },
        ],
      },
      {
        title: 'Advanced disease management',
        steps: [
          {
            label: 'Node-positive (M0 N+)',
            description:
              'EBRT to prostate + pelvis (dose 73–79.2 Gy) + ADT × 2 years. Earlier hormone therapy in high-risk N+ disease improves metastasis-free survival.',
            source: {
              label: 'RTOG 9408 Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/11050161/',
            },
          },
          {
            label: 'Metastatic (M1a/M1b)',
            description:
              'Androgen deprivation therapy (ADT) with GnRH agonist ± bicalutamide. Add docetaxel (75 mg/m² q21 days × 6 cycles) if ECOG 0–1 and high-volume disease (visceral mets or ≥3 bone lesions). Abiraterone/enzalutamide as second-line post-docetaxel.',
            source: {
              label: 'CHAARTED Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/26595959/',
            },
          },
        ],
      },
      {
        title: 'Surveillance & recurrence',
        steps: [
          {
            label: 'Post-RP surveillance',
            description:
              'PSA at 6 weeks, then q3 months × 1 year, q6 months × 1 year, then annually. Biochemical recurrence defined as PSA >0.2 ng/mL (confirmatory second measurement). Adjuvant RT if ≥2 high-risk features (Gleason ≥8, pT3, positive margins).',
            source: {
              label: 'AUA Prostate Cancer Guidelines 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/clinically-localized-prostate-cancer',
            },
          },
          {
            label: 'Biochemical recurrence management',
            description:
              'PSA doubling time <3 months or PSA rising to 1–2 ng/mL → imaging (CT/bone scan if PSA >5). Early ADT in younger men with long PSA doubling time may delay metastatic progression.',
            source: {
              label: 'EAU Prostate Cancer Guidelines 2024',
              url: 'https://uroweb.org/guidelines/prostate-cancer/',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'bladder-cancer',
    title: 'Bladder cancer',
    condition: 'Non-muscle and muscle-invasive disease management',
    eauUrl: 'https://uroweb.org/guidelines/non-muscle-invasive-bladder-cancer',
    eauPdfUrl: '/guidelines/eau/nmibc-bladder-cancer.pdf',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
    quickAlgorithm: `
1. Initial workup:
   • Cystoscopy + biopsy (confirm diagnosis & grade)
   • Imaging: CT chest/abdomen/pelvis (assess staging, upper tract)
   • Resection: TURBT with muscle-free specimen (critical for staging)

2. Non-muscle invasive (NMIBC):
   • Low-risk Ta/T1 G1 → TURBT ± single-dose chemo, surveillance cystoscopy q3 months
   • Intermediate-risk → TURBT + intravesical chemo (mitomycin C or doxorubicin) × 6 wks
   • High-risk (CIS, T1 G3, or recurrent) → TURBT + BCG induction + maintenance × 1–3 years
   • Recurrent/refractory NMIBC after BCG → consider cystectomy

3. Muscle-invasive (MIBC):
   • cT2-T4 M0 → neo-adjuvant cisplatin-based chemo, then RC + extended pelvic LN dissection (if fit)
   • Unfit for chemo → RT + concurrent radiosensitizing chemo, OR primary RC
   • M+ disease → systemic chemo (carboplatin if cisplatin-ineligible)

4. Surveillance: cystoscopy q3 months × 2 yrs (NMIBC); imaging q3–6 months post-RC (MIBC)
    `,
    sections: [
      {
        title: 'Diagnosis & risk stratification',
        steps: [
          {
            label: 'TURBT technique',
            description:
              'Complete resection of tumor with muscle in specimen; critical for accurate staging and prognostication. Incomplete TURBT (no muscle) increases MIBC upstaging risk; repeat TURBT recommended if high-grade or no muscle.',
            source: {
              label: 'AUA Bladder Cancer Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
            },
          },
          {
            label: 'NMIBC risk stratification',
            description:
              'Low-risk: Ta, G1-2, <3 cm, no CIS. Intermediate: All others. High-risk: CIS, T1, high-grade (G3), recurrent high-grade, >1 focus of T1. Risk determines intravesical therapy intensity.',
            source: {
              label: 'AUA Bladder Cancer Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
            },
          },
          {
            label: 'Staging imaging',
            description:
              'CT chest/abdomen/pelvis for all; MRI pelvis if concern for bladder wall invasion. Upper tract imaging (CT KUB or IVP) in all patients with hematuria to exclude upper tract UC.',
            source: {
              label: 'EAU Bladder Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/bladder-cancer-urothelial-carcinoma/',
            },
          },
        ],
      },
      {
        title: 'NMIBC management',
        steps: [
          {
            label: 'Low-risk NMIBC',
            description:
              'TURBT alone ± single intravesical dose of mitomycin C (within 24 hrs of resection, before perforation heals). Surveillance cystoscopy + voided UA at 3 months, then 6–12 monthly. No BCG required.',
            source: {
              label: 'EORTC Trial 30863',
              url: 'https://pubmed.ncbi.nlm.nih.gov/8663225/',
            },
          },
          {
            label: 'Intermediate-risk NMIBC',
            description:
              'TURBT + intravesical chemotherapy (mitomycin C 40 mg or doxorubicin 50 mg weekly × 6 weeks). Consider single-dose chemo if contraindications. Cystoscopy at 3 months (if complete response, routine surveillance).',
            source: {
              label: 'AUA Bladder Cancer Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
            },
          },
          {
            label: 'High-risk NMIBC',
            description:
              'TURBT + BCG induction (weekly × 6 weeks) + maintenance (1-, 3-, 6-month cycles) × 1–3 years. Repeat TURBT recommended if T1 G3 or incomplete resection. Monitor BCG toxicity (dysuria, frequency, cystitis). Cystectomy if BCG-refractory or intolerant.',
            source: {
              label: 'AUA Bladder Cancer Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
            },
          },
        ],
      },
      {
        title: 'MIBC management',
        steps: [
          {
            label: 'Neoadjuvant chemotherapy',
            description:
              'Cisplatin-based combination (e.g., MVAC: methotrexate, vinblastine, doxorubicin, cisplatin) × 3–4 cycles in fit patients with cT2-T4 MIBC. 5–10% pathologic complete response; improves 5-yr OS by 5–10%.',
            source: {
              label: 'Advanced Bladder Cancer Meta-analysis',
              url: 'https://pubmed.ncbi.nlm.nih.gov/12958162/',
            },
          },
          {
            label: 'Radical cystoprostatectomy (in men)',
            description:
              'Extended pelvic lymph node dissection (to common iliac bifurcation). Urinary diversion: ileal conduit, continent pouch, or neobladder (if renal function adequate, no neurogenic dysfunction, patient preference). Morbidity 20–30% but standard of care for fit patients.',
            source: {
              label: 'EAU Bladder Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/bladder-cancer-urothelial-carcinoma/',
            },
          },
          {
            label: 'Trimodal therapy (chemo-RT)',
            description:
              'For cisplatin-ineligible or unfit patients: external beam RT (64–70 Gy) + concurrent radiosensitizing chemo (5-FU/mitomycin C). Response rates 40–60%; 5-yr OS ~30%. Less morbidity than RC but requires compliance with imaging follow-up.',
            source: {
              label: 'RTOG 99-006 Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/15231755/',
            },
          },
        ],
      },
      {
        title: 'Surveillance & follow-up',
        steps: [
          {
            label: 'NMIBC surveillance',
            description:
              'Cystoscopy + voided urine cytology at 3 months, then q3–6 months for first 2 years, annually thereafter. Upper urinary tract imaging annually. Intravesical therapy adjusted based on recurrence/progression patterns.',
            source: {
              label: 'AUA Bladder Cancer Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
            },
          },
          {
            label: 'Post-RC surveillance',
            description:
              'Imaging (CT chest/abdomen/pelvis) q3–6 months × 2 years, then annually. Renal function & electrolytes (if continent diversion). Upper tract surveillance (ultrasound or CT) annually. Surveillance for metachronous upper tract UC in 2–5% of cases.',
            source: {
              label: 'EAU Bladder Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/bladder-cancer-urothelial-carcinoma/',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'testicular-cancer',
    title: 'Testicular cancer',
    condition: 'Germ cell tumor risk stratification and treatment',
    eauUrl: 'https://uroweb.org/guidelines/testicular-cancer',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/testicular-cancer-guideline',
    quickAlgorithm: `
1. Diagnosis:
   • Radical inguinal orchiectomy (confirm histology: seminoma vs. non-seminomatous GCT)
   • Tumor markers: AFP, β-hCG, LDH (prognostic & track treatment response)
   • Imaging: CT chest/abdomen/pelvis (stage disease)

2. Seminoma (all stages):
   • Stage I (pT1-4 N0 M0): Surveillance, radiation, or single-agent chemo (carboplatin AUC 7)
   • Stage IIA/IIB (pT1-4 N1-2 M0): RT to abdomen/mediastinum OR 3–4 cycles BEP (bleomycin, etoposide, cisplatin)
   • Stage III (M+): 3–4 cycles BEP (good-risk) or 4 cycles BEP (intermediate/poor-risk)

3. Non-seminomatous GCT (NSGCT):
   • Good-risk (AFP <1000, β-hCG <5000, LDH <1.5× ULN): 3 cycles BEP
   • Intermediate (1–10k AFP, 5–50k β-hCG, 1.5–10× LDH): 3–4 cycles BEP
   • Poor-risk (>10k AFP, >50k β-hCG, >10× LDH): 4 cycles BEP

4. Post-chemo surveillance: Tumor markers @ 5 days, 2 wks, 4 wks; imaging q3 months × 2 yrs; mass >1 cm post-chemo → biopsy/resection if residual tumor
    `,
    sections: [
      {
        title: 'Diagnosis & staging',
        steps: [
          {
            label: 'Radical inguinal orchiectomy',
            description:
              'Gold standard for tissue diagnosis; inguinal approach avoids scrotal violation and risks lymphatic spread. Never biopsy testicle percutaneously. Histology determines seminoma vs. NSGCT (mixed histology → treat as NSGCT).',
            source: {
              label: 'AUA Testicular Cancer Guidelines 2018',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testicular-cancer-guideline',
            },
          },
          {
            label: 'Tumor markers',
            description:
              'AFP (half-life 5–7 days), β-hCG (24–36 hrs), LDH (essential for risk stratification). IGCCCG criteria use these to classify good/intermediate/poor-risk. Markers should normalize post-orchiectomy; failure to normalize suggests incomplete surgery or occult metastatic disease.',
            source: {
              label: 'International Germ Cell Cancer Collaborative Group (IGCCCG)',
              url: 'https://pubmed.ncbi.nlm.nih.gov/9237867/',
            },
          },
          {
            label: 'Staging imaging',
            description:
              'CT chest/abdomen/pelvis (detects >95% of nodes >1 cm). MRI for borderline adenopathy or concern for inguinal node involvement. Tumor marker elevation >2 SD above normal post-orchiectomy suggests stage II–III disease even if imaging negative (marker-positive disease).',
            source: {
              label: 'EAU Testicular Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/testis-cancer/',
            },
          },
        ],
      },
      {
        title: 'Seminoma management',
        steps: [
          {
            label: 'Stage I seminoma',
            description:
              'Three options: (1) Surveillance (CT + markers q3 months; ~15% recurrence), (2) Single-agent carboplatin (AUC 7, 1 cycle; ~2% recurrence), (3) Radiation (infradiaphragmatic RT 25–30 Gy; excellent efficacy but late toxicity). Carboplatin now preferred in many centers (less long-term toxicity than RT).',
            source: {
              label: 'SWENOTECA Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/15231755/',
            },
          },
          {
            label: 'Stage IIA/IIB seminoma',
            description:
              'Radiation to abdomen + mediastinum (30–36 Gy) for stage IIA/IIB (nodes <5 cm). OR 3–4 cycles BEP if bulky disease (>5 cm) or radio-resistant. Recurrent seminoma post-RT → chemotherapy.',
            source: {
              label: 'EAU Testicular Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/testis-cancer/',
            },
          },
          {
            label: 'Stage III (metastatic) seminoma',
            description:
              'All patients receive chemotherapy: 3–4 cycles BEP (bleomycin 30 u/wk, etoposide 100 mg/day × 5, cisplatin 20 mg/day × 5, q21 days). Four cycles for marker-positive or bulky disease. 5-yr OS >90% for good-risk metastatic seminoma.',
            source: {
              label: 'IGCCCG Prognostic Model',
              url: 'https://pubmed.ncbi.nlm.nih.gov/9237867/',
            },
          },
        ],
      },
      {
        title: 'NSGCT management',
        steps: [
          {
            label: 'Risk stratification (IGCCCG)',
            description:
              'Good-risk: AFP ≤1000, β-hCG ≤5000, LDH <1.5× ULN. Intermediate: AFP 1–10k, β-hCG 5–50k, LDH 1.5–10×. Poor-risk: AFP >10k, β-hCG >50k, LDH >10×. Risk category determines chemotherapy cycles & intensity.',
            source: {
              label: 'IGCCCG Prognostic Model',
              url: 'https://pubmed.ncbi.nlm.nih.gov/9237867/',
            },
          },
          {
            label: 'Chemotherapy dosing',
            description:
              'Good-risk NSGCT: 3 cycles BEP. Intermediate/poor-risk: 4 cycles BEP or 3 cycles with dose-intensified cisplatin. Carboplatin less effective for NSGCT; cisplatin-based mandatory. ~95% CR in good-risk; ~70% in poor-risk.',
            source: {
              label: 'EAU Testicular Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/testis-cancer/',
            },
          },
          {
            label: 'Residual masses post-chemo',
            description:
              'If residual mass >1 cm after chemotherapy & markers normal: biopsy (if <2 cm) or resection (if >2 cm, surgical candidate). Masses <1 cm with normal markers → imaging surveillance. Persistent teratoma (germ cell elements) requires surgical resection despite marker normalization.',
            source: {
              label: 'EAU Testicular Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/testis-cancer/',
            },
          },
        ],
      },
      {
        title: 'Surveillance & follow-up',
        steps: [
          {
            label: 'Post-chemotherapy surveillance',
            description:
              'Tumor markers at day 5, week 2, week 4 post-chemo (ensure normalization). Imaging (CT chest/abdomen/pelvis) q3 months × 2 years, q6 months × 2 years, then annually. Pulmonary symptoms → CXR (bleomycin toxicity ~2%).',
            source: {
              label: 'AUA Testicular Cancer Guidelines 2018',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testicular-cancer-guideline',
            },
          },
          {
            label: 'Marker elevation during follow-up',
            description:
              'Any rise in AFP or β-hCG during surveillance → imaging + consider salvage chemotherapy. Relapsed disease treated with high-dose chemo ± stem cell rescue (40–50% salvage response). Late recurrence (>2 yrs) uncommon but can occur in mediastinal primary NSGCT.',
            source: {
              label: 'EAU Testicular Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/testis-cancer/',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'upper-tract-urothelial',
    title: 'Upper tract urothelial cancer',
    condition: 'Upper urinary tract urothelial carcinoma diagnosis & treatment',
    eauUrl: 'https://uroweb.org/guidelines/upper-urinary-tract-urothelial-cell-carcinoma',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/non-metastatic-upper-tract-urothelial-carcinoma',
    quickAlgorithm: `
1. Diagnosis:
   • Imaging: non-contrast CT (detects mass, hydronephrosis, renal function)
   • Urine cytology (high specificity, ~50% sensitivity; repeat if negative & high suspicion)
   • Endoscopy (URS ± biopsy; avoid tumor seeding in ureteral perforation)

2. Staging:
   • Grade & muscle invasion on biopsy (grade 1–3; Ta/T1/T2/T3 for intrinsic tumors)
   • Imaging: assess local invasion, nodal status, distant mets
   • Risk stratification: low-risk (Ta G1/2, <2 cm) vs. high-risk (T1, T2+, G3, >2 cm, CIS)

3. Treatment:
   • Low-risk: endoscopic management (URS with biopsy/laser ablation) + surveillance
   • High-risk or metastatic: nephroureterectomy with bladder cuff + pelvic LN dissection
   • Adjuvant chemo (platinum-based × 4 cycles) if high-risk features or N+ disease

4. Surveillance: Cystoscopy + voided UA q3 months × 2 yrs (monitor for bladder cancer)
    `,
    sections: [
      {
        title: 'Diagnosis & evaluation',
        steps: [
          {
            label: 'Imaging workup',
            description:
              'Non-contrast CT KUB (detects mass, hydronephrosis, renal function assessment). MRI if concern for renal insufficiency. IVP rarely used now but shows delayed excretion in ureteral UC. Avoid excessive ureteral manipulation pre-operative (tumor seeding risk).',
            source: {
              label: 'AUA Upper Tract UC Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/non-metastatic-upper-tract-urothelial-carcinoma',
            },
          },
          {
            label: 'Urine cytology',
            description:
              'High specificity (~95%) but low sensitivity (~30–50%); repeat x3 if negative but clinical suspicion high. Findings: atypical cells, high-grade, or frank malignant cells. Negative cytology does not exclude UC.',
            source: {
              label: 'AUA Upper Tract UC Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/non-metastatic-upper-tract-urothelial-carcinoma',
            },
          },
          {
            label: 'Endoscopic evaluation (URS)',
            description:
              'Diagnostic URS with selective ureteral catheterization to obtain tissue. Biopsies (2–3 samples) assess grade & depth. Avoid perforation (seeding risk). Biopsy at tumor site, margins, and normal-appearing areas to detect field changes.',
            source: {
              label: 'EAU Upper Tract UC Guidelines 2023',
              url: 'https://uroweb.org/guidelines/upper-urinary-tract-urothelial-carcinoma/',
            },
          },
        ],
      },
      {
        title: 'Risk stratification & staging',
        steps: [
          {
            label: 'Low-risk UTUC',
            description:
              'Ta, G1–2, <2 cm, no CIS. Often managed endoscopically. Recurrence risk ~30–40%; progression risk ~5–10%. Systemic staging (CT chest/abdomen) still recommended.',
            source: {
              label: 'AUA Upper Tract UC Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/non-metastatic-upper-tract-urothelial-carcinoma',
            },
          },
          {
            label: 'High-risk UTUC',
            description:
              'T1, T2+, G3, CIS, or >2 cm. Progression to T2+ occurs in ~20–30% of T1 tumors. Requires nephroureterectomy. Pre-operative imaging: CT chest/abdomen/pelvis to rule out metastatic disease.',
            source: {
              label: 'Margulis et al., Eur Urol 2009',
              url: 'https://pubmed.ncbi.nlm.nih.gov/19157687/',
            },
          },
          {
            label: 'TNM staging',
            description:
              'Ta (non-invasive), T1 (lamina propria), T2 (muscle), T3 (fat/renal parenchyma), T4 (adjacent organs). Nodal staging: N0, N1–2 (regional), N3 (common iliac/para-aortic). Identical to bladder UC staging rules.',
            source: {
              label: 'AJCC Cancer Staging Manual 8th Ed.',
              url: 'https://pubmed.ncbi.nlm.nih.gov/26915987/',
            },
          },
        ],
      },
      {
        title: 'Treatment',
        steps: [
          {
            label: 'Low-risk UTUC management',
            description:
              'Endoscopic surveillance (URS with laser ablation/biopsy) q3–6 months. Percutaneous antegrade endoscopy if ureter stricture or failed retrograde access. Surgery (nephroureterectomy) offered if tumor progression, high-grade recurrence, or patient preference.',
            source: {
              label: 'AUA Upper Tract UC Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/non-metastatic-upper-tract-urothelial-carcinoma',
            },
          },
          {
            label: 'Nephroureterectomy',
            description:
              'Standard of care for high-risk/metastatic UTUC. Open or laparoscopic approach; en bloc resection of kidney, entire ureter, bladder cuff (prevent ureteral stump recurrence). Extended pelvic LN dissection (>10 nodes optimal). Intrafascial approach reduces peritoneal spillage.',
            source: {
              label: 'EAU Upper Tract UC Guidelines 2023',
              url: 'https://uroweb.org/guidelines/upper-urinary-tract-urothelial-carcinoma/',
            },
          },
          {
            label: 'Adjuvant chemotherapy',
            description:
              'Platinum-based combination (e.g., gemcitabine-cisplatin × 4 cycles) in pT2–T4, pN+, or high-grade tumors to improve disease-free survival. Cisplatin-ineligible → carboplatin-based regimens less effective but considered.',
            source: {
              label: 'EAU Upper Tract UC Guidelines 2023',
              url: 'https://uroweb.org/guidelines/upper-urinary-tract-urothelial-carcinoma/',
            },
          },
        ],
      },
      {
        title: 'Surveillance & complications',
        steps: [
          {
            label: 'Post-treatment surveillance',
            description:
              'Cystoscopy + voided UA q3–6 months × 2 years (assess for bladder recurrence; 20–40% risk). Imaging annually for 5 years (monitor contralateral kidney). Metachronous UC in contralateral upper tract in 2–5% of cases.',
            source: {
              label: 'AUA Upper Tract UC Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/non-metastatic-upper-tract-urothelial-carcinoma',
            },
          },
          {
            label: 'Bladder cancer risk',
            description:
              'Patients with history of UTUC have 20–40% risk of bladder UC during life. Lifelong cystoscopic surveillance recommended. Intravesical BCG or chemotherapy considered if recurrent high-grade bladder tumors.',
            source: {
              label: 'Margulis et al., J Urol 2007',
              url: 'https://pubmed.ncbi.nlm.nih.gov/17383550/',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'renal-cell-carcinoma',
    title: 'Renal cell carcinoma',
    condition: 'Clear cell RCC diagnosis, staging, and treatment',
    eauUrl: 'https://uroweb.org/guidelines/renal-cell-carcinoma',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
    quickAlgorithm: `
1. Diagnosis & staging:
   • Imaging: CT or MRI (characterizes mass, IVC thrombus, nodal/distant mets)
   • Biopsy rarely needed; imaging features (enhancement, necrosis, heterogeneity) diagnostic
   • TNM staging: assess T (size/invasion), N (nodes), M (mets)

2. Localized RCC (<4 cm or T1):
   • Partial nephrectomy (PN) preferred if tumor <4 cm AND renal mass-to-total function ratio permits
   • Radical nephrectomy (RN) if PN not feasible (central location, solitary kidney)
   • Ablation (cryo/RFA) for elderly/medically unfit

3. Locally advanced (T2-T4):
   • Radical nephrectomy with IVC thrombus extraction if necessary (>2 cm thrombus → sternotomy/CPB)
   • Consider neoadjuvant immunotherapy (axitinib ± pembrolizumab) if borderline resectability

4. Metastatic RCC (M+):
   • First-line: tyrosine kinase inhibitor (sunitinib, pazopanib, axitinib) or combination immunotherapy (nivolumab + ipilimumab)
   • Second-line based on response: switch TKI, add IL-2, or use checkpoint inhibitor if not used first-line

5. Surveillance: CT/MRI q3–6 months × 2 yrs; annual thereafter for high-risk patients
    `,
    sections: [
      {
        title: 'Diagnosis & staging',
        steps: [
          {
            label: 'Imaging characteristics',
            description:
              'CT or MRI: arterial phase enhancement (>20 HU), size, homogeneity, necrosis, hemorrhage. Bosniak classification for cysts (I–V; I/II likely benign, III indeterminate, IV malignant). Evaluate for IVC thrombus, renal vein involvement, nodal metastases.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
          {
            label: 'Histologic subtype & grade',
            description:
              'Clear cell RCC (70–75% of all RCC), papillary (10%), chromophobe (5%), oncocytoma, AML (benign). Fuhrman grade (1–4) and ISUP grade prognosticate; grade ≥3 associated with increased metastasis risk and mortality.',
            source: {
              label: 'Srigley et al., Eur Urol 2011 (RCC Grading System)',
              url: 'https://pubmed.ncbi.nlm.nih.gov/21481502/',
            },
          },
          {
            label: 'TNM staging & risk stratification',
            description:
              'T1a (<4 cm), T1b (4–7 cm), T2a (7–10 cm), T2b (>10 cm), T3 (renal vein/IVC), T4 (beyond Gerota). SSIGN score (size, ECOG, grade, necrosis) predicts recurrence risk. High-risk tumors (SSIGN >4) warrant imaging surveillance ±adjuvant RT.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
        ],
      },
      {
        title: 'Surgical management (localized)',
        steps: [
          {
            label: 'Partial nephrectomy (PN)',
            description:
              'Gold standard for T1 RCC if tumor <4 cm and anatomy permits. Approach: open, laparoscopic, or robot-assisted. Ischemia time <20–25 min for warm ischemia. Equivalent oncologic outcomes to RN with better renal function preservation and lower cardiovascular morbidity.',
            source: {
              label: 'EORTC 30904 Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/22412146/',
            },
          },
          {
            label: 'Radical nephrectomy (RN)',
            description:
              'Indicated for T2+ RCC, solitary kidney with large tumor, or central tumors unsuitable for PN. Extended RN (with ipsilateral adrenalectomy) if upper pole tumor or adrenal involvement. Transperitoneal or retroperitoneal approach. 5-yr cancer-specific survival ~90% for pT1 N0.',
            source: {
              label: 'EAU Renal Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/renal-cell-carcinoma/',
            },
          },
          {
            label: 'IVC thrombus management',
            description:
              'Level 1–2 (<hepatic vein): open RN via transperitoneal approach, IVC reconstruction if necessary. Level 3–4 (supra-hepatic to supradiaphragmatic): may require sternotomy, bypass, or CPB. IVC thrombus resection improves OS if no unresectable distant mets; thrombus alone not contraindication to surgery.',
            source: {
              label: 'EAU Renal Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/renal-cell-carcinoma/',
            },
          },
          {
            label: 'Ablation (RFA/cryotherapy)',
            description:
              'Acceptable for patients >70 yrs, solitary kidney, or significant comorbidities; <4 cm tumors preferred. Percutaneous or image-guided approach. Local recurrence rate 10–20% vs. <2% for surgery. Surveillance imaging q3 months × 1 year.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
        ],
      },
      {
        title: 'Metastatic RCC treatment',
        steps: [
          {
            label: 'First-line systemic therapy',
            description:
              'TKI monotherapy (sunitinib 50 mg daily, pazopanib 800 mg daily, axitinib 5 mg BID) or combination immunotherapy (nivolumab 3 mg/kg + ipilimumab 1 mg/kg q3 weeks × 4, then nivolumab maintenance). Immunotherapy preferred for intermediate/poor-risk; TKI for favorable-risk per IMDC/MSKCC criteria.',
            source: {
              label: 'CheckMate 214 Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/30232451/',
            },
          },
          {
            label: 'Response assessment & progression',
            description:
              'Imaging (CT/MRI) at 6–12 weeks to assess RECIST response. Progressive disease after first-line → switch to different class (TKI → immunotherapy or vice versa) or add checkpoint inhibitor. Second/third-line options: lenvatinib + pembrolizumab, sorafenib, cabozantinib.',
            source: {
              label: 'EAU Renal Cancer Guidelines 2023',
              url: 'https://uroweb.org/guidelines/renal-cell-carcinoma/',
            },
          },
          {
            label: 'Cytoreductive nephrectomy',
            description:
              'Removal of primary tumor in metastatic RCC can improve OS if surgery feasible (no unresectable IVC thrombus, distant mets stable or resectable). Thrombus extraction via sternotomy if indicated. Median OS gain ~2–5 months in selected cases.',
            source: {
              label: 'CARMENA Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/29584124/',
            },
          },
        ],
      },
      {
        title: 'Surveillance & follow-up',
        steps: [
          {
            label: 'Post-PN/RN surveillance',
            description:
              'Imaging (CT/MRI abdomen) q3–6 months × 2 years, then annually × 3 years, then q1–2 years. Contralateral kidney surveillance (25% develop metachronous RCC). Serum creatinine & BP monitoring (post-PN CKD progression risk). Cumulative incidence of ipsilateral recurrence <2% for T1 N0.',
            source: {
              label: 'AUA Renal Mass Guidelines 2017',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
            },
          },
          {
            label: 'High-risk disease adjuvant therapy',
            description: 'Adjuvant VEGF TKI (sunitinib 50 mg × 4 wks on/2 wks off × 1 yr) improves recurrence-free survival in pT3 N0 M0 or pT1–3 N+ M0 by ~20–30%. Adjuvant checkpoint inhibitors (nivolumab, atezolizumab) trials ongoing. Consider enrollment in adjuvant immunotherapy trials for high-risk disease.',
            source: {
              label: 'S-TRAC Trial',
              url: 'https://pubmed.ncbi.nlm.nih.gov/26975494/',
            },
          },
        ],
      },
    ],
  },

  // NON-ONCOLOGICAL GUIDELINES (AUA)

  {
    id: 'bph-luts',
    title: 'Benign prostatic hyperplasia (BPH)',
    condition: 'Lower urinary tract symptoms & male LUTS management',
    eauUrl: 'https://uroweb.org/guidelines/management-of-non-neurogenic-male-luts',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
    pdfUrl: '/guidelines/non-oncology/bph.pdf',
    quickAlgorithm: `
1. Symptom severity (IPSS):
   • IPSS ≤7 (mild) → watchful waiting, lifestyle modification
   • IPSS 8–19 (moderate) → consider pharmacotherapy (alpha-blockers ± 5-ARI)
   • IPSS ≥20 (severe) → medical therapy or surgical intervention

2. Prostate size assessment:
   • <30 mL → alpha-blocker monotherapy
   • 30–40 mL → alpha-blocker ± 5-ARI (finasteride/dutasteride)
   • >40 mL → 5-ARI preferred, consider 5-ARI + alpha-blocker combo

3. Flow rate & PVR:
   • Qmax >15 mL/s, PVR <100 mL → medical management
   • Qmax <15 mL/s or PVR >100 mL → consider surgical intervention

4. Surgical options (refractory):
   • <30 mL prostate → TURP
   • 30–45 mL → TURP or laser (HoLEP, Thulium)
   • >45 mL → Open prostatectomy or laser enucleation

5. Minimally invasive: Rezum, UroLift (for selected patients)
    `,
    sections: [
      {
        title: 'Diagnosis & assessment',
        steps: [
          {
            label: 'IPSS + symptom history',
            description:
              'IPSS score (0–35) quantifies severity. Ask about nocturia, weak stream, incomplete emptying, urgency. Duration >6 months suggests chronic LUTS.',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
          {
            label: 'Digital rectal exam (DRE)',
            description:
              'Assess prostate size, nodularity, symmetry. Grade: small (<15 g), medium (15–30 g), large (>30 g). Correlates with symptoms but not perfectly.',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
          {
            label: 'PSA & urinalysis',
            description:
              'PSA screening optional (shared decision-making). UA rules out hematuria, infection, glycosuria suggesting alternative pathology.',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
          {
            label: 'Uroflowmetry + post-void residual',
            description:
              'Qmax <15 mL/s suggests obstruction. PVR >100 mL warrants further evaluation. Repeat Qmax if initial is low (poor effort possible).',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
        ],
      },
      {
        title: 'Medical management',
        steps: [
          {
            label: 'Alpha-adrenergic blockers',
            description:
              'Tamsulosin 0.4 mg, terazosin 1–10 mg, doxazosin 1–8 mg daily. Onset 1–2 weeks. Side effects: orthostatic hypotension, retrograde ejaculation (~20%). FDA-approved for LUTS/BPH.',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
          {
            label: '5-alpha reductase inhibitors (5-ARI)',
            description:
              'Finasteride 5 mg or dutasteride 0.5 mg daily. Reduces prostate volume ~25% over 6 months. Efficacy increases with larger glands (>40 g). Side effects: ED (~10%), decreased libido, gynecomastia (<1%).',
            source: {
              label: 'McConnell et al., NEJM 2003',
              url: 'https://pubmed.ncbi.nlm.nih.gov/12559327/',
            },
          },
          {
            label: 'Combination therapy',
            description:
              'Alpha-blocker + 5-ARI superior to monotherapy for moderate-severe LUTS with large prostate. MTOPS trial: combo reduced symptom progression risk by 34%.',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
        ],
      },
      {
        title: 'Surgical intervention',
        steps: [
          {
            label: 'TURP (gold standard)',
            description:
              'For Qmax <15 mL/s, PVR >100 mL, or recurrent UTI/retention. 80% of men report symptom improvement. Morbidity 15–20% (TURP syndrome ~1–2%, bleeding, infection). Can repeat if recurrence.',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
          {
            label: 'Laser enucleation (HoLEP, Thulium)',
            description:
              'Superior to TURP for large glands (>45 g). Lower morbidity, faster catheter removal. Excellent long-term outcomes. Higher cost, steeper learning curve.',
            source: {
              label: 'Ahyai et al., Eur Urol 2016',
              url: 'https://pubmed.ncbi.nlm.nih.gov/26275039/',
            },
          },
          {
            label: 'Minimally invasive (Rezum, UroLift)',
            description:
              'Rezum: convective RF energy ablates prostate; 1-year durability ~70%. UroLift: mechanical retraction; QoL improvement, lower morbidity but symptom relief modest. Consider for mild-moderate LUTS, smaller glands, high surgical risk.',
            source: {
              label: 'AUA BPH Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'oab',
    title: 'Overactive bladder (OAB)',
    condition: 'Urgency ± urgency incontinence with or without frequency',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
    pdfUrl: '/guidelines/non-oncology/oab.pdf',
    quickAlgorithm: `
1. Definition: ≥1 episode of urgency incontinence/week OR ≥8 voids/day + ≥2 urgent episodes/week
   • Dry OAB: urgency & frequency without incontinence
   • Wet OAB: urgency incontinence present

2. Workup:
   • UA/UCx → rule out UTI
   • PVR → exclude retention (>100 mL warrants further eval)
   • Bladder diary → document frequency, urgency, incontinence episodes

3. First-line: Behavioral (pelvic floor PT, bladder training, fluid management)
   • Success ~50% with adherence; NO side effects

4. Second-line: Antimuscarinics (oxybutynin, tolterodine, solifenacin)
   • Efficacy 40–60% reduction in incontinence episodes
   • Side effects: dry mouth (40%), constipation, blurred vision

5. Third-line: Beta-3 agonist (mirabegron 50 mg) or botulinum toxin (200 U intravesical)
   • Mirabegron: 40–50% efficacy, no anticholinergic side effects
   • Botox: 60–70% efficacy in refractory OAB; repeat q3 months; risk CIC dependency

6. Refractory OAB: Consider neuromodulation (SNS) or augmentation cystoplasty
    `,
    sections: [
      {
        title: 'Diagnostic criteria',
        steps: [
          {
            label: 'OAB definition',
            description:
              'Urinary urgency with or without urgency incontinence, usually with frequency (≥8 voids/day) and nocturia (≥2 episodes/night), in the absence of UTI or urinary retention.',
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
          {
            label: 'Bladder diary',
            description:
              'Patient records voiding times and volumes × 3 days. Typical findings: frequent small-volume voids, urgency episodes. Helps rule out polyuria (>2.8 L/day).',
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
          {
            label: 'Exclude mimics',
            description:
              "UTI (dysuria, pyuria), polyuria (diabetes, diuretics), detrusor overactivity from neurologic disease (MS, Parkinson's, spinal cord injury). UA, PVR, eGFR required.",
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
        ],
      },
      {
        title: 'Conservative management',
        steps: [
          {
            label: 'Behavioral therapy',
            description:
              'Pelvic floor muscle training (PFMT), bladder retraining (progressive voiding intervals), fluid restriction, caffeine/alcohol reduction. Success ~50% if adherent. First-line, no side effects.',
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
          {
            label: 'Scheduled voiding',
            description:
              'Fixed toilet visits (e.g., every 2 hours) to restore voluntary bladder control. Effective for frequency-predominant OAB and cognitive impairment.',
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
        ],
      },
      {
        title: 'Pharmacological treatment',
        steps: [
          {
            label: 'Antimuscarinics (first-line drug)',
            description:
              'Oxybutynin 5–15 mg, tolterodine 2–4 mg, solifenacin 5–10 mg daily. 40–60% reduce incontinence episodes. Onset 1–2 weeks. Side effects: dry mouth (40%), constipation, urinary retention (<5%), cognitive effects in elderly.',
            source: {
              label: 'Chapple et al., Neurourol Urodyn 2018',
              url: 'https://pubmed.ncbi.nlm.nih.gov/29697876/',
            },
          },
          {
            label: 'Beta-3 agonist (mirabegron)',
            description:
              'Non-anticholinergic; 50 mg daily. 40–50% efficacy. No dry mouth. Caution in hypertension (BP increase ~2 mmHg). Efficacy comparable to antimuscarinics; fewer cognitive effects.',
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
        ],
      },
      {
        title: 'Advanced options',
        steps: [
          {
            label: 'Intravesical botulinum toxin',
            description:
              'Onabotulinumtoxin A 200 U (4-6 injections) into detrusor. 60–70% efficacy in refractory OAB; onset 1–2 weeks, duration 3 months. Requires repeat. Risk: CIC dependency (10–20%), hematuria, infection.',
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
          {
            label: 'Sacral neuromodulation (SNS)',
            description:
              'InterStim device; effective for refractory OAB and urinary retention. 50–80% response rate. Trial lead placement first (3 days); if success, IPG implanted. Morbidity: infection, lead migration, IPG malfunction.',
            source: {
              label: 'AUA OAB Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'sui',
    title: 'Stress urinary incontinence (SUI)',
    condition: 'Involuntary urine leakage with physical exertion, coughing, sneezing',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/stress-urinary-incontinence-(sui)-guideline',
    pdfUrl: '/guidelines/non-oncology/sui.pdf',
    quickAlgorithm: `
1. Diagnosis: Leakage with Valsalva, cough, exercise (NOT with urgency)
   • History alone diagnostic (high specificity)
   • Cough stress test: patient coughs supine then upright; visualize leakage

2. Assessment:
   • Urinalysis → rule out UTI
   • PVR → exclude retention
   • Pelvic floor strength (Oxford grade 0–5): guides PT intensity

3. First-line: Pelvic floor muscle training (PFMT)
   • 3-month trial: 8–12 reps × 3 sets daily (or supervised PT)
   • Success: 30–60% cure/improvement
   • No side effects; can combine with pessary or bladder neck tape if inadequate

4. Second-line:
   • Pessary (ring, cube): 60–80% symptom improvement; reversible
   • Surgical: MUS (TVT, TOT) or traditional (Burch) if refractory to PT

5. Surgical outcomes:
   • MUS: 80–90% cure; minimally invasive; OCP risk <2%
   • Burch: 80–85% cure; open approach; CUI risk (~5–10%)
    `,
    sections: [
      {
        title: 'Clinical assessment',
        steps: [
          {
            label: 'History & stress test',
            description:
              'Ask: leakage with cough, laugh, exercise, sneezing? (NOT with urgency urgency). Cough stress test: patient voids, drinks 300 mL, coughs supine then upright. Visualize leakage = positive test.',
            source: {
              label: 'AUA SUI Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/stress-urinary-incontinence-(sui)-guideline',
            },
          },
          {
            label: 'Exclude other causes',
            description:
              'UA rules out UTI (dysuria, frequency mimics SUI). PVR rules out retention-related overflow incontinence. Ask about urgency incontinence (mixed SUI/UUI present in 30% of women).',
            source: {
              label: 'AUA SUI Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/stress-urinary-incontinence-(sui)-guideline',
            },
          },
          {
            label: 'Pelvic floor exam',
            description:
              'Oxford grade (0–5) assesses pelvic floor strength. Grade 0–1: weak (PT indicated). Grade 3+: reasonable baseline for MUS surgery. Vaginal exam rules out prolapse requiring concurrent repair.',
            source: {
              label: 'AUA SUI Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/stress-urinary-incontinence-(sui)-guideline',
            },
          },
        ],
      },
      {
        title: 'Conservative management',
        steps: [
          {
            label: 'Pelvic floor muscle training (PFMT)',
            description:
              'Gold standard first-line. Kegel exercises: 8–12 contractions × 3 sets daily × 3 months. Supervised PT superior to home program. Success: 30–60% cure or significant improvement. Maintain indefinitely for durability.',
            source: {
              label: 'Dumoulin et al., Cochrane 2018',
              url: 'https://pubmed.ncbi.nlm.nih.gov/30225893/',
            },
          },
          {
            label: 'Pessary',
            description:
              'Mechanical support; ring, cube, or tandem designs. Inserted by patient or provider. 60–80% subjective improvement. Reversible, safe. Requires cleaning, periodic fitting. Good for mild-moderate SUI or as bridge to surgery.',
            source: {
              label: 'AUA SUI Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/stress-urinary-incontinence-(sui)-guideline',
            },
          },
        ],
      },
      {
        title: 'Surgical options',
        steps: [
          {
            label: 'Mid-urethral sling (MUS)',
            description:
              'Retropubic (TVT), transobturator (TOT/TVT-O), or single-incision (mini-slings). Minimally invasive; 80–90% continence cure. OCP risk <2%. Complications: voiding dysfunction (5%), mesh-related events (<1% with modern technique).',
            source: {
              label: 'AUA SUI Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/stress-urinary-incontinence-(sui)-guideline',
            },
          },
          {
            label: 'Burch colposuspension',
            description:
              'Open abdominal approach; elevates bladder neck. 80–85% cure. Requires laparotomy; longer recovery. Risk: occult incontinence (OUI) at 5–10% (pre-op urodynamics help predict). Gold standard pre-MUS era, rarely used now.',
            source: {
              label: 'AUA SUI Guidelines 2024',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/stress-urinary-incontinence-(sui)-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'kidney-stones-medical',
    title: 'Kidney stones — Medical management',
    condition: 'Nephrolithiasis: prevention and medical expulsion therapy',
    eauUrl: 'https://uroweb.org/guidelines/urolithiasis',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
    pdfUrl: '/guidelines/non-oncology/stones-medical.pdf',
    quickAlgorithm: `
1. Acute stone management:
   • NSAIDs (ketorolac 30–60 mg IV/IM q4–6h) or IV morphine 4–8 mg
   • Hydration: 1–2 L/day (avoid polyuria >2.5 L/day which increases recurrence)
   • Tamsulosin 0.4 mg daily speeds passage (especially <6 mm stones in lower ureter)

2. Stone prevention (all patients):
   • Increase fluid intake to urine output ~2–2.5 L/day
   • Dietary salt restriction (<2.3 g/day sodium)
   • Reduce animal protein (modest reduction; don't eliminate)
   • Modulate calcium/oxalate/citrate per stone type & metabolic abnormalities

3. Medical expulsive therapy (MET):
   • Alpha-blocker (tamsulosin 0.4 mg) ± corticosteroid (if distal ureteral stone)
   • Passage rates: 80–85% vs. 50–55% without therapy
   • Efficacy higher for distal stones <6 mm

4. Stone-specific prevention:
   • Calcium oxalate → ↓ sodium, ↑ fluid, avoid high-dose vitamin C
   • Uric acid → ↑ pH (potassium citrate), ↓ purine diet, allopurinol if recurrent
   • Struvite (infection) → aggressive UTI treatment, consider PCNL or urease inhibitors
   • Cystine → high-volume hydration, ↑ pH, D-penicillamine or tiopronin
    `,
    sections: [
      {
        title: 'Acute stone passage',
        steps: [
          {
            label: 'Pain management',
            description:
              'NSAIDs (ketorolac 30–60 mg IV/IM q4–6h) preferred; equivalent efficacy to opioids with fewer side effects. Morphine 4–8 mg IV acceptable if NSAID contraindicated. Antiemetics PRN (ondansetron 4 mg IV).',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
          {
            label: 'Hydration',
            description:
              'Goal urine output ~2–2.5 L/day (NOT >3 L; causes relative hypercalciuria). IV fluid bolus (1–2 L) in acute setting; transition to oral as tolerated. Avoid overhydration.',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
          {
            label: 'Medical expulsive therapy (MET)',
            description:
              'Tamsulosin 0.4 mg daily reduces stone passage time & increases success. NNT ~5 to prevent one surgical intervention. Most effective for distal stones <6 mm. Consider adding corticosteroid (dexamethasone 8 mg × 5 days) for distal ureteral stones.',
            source: {
              label: 'Hollingsworth et al., NEJM 2006',
              url: 'https://pubmed.ncbi.nlm.nih.gov/16870699/',
            },
          },
        ],
      },
      {
        title: 'Stone prevention strategies',
        steps: [
          {
            label: 'Universal measures (all patients)',
            description:
              'Adequate hydration (urine output 2–2.5 L/day), dietary sodium restriction (<2.3 g/day), moderate protein intake (50–100 g/day, individualize). Reduce caffeine, high-fructose products.',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
          {
            label: 'Calcium oxalate stones',
            description:
              "Limit sodium, increase fluid, avoid high-dose vitamin C supplementation. Calcium intake normal (don't restrict; paradoxically increases oxalate absorption). Thiazide diuretic (HCTZ 25 mg) if hypercalciuria >250 mg/day.",
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
          {
            label: 'Uric acid stones',
            description:
              'Potassium citrate 20–40 mEq daily to alkalinize urine (target pH 6.5–7.0). Allopurinol 300 mg daily if recurrent uric acid stones or elevated uric acid level. Dietary purine reduction (moderate).',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
          {
            label: 'Struvite (infection) stones',
            description:
              'Aggressive treatment of UTI; complete eradication crucial (struvite forms with urease-producing bacteria). Consider long-term prophylactic antibiotics post-PCNL. Acetohydroxamic acid rarely used (side effects).',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
          {
            label: 'Cystine stones',
            description:
              'High-volume hydration (>3 L urine/day), urine alkalinization (potassium citrate, target pH >7.5). First-line: massive hydration alone. Second-line: D-penicillamine or tiopronin if recurrent despite max hydration.',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
        ],
      },
      {
        title: 'Metabolic evaluation',
        steps: [
          {
            label: '24-hour urine collection',
            description:
              'Measure calcium, oxalate, citrate, uric acid, phosphate, creatinine, sodium. Indicated after first stone, recurrent stones, or family history. Guides targeted therapy.',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
          {
            label: 'Stone analysis',
            description:
              'Chemical composition directs prevention. Calcium oxalate → limit sodium/protein. Uric acid → alkalinize. Struvite → eradicate infection. Cystine → high hydration & alkalinization.',
            source: {
              label: 'AUA Medical Stone Management 2023',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'microhematuria',
    title: 'Asymptomatic microscopic hematuria (AMH)',
    condition: 'Hematuria ≥3 RBC/hpf without urinary symptoms',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
    pdfUrl: '/guidelines/non-oncology/microhematuria.pdf',
    quickAlgorithm: `
1. Define AMH: ≥3 RBC/hpf on urinalysis (or ≥3 RBC/μL on flow cytometry)
   • Repeat UA to confirm (transient hematuria common)

2. Risk stratification:
   • Age <40 + no risk factors → low cancer risk (<1%); UA follow-up at 6, 12 months
   • Age ≥50 or smoking (any age) → higher risk; imaging (renal ultrasound ± cystoscopy)

3. Exclude glomerular causes:
   • RBC casts, proteinuria, ↓eGFR → glomerulonephritis; refer to nephrology
   • Isolated hematuria → urologic workup

4. Imaging (high-risk patients):
   • Renal ultrasound (screens for masses >1 cm) OR CT KUB (more sensitive)
   • Normal imaging → routine urinalysis f/u annually × 2–3 years

5. Cystoscopy: Selective in high-risk patients (age ≥50, smokers)
   • Low bladder cancer yield in pure AMH (1–2%)
   • Consider if hematuria persists, becomes gross, or concurrent risk factors
    `,
    sections: [
      {
        title: 'Initial workup',
        steps: [
          {
            label: 'Confirm hematuria',
            description:
              'Repeat UA (transient hematuria from contamination, menses, infection common). True AMH: ≥3 RBC/hpf on ≥2 occasions. Exclude menstruation in women.',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
          {
            label: 'Glomerular disease screening',
            description:
              'RBC casts, proteinuria (>1 g/day), dysmorphic RBCs, ↓eGFR, HTN suggest glomerulonephritis → nephrology referral. Isolated isomorphic RBC → urologic workup.',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
        ],
      },
      {
        title: 'Risk stratification',
        steps: [
          {
            label: 'Low-risk (age <40, no risk factors)',
            description:
              'Cancer risk <1%. UA at 6 months, then annually × 2–3 years. No imaging/cystoscopy. Reassure patient. Lifestyle counseling (smoking cessation if applicable).',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
          {
            label: 'High-risk (age ≥50, smokers, other risk factors)',
            description:
              'Risk factors: smoking (current/former), occupational exposures (dyes, rubber), cyclophosphamide, chronic irritation (neurogenic bladder). Proceed to imaging + consider cystoscopy.',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
        ],
      },
      {
        title: 'Imaging strategy',
        steps: [
          {
            label: 'Renal ultrasound (first-line)',
            description:
              'Detects masses >1 cm; no radiation. Sensitivity for masses ~95%. If unrevealing, no upper tract cancer found. Repeat if hematuria persists/worsens.',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
          {
            label: 'Cystoscopy (selective)',
            description:
              'Low yield (~1–2% bladder cancer in pure AMH). Indicated in high-risk patients (age ≥50, smokers) or if gross hematuria develops. Can defer if imaging normal, UA negative, and low suspicion.',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
        ],
      },
      {
        title: 'Follow-up',
        steps: [
          {
            label: 'Persistence & recurrence',
            description:
              'UA annual × 2–3 years minimum. Serum creatinine annually (eGFR trajectory). If hematuria resolves, longer-term f/u optional. If worsens or gross hematuria develops, repeat imaging/cystoscopy.',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
          {
            label: 'Glomerular disease referral',
            description:
              'New proteinuria, HTN, ↓eGFR, or persistent hematuria with renal signs → nephrology for kidney biopsy if indicated. Prognosis for primary glomerulonephritis generally favorable with treatment.',
            source: {
              label: 'AUA Hematuria Guidelines 2020',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'ruti',
    title: 'Recurrent urinary tract infection (rUTI)',
    condition: 'Recurrent bacterial UTI: ≥2 episodes in 6 months or ≥3 in 12 months',
    eauUrl: 'https://uroweb.org/guidelines/urological-infections',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
    pdfUrl: '/guidelines/non-oncology/ruti.pdf',
    quickAlgorithm: `
1. Confirm diagnosis:
   • Each episode: symptoms (dysuria, frequency, urgency) + culture ≥10^2–10^3 CFU/mL (midstream clean-catch)
   • Exclude catheter-related/complicated UTI (anatomic abnormality, immunocompromise)

2. First-line investigations:
   • Urinalysis + culture (before antibiotics if possible)
   • PVR → exclude retention (>100 mL warrants imaging/urodynamics)
   • Imaging (renal ultrasound) if fever/flank pain or first UTI in men (rule out obstruction)

3. Prevention strategies (non-antimicrobial, FIRST):
   • Behavioral: hydration, voiding frequency, post-coital voiding, cranberry (modest effect)
   • Vaginal estrogen (post-menopausal women) improves vaginal flora
   • D-mannose or probiotics: insufficient evidence; reasonable trial

4. Antimicrobial prophylaxis (if recurrence despite behavioral):
   • Continuous (TMP-SMX 40–200 mg nightly × 6–12 months) vs.
   • Post-coital (TMP-SMX 1 DS after intercourse) if coitus-linked
   • Alternative: nitrofurantoin 50–100 mg nightly, cephalexin 250 mg nightly

5. Long-term monitoring:
   • Annual UA; renal function if recurrent imaging
   • D/C prophylaxis after 6–12 months; reassess if recurrence
    `,
    sections: [
      {
        title: 'Diagnosis & baseline assessment',
        steps: [
          {
            label: 'rUTI definition & confirmation',
            description:
              '≥2 episodes in 6 months OR ≥3 in 12 months, each with symptoms + urine culture. Culture ≥10^2 CFU/mL for women (≥10^3 acceptable if symptoms present), ≥10^4 for men. Asymptomatic bacteriuria NOT rUTI.',
            source: {
              label: 'AUA rUTI Guidelines 2025',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
            },
          },
          {
            label: 'Imaging & urodynamics',
            description:
              'Renal ultrasound indicated if fever, flank pain, or first UTI in males (rule out obstruction, stones). PVR > 100 mL warrants further evaluation (urodynamics if considering prophylaxis). Upper tract imaging optional if normal renal function and no pyelo.',
            source: {
              label: 'AUA rUTI Guidelines 2025',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
            },
          },
        ],
      },
      {
        title: 'Non-antimicrobial prevention',
        steps: [
          {
            label: 'Behavioral modifications',
            description:
              'Adequate hydration (urine output ~1.5–2 L/day), frequent voiding (don\'t "hold"), post-coital voiding (if linked to intercourse), complete bladder emptying. Cranberry juice/extracts: modest benefit (~20–30% reduction), not first-line.',
            source: {
              label: 'AUA rUTI Guidelines 2025',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
            },
          },
          {
            label: 'Vaginal estrogen (post-menopausal women)',
            description:
              'Conjugated estrogen cream 0.5–1 g nightly × 2 weeks, then 2×/week OR vaginal tablet (estradiol 10 mcg) daily × 2 weeks, then 2×/week. Restores lactobacilli, ↓ pathogenic bacteria. 40–60% reduce UTI recurrence.',
            source: {
              label: 'Perrotta et al., Cochrane 2008',
              url: 'https://pubmed.ncbi.nlm.nih.gov/18254119/',
            },
          },
          {
            label: 'D-mannose & probiotics',
            description:
              'D-mannose (2 g daily): weak evidence; some benefit for acute prevention. Probiotics (Lactobacillus): insufficient evidence. Reasonable trial if patient interested; not standard-of-care replacement for prophylaxis.',
            source: {
              label: 'AUA rUTI Guidelines 2025',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
            },
          },
        ],
      },
      {
        title: 'Antimicrobial prophylaxis',
        steps: [
          {
            label: 'First-line regimens',
            description:
              'TMP-SMX (Bactrim DS 40–200 mg nightly), nitrofurantoin (50–100 mg nightly, fosfomycin 3 g q72h), or cephalexin (250 mg nightly). Duration 6–12 months; reassess need annually. Continuous vs. post-coital dosing based on UTI pattern.',
            source: {
              label: 'AUA rUTI Guidelines 2025',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
            },
          },
          {
            label: 'Post-coital prophylaxis',
            description:
              'If UTI temporally linked to intercourse: TMP-SMX 1 DS, nitrofurantoin 100 mg, or cephalexin 250 mg within 2 hours post-coitus. Less antibiotic exposure than continuous. Efficacy ~80% reduction in linked UTI.',
            source: {
              label: 'AUA rUTI Guidelines 2025',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
            },
          },
          {
            label: 'Resistance & stewardship',
            description:
              'Monitor for resistance (culture on breakthrough UTI). Consider rotating prophylactic agents yearly. Avoid agents used for acute treatment (select for resistance). Obtain baseline & periodic urine cultures.',
            source: {
              label: 'AUA rUTI Guidelines 2025',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'surgical-stones',
    title: 'Kidney & ureteral stones — Surgical management',
    condition: 'Stone intervention: SWL, ureteroscopy, PCNL',
    eauUrl: 'https://uroweb.org/guidelines/urolithiasis',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
    pdfUrl: '/guidelines/non-oncology/stones-surgical.pdf',
    quickAlgorithm: `
1. Emergency: obstruction + infection (fever, sepsis)
   → urgent decompression (ureteral stent OR percutaneous nephrostomy); defer definitive
     stone treatment until sepsis resolved

2. Ureteral stones:
   • <10 mm, no infection → trial of passage ± medical expulsive therapy
   • Persistent/large/failed passage → ureteroscopy (URS) with laser lithotripsy (first-line)
   • SWL an option for smaller stones; lower single-session clearance than URS

3. Renal stones:
   • <20 mm → SWL or URS (choice by location, density, anatomy, patient preference)
   • >20 mm (incl. staghorn) → percutaneous nephrolithotomy (PCNL) first-line
   • Lower-pole ≥10 mm → PCNL or URS favored over SWL (worse SWL clearance)

4. Pre-op: obtain UA/urine culture; treat infection before elective intervention
5. Stent decisions: not mandatory after uncomplicated URS; place if ureteral injury,
   solitary kidney, or concern for edema/obstruction
    `,
    sections: [
      {
        title: 'Urgent scenarios',
        steps: [
          {
            label: 'Obstructing stone with infection',
            description:
              'Fever, leukocytosis, or sepsis with an obstructing stone is a urologic emergency: decompress promptly with a ureteral stent or percutaneous nephrostomy, give antibiotics, and delay definitive stone removal until the infection clears.',
            source: {
              label: 'AUA/Endourology Surgical Stone Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
            },
          },
          {
            label: 'Pre-operative urine culture',
            description:
              'Obtain urinalysis and culture before any elective stone procedure; treat a positive culture with targeted antibiotics beforehand to reduce post-operative sepsis risk.',
            source: {
              label: 'AUA/Endourology Surgical Stone Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
            },
          },
        ],
      },
      {
        title: 'Modality selection',
        steps: [
          {
            label: 'Ureteral stones',
            description:
              'Ureteroscopy with laser lithotripsy gives the highest single-session stone-free rate and is first-line for stones that fail passage or are unsuitable for observation. Shockwave lithotripsy (SWL) is a less invasive alternative for suitable smaller stones.',
            source: {
              label: 'AUA/Endourology Surgical Stone Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
            },
          },
          {
            label: 'Renal stones <20 mm',
            description:
              'SWL or ureteroscopy are both reasonable; choose based on stone location and density, collecting-system anatomy, and patient preference. Lower-pole stones ≥10 mm clear less reliably with SWL, favoring URS or PCNL.',
            source: {
              label: 'AUA/Endourology Surgical Stone Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
            },
          },
          {
            label: 'Large / staghorn stones (>20 mm)',
            description:
              'Percutaneous nephrolithotomy is first-line for large-volume and staghorn stones, offering the best stone-free rates. Combined (URS + PCNL) approaches may be used for complex stone burdens.',
            source: {
              label: 'AUA/Endourology Surgical Stone Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'nlutd',
    title: 'Neurogenic lower urinary tract dysfunction (NLUTD)',
    condition: 'Bladder dysfunction from neurologic disease or injury',
    eauUrl: 'https://uroweb.org/guidelines/neuro-urology',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/adult-neurogenic-lower-urinary-tract-dysfunction',
    pdfUrl: '/guidelines/non-oncology/nlutd.pdf',
    quickAlgorithm: `
1. Risk-stratify at diagnosis (low vs. moderate/high risk):
   • Based on neurologic condition, urodynamic hostility (high detrusor pressures,
     poor compliance, DSD), and upper-tract status

2. Core goals: protect the upper tracts, achieve continence/quality of life,
   minimize infection & stones

3. Baseline evaluation:
   • History, exam, UA; post-void residual; renal function
   • Urodynamics for moderate/high-risk patients (detrusor pressure, compliance, DSD)
   • Upper-tract imaging in high-risk groups

4. Management ladder:
   • Elevated storage pressures → antimuscarinic/β3 agonist ± clean intermittent
     catheterization (CIC)
   • Refractory detrusor overactivity → intradetrusor botulinum toxin
   • Failed conservative → augmentation cystoplasty or urinary diversion (selected)

5. Surveillance: periodic renal function, upper-tract imaging, and urodynamics in
   moderate/high-risk patients
    `,
    sections: [
      {
        title: 'Evaluation & risk stratification',
        steps: [
          {
            label: 'Risk categories',
            description:
              'Patients are stratified as low, moderate, or high risk using the neurologic diagnosis, urodynamic findings (elevated storage pressure, poor compliance, detrusor–sphincter dyssynergia), and upper-tract status. Risk drives the intensity of evaluation and surveillance.',
            source: {
              label: 'AUA/SUFU Adult NLUTD Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/adult-neurogenic-lower-urinary-tract-dysfunction',
            },
          },
          {
            label: 'Urodynamics',
            description:
              'Video-urodynamics or filling/voiding urodynamics characterize storage pressure, compliance, and dyssynergia in moderate/high-risk patients, identifying the hostile bladder that threatens the kidneys.',
            source: {
              label: 'AUA/SUFU Adult NLUTD Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/adult-neurogenic-lower-urinary-tract-dysfunction',
            },
          },
        ],
      },
      {
        title: 'Management',
        steps: [
          {
            label: 'Lower storage pressures',
            description:
              'Antimuscarinics or a β3 agonist reduce detrusor pressure and improve compliance; clean intermittent catheterization is the preferred emptying method when the bladder does not empty adequately.',
            source: {
              label: 'AUA/SUFU Adult NLUTD Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/adult-neurogenic-lower-urinary-tract-dysfunction',
            },
          },
          {
            label: 'Escalation',
            description:
              'Refractory neurogenic detrusor overactivity may be treated with intradetrusor botulinum toxin; augmentation cystoplasty or urinary diversion is reserved for selected patients who fail conservative measures.',
            source: {
              label: 'AUA/SUFU Adult NLUTD Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/adult-neurogenic-lower-urinary-tract-dysfunction',
            },
          },
          {
            label: 'Upper-tract surveillance',
            description:
              'Moderate/high-risk patients need ongoing monitoring of renal function, upper-tract imaging, and periodic urodynamics to detect deterioration before irreversible renal damage occurs.',
            source: {
              label: 'AUA/SUFU Adult NLUTD Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/adult-neurogenic-lower-urinary-tract-dysfunction',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'ic-bps',
    title: 'Interstitial cystitis / bladder pain syndrome (IC/BPS)',
    condition: 'Chronic bladder pain, pressure, or discomfort with urinary symptoms',
    eauUrl: 'https://uroweb.org/guidelines/chronic-pelvic-pain',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-treatment-interstitial-of-cystitis/bladder-pain-syndrome-(2022)',
    pdfUrl: '/guidelines/non-oncology/ic-bps.pdf',
    quickAlgorithm: `
1. Diagnosis (clinical): bladder pain/pressure/discomfort >6 weeks with urinary symptoms,
   after excluding infection, malignancy, and other confusable disorders

2. Baseline: symptom & pain assessment, UA/culture, PVR; cystoscopy/urodynamics only
   when the diagnosis is uncertain or to identify Hunner lesions

3. Treatment escalates step-wise (least to most invasive):
   • 1st — education, behavioral/dietary modification, stress management, pelvic-floor PT
   • 2nd — oral (amitriptyline, pentosan polysulfate, hydroxyzine, cimetidine) and/or
     intravesical (DMSO, heparin, lidocaine)
   • 3rd — cystoscopy under anesthesia ± hydrodistension; fulguration of Hunner lesions
   • 4th — intradetrusor botulinum toxin or sacral neuromodulation
   • 5th — oral cyclosporine A (selected)
   • 6th — major surgery (diversion ± cystectomy) for severe refractory disease only

4. Avoid long-term systemic opioids; treat Hunner lesions directly when present
    `,
    sections: [
      {
        title: 'Diagnosis',
        steps: [
          {
            label: 'Clinical diagnosis of exclusion',
            description:
              'IC/BPS is diagnosed clinically: bladder-related pain, pressure, or discomfort lasting more than six weeks with urinary symptoms, after excluding infection, malignancy, and other conditions that can mimic it. Baseline includes symptom/pain assessment, urinalysis and culture, and post-void residual.',
            source: {
              label: 'AUA IC/BPS Guideline (2022)',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-treatment-interstitial-of-cystitis/bladder-pain-syndrome-(2022)',
            },
          },
          {
            label: 'Role of cystoscopy',
            description:
              'Cystoscopy and urodynamics are not required for every patient; they are used when the diagnosis is uncertain or to identify Hunner lesions, which change management because they respond to direct treatment.',
            source: {
              label: 'AUA IC/BPS Guideline (2022)',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-treatment-interstitial-of-cystitis/bladder-pain-syndrome-(2022)',
            },
          },
        ],
      },
      {
        title: 'Stepwise treatment',
        steps: [
          {
            label: 'First- and second-line',
            description:
              'Begin with education, behavioral and dietary modification, stress management, and pelvic-floor physical therapy (avoid strengthening/Kegels, which can worsen pain). Add oral agents (amitriptyline, pentosan polysulfate, hydroxyzine, cimetidine) and/or intravesical therapy (DMSO, heparin, lidocaine) as needed.',
            source: {
              label: 'AUA IC/BPS Guideline (2022)',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-treatment-interstitial-of-cystitis/bladder-pain-syndrome-(2022)',
            },
          },
          {
            label: 'Procedural & advanced options',
            description:
              'Cystoscopy under anesthesia with hydrodistension and fulguration/injection of Hunner lesions is effective when lesions are present. Refractory disease may be treated with intradetrusor botulinum toxin, sacral neuromodulation, or oral cyclosporine A; major reconstructive surgery is reserved for severe, truly refractory cases.',
            source: {
              label: 'AUA IC/BPS Guideline (2022)',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-treatment-interstitial-of-cystitis/bladder-pain-syndrome-(2022)',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'male-cpp',
    title: 'Male chronic pelvic pain (CP/CPPS)',
    condition: 'Chronic prostatitis / chronic pelvic pain syndrome',
    eauUrl: 'https://uroweb.org/guidelines/chronic-pelvic-pain',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-chronic-pelvic-pain',
    pdfUrl: '/guidelines/non-oncology/cpp.pdf',
    quickAlgorithm: `
1. Characterize with a validated phenotype approach (e.g., UPOINT domains):
   Urinary, Psychosocial, Organ-specific, Infection, Neurologic/systemic, Tenderness
   of pelvic floor

2. Baseline: history, exam (incl. pelvic-floor tenderness), UA/culture; exclude UTI,
   STI, bladder cancer, and other specific causes

3. Treat by dominant phenotype (multimodal, individualized):
   • Urinary → alpha-blocker, bladder-directed therapy
   • Pelvic-floor tenderness → pelvic-floor physical therapy (myofascial release)
   • Psychosocial → cognitive-behavioral therapy, address catastrophizing/depression
   • Neuropathic pain → neuromodulators (amitriptyline, pregabalin/gabapentin)
   • Documented infection → targeted antibiotics (avoid prolonged empiric courses)

4. Set expectations: chronic condition; goal is symptom control and function, not
   a single curative intervention
    `,
    sections: [
      {
        title: 'Assessment',
        steps: [
          {
            label: 'Phenotype-driven evaluation',
            description:
              'CP/CPPS is heterogeneous; a phenotypic framework such as UPOINT (Urinary, Psychosocial, Organ-specific, Infection, Neurologic/systemic, Tenderness) organizes the evaluation and directs individualized therapy. Baseline includes exam for pelvic-floor tenderness, urinalysis, and culture.',
            source: {
              label: 'AUA Male Chronic Pelvic Pain Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-chronic-pelvic-pain',
            },
          },
          {
            label: 'Exclude specific causes',
            description:
              'Rule out urinary tract infection, sexually transmitted infection, bladder cancer, and other identifiable conditions before attributing symptoms to CP/CPPS.',
            source: {
              label: 'AUA Male Chronic Pelvic Pain Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-chronic-pelvic-pain',
            },
          },
        ],
      },
      {
        title: 'Multimodal treatment',
        steps: [
          {
            label: 'Match therapy to phenotype',
            description:
              'Target the dominant domains: alpha-blockers/bladder-directed therapy for urinary symptoms, pelvic-floor physical therapy for muscle tenderness, cognitive-behavioral therapy for psychosocial burden, and neuromodulators (amitriptyline, pregabalin/gabapentin) for neuropathic pain. Combining modalities outperforms single-agent approaches.',
            source: {
              label: 'AUA Male Chronic Pelvic Pain Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-chronic-pelvic-pain',
            },
          },
          {
            label: 'Antibiotic stewardship',
            description:
              'Reserve antibiotics for documented infection; avoid repeated prolonged empiric courses in culture-negative CP/CPPS, which are unlikely to help and drive resistance.',
            source: {
              label: 'AUA Male Chronic Pelvic Pain Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-chronic-pelvic-pain',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'urethral-stricture',
    title: 'Urethral stricture disease',
    condition: 'Anterior urethral narrowing: evaluation and reconstruction',
    eauUrl: 'https://uroweb.org/guidelines/urethral-strictures',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/urethral-stricture-guideline',
    pdfUrl: '/guidelines/non-oncology/urethral-stricture.pdf',
    quickAlgorithm: `
1. Diagnose & map: uroflow + PVR; confirm and characterize length/location with
   retrograde urethrogram ± cystoscopy

2. Short strictures (<2 cm, bulbar):
   • Direct-vision internal urethrotomy (DVIU) or dilation reasonable for a first,
     short stricture — but recurrence is common
   • Repeat DVIU/dilation for the same stricture is discouraged (low durable success)

3. Recurrent or longer strictures:
   • Urethroplasty is the most durable option and is preferred over repeat
     endoscopic treatment
   • Technique by length/location: excision & primary anastomosis (short bulbar);
     substitution (buccal mucosa graft) for longer strictures

4. Special: pelvic fracture urethral injury → delayed posterior urethroplasty at a
   reconstructive center

5. Counsel on recurrence risk and shared decision-making about endoscopic vs.
   reconstructive management
    `,
    sections: [
      {
        title: 'Evaluation',
        steps: [
          {
            label: 'Imaging & mapping',
            description:
              'Uroflowmetry and post-void residual screen for obstruction; retrograde urethrogram (with cystoscopy as needed) confirms the diagnosis and defines stricture length and location, which drive the choice of treatment.',
            source: {
              label: 'AUA Urethral Stricture Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urethral-stricture-guideline',
            },
          },
        ],
      },
      {
        title: 'Treatment selection',
        steps: [
          {
            label: 'Endoscopic treatment (short, first-time)',
            description:
              'Dilation or direct-vision internal urethrotomy is reasonable for a single short (<2 cm) bulbar stricture, but recurrence is frequent. Repeating endoscopic treatment for the same recurrent stricture yields poor durable success and is discouraged.',
            source: {
              label: 'AUA Urethral Stricture Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urethral-stricture-guideline',
            },
          },
          {
            label: 'Urethroplasty (recurrent / longer)',
            description:
              'Urethroplasty is the most durable treatment and is preferred for recurrent strictures or those unsuitable for endoscopic management. Excision and primary anastomosis suits short bulbar strictures; substitution urethroplasty with buccal mucosa graft is used for longer strictures.',
            source: {
              label: 'AUA Urethral Stricture Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urethral-stricture-guideline',
            },
          },
          {
            label: 'Pelvic fracture urethral injury',
            description:
              'Distraction injuries of the posterior urethra are managed with delayed posterior urethroplasty at an experienced reconstructive center after the patient stabilizes.',
            source: {
              label: 'AUA Urethral Stricture Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urethral-stricture-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'urotrauma',
    title: 'Urotrauma',
    condition: 'Renal, ureteral, bladder, and genitourinary trauma',
    eauUrl: 'https://uroweb.org/guidelines/urological-trauma',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
    pdfUrl: '/guidelines/non-oncology/urotrauma.pdf',
    quickAlgorithm: `
1. Renal trauma:
   • Image with CT (with IV contrast + delayed excretory phase) in hemodynamically
     stable patients with gross hematuria, or microhematuria + shock, or concerning
     mechanism
   • Most blunt injuries (even high-grade) managed non-operatively if stable
   • Persistent bleeding → angioembolization; explore for hemodynamic instability

2. Ureteral trauma:
   • Often iatrogenic/penetrating; high index of suspicion; confirm with imaging or
     intra-op inspection
   • Repair by level: ureteroureterostomy (upper/mid), ureteral reimplant ± Boari/psoas
     hitch (distal); stent

3. Bladder trauma:
   • Gross hematuria + pelvic fracture → CT cystography
   • Extraperitoneal rupture → catheter drainage (usually non-operative)
   • Intraperitoneal rupture → surgical repair

4. Urethral trauma: blood at meatus / high-riding prostate → retrograde urethrogram
   before catheter; suprapubic tube if unable to catheterize

5. Genital trauma: penile fracture → prompt surgical exploration & repair
    `,
    sections: [
      {
        title: 'Renal trauma',
        steps: [
          {
            label: 'Imaging criteria',
            description:
              'Obtain contrast CT with delayed excretory images in stable patients with gross hematuria, microscopic hematuria plus hypotension, or a mechanism/deceleration pattern suggestive of renal injury.',
            source: {
              label: 'AUA Urotrauma Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
            },
          },
          {
            label: 'Non-operative management',
            description:
              'Most blunt renal injuries, including many high-grade injuries, are managed non-operatively when the patient is hemodynamically stable. Angioembolization controls persistent bleeding; surgical exploration is reserved for hemodynamic instability or renovascular injury.',
            source: {
              label: 'AUA Urotrauma Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
            },
          },
        ],
      },
      {
        title: 'Bladder & urethral trauma',
        steps: [
          {
            label: 'Bladder rupture',
            description:
              'CT cystography is indicated for gross hematuria with pelvic fracture. Extraperitoneal ruptures are usually managed with catheter drainage alone; intraperitoneal ruptures require surgical repair.',
            source: {
              label: 'AUA Urotrauma Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
            },
          },
          {
            label: 'Urethral injury',
            description:
              'Blood at the meatus, inability to void, or a high-riding prostate warrants a retrograde urethrogram before catheterization. If catheterization fails or is contraindicated, place a suprapubic tube.',
            source: {
              label: 'AUA Urotrauma Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'incontinence-post-prostate',
    title: 'Incontinence after prostate treatment (IPT)',
    condition: 'Stress incontinence following prostatectomy or radiation',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/incontinence-after-prostate-treatment',
    pdfUrl: '/guidelines/non-oncology/ipt.pdf',
    quickAlgorithm: `
1. Evaluate: history, exam, pad testing/pad count, UA; cystoscopy to assess sphincter
   and exclude anastomotic stricture/recurrence; consider urodynamics

2. Early post-prostatectomy (first ~12 months):
   • Pelvic-floor muscle training; most men improve over the first year
   • Continence often continues to recover — counsel on timeline before surgery

3. Persistent stress incontinence beyond ~12 months → offer surgery:
   • Mild–moderate → male urethral sling
   • Moderate–severe, or prior radiation, or bothersome despite sling → artificial
     urinary sphincter (AUS), the most effective option

4. Post-radiation patients: AUS favored over sling; counsel on higher complication
   and revision rates

5. Manage concurrent anastomotic stenosis before, or at the time of, continence surgery
    `,
    sections: [
      {
        title: 'Evaluation',
        steps: [
          {
            label: 'Baseline workup',
            description:
              'Assess severity with pad testing/pad counts, perform urinalysis, and use cystoscopy to evaluate sphincter function and exclude anastomotic stricture or cancer recurrence. Urodynamics is considered when the picture is mixed or unclear.',
            source: {
              label: 'AUA/SUFU Incontinence after Prostate Treatment Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/incontinence-after-prostate-treatment',
            },
          },
        ],
      },
      {
        title: 'Management',
        steps: [
          {
            label: 'Conservative first year',
            description:
              'Pelvic-floor muscle training is first-line early after prostatectomy; continence commonly improves over the first 12 months, so surgery is generally deferred until recovery plateaus.',
            source: {
              label: 'AUA/SUFU Incontinence after Prostate Treatment Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/incontinence-after-prostate-treatment',
            },
          },
          {
            label: 'Surgical options',
            description:
              'For persistent stress incontinence, a male sling suits mild-to-moderate leakage, while the artificial urinary sphincter is the most effective option for moderate-to-severe leakage. After radiation, the artificial sphincter is favored over a sling, with counseling about higher complication and revision rates.',
            source: {
              label: 'AUA/SUFU Incontinence after Prostate Treatment Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/incontinence-after-prostate-treatment',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'gsm',
    title: 'Genitourinary syndrome of menopause (GSM)',
    condition: 'Vulvovaginal and urinary symptoms from estrogen deficiency',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/genitourinary-syndrome-of-menopause',
    pdfUrl: '/guidelines/non-oncology/gsm.pdf',
    quickAlgorithm: `
1. Recognize the cluster: vaginal dryness/irritation, dyspareunia, urinary urgency/
   frequency, and recurrent UTI attributable to postmenopausal estrogen deficiency

2. Evaluate: symptom-based; exam of vulvovaginal tissues; exclude infection and other
   causes of urinary/vaginal symptoms

3. First-line:
   • Nonhormonal vaginal moisturizers and lubricants for milder symptoms
   • Low-dose vaginal estrogen for moderate–severe GSM (creams, tablets, ring) —
     minimal systemic absorption; effective for vaginal and urinary symptoms

4. Alternatives: vaginal DHEA (prasterone), oral ospemifene (selected patients)

5. Recurrent UTI in postmenopausal women: vaginal estrogen reduces recurrences —
   integrates with the rUTI pathway
    `,
    sections: [
      {
        title: 'Diagnosis',
        steps: [
          {
            label: 'Symptom-based recognition',
            description:
              'GSM is a clinical diagnosis based on the constellation of vulvovaginal (dryness, irritation, dyspareunia) and urinary (urgency, frequency, recurrent UTI) symptoms in the setting of estrogen deficiency, after excluding infection and other causes.',
            source: {
              label: 'AUA/SUFU/AUGS GSM Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/genitourinary-syndrome-of-menopause',
            },
          },
        ],
      },
      {
        title: 'Treatment',
        steps: [
          {
            label: 'Nonhormonal & vaginal estrogen',
            description:
              'Vaginal moisturizers and lubricants help milder symptoms. Low-dose vaginal estrogen (cream, tablet, or ring) is effective for moderate-to-severe GSM with minimal systemic absorption, improving both vaginal and lower urinary tract symptoms.',
            source: {
              label: 'AUA/SUFU/AUGS GSM Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/genitourinary-syndrome-of-menopause',
            },
          },
          {
            label: 'Recurrent UTI benefit',
            description:
              'In postmenopausal women with recurrent urinary tract infection, vaginal estrogen restores the vaginal microbiome and reduces recurrence, complementing the recurrent-UTI prevention pathway.',
            source: {
              label: 'AUA/SUFU/AUGS GSM Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/genitourinary-syndrome-of-menopause',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'erectile-dysfunction',
    title: 'Erectile dysfunction (ED)',
    condition: 'Evaluation and treatment of erectile dysfunction',
    eauUrl: 'https://uroweb.org/guidelines/sexual-and-reproductive-health',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-(ed)-guideline',
    pdfUrl: '/guidelines/non-oncology/ed.pdf',
    quickAlgorithm: `
1. Evaluate: sexual, medical, and psychosocial history; validated instrument (IIEF/SHIM);
   focused exam; check testosterone (morning) and screen cardiovascular risk
   (ED is a marker of cardiovascular disease)

2. Shared decision-making across all treatment options; counsel on benefits/risks

3. First-line:
   • PDE5 inhibitors (sildenafil, tadalafil, vardenafil, avanafil) — contraindicated
     with nitrates
   • Treat low testosterone if present (can improve PDE5i response)
   • Lifestyle optimization; address reversible contributors

4. Second-line:
   • Intraurethral alprostadil or intracavernosal injection therapy
   • Vacuum erection device

5. Third-line:
   • Inflatable penile prosthesis for refractory ED or patient preference — high
     satisfaction

6. Counsel about priapism risk with injection therapy and when to seek emergency care
    `,
    sections: [
      {
        title: 'Evaluation',
        steps: [
          {
            label: 'History, exam, and labs',
            description:
              'Assess ED with a thorough sexual/medical/psychosocial history and a validated questionnaire (IIEF/SHIM). Obtain a morning testosterone level and screen cardiovascular risk, since ED is an independent marker of cardiovascular disease.',
            source: {
              label: 'AUA Erectile Dysfunction Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-(ed)-guideline',
            },
          },
        ],
      },
      {
        title: 'Treatment ladder',
        steps: [
          {
            label: 'First-line',
            description:
              'PDE5 inhibitors are first-line for most men and are absolutely contraindicated with nitrate therapy. Correcting low testosterone can improve response, and lifestyle optimization addresses reversible contributors.',
            source: {
              label: 'AUA Erectile Dysfunction Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-(ed)-guideline',
            },
          },
          {
            label: 'Second- and third-line',
            description:
              'Options for PDE5i failure include intraurethral or intracavernosal alprostadil and vacuum erection devices. The inflatable penile prosthesis is a definitive third-line option with high satisfaction for refractory ED or by patient preference.',
            source: {
              label: 'AUA Erectile Dysfunction Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-(ed)-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'peyronies',
    title: "Peyronie's disease",
    condition: 'Penile curvature from tunica albuginea fibrosis',
    eauUrl: 'https://uroweb.org/guidelines/sexual-and-reproductive-health',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/peyronies-disease-guideline',
    pdfUrl: '/guidelines/non-oncology/peyronies.pdf',
    quickAlgorithm: `
1. Assess: history (onset, pain, curvature, deformity, erectile function); exam of
   plaque; objective curvature measurement on a functional (e.g., injection-induced)
   erection; assess ED

2. Distinguish phase:
   • Active/acute (pain, changing deformity) → generally avoid surgery until stable
   • Stable (≥3 months, no pain, stable curve) → definitive options appropriate

3. Nonsurgical:
   • Intralesional collagenase clostridium histolyticum for stable curvature
     (dorsal/lateral, without significant hourglass/hinge) in appropriate candidates
   • Traction therapy as adjunct; oral therapies have limited proven benefit

4. Surgical (stable disease with functional impact):
   • Adequate length + good erectile function → tunical plication or plaque
     incision/excision + grafting
   • ED not responsive to medication → inflatable penile prosthesis ± straightening

5. Counsel on realistic outcomes, possible length change, and sensory changes
    `,
    sections: [
      {
        title: 'Evaluation',
        steps: [
          {
            label: 'Objective assessment',
            description:
              "Characterize the deformity with history and exam, and measure curvature objectively on a rigid (injection-induced) erection. Assess erectile function, since it strongly influences treatment choice.",
            source: {
              label: "AUA Peyronie's Disease Guideline",
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/peyronies-disease-guideline',
            },
          },
          {
            label: 'Active vs. stable disease',
            description:
              'Definitive correction is generally deferred until disease is stable (no pain, stable curvature for at least several months), because the deformity can continue to evolve during the active phase.',
            source: {
              label: "AUA Peyronie's Disease Guideline",
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/peyronies-disease-guideline',
            },
          },
        ],
      },
      {
        title: 'Treatment',
        steps: [
          {
            label: 'Nonsurgical',
            description:
              'Intralesional collagenase clostridium histolyticum is an option for stable dorsal/lateral curvature in appropriate candidates without a significant hourglass or hinge deformity. Penile traction may be used adjunctively; oral agents have limited proven efficacy.',
            source: {
              label: "AUA Peyronie's Disease Guideline",
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/peyronies-disease-guideline',
            },
          },
          {
            label: 'Surgical',
            description:
              'For stable disease with functional impact and good erectile function, tunical plication or plaque incision/excision with grafting corrects curvature. When ED is unresponsive to medication, an inflatable penile prosthesis (with straightening maneuvers as needed) addresses both problems.',
            source: {
              label: "AUA Peyronie's Disease Guideline",
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/peyronies-disease-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'priapism',
    title: 'Priapism',
    condition: 'Prolonged erection — ischemic (emergency) vs. non-ischemic',
    eauUrl: 'https://uroweb.org/guidelines/sexual-and-reproductive-health',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-management-of-priapism-aua/smsna-guideline-(2022)',
    pdfUrl: '/guidelines/non-oncology/priapism.pdf',
    quickAlgorithm: `
1. Determine type (this changes everything):
   • Ischemic (low-flow) → painful, rigid; EMERGENCY — corporal blood gas shows
     hypoxia/acidosis; time-critical (irreversible damage after prolonged ischemia)
   • Non-ischemic (high-flow) → non-painful, not fully rigid; often post-traumatic;
     not an emergency

2. Ischemic priapism — act immediately:
   • Corporal aspiration ± irrigation
   • Intracavernosal phenylephrine (dilute; repeat at intervals with BP/HR monitoring)
   • Failed aspiration/injection → distal (then proximal) surgical shunt
   • Prolonged/refractory or unsalvageable → early penile prosthesis considered

3. Stuttering (recurrent) ischemic priapism: treat episodes as above; preventive
   strategies for recurrence

4. Non-ischemic priapism: observation is first-line; selective arterial embolization
   for bothersome persistent cases

5. Sickle cell / hematologic cause: treat priapism directly AND manage the systemic
   disease concurrently
    `,
    sections: [
      {
        title: 'Diagnosis',
        steps: [
          {
            label: 'Ischemic vs. non-ischemic',
            description:
              'Differentiate ischemic (low-flow) priapism — painful, rigid, a compartment-syndrome emergency — from non-ischemic (high-flow) priapism, which is typically non-painful, incompletely rigid, and often follows trauma. Corporal blood gas (hypoxic/acidotic in ischemic) and Doppler ultrasound confirm the type.',
            source: {
              label: 'AUA/SMSNA Priapism Guideline (2022)',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-management-of-priapism-aua/smsna-guideline-(2022)',
            },
          },
        ],
      },
      {
        title: 'Management',
        steps: [
          {
            label: 'Ischemic priapism (emergency)',
            description:
              'Treat urgently: corporal aspiration with irrigation and intracavernosal injection of a diluted alpha-agonist (phenylephrine) with cardiovascular monitoring. If these fail, proceed to surgical shunting; for prolonged, refractory, or non-salvageable cases, early penile prosthesis placement is considered.',
            source: {
              label: 'AUA/SMSNA Priapism Guideline (2022)',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-management-of-priapism-aua/smsna-guideline-(2022)',
            },
          },
          {
            label: 'Non-ischemic priapism',
            description:
              'High-flow priapism is not an emergency; observation is first-line, with selective arterial embolization reserved for bothersome, persistent cases. When a hematologic cause such as sickle cell disease is present, manage the systemic disease alongside the priapism.',
            source: {
              label: 'AUA/SMSNA Priapism Guideline (2022)',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/diagnosis-and-management-of-priapism-aua/smsna-guideline-(2022)',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'testosterone-deficiency',
    title: 'Testosterone deficiency',
    condition: 'Diagnosis and management of low testosterone',
    eauUrl: 'https://uroweb.org/guidelines/sexual-and-reproductive-health',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
    pdfUrl: '/guidelines/non-oncology/testosterone.pdf',
    quickAlgorithm: `
1. Diagnose on symptoms + biochemistry:
   • Two separate early-morning total testosterone levels
   • Use a threshold around 300 ng/dL to support the diagnosis (combine with symptoms)
   • Measure LH/FSH and prolactin to localize primary vs. secondary; check other pituitary
     axes if secondary

2. Before treatment: baseline hematocrit and PSA; discuss fertility (exogenous
   testosterone impairs spermatogenesis)

3. Treatment (symptomatic + confirmed low T):
   • Testosterone therapy (gel, injection, pellet) titrated to the mid-normal range
   • If fertility desired → avoid exogenous testosterone; consider clomiphene/hCG

4. Counsel on cardiovascular considerations via shared decision-making

5. Monitor at ~3–12 months and periodically: symptoms, testosterone level, hematocrit,
   and PSA; manage erythrocytosis (dose reduction/phlebotomy)
    `,
    sections: [
      {
        title: 'Diagnosis',
        steps: [
          {
            label: 'Biochemical confirmation',
            description:
              'Diagnose testosterone deficiency using symptoms plus two separate early-morning total testosterone measurements, supported by a threshold around 300 ng/dL. LH/FSH and prolactin distinguish primary from secondary hypogonadism.',
            source: {
              label: 'AUA Testosterone Deficiency Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
            },
          },
          {
            label: 'Baseline safety labs',
            description:
              'Check hematocrit and PSA before starting therapy, and discuss that exogenous testosterone suppresses spermatogenesis — important for men who wish to preserve fertility.',
            source: {
              label: 'AUA Testosterone Deficiency Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
            },
          },
        ],
      },
      {
        title: 'Treatment & monitoring',
        steps: [
          {
            label: 'Therapy selection',
            description:
              'Testosterone therapy (gel, injection, or pellet) is titrated toward the mid-normal range for symptomatic men with confirmed low testosterone. For men desiring fertility, avoid exogenous testosterone and consider clomiphene or hCG to preserve sperm production.',
            source: {
              label: 'AUA Testosterone Deficiency Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
            },
          },
          {
            label: 'Follow-up',
            description:
              'Reassess symptoms, testosterone level, hematocrit, and PSA at roughly 3–12 months and periodically thereafter. Manage treatment-induced erythrocytosis with dose reduction or phlebotomy.',
            source: {
              label: 'AUA Testosterone Deficiency Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'male-infertility',
    title: 'Male infertility',
    condition: 'Evaluation and management of the infertile male',
    eauUrl: 'https://uroweb.org/guidelines/sexual-and-reproductive-health',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-infertility',
    pdfUrl: '/guidelines/non-oncology/male-infertility.pdf',
    quickAlgorithm: `
1. Evaluate both partners; for the male: reproductive history, exam, and ≥2 semen
   analyses

2. Abnormal semen or clinical concern → endocrine workup (testosterone, FSH; add LH,
   prolactin, estradiol as indicated)

3. Azoospermia:
   • Low volume + absent fructose → consider ejaculatory duct obstruction / CBAVD
     (test for CFTR mutations; offer genetic counseling)
   • Normal volume → distinguish obstructive vs. non-obstructive (FSH, testis size);
     karyotype + Y-chromosome microdeletion testing for non-obstructive azoospermia
     or severe oligospermia

4. Identify & treat reversible causes: varicocele (repair if palpable + abnormal
   semen + otherwise unexplained infertility), endocrinopathy, gonadotoxin exposure,
   medications

5. Sperm retrieval (TESE/micro-TESE) + ART/ICSI for non-obstructive azoospermia or when
   correction is not feasible

6. Malignancy vigilance: azoospermia/severe oligospermia and testicular findings raise
   risk of testis cancer and, rarely, serious underlying disease — evaluate accordingly
    `,
    sections: [
      {
        title: 'Evaluation',
        steps: [
          {
            label: 'Core workup',
            description:
              'Evaluate the male partner with a reproductive history, physical exam, and at least two semen analyses. Abnormal parameters or clinical findings prompt an endocrine evaluation (testosterone and FSH, with LH, prolactin, and estradiol as indicated).',
            source: {
              label: 'AUA/ASRM Male Infertility Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-infertility',
            },
          },
          {
            label: 'Azoospermia & genetics',
            description:
              'Low-volume azoospermia with absent fructose suggests ejaculatory duct obstruction or congenital absence of the vas (test for CFTR mutations). Non-obstructive azoospermia or severe oligospermia warrants karyotype and Y-chromosome microdeletion testing with genetic counseling.',
            source: {
              label: 'AUA/ASRM Male Infertility Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-infertility',
            },
          },
        ],
      },
      {
        title: 'Management',
        steps: [
          {
            label: 'Treat reversible causes',
            description:
              'Repair clinically palpable varicoceles when semen parameters are abnormal and infertility is otherwise unexplained; correct endocrinopathies and remove gonadotoxin/medication exposures where possible.',
            source: {
              label: 'AUA/ASRM Male Infertility Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-infertility',
            },
          },
          {
            label: 'Sperm retrieval & ART',
            description:
              'For non-obstructive azoospermia or when correction is not feasible, surgical sperm retrieval (including micro-TESE) combined with assisted reproduction (ICSI) offers the chance of biological paternity.',
            source: {
              label: 'AUA/ASRM Male Infertility Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/male-infertility',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'vasectomy',
    title: 'Vasectomy',
    condition: 'Male permanent contraception: technique and follow-up',
    eauUrl: 'https://uroweb.org/guidelines/sexual-and-reproductive-health',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/vasectomy-guideline',
    pdfUrl: '/guidelines/non-oncology/vasectomy.pdf',
    quickAlgorithm: `
1. Counsel: vasectomy is intended to be permanent; discuss alternatives, ~small failure
   rate, and that it does not protect against STIs

2. No routine pre-op labs or contralateral testis imaging needed for standard cases

3. Technique:
   • Isolate the vas using a minimally invasive (no-scalpel) approach — fewer
     complications than conventional incision
   • Occlude with an effective method: mucosal cautery + fascial interposition is
     among the most reliable

4. Continue other contraception until post-vasectomy semen analysis (PVSA) confirms
   success

5. PVSA at ~8–16 weeks: success = azoospermia OR rare non-motile sperm (RNMS) at a
   low threshold. Persistent motile sperm → repeat/consider failure

6. Manage post-op issues: hematoma, infection, and post-vasectomy pain syndrome
   (counsel pre-op)
    `,
    sections: [
      {
        title: 'Counseling & technique',
        steps: [
          {
            label: 'Pre-procedure counseling',
            description:
              'Counsel that vasectomy is intended to be permanent, carries a small failure rate, and does not prevent sexually transmitted infections. Routine preoperative laboratory testing and contralateral testicular imaging are not required for standard cases.',
            source: {
              label: 'AUA Vasectomy Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/vasectomy-guideline',
            },
          },
          {
            label: 'Isolation & occlusion',
            description:
              'A minimally invasive (no-scalpel) vas isolation technique reduces complications compared with conventional incision. Effective occlusion — such as mucosal cautery combined with fascial interposition — provides among the lowest failure rates.',
            source: {
              label: 'AUA Vasectomy Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/vasectomy-guideline',
            },
          },
        ],
      },
      {
        title: 'Confirming success',
        steps: [
          {
            label: 'Post-vasectomy semen analysis',
            description:
              'Patients must use other contraception until success is confirmed. Obtain a post-vasectomy semen analysis around 8–16 weeks; success is defined as azoospermia or rare non-motile sperm at a low threshold. Persistent motile sperm indicates the procedure has not yet succeeded.',
            source: {
              label: 'AUA Vasectomy Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/vasectomy-guideline',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'cryptorchidism',
    title: 'Cryptorchidism (undescended testis)',
    condition: 'Pediatric undescended testis: evaluation and orchiopexy',
    eauUrl: 'https://uroweb.org/guidelines/paediatric-urology',
    auaUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines/cryptorchidism-guideline',
    pdfUrl: '/guidelines/non-oncology/cryptorchidism.pdf',
    quickAlgorithm: `
1. Diagnose clinically — do NOT order routine ultrasound to locate a non-palpable
   testis (it does not reliably change management)

2. Refer promptly if the testis is not descended by ~6 months (corrected age);
   spontaneous descent is unlikely after this

3. Palpable undescended testis → scrotal or inguinal orchiopexy, ideally by ~6–18
   months of age

4. Non-palpable testis → examination under anesthesia + diagnostic laparoscopy to
   locate; orchiopexy (staged if needed) or removal of a nubbin/atrophic testis

5. Bilateral non-palpable testes (especially with hypospadias) → evaluate for a
   disorder of sexual development before surgery (karyotype, hormonal testing)

6. Counsel: undescended testis is associated with reduced fertility potential and a
   higher relative risk of testicular malignancy; orchiopexy improves examinability
    `,
    sections: [
      {
        title: 'Evaluation',
        steps: [
          {
            label: 'No routine imaging',
            description:
              'Ultrasound and other imaging do not reliably localize a non-palpable testis or change management, so routine imaging is not recommended. Diagnosis and localization are clinical, with examination under anesthesia and laparoscopy for non-palpable cases.',
            source: {
              label: 'AUA Cryptorchidism Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/cryptorchidism-guideline',
            },
          },
          {
            label: 'DSD evaluation',
            description:
              'Bilateral non-palpable testes, particularly with hypospadias, require evaluation for a disorder of sexual development (karyotype and hormonal testing) before surgical management.',
            source: {
              label: 'AUA Cryptorchidism Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/cryptorchidism-guideline',
            },
          },
        ],
      },
      {
        title: 'Management',
        steps: [
          {
            label: 'Timing of orchiopexy',
            description:
              'Refer if the testis has not descended by about six months of corrected age, since spontaneous descent becomes unlikely. Orchiopexy is ideally performed by 6–18 months to optimize outcomes.',
            source: {
              label: 'AUA Cryptorchidism Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/cryptorchidism-guideline',
            },
          },
          {
            label: 'Long-term counseling',
            description:
              'Counsel families that an undescended testis is associated with reduced fertility potential and an increased relative risk of testicular malignancy; orchiopexy places the testis in a palpable position for future self-examination.',
            source: {
              label: 'AUA Cryptorchidism Guideline',
              url: 'https://www.auanet.org/guidelines-and-quality/guidelines/cryptorchidism-guideline',
            },
          },
        ],
      },
    ],
  },
];
