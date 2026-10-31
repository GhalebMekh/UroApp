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

/*
 * The scenarios below follow the matching procedure in procedures.ts: the
 * guideline-level decisions from AUA/EAU, the intra-operative detail (danger
 * zones and bailouts) from the Campbell-Walsh-Wein chapter cited there. Both
 * are named in each node's source label; the link goes to the guideline.
 */

const AUA_BPH_CWW = {
  label: 'AUA BPH Guideline · Campbell-Walsh-Wein 12th ed, ch 146 (TURP)',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
};

const turp: Scenario = {
  id: 'turp',
  title: 'TURP — bleeding, orifices and fluid absorption',
  procedureId: 'turp',
  vignette:
    'A 72-year-old man with BPH has failed a trial without catheter despite an alpha-blocker. Transrectal ultrasound shows a large gland with a prominent median lobe. He is having a monopolar TURP under spinal anaesthesia.',
  nodes: [
    {
      id: 'setup',
      situation: 'The scrub nurse asks which irrigant to hang and how high, for the monopolar resectoscope.',
      question: 'What do you ask for?',
      choices: [
        {
          text: 'Glycine (or water), hung about 60 cm above the patient.',
          correct: true,
          outcome:
            'Correct. Monopolar diathermy needs a non-conducting irrigant (saline is for bipolar). Height drives absorption — each extra 10 cm above about 60 cm more than doubles it.',
        },
        {
          text: 'Normal saline, hung as high as the stand allows for the best view.',
          correct: false,
          outcome:
            'Wrong on both counts. Match the irrigant to the energy: saline is for bipolar, glycine or water for monopolar. And a high bag pushes far more fluid into open venous sinuses.',
        },
      ],
      source: AUA_BPH_CWW,
    },
    {
      id: 'orifices',
      situation: 'The median lobe is large and sits high; you cannot see either ureteric orifice from the bladder neck.',
      question: 'How do you start?',
      choices: [
        {
          text: 'Look again with a 70° lens; if they stay hidden, start in the midline and take the median lobe down first.',
          correct: true,
          outcome:
            'Correct. Identify the orifices before resecting (70° lens, intravenous dye). If still hidden, resecting the median lobe in the midline first usually brings them into view once its bulk is gone.',
        },
        {
          text: 'Start at the 5 and 7 o’clock positions at the bladder neck as usual.',
          correct: false,
          terminal: true,
          outcome:
            'A large median lobe or high bladder neck hides the orifices, and resecting blind at the lateral bladder neck can take an orifice with it. — Case ends here for review.',
        },
      ],
      source: AUA_BPH_CWW,
    },
    {
      id: 'tur-syndrome',
      situation:
        'Seventy minutes in, a venous sinus has been opened near the capsule. The awake patient becomes confused and nauseated, says his vision is blurred, and is hypertensive with a falling heart rate.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Finish promptly, secure haemostasis, and check the serum sodium; treat neurological signs with slow correction using hypertonic saline.',
          correct: true,
          outcome:
            'Correct. This is TUR syndrome from irrigant absorption through open sinuses. Stop the exposure, control bleeding (an over-inflated catheter balloon on traction tamponades venous bleeding), and check sodium — below 120 mmol/L risks seizures.',
        },
        {
          text: 'Give more IV fluid for the bradycardia and keep resecting to finish the lobe.',
          correct: false,
          terminal: true,
          outcome:
            'Dangerous. Continuing resection keeps the sinuses open and absorption going, and more IV fluid worsens the overload and dilutional hyponatraemia. — Case ends here for review.',
        },
      ],
      source: AUA_BPH_CWW,
    },
    {
      id: 'apex',
      situation: 'Sodium is acceptable and the bleeding is controlled. Some apical tissue remains just beside the verumontanum.',
      question: 'How do you deal with the apex?',
      choices: [
        {
          text: 'Resect the apex last, in a dry field, staying proximal to the verumontanum — and accept leaving a little tissue.',
          correct: true,
          outcome:
            'Correct. The external sphincter lies distal to the verumontanum and tilts proximally anteriorly. A repeat resection later is far better than an incontinent patient.',
        },
        {
          text: 'Chase every last piece of apical tissue beyond the verumontanum for a complete channel.',
          correct: false,
          terminal: true,
          outcome:
            'Resecting distal to the verumontanum, especially anteriorly, injures the external sphincter and causes stress incontinence — and there is no bailout, only prevention. — Case ends here for review.',
        },
      ],
      source: AUA_BPH_CWW,
    },
  ],
  source: AUA_BPH_CWW,
};

const AUA_STONES = 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones';
const URS_SRC = { label: 'AUA Surgical Stones Guideline · Campbell-Walsh-Wein 12th ed, ch 94 (ureteroscopy)', url: AUA_STONES };
const PCNL_SRC = { label: 'AUA Surgical Stones Guideline · Campbell-Walsh-Wein 12th ed, ch 94 (PCNL)', url: AUA_STONES };

const urs: Scenario = {
  id: 'semi-rigid-urs',
  title: 'Semi-rigid URS — the scope that will not pass',
  procedureId: 'semi-rigid-urs',
  vignette:
    'A 45-year-old man has a 7 mm left mid-ureteric stone with persistent colic. His urine culture is negative and he has had prophylactic antibiotics. You are starting semi-rigid ureteroscopy.',
  nodes: [
    {
      id: 'safety-wire',
      situation: 'Cystoscopy shows a normal left orifice.',
      question: 'Before advancing the ureteroscope, what do you do?',
      choices: [
        {
          text: 'Pass a guidewire to the renal pelvis under fluoroscopy and keep it as a safety wire throughout.',
          correct: true,
          outcome:
            'Correct. A safety wire keeps access to the kidney if the ureter is injured, so a stent can always be placed.',
        },
        {
          text: 'Go straight up with the scope under vision — a wire just gets in the way.',
          correct: false,
          outcome:
            'Risky. Without a safety wire, a perforation or false passage can leave you unable to regain access or place a stent.',
        },
      ],
      source: URS_SRC,
    },
    {
      id: 'iliac-vessels',
      situation: 'At the level of the iliac vessels the scope meets firm resistance and will not advance.',
      question: 'What next?',
      choices: [
        {
          text: 'Do not force it: switch to a flexible ureteroscope over the wire, or leave a stent to dilate the ureter and come back.',
          correct: true,
          outcome:
            'Correct. In men a rigid scope often will not pass above the iliac vessels. Passive dilation with a stent and a staged return is a safe bailout.',
        },
        {
          text: 'Push harder with gentle rotation until it gives.',
          correct: false,
          terminal: true,
          outcome:
            'Forcing a rigid scope perforates the ureter or grips it (scabbard effect) so that it avulses on withdrawal. — Case ends here for review.',
        },
      ],
      source: URS_SRC,
    },
    {
      id: 'basket',
      situation: 'With a flexible scope you reach the stone. It is larger than the ureteric lumen around it.',
      question: 'How do you remove it?',
      choices: [
        {
          text: 'Fragment it with the laser first, then basket only small fragments under direct vision.',
          correct: true,
          outcome:
            'Correct. Basket only small stones under vision; fragment larger ones. If a basket ever gets trapped, release or dismantle it rather than pulling.',
        },
        {
          text: 'Basket it whole and pull it down steadily.',
          correct: false,
          terminal: true,
          outcome:
            'Pulling a stone too large for the lumen can avulse the ureter (0.06–0.5%), which then needs a nephrostomy and delayed reconstruction. — Case ends here for review.',
        },
      ],
      source: URS_SRC,
    },
    {
      id: 'stent',
      situation: 'The ureter is clear of fragments. On inspection there is no oedema, perforation or other injury.',
      question: 'Do you leave a stent?',
      choices: [
        {
          text: 'A stent may be omitted after this uncomplicated case — but image him afterwards.',
          correct: true,
          outcome:
            'Correct. After uncomplicated ureteroscopy a stent can be omitted. Image every patient afterwards, because post-ureteroscopy strictures (3–6%) can be silent.',
        },
        {
          text: 'Always stent after ureteroscopy, whatever the findings.',
          correct: false,
          outcome:
            'Not required. A stent is for oedema or injury; an uncomplicated case can safely go without one, sparing him stent symptoms (pain, frequency, haematuria).',
        },
      ],
      source: URS_SRC,
    },
  ],
  source: URS_SRC,
};

const pcnl: Scenario = {
  id: 'pcnl',
  title: 'PCNL — pus, bleeding and a breathless patient',
  procedureId: 'pcnl',
  vignette:
    'A 55-year-old woman has a 3 cm right renal pelvic stone. Her pre-operative urine culture was negative and she has had prophylactic antibiotics. She is prone under general anaesthesia with a retrograde ureteric catheter in place.',
  nodes: [
    {
      id: 'pus',
      situation: 'Your lower-pole puncture returns thick, purulent fluid instead of clear urine.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Stop: leave a nephrostomy to drain, send the fluid for culture, and treat the infection before any stone surgery.',
          correct: true,
          outcome:
            'Correct. Manipulating stones in an infected collecting system exposes the renal vasculature to infected urine and risks sepsis. Drain now, treat, and come back.',
        },
        {
          text: 'Wash it out and carry on with the stone — the antibiotics are already in.',
          correct: false,
          terminal: true,
          outcome:
            'Dangerous. An infected kidney gets drainage only; active untreated infection is a contraindication to PCNL, and proceeding invites severe sepsis. — Case ends here for review.',
        },
      ],
      source: PCNL_SRC,
    },
    {
      id: 'bleeding',
      situation:
        'Two weeks later, with the infection treated, you return. Midway through fragmentation, brisk bleeding fills the field and you cannot see.',
      question: 'What next?',
      choices: [
        {
          text: 'Stop, place a nephrostomy tube and clamp it; if bleeding continues, a tamponade balloon, then angiography.',
          correct: true,
          outcome:
            'Correct. Most bleeding is venous and settles with a clamped tube. Persistent bleeding needs a tamponade balloon and immediate angiography — an AV fistula or pseudoaneurysm (under 1%) is embolised; partial nephrectomy is the last resort.',
        },
        {
          text: 'Turn up the irrigation pressure and keep going to finish the stone.',
          correct: false,
          outcome:
            'Unsafe. Significant bleeding obscures vision and usually means stopping; higher pressure also drives fluid absorption and extravasation. Stage the procedure.',
        },
      ],
      source: PCNL_SRC,
    },
    {
      id: 'intraperitoneal',
      situation:
        'At a third session the case goes smoothly, but near the end the anaesthetist reports rising airway pressure, narrowing pulse pressure and a rising CVP. You suspect a perforation.',
      question: 'What are you worried about?',
      choices: [
        {
          text: 'Intraperitoneal irrigant from a collecting-system perforation — stop, leave a nephrostomy, and treat with diuresis or peritoneal drainage.',
          correct: true,
          outcome:
            'Correct. Intraperitoneal extravasation is the dangerous kind and hard to see with the patient prone. Diuresis, peritoneal drainage or, rarely, laparotomy.',
        },
        {
          text: 'A light anaesthetic — ask for more sedation and finish.',
          correct: false,
          terminal: true,
          outcome:
            'Missed diagnosis. These signs suggest intraperitoneal fluid; carrying on adds more. — Case ends here for review.',
        },
      ],
      source: PCNL_SRC,
    },
  ],
  source: PCNL_SRC,
};

const TORSION_SRC = {
  label: 'EAU Paediatric Urology Guideline · Campbell-Walsh-Wein 12th ed, ch 44',
  url: 'https://uroweb.org/guidelines/paediatric-urology',
};

const torsion: Scenario = {
  id: 'scrotal-exploration',
  title: 'Testicular torsion — exploration',
  procedureId: 'scrotal-exploration',
  vignette:
    'A 14-year-old boy woke 5 hours ago with sudden severe left scrotal pain and vomiting. The left testis is high-riding and horizontal and the cremasteric reflex is absent.',
  nodes: [
    {
      id: 'imaging',
      situation: 'The ED registrar suggests a Doppler ultrasound first; the scanner is free in about an hour.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Take him to theatre now for exploration — consent for possible orchiectomy and fixation of the other testis.',
          correct: true,
          outcome:
            'Correct. With a typical picture, do not delay surgery for imaging. Doppler sensitivity was only 63–90% in some series, and testis loss climbs with each hour (about 5% at 0–6 h, 20% at 7–12 h).',
        },
        {
          text: 'Wait for the Doppler — if flow is normal, he can be observed.',
          correct: false,
          terminal: true,
          outcome:
            'Normal flow does not exclude torsion when the story fits, and the wait costs testicular viability. — Case ends here for review.',
        },
      ],
      source: TORSION_SRC,
    },
    {
      id: 'viability',
      situation: 'The cord is twisted 540°. After untwisting, the testis is dark and you are unsure whether it will recover.',
      question: 'What now?',
      choices: [
        {
          text: 'Wrap it in warm saline gauze, fix the other testis first, then re-examine it.',
          correct: true,
          outcome:
            'Correct. Viability judged straight after untwisting is unreliable. Using the wait to fix the contralateral side gives the testis time to declare itself.',
        },
        {
          text: 'Remove it straight away — it looks dark.',
          correct: false,
          outcome:
            'Premature. Colour immediately after detorsion is unreliable; give it time under warm gauze before deciding.',
        },
      ],
      source: TORSION_SRC,
    },
    {
      id: 'tense',
      situation: 'On re-examination the colour has partly improved, but the testis is tense and congested.',
      question: 'What can you do?',
      choices: [
        {
          text: 'Incise the tunica albuginea and patch the defect with a vascularised tunica vaginalis flap, then fix it.',
          correct: true,
          outcome:
            'Correct. A tense testis may stay ischaemic from compartment syndrome; decompression with a tunica vaginalis flap rescued 55% of testes judged unsalvageable in one series (long-term data lacking).',
        },
        {
          text: 'Close over it and hope for the best.',
          correct: false,
          outcome:
            'A tensely congested testis can stay ischaemic after untwisting; decompression is an option worth considering before closing.',
        },
      ],
      source: TORSION_SRC,
    },
    {
      id: 'contralateral',
      situation: 'You have kept the left testis. A trainee asks whether the right side really needs fixing too.',
      question: 'What do you answer?',
      choices: [
        {
          text: 'Yes — fix the contralateral testis with non-absorbable sutures at the same operation.',
          correct: true,
          outcome:
            'Correct. The other testis can twist later (metachronous torsion), so it is fixed at the same operation. Non-absorbable sutures guard against retorsion from suture failure.',
        },
        {
          text: 'No — only fix the side that twisted, with absorbable sutures.',
          correct: false,
          terminal: true,
          outcome:
            'This leaves him at risk of metachronous torsion of his only healthy testis, and absorbable sutures can fail. — Case ends here for review.',
        },
      ],
      source: TORSION_SRC,
    },
  ],
  source: TORSION_SRC,
};

export const SCENARIOS: Scenario[] = [turbt, turp, urs, pcnl, torsion];
