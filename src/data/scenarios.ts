/**
 * Branching intra-operative decision scenarios.
 *
 * Each node's guideline-preferred ("correct") choice is summarised in our own
 * words from the cited guideline (CLAUDE.md — no content from memory, one
 * procedure at a time from a named source). Wrong choices describe the
 * clinically established consequence; some end the case ("terminal") so a
 * dangerous decision has a visible outcome. Decision support / education only.
 */

export interface ScenarioChoice {
  text: string;
  /** The guideline-preferred action. */
  correct: boolean;
  /** A wrong choice that ends the case badly (shown, then restart). */
  terminal?: boolean;
  /** Feedback shown after the choice — why it is right or wrong. */
  outcome: string;
}

export interface ScenarioNode {
  id: string;
  /** The evolving intra-operative situation. */
  situation: string;
  question: string;
  choices: ScenarioChoice[];
  source: { label: string; url: string };
}

export interface Scenario {
  id: string;
  title: string;
  /** Links to a procedure in procedures.ts where one exists. */
  procedureId?: string;
  vignette: string;
  nodes: ScenarioNode[];
  source: { label: string; url: string };
}

const AUA_NMIBC = {
  label: 'AUA Non-Muscle-Invasive Bladder Cancer Guideline',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
};

const turbt: Scenario = {
  id: 'turbt',
  title: 'TURBT — first-time bladder tumour',
  procedureId: 'turbt',
  vignette:
    'A 68-year-old man presents with painless visible haematuria and no prior urological history. Flexible cystoscopy showed a single ~3 cm papillary tumour on the posterior bladder wall. He is booked for transurethral resection of the bladder tumour (TURBT) under general anaesthesia.',
  nodes: [
    {
      id: 'blue-light',
      situation:
        'You are set up to begin. Photodynamic (blue-light) cystoscopy is available in theatre and the patient has received intravesical hexaminolevulinate.',
      question: 'How do you inspect the bladder?',
      choices: [
        {
          text: 'Use blue-light (enhanced) cystoscopy alongside white light.',
          correct: true,
          outcome:
            'Correct. Where it is available, AUA advises offering blue-light cystoscopy at TURBT to improve tumour detection and reduce recurrence — it helps reveal carcinoma in situ and satellite lesions that white light can miss.',
        },
        {
          text: "White-light cystoscopy only — blue light isn't needed for a visible papillary tumour.",
          correct: false,
          outcome:
            'Suboptimal. White light alone can miss flat CIS and small satellite lesions. AUA advises offering blue-light cystoscopy when available to increase detection and lower recurrence.',
        },
      ],
      source: AUA_NMIBC,
    },
    {
      id: 'resection-depth',
      situation: 'You resect the visible papillary tumour down to its base.',
      question: 'How do you complete the resection and send the specimen?',
      choices: [
        {
          text: 'Resect the tumour base separately, including the underlying detrusor (muscularis propria), and send it as a separate specimen.',
          correct: true,
          outcome:
            'Correct. Including detrusor muscle allows accurate T-staging. AUA calls for complete visual resection with muscle in the specimen when feasible — incomplete resection is a major driver of understaging and early recurrence.',
        },
        {
          text: 'Stop once the exophytic tumour is removed and send it all as one specimen.',
          correct: false,
          outcome:
            'Incomplete. Without detrusor in the base the tumour may be understaged and recurrence rises — tumour is seen at first surveillance in up to 45% after incomplete resection. Take a separate base specimen that includes muscle.',
        },
        {
          text: 'Fulgurate the base widely without taking a separate muscle sample.',
          correct: false,
          outcome:
            'This destroys the tissue needed for staging. Resect (do not simply fulgurate) a separate base specimen containing detrusor muscle.',
        },
      ],
      source: AUA_NMIBC,
    },
    {
      id: 'immediate-chemo',
      situation:
        'Resection is complete with good haemostasis and no sign of bladder perforation. The tumour looks intermediate-risk.',
      question: 'What do you do about a single immediate intravesical chemotherapy instillation?',
      choices: [
        {
          text: 'Give a single intravesical chemotherapy instillation (e.g. mitomycin) within 24 hours.',
          correct: true,
          outcome:
            'Correct. For low- or intermediate-risk disease AUA recommends a single post-operative intravesical chemotherapy instillation within 24 hours to reduce recurrence. Important exception: withhold it if you suspect a perforation or performed an extensive resection.',
        },
        {
          text: "Skip the instillation — it isn't worth it for a single tumour.",
          correct: false,
          outcome:
            'Missed opportunity. A single early instillation lowers recurrence in low/intermediate-risk NMIBC and is recommended within 24 hours when there is no perforation.',
        },
        {
          text: 'Give the instillation even though you now notice a likely perforation.',
          correct: false,
          terminal: true,
          outcome:
            'Dangerous. Intravesical chemotherapy through a perforation can extravasate and cause severe local and systemic toxicity. AUA specifically says not to give the post-operative instillation when perforation is suspected or the resection was extensive. — Case ends here for review.',
        },
      ],
      source: AUA_NMIBC,
    },
    {
      id: 'restaging',
      situation:
        'Final pathology returns high-grade T1 urothelial carcinoma, and muscularis propria is present in the specimen.',
      question: 'What is the next step?',
      choices: [
        {
          text: 'Arrange a repeat (restaging) TURBT within 6 weeks.',
          correct: true,
          outcome:
            'Correct. AUA strongly recommends a repeat TURBT within 6 weeks for T1 disease to remove residual tumour and reduce understaging before choosing intravesical therapy or cystectomy.',
        },
        {
          text: 'Proceed straight to an induction course of intravesical BCG without restaging.',
          correct: false,
          terminal: true,
          outcome:
            'Risky. A substantial share of T1 tumours are understaged; going straight to BCG can miss muscle-invasive disease. AUA recommends a repeat TURBT within 6 weeks first. — Case ends here for review.',
        },
        {
          text: 'Discharge with routine surveillance cystoscopy in 3 months.',
          correct: false,
          terminal: true,
          outcome:
            'Unsafe for high-grade T1. This delays detection of residual or understaged disease; a repeat TURBT within 6 weeks is indicated. — Case ends here for review.',
        },
      ],
      source: AUA_NMIBC,
    },
  ],
  source: AUA_NMIBC,
};

export const SCENARIOS: Scenario[] = [turbt];
