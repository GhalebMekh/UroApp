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
  /** Core = one problem at a time; advanced = complications that lead into each other. */
  level?: 'core' | 'advanced';
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

/* ── Advanced: multi-step cases where one problem leads to the next ── */

const NEPH_SRC = {
  label: 'AUA Renal Mass Guideline · Campbell-Walsh-Wein 12th ed, ch 102 (laparoscopic kidney surgery)',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
};

const lapNephrectomy: Scenario = {
  id: 'lap-nephrectomy-advanced',
  level: 'advanced',
  title: 'Laparoscopic radical nephrectomy — scars, a torn vein and a misfire',
  procedureId: 'lap-nephrectomy',
  vignette:
    'A 61-year-old obese man has a 9 cm right renal tumour with no venous thrombus. He had a midline laparotomy for a perforated ulcer years ago. Pre-operative CT shows two right renal arteries. You plan a transperitoneal laparoscopic radical nephrectomy.',
  nodes: [
    {
      id: 'access',
      situation: 'He is in the modified flank position. The midline scar runs through the umbilicus.',
      question: 'How do you get into the abdomen?',
      choices: [
        {
          text: 'Open (Hasson) access away from the scar — or go retroperitoneal.',
          correct: true,
          outcome:
            'Correct. Most life-threatening vascular injuries, and about a third of bowel injuries, happen at Veress or first-trocar insertion. After previous surgery, enter away from scars with open access, or use the retroperitoneal route.',
        },
        {
          text: 'Veress needle at the umbilicus, as usual.',
          correct: false,
          terminal: true,
          outcome:
            'Blind entry through a scarred umbilicus risks bowel stuck to the wall and a great-vessel injury — the commonest moment for the worst complications of laparoscopy. — Case ends here for review.',
        },
      ],
      source: NEPH_SRC,
    },
    {
      id: 'gonadal-ivc',
      situation:
        'You lift the ureter and lower pole to work up towards the hilum. Dark blood wells up at the junction of the right gonadal vein and the IVC.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Press on it with gauze for several minutes; once a grasper controls the hole, clip or suture it.',
          correct: true,
          outcome:
            'Correct. The gonadal vein–IVC junction is weak and tears with traction on the lower pole. Pressure first, then a precise clip or suture under vision — never blindly.',
        },
        {
          text: 'Fire clips into the pool of blood where the bleeding seems to come from.',
          correct: false,
          terminal: true,
          outcome:
            'Blind clipping beside the cava can enlarge the tear or catch the IVC wall. Control and see before you clip. — Case ends here for review.',
        },
      ],
      source: NEPH_SRC,
    },
    {
      id: 'hilum',
      situation:
        'The bleeding is controlled. At the hilum you find both arteries and the renal vein; a plastic locking clip placed earlier sits on the vein near where you plan to staple.',
      question: 'How do you divide the hilum?',
      choices: [
        {
          text: 'Divide both arteries first, then the vein with the vascular stapler — placed clear of any clip.',
          correct: true,
          outcome:
            'Correct. Artery before vein. Stapling over a clip is a preventable cause of misfire, and plastic clips alone should never be used on the renal artery.',
        },
        {
          text: 'Plastic locking clips on both arteries and staple the vein across the existing clip to save time.',
          correct: false,
          outcome:
            'Two errors: plastic clips alone are not safe on the renal artery, and a stapler fired over a clip can misfire and leave part of the vessel open.',
        },
      ],
      source: NEPH_SRC,
    },
    {
      id: 'misfire',
      situation:
        'At the second artery the stapler fires incompletely, and brisk bleeding obscures the view. Suction is struggling to keep up.',
      question: 'What next?',
      choices: [
        {
          text: 'Make a small lower-midline incision, put a hand in to hold pressure, then suture or convert in a controlled way.',
          correct: true,
          outcome:
            'Correct. A hand through a small incision gives immediate tamponade and buys time to suture, or to convert without losing control.',
        },
        {
          text: 'Keep firing clips and staplers into the field until it stops.',
          correct: false,
          terminal: true,
          outcome:
            'Blind firing in a bloody field causes more vascular injury and can catch the IVC or the other vessels. — Case ends here for review.',
        },
      ],
      source: NEPH_SRC,
    },
    {
      id: 'before-closing',
      situation: 'The kidney is out in a bag. The field looks dry at the working pressure.',
      question: 'Before closing, what do you do?',
      choices: [
        {
          text: 'Lower the insufflation pressure and recheck the bed, adrenal, mesentery, gonadal vessels and ureteric stump.',
          correct: true,
          outcome: 'Correct. Pneumoperitoneum tamponades venous bleeding; lowering it unmasks bleeders before you leave.',
        },
        {
          text: 'Close — it is dry.',
          correct: false,
          outcome: 'Risky. Venous bleeding is often hidden by insufflation pressure and appears only once it is released.',
        },
      ],
      source: NEPH_SRC,
    },
    {
      id: 'day-two',
      situation:
        'On day 2 he has severe pain at one port site, a distending abdomen and a low-grade fever. His white count is low.',
      question: 'What do you suspect, and what do you do?',
      choices: [
        {
          text: 'An unrecognised bowel injury: CT with oral contrast, and usually exploration.',
          correct: true,
          outcome:
            'Correct. Port-site pain out of proportion, distension and a low white count are the pattern of an unrecognised bowel injury (0.1–0.8%, about 3% mortality); half are thermal injuries from energy devices out of view.',
        },
        {
          text: 'Post-operative ileus — nil by mouth and wait.',
          correct: false,
          terminal: true,
          outcome:
            'Waiting on this picture lets a bowel injury progress to peritonitis and sepsis. — Case ends here for review.',
        },
      ],
      source: NEPH_SRC,
    },
  ],
  source: NEPH_SRC,
};

const RPLND_SRC = {
  label: 'AUA Testicular Cancer Guideline · Campbell-Walsh-Wein 12th ed, ch 77 (surgery of testicular tumours)',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testicular-cancer-guideline',
};

const rplnd: Scenario = {
  id: 'pc-rplnd',
  level: 'advanced',
  title: 'Post-chemotherapy RPLND — bleomycin, lumbars and the left hilum',
  procedureId: 'rplnd',
  vignette:
    'A 27-year-old man with a left non-seminomatous germ cell tumour has finished bleomycin-based chemotherapy. His markers have normalised, but an 11 cm left para-aortic residual mass remains. He wants children in future. You plan a post-chemotherapy RPLND.',
  nodes: [
    {
      id: 'anaesthesia',
      situation: 'At the time-out the anaesthetist plans generous fluids and a high inspired oxygen for a long case.',
      question: 'What do you say?',
      choices: [
        {
          text: 'Flag the bleomycin: low inspired oxygen and conservative fluids — and confirm he banked sperm.',
          correct: true,
          outcome:
            'Correct. After bleomycin, lung toxicity is a real risk (about 11% vs 1.7% without it): keep inspired oxygen low and fluids conservative. Sperm banking should be offered to anyone who may want children.',
        },
        {
          text: 'Agree — a long retroperitoneal case needs plenty of fluid and oxygen.',
          correct: false,
          terminal: true,
          outcome:
            'High oxygen and liberal fluids after bleomycin risk serious pulmonary toxicity. — Case ends here for review.',
        },
      ],
      source: RPLND_SRC,
    },
    {
      id: 'lumbars',
      situation: 'You are about to roll the aorta to clear the nodes behind it. Near the IMA level the tissue is thick and fibrotic.',
      question: 'What do you do first?',
      choices: [
        {
          text: 'Find and doubly ligate each lumbar vessel before rolling — expecting a large common lumbar vein near the IMA.',
          correct: true,
          outcome:
            'Correct. There are about three pairs of lumbar arteries and variable lumbar veins, including a large common lumbar vein near the IMA level; torn while rolling, they bleed heavily.',
        },
        {
          text: 'Roll the aorta first and deal with lumbar bleeding if it happens.',
          correct: false,
          outcome:
            'Rolling first tears lumbar vessels, which retract and bleed in a deep, fibrotic field — far harder to control than ligating them up front.',
        },
      ],
      source: RPLND_SRC,
    },
    {
      id: 'nerves',
      situation: 'Left of the aorta, fine fibres run from under the left renal vein around the aorta towards the IMA.',
      question: 'How do you handle them?',
      choices: [
        {
          text: 'Identify and isolate them before splitting and rolling, then pass the node packet around them.',
          correct: true,
          outcome:
            'Correct. These are the left postganglionic sympathetic fibres; cutting them causes loss of antegrade ejaculation. Isolating them first is what makes the dissection nerve-sparing.',
        },
        {
          text: 'Take them with the packet — clearance matters more.',
          correct: false,
          outcome:
            'He wants children. Loss of antegrade ejaculation is avoidable with a nerve-sparing technique where it does not compromise the resection.',
        },
      ],
      source: RPLND_SRC,
    },
    {
      id: 'hilum',
      situation: 'The mass encases the left renal hilum. You were expecting this: a mass over 10 cm, left-sided.',
      question: 'What is your approach?',
      choices: [
        {
          text: 'Try to salvage the kidney, accepting nephrectomy only if the mass cannot be cleared — he was counselled for it.',
          correct: true,
          outcome:
            'Correct. Nephrectomy is needed in 5–31% of these cases, most strongly predicted by a mass over 10 cm, mostly left-sided. Save the kidney where possible, as he may need more cisplatin.',
        },
        {
          text: 'Remove the kidney routinely with the mass — it is simpler.',
          correct: false,
          outcome:
            'Routine nephrectomy removes renal reserve he may need for further cisplatin. Salvage the kidney where the resection allows.',
        },
      ],
      source: RPLND_SRC,
    },
    {
      id: 'chyle',
      situation:
        'At the top of the template, around the renal veins and behind the pancreas, milky fluid is collecting in the bed.',
      question: 'How do you prevent chylous ascites?',
      choices: [
        {
          text: 'Clip or suture the leaking lymphatics, inspect the bed, and plan a low-fat diet afterwards.',
          correct: true,
          outcome:
            'Correct. Unsecured lymphatics at the cephalad end and behind the duodenum and pancreas cause chyle leak (about 2%). Clip liberally at the top of the template and check the bed before closing.',
        },
        {
          text: 'Leave a suction drain and start a normal diet the next day.',
          correct: false,
          outcome:
            'A drain does not close the leak, and normal dietary fat increases chyle flow. Secure the lymphatics and use a low-fat diet.',
        },
      ],
      source: RPLND_SRC,
    },
  ],
  source: RPLND_SRC,
};

const flexUrs: Scenario = {
  id: 'flexible-urs-advanced',
  level: 'advanced',
  title: 'Flexible URS — tight ureter, dust, a trapped basket and a lost fragment',
  procedureId: 'flexible-urs',
  vignette:
    'A 50-year-old woman has a 1.6 cm right renal pelvic stone. Her urine culture is negative and she has had prophylactic antibiotics. You plan flexible ureteroscopy with laser lithotripsy through an access sheath.',
  nodes: [
    {
      id: 'sheath',
      situation: 'With the safety wire in place, the access sheath meets firm resistance in the mid ureter.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Stop: leave a stent and come back in a couple of weeks.',
          correct: true,
          outcome:
            'Correct. A forced sheath can split the ureter (perforation 0–4% in modern series). Pre-stenting a tight ureter and returning is the safe route.',
        },
        {
          text: 'Push the sheath through with steady pressure.',
          correct: false,
          terminal: true,
          outcome: 'Forcing the sheath risks ureteric perforation or worse. — Case ends here for review.',
        },
      ],
      source: URS_SRC,
    },
    {
      id: 'dust',
      situation:
        'Two weeks later the sheath passes easily. Dusting the large stone fills the pelvis with cloud and you can no longer see the stone or the wall.',
      question: 'How do you get your view back?',
      choices: [
        {
          text: 'Aspirate the irrigant through the scope to clear it — or stent and stage if it will not clear.',
          correct: true,
          outcome:
            'Correct. Dust hides fragments and the collecting-system wall, which invites perforation. Aspirate to clear the view, or stage the procedure.',
        },
        {
          text: 'Turn the irrigation pressure right up to wash the dust away.',
          correct: false,
          outcome:
            'High irrigation pressure can rupture a calyx. Clear the view by aspirating instead.',
        },
      ],
      source: URS_SRC,
    },
    {
      id: 'trapped-basket',
      situation:
        'Bringing a fragment down in a basket, it jams in the proximal ureter; the basket will not move up or down.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Release the fragment if you can; otherwise dismantle the basket and laser the fragment where it is.',
          correct: true,
          outcome:
            'Correct. The proximal third is the weakest part of the ureter. Never pull a trapped basket — release it, or dismantle it and fragment the stone in situ.',
        },
        {
          text: 'Pull firmly on the basket to bring it out.',
          correct: false,
          terminal: true,
          outcome:
            'Forceful traction can avulse the proximal ureter (0.06–0.5%), a catastrophic injury needing nephrostomy and delayed reconstruction. — Case ends here for review.',
        },
      ],
      source: URS_SRC,
    },
    {
      id: 'lost-fragment',
      situation:
        'Freeing the basket, you see a small perforation in the ureteric wall, and a fragment has gone out through it.',
      question: 'What now?',
      choices: [
        {
          text: 'Leave the fragment, stop the procedure, place a stent, give antibiotics, and tell her about it.',
          correct: true,
          outcome:
            'Correct. An extruded fragment is left alone: stop, stent, antibiotics and later imaging. Tell her, so it is not mistaken for a new stone on a future scan.',
        },
        {
          text: 'Follow the fragment through the perforation with the scope to retrieve it.',
          correct: false,
          terminal: true,
          outcome:
            'Chasing it widens the perforation and risks extravasation and a much larger injury. — Case ends here for review.',
        },
      ],
      source: URS_SRC,
    },
    {
      id: 'after',
      situation: 'The stent is in. She asks how long it stays and what happens next.',
      question: 'What is the plan?',
      choices: [
        {
          text: 'Stent for about 4 weeks, then imaging to confirm healing and drainage — and a later check for a silent stricture.',
          correct: true,
          outcome:
            'Correct. After a perforation, stent about 4 weeks and image afterwards. Image every patient after ureteroscopy — strictures (3–6%) can be silent.',
        },
        {
          text: 'Remove the stent in 3 days; no imaging needed if she feels well.',
          correct: false,
          outcome:
            'Too short after a perforation, and strictures can be silent — imaging is needed even when she feels well.',
        },
      ],
      source: URS_SRC,
    },
  ],
  source: URS_SRC,
};

const TURBT_CWW = {
  label: 'AUA NMIBC Guideline · Campbell-Walsh-Wein 12th ed, ch 138 (transurethral resection)',
  url: AUA_NMIBC.url,
};

const turbtAdvanced: Scenario = {
  id: 'turbt-advanced',
  level: 'advanced',
  title: 'Lateral-wall TURBT — obturator jerk, perforation and an orifice',
  procedureId: 'turbt',
  vignette:
    'A 70-year-old man has a 4 cm papillary tumour on the left lateral bladder wall and a second small tumour beside the right ureteric orifice. He is booked for TURBT; the anaesthetist offers spinal or general anaesthesia.',
  nodes: [
    {
      id: 'obturator-setup',
      situation: 'You are planning how to resect the lateral-wall tumour safely.',
      question: 'How do you set up?',
      choices: [
        {
          text: 'General anaesthesia with a muscle relaxant, bipolar resection if available, and only moderate bladder filling.',
          correct: true,
          outcome:
            'Correct. Diathermy on the lateral wall stimulates the obturator nerve; the leg adducts and drives the loop through the wall. A relaxant, bipolar current and limited distension all reduce the risk.',
        },
        {
          text: 'Spinal anaesthesia, monopolar loop, and a full bladder to flatten the wall.',
          correct: false,
          outcome:
            'Each choice raises the risk: no relaxant to block the reflex, monopolar current, and an overdistended, thinned wall that perforates more easily.',
        },
      ],
      source: TURBT_CWW,
    },
    {
      id: 'perforation',
      situation:
        'Despite this, the leg jerks during the deep resection. The bladder will no longer distend, you see a defect, and the abdomen is becoming distended.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Suspect intraperitoneal perforation: confirm with an on-table cystogram, then laparotomy — inspect the bowel, repair, catheter and drain.',
          correct: true,
          outcome:
            'Correct. Loss of distension, a visible defect and a distending abdomen suggest intraperitoneal perforation. It needs laparotomy, bowel inspection, repair, a catheter and a drain.',
        },
        {
          text: 'Leave a catheter on free drainage and observe overnight.',
          correct: false,
          terminal: true,
          outcome:
            'Catheter drainage is for extraperitoneal perforation. An intraperitoneal tear needs surgical repair, and the bowel may be injured. — Case ends here for review.',
        },
      ],
      source: TURBT_CWW,
    },
    {
      id: 'instillation',
      situation: 'After the repair, the nurse asks whether to give the single post-operative chemotherapy instillation.',
      question: 'What do you answer?',
      choices: [
        {
          text: 'No — withhold it because of the perforation.',
          correct: true,
          outcome:
            'Correct. The single instillation is withheld when perforation is suspected or the resection was extensive.',
        },
        {
          text: 'Yes — it reduces recurrence, so give it within 24 hours as usual.',
          correct: false,
          outcome:
            'It does reduce recurrence in suitable patients, but it is withheld when perforation is suspected or the resection was extensive.',
        },
      ],
      source: TURBT_CWW,
    },
    {
      id: 'orifice',
      situation: 'At a staged second session you resect the small tumour sitting at the right ureteric orifice.',
      question: 'How do you handle the orifice?',
      choices: [
        {
          text: 'Pure cutting current with quick strokes; consider a short-term stent if the resection was large or needed heavy cautery.',
          correct: true,
          outcome:
            'Correct. Coagulating over the orifice can seal it. Routine stenting is not needed (hydronephrosis in about 4%), but a short stent is reasonable after a large resection or heavy cautery.',
        },
        {
          text: 'Coagulate thoroughly over the orifice to make sure the base is dry.',
          correct: false,
          outcome: 'Heavy coagulation over the orifice can seal it and obstruct the kidney. Use cutting current and keep cautery to a minimum.',
        },
      ],
      source: TURBT_CWW,
    },
    {
      id: 'pathology',
      situation: 'Pathology from the lateral-wall tumour: high-grade T1, with no detrusor muscle in the specimen.',
      question: 'What is the plan?',
      choices: [
        {
          text: 'Repeat TURBT within 6 weeks; BCG only later — never immediately, and not with visible haematuria.',
          correct: true,
          outcome:
            'Correct. High-grade T1 without muscle needs restaging within 6 weeks. BCG waits 2–4 weeks after resection, and not while there is visible haematuria.',
        },
        {
          text: 'Start BCG next week — the tumour has been resected.',
          correct: false,
          terminal: true,
          outcome:
            'Without detrusor in the specimen the stage is uncertain and muscle-invasive disease may be missed. Restage first. — Case ends here for review.',
        },
      ],
      source: TURBT_CWW,
    },
  ],
  source: TURBT_CWW,
};

const RECON_SRC = {
  label: 'EAU Urological Trauma Guideline · Campbell-Walsh-Wein 12th ed, ch 89–90',
  url: 'https://uroweb.org/guidelines/urological-trauma',
};

const ureteralRepair: Scenario = {
  id: 'ureteral-repair-advanced',
  level: 'advanced',
  title: 'Ureteric injury at hysterectomy — climbing the reconstructive ladder',
  procedureId: 'ureteral-reconstruction',
  vignette:
    'You are called to theatre during an open hysterectomy for a large fibroid uterus. The gynaecologist has transected the left ureter low in the pelvis. The patient is stable, the bladder is of normal size, and there is no bowel injury.',
  nodes: [
    {
      id: 'tension',
      situation: 'After trimming to healthy, bleeding edges, the spatulated ends only meet if you pull them together.',
      question: 'How do you repair it?',
      choices: [
        {
          text: 'Abandon end-to-end repair: reimplant into the bladder, with a psoas hitch to bridge the gap.',
          correct: true,
          outcome:
            'Correct. A uretero-ureterostomy under tension almost always strictures. For a distal injury, a reimplant (adding up to about 5 cm with a hitch) is the next rung of the ladder.',
        },
        {
          text: 'Anastomose end to end anyway, over a stent — the stent will protect it.',
          correct: false,
          terminal: true,
          outcome: 'A stent does not compensate for tension; this repair will almost certainly stricture. — Case ends here for review.',
        },
      ],
      source: RECON_SRC,
    },
    {
      id: 'hitch',
      situation: 'The bladder dome does not quite reach the psoas above the iliac vessels.',
      question: 'How do you gain length?',
      choices: [
        {
          text: 'Divide the contralateral superior vesical pedicle, then place hitch sutures in psoas under vision, clear of the genitofemoral nerve.',
          correct: true,
          outcome:
            'Correct. Releasing the opposite pedicle mobilises the bladder. Sutures go into psoas and the psoas minor tendon, avoiding the genitofemoral nerve on its surface and the femoral nerve behind it.',
        },
        {
          text: 'Pull the bladder up harder and take deep bites in psoas to hold it.',
          correct: false,
          outcome:
            'Deep sutures risk the femoral nerve behind psoas, and more traction just adds tension. Release the contralateral pedicle instead.',
        },
      ],
      source: RECON_SRC,
    },
    {
      id: 'longer-defect',
      situation:
        'On closer inspection the devitalised segment is longer than expected and the gap now extends above the pelvic brim. The bladder has good capacity.',
      question: 'What do you add?',
      choices: [
        {
          text: 'A well-vascularised Boari flap combined with the psoas hitch.',
          correct: true,
          outcome:
            'Correct. A psoas hitch alone rarely reaches above the brim; a Boari flap bridges 10–15 cm. Raise it wide-based (≥4 cm), without tension — ischaemia or tension is the commonest cause of a recurrent stricture.',
        },
        {
          text: 'Raise a long, narrow flap to save bladder capacity.',
          correct: false,
          outcome:
            'A narrow flap is poorly vascularised and is the classic cause of flap stricture. The base should be at least 4 cm.',
        },
      ],
      source: RECON_SRC,
    },
    {
      id: 'tunnel',
      situation: 'You are ready to join the ureter to the flap.',
      question: 'Tunnelled or non-tunnelled?',
      choices: [
        {
          text: 'A long, non-tunnelled, widely spatulated, stented anastomosis.',
          correct: true,
          outcome:
            'Correct. After trauma, a tunnelled reimplant carries more risk of obstruction than a non-tunnelled one does of clinically important reflux; reflux is usually insignificant in adults.',
        },
        {
          text: 'A tunnelled antireflux reimplant, as in children.',
          correct: false,
          outcome: 'In this setting a tunnel raises the risk of obstruction, and reflux matters little in adults.',
        },
      ],
      source: RECON_SRC,
    },
    {
      id: 'leak',
      situation:
        'On day 3 the drain output is high and its creatinine is far above serum. The stent is in a good position on a plain film.',
      question: 'How do you manage the leak?',
      choices: [
        {
          text: 'Move the drain off the anastomosis and stop suction, keep the catheter in with an anticholinergic, and add a nephrostomy if it persists.',
          correct: true,
          outcome:
            'Correct. The drain comes off the anastomosis and suction stops; the catheter and an anticholinergic deal with reflux and spasm; a nephrostomy diverts urine if the leak continues.',
        },
        {
          text: 'Put the drain on stronger suction and remove the catheter to reduce spasm.',
          correct: false,
          outcome:
            'The opposite of what is advised: take suction off and move the drain away from the anastomosis, and keep the catheter in for reflux and spasm.',
        },
      ],
      source: RECON_SRC,
    },
  ],
  source: RECON_SRC,
};

const PEDS_PYELO_SRC = {
  label: 'EAU Paediatric Urology Guideline · Campbell-Walsh-Wein 12th ed, ch 42 (surgery of the ureter in children)',
  url: 'https://uroweb.org/guidelines/paediatric-urology',
};

const pyeloplasty: Scenario = {
  id: 'pyeloplasty-advanced',
  level: 'advanced',
  title: 'Laparoscopic pyeloplasty in a child — crossing vessel, tense pelvis and a kinked apex',
  procedureId: 'pyeloplasty',
  vignette:
    'A 9-year-old boy has intermittent left flank pain. Diuretic renography shows obstruction with falling differential function. He is booked for laparoscopic dismembered (Anderson-Hynes) pyeloplasty.',
  nodes: [
    {
      id: 'crossing-vessel',
      situation: 'You have exposed the PUJ. The lower pole has not been freed yet.',
      question: 'What do you do before dividing anything?',
      choices: [
        {
          text: 'Free the lower pole and look for a crossing vessel; if present, keep it and bring the new junction in front of it.',
          correct: true,
          outcome:
            'Correct. A lower-pole crossing vessel is a common cause in older children; a missed one leaves the obstruction in place. The vessel is preserved and the anastomosis placed anterior to it.',
        },
        {
          text: 'Divide the PUJ straight away — the stenosis is obvious.',
          correct: false,
          outcome: 'A missed crossing vessel can leave the obstruction in place even after a technically good anastomosis.',
        },
      ],
      source: PEDS_PYELO_SRC,
    },
    {
      id: 'tense-pelvis',
      situation: 'A crossing vessel is present and preserved. The pelvis is tensely distended and hard to handle.',
      question: 'What next?',
      choices: [
        {
          text: 'Place stay sutures, then decompress the pelvis with a 21G needle before dividing the PUJ.',
          correct: true,
          outcome: 'Correct. Decompressing first makes the pelvis manageable and avoids the temptation to over-reduce a tense pelvis.',
        },
        {
          text: 'Excise a large part of the pelvis to make it smaller.',
          correct: false,
          outcome: 'A tense pelvis tempts excessive reduction. Decompress it, then reduce only redundant pelvis.',
        },
      ],
      source: PEDS_PYELO_SRC,
    },
    {
      id: 'apex',
      situation:
        'While you sew the back wall, traction on the stay sutures holds everything in line. On relaxing them, the apex looks angulated.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Re-place the apex precisely with the stays relaxed; if short, mobilise the kidney or add a low horizontal pelvic incision.',
          correct: true,
          outcome:
            'Correct. Traction on stay sutures hides a kink that appears when released, and an imprecise or tense apex stenoses. Align it with the stays relaxed.',
        },
        {
          text: 'Accept it — the stent will keep it open.',
          correct: false,
          terminal: true,
          outcome: 'A kinked or tense apex stenoses after the stent comes out. — Case ends here for review.',
        },
      ],
      source: PEDS_PYELO_SRC,
    },
    {
      id: 'clot',
      situation: 'Before the last sutures, there is clot in the pelvis.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Irrigate the pelvis with saline, then place the stent and finish the anastomosis.',
          correct: true,
          outcome: 'Correct. Clot left in the pelvis can block the new junction in the early days.',
        },
        {
          text: 'Close — the clot will pass.',
          correct: false,
          outcome: 'Retained clot is a cause of early obstruction. Irrigate before completing the anastomosis.',
        },
      ],
      source: PEDS_PYELO_SRC,
    },
    {
      id: 'early-pain',
      situation:
        'With a double-J stent and the catheter removed on day 2, he develops flank pain and the ultrasound shows more dilation than before.',
      question: 'What is the most likely cause, and what do you do?',
      choices: [
        {
          text: 'Reflux up the stent or early oedema/clot: replace the bladder catheter; if it persists, a temporary nephrostomy.',
          correct: true,
          outcome:
            'Correct. Reflux up a double-J transmits bladder pressure (hence the catheter for 24–48 h). Early clot and oedema usually settle within days; a temporary nephrostomy helps if needed.',
        },
        {
          text: 'The pyeloplasty has failed — plan a redo now.',
          correct: false,
          outcome:
            'Too early to call failure: oedema and clot usually settle within days. Drain first; failure is judged later.',
        },
      ],
      source: PEDS_PYELO_SRC,
    },
  ],
  source: PEDS_PYELO_SRC,
};

const CYST_SRC = {
  label: 'AUA MIBC Guideline · Campbell-Walsh-Wein 12th ed, ch 138 (open and robotic cystectomy)',
  url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-metastatic-muscle-invasive-guideline',
};

const cystectomy: Scenario = {
  id: 'radical-cystectomy-advanced',
  level: 'advanced',
  title: 'Radical cystectomy after radiation — a frozen pelvis, the rectum and the urethral margin',
  procedureId: 'radical-cystectomy',
  vignette:
    'A 66-year-old man with muscle-invasive bladder cancer had pelvic radiotherapy for prostate cancer years ago. Staging CT shows localised disease. He wants an orthotopic neobladder if possible and has good erections. You are performing an open radical cystoprostatectomy.',
  nodes: [
    {
      id: 'prep',
      situation: 'On the ward the day before, the nurse asks about bowel preparation and stoma marking.',
      question: 'What do you order?',
      choices: [
        {
          text: 'No routine mechanical bowel prep; stoma marking anyway (sitting and standing); alvimopan before surgery; antibiotics within 1 hour of incision; thromboprophylaxis.',
          correct: true,
          outcome:
            'Correct. Routine bowel prep is not advised (especially with ileum only). Mark a stoma even when a neobladder is planned — he may end up with a conduit. Alvimopan speeds bowel recovery.',
        },
        {
          text: 'Three-day mechanical bowel prep; no stoma marking, since he is having a neobladder.',
          correct: false,
          outcome:
            'Bowel prep gave no benefit (and more prolonged ileus in one trial), and skipping stoma marking leaves you stuck if a neobladder becomes unsafe at surgery.',
        },
      ],
      source: CYST_SRC,
    },
    {
      id: 'rectal-plane',
      situation: 'Posteriorly, the plane between the prostate and rectum is obliterated by radiation fibrosis.',
      question: 'How do you develop it?',
      choices: [
        {
          text: 'Sharp dissection under direct vision, staying on the specimen, and shielding the rectum with a finger if you use a sealing device.',
          correct: true,
          outcome:
            'Correct. After radiation, blunt dissection can tear the rectum. Sharp dissection under vision maintains rectal integrity; heat from sealing devices can injure the rectum too.',
        },
        {
          text: 'Develop it bluntly with a finger, as in a non-irradiated pelvis.',
          correct: false,
          terminal: true,
          outcome: 'Blunt dissection in a fibrotic, irradiated plane is how rectal injuries happen. — Case ends here for review.',
        },
      ],
      source: CYST_SRC,
    },
    {
      id: 'rectal-injury',
      situation: 'Despite care, a small hole opens in the anterior rectal wall.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Repair it primarily, consider flap cover and/or a diverting stoma — especially in an irradiated field.',
          correct: true,
          outcome:
            'Correct. Rectal injury is treated with primary repair, with or without flap coverage and/or bowel diversion.',
        },
        {
          text: 'Leave it — it is small and will seal.',
          correct: false,
          terminal: true,
          outcome: 'A recognised rectal injury must be dealt with now: primary repair, with or without flap cover and/or diversion. — Case ends here for review.',
        },
      ],
      source: CYST_SRC,
    },
    {
      id: 'nerve-sparing',
      situation: 'Before the apical dissection, the trainee asks whether to spare the neurovascular bundles.',
      question: 'What do you weigh?',
      choices: [
        {
          text: 'Weigh his good erections against disease burden — results are modest (38% potent in one series), and non-nerve sparing is preferred for advanced disease.',
          correct: true,
          outcome:
            'Correct. Nerve sparing is done as in radical prostatectomy but function after cystectomy is worse; decide on preoperative function and disease burden.',
        },
        {
          text: 'Always nerve-spare — potency outcomes match prostatectomy.',
          correct: false,
          outcome:
            'They do not: only 38% were potent after nerve sparing in one series, and it is not chosen for advanced disease.',
        },
      ],
      source: CYST_SRC,
    },
    {
      id: 'urethral-margin',
      situation: 'You divide the urethra. The frozen section of the urethral margin shows carcinoma.',
      question: 'What diversion do you make?',
      choices: [
        {
          text: 'No neobladder: a cutaneous diversion (ileal conduit), as he was counselled.',
          correct: true,
          outcome:
            'Correct. A positive urethral margin rules out an orthotopic neobladder; this is why the possibility is raised before surgery and the stoma is marked.',
        },
        {
          text: 'Build the neobladder as planned — he wanted it.',
          correct: false,
          terminal: true,
          outcome: 'An orthotopic neobladder onto a urethra with cancer at the margin is contraindicated. — Case ends here for review.',
        },
      ],
      source: CYST_SRC,
    },
    {
      id: 'recovery',
      situation: 'On day 3 he is bloated with no flatus. He is on regular morphine.',
      question: 'How do you help his bowel recover?',
      choices: [
        {
          text: 'Cut opioids (paracetamol and ketorolac if allowed), continue alvimopan, anti-emetics, early feeding when not nauseated, keep walking — neostigmine with telemetry if needed.',
          correct: true,
          outcome:
            'Correct. Delayed bowel recovery is the commonest reason for a long stay. Opioid avoidance, alvimopan and early feeding are the core of enhanced recovery. No routine nasogastric tube.',
        },
        {
          text: 'Routine nasogastric tube on suction and keep him nil by mouth until he passes flatus.',
          correct: false,
          outcome:
            'Routine nasogastric suction is not needed unless consciousness or airway protection is a concern; reduce opioids and use the recovery measures instead.',
        },
      ],
      source: CYST_SRC,
    },
  ],
  source: CYST_SRC,
};

const PN_SRC = {
  label: 'AUA Renal Mass Guideline · Campbell-Walsh-Wein 12th ed, ch 101–102 (partial nephrectomy)',
  url: NEPH_SRC.url,
};

const partialNephrectomy: Scenario = {
  id: 'partial-nephrectomy-advanced',
  level: 'advanced',
  title: 'Partial nephrectomy in a solitary kidney — ischaemia, the collecting system and late bleeding',
  procedureId: 'partial-nephrectomy',
  vignette:
    'A 58-year-old woman has a solitary right kidney (the left was removed years ago) and a 5 cm central tumour near the hilum, abutting the collecting system. There is no venous thrombus or nodal disease. You plan an open partial nephrectomy.',
  nodes: [
    {
      id: 'ischaemia',
      situation: 'The tumour is too central for compression alone; you will need to clamp the hilum.',
      question: 'How do you protect the kidney?',
      choices: [
        {
          text: 'Mannitol and furosemide 15 minutes before clamping, then cool in ice slush to 20 °C (about 15 minutes) — aiming for under 35 minutes cold.',
          correct: true,
          outcome:
            'Correct. For a large or hilar tumour, cold ischaemia protects function: allow ~15 minutes to reach 20 °C, and aim for ~20 minutes warm or ~35 minutes cold at most. Expected cold ischaemia over 45 minutes would favour an extracorporeal approach.',
        },
        {
          text: 'Clamp warm and work as fast as possible — cooling just wastes time.',
          correct: false,
          outcome:
            'A complex central resection in a solitary kidney is unlikely to fit in 20 minutes of warm ischaemia; prolonged ischaemia is a key cause of acute renal failure after partial nephrectomy.',
        },
      ],
      source: PN_SRC,
    },
    {
      id: 'collecting',
      situation: 'The tumour is out. The base looks wet and you are not sure whether the collecting system has been opened.',
      question: 'What do you do?',
      choices: [
        {
          text: 'Occlude the ureter and inject dilute indigo carmine into the pelvis; close any defect with 4-0 absorbable suture.',
          correct: true,
          outcome:
            'Correct. 10–20 mL of dilute indigo carmine with the ureter occluded shows any leak, which is closed separately before the parenchyma.',
        },
        {
          text: 'Close the parenchyma over bolsters — that will seal any small leak.',
          correct: false,
          outcome:
            'An unrecognised collecting-system opening is the classic cause of a urinary fistula. Find it and close it first.',
        },
      ],
      source: PN_SRC,
    },
    {
      id: 'unclamp',
      situation: 'The defect is closed over bolsters with pledgeted mattress sutures. Both artery and vein are clamped.',
      question: 'How do you unclamp?',
      choices: [
        {
          text: 'Vein first, then the artery — then check for bleeding, ischaemia and urine leak.',
          correct: true,
          outcome: 'Correct. When both are clamped, the vein is released before the artery.',
        },
        {
          text: 'Artery first, then the vein.',
          correct: false,
          outcome: 'The recommended order is the reverse: vein first, then artery.',
        },
      ],
      source: PN_SRC,
    },
    {
      id: 'leak',
      situation:
        'On day 7 the drain output rises. Drain fluid creatinine is many times the serum level. She is well otherwise.',
      question: 'What is it, and how do you treat it?',
      choices: [
        {
          text: 'A urinary fistula: keep the drain, place a double-J stent after retrograde pyelography, and a urethral catheter.',
          correct: true,
          outcome:
            'Correct. Most fistulas present at about 1 week. "Three tubes" — drain, stent, catheter — keep the system at low pressure; most heal in 4–6 weeks without reoperation.',
        },
        {
          text: 'Take her back to theatre to re-suture the collecting system.',
          correct: false,
          outcome: 'Reoperation is rarely needed; conservative drainage heals most fistulas within 4–6 weeks.',
        },
      ],
      source: PN_SRC,
    },
    {
      id: 'haematuria',
      situation:
        'Three weeks after discharge she returns with heavy visible haematuria and a falling haemoglobin.',
      question: 'What do you suspect, and what do you do?',
      choices: [
        {
          text: 'A renal artery pseudoaneurysm: angiography and selective embolisation.',
          correct: true,
          outcome:
            'Correct. Pseudoaneurysm occurs in about 2% after partial nephrectomy, usually with visible haematuria within 30 days; almost all are treated by angiography and embolisation, saving the kidney.',
        },
        {
          text: 'Re-explore and convert to nephrectomy.',
          correct: false,
          terminal: true,
          outcome:
            'In a solitary kidney this means dialysis — and selective embolisation almost always works. — Case ends here for review.',
        },
      ],
      source: PN_SRC,
    },
  ],
  source: PN_SRC,
};

export const SCENARIOS: Scenario[] = [
  turbt,
  turp,
  urs,
  pcnl,
  torsion,
  lapNephrectomy,
  rplnd,
  flexUrs,
  turbtAdvanced,
  ureteralRepair,
  pyeloplasty,
  cystectomy,
  partialNephrectomy,
];
