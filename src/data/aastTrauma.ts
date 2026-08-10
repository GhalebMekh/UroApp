/**
 * AAST Organ Injury Scale (OIS) for the genitourinary tract.
 *
 * Sources (CLAUDE.md: primary source + working link, no numbers from memory):
 *  - Kidney: 2018 REVISION — Kozar RA et al., J Trauma Acute Care Surg
 *    2018;85(6):1119-1122 (PMID 30462622). The 2018 revision supersedes the
 *    1989 Moore scale still printed in many textbooks: it removes "nonexpanding"
 *    as a qualifier and folds CT-diagnosed vascular injury and active bleeding
 *    into the grade.
 *  - Ureter / bladder / urethra: Moore EE et al., "Organ injury scaling III",
 *    J Trauma 1992;33(3):337-339 (PMID 1404499).
 *
 * Criteria are paraphrased, not reproduced verbatim, per the CLAUDE.md rule on
 * copyrighted guideline/staging tables. Numeric thresholds are preserved exactly.
 */
import { CITATIONS, type Citation } from '@/data/citations';

export type AastOrgan = 'kidney' | 'ureter' | 'bladder' | 'urethra';

export type AastGrade = 1 | 2 | 3 | 4 | 5;

export interface AastCriterion {
  /** Short label shown on the tappable row. */
  label: string;
  /** Optional qualifier shown under the label. */
  detail?: string;
}

export interface AastGradeEntry {
  grade: AastGrade;
  criteria: AastCriterion[];
  /**
   * What the grade typically implies for management. Decision support only —
   * haemodynamic status governs, not the grade.
   */
  implication: string;
}

export interface AastScale {
  organ: AastOrgan;
  label: string;
  /** Which scale/edition this is, shown under the organ heading. */
  edition: string;
  grades: AastGradeEntry[];
  /** Grading rules that apply across all grades for this organ. */
  rules: string[];
  citation: Citation;
}

/** Roman numerals for display — the AAST scale is always written I–V. */
export const ROMAN: Record<AastGrade, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

const KIDNEY: AastScale = {
  organ: 'kidney',
  label: 'Kidney',
  edition: 'AAST 2018 revision',
  citation: CITATIONS.aastKidney,
  rules: [
    'Grade on the highest of the imaging, operative or pathologic criteria.',
    'If more than one grade of injury is present, classify by the higher grade.',
    'Advance one grade for bilateral injuries, up to Grade III.',
    'Vascular injury = pseudoaneurysm or AV fistula: focal vascular contrast that fades on delayed imaging. Active bleeding increases in size or attenuation on the delayed phase.',
  ],
  grades: [
    {
      grade: 1,
      criteria: [
        { label: 'Subcapsular haematoma', detail: 'and/or parenchymal contusion, without laceration' },
      ],
      implication: 'Non-operative management. Observation and serial haemoglobin.',
    },
    {
      grade: 2,
      criteria: [
        { label: 'Perirenal haematoma confined to Gerota fascia' },
        { label: 'Parenchymal laceration ≤1 cm depth', detail: 'without urinary extravasation' },
      ],
      implication: 'Non-operative management in the stable patient.',
    },
    {
      grade: 3,
      criteria: [
        { label: 'Parenchymal laceration >1 cm depth', detail: 'without collecting-system rupture or urinary extravasation' },
        { label: 'Any injury with vascular injury or active bleeding contained within Gerota fascia' },
      ],
      implication: 'Usually non-operative if stable. Consider angioembolisation for ongoing bleeding; re-image if the course changes.',
    },
    {
      grade: 4,
      criteria: [
        { label: 'Laceration into the collecting system', detail: 'with urinary extravasation' },
        { label: 'Renal pelvis laceration and/or complete UPJ disruption' },
        { label: 'Segmental renal vein or artery injury' },
        { label: 'Active bleeding beyond Gerota fascia', detail: 'into the retroperitoneum or peritoneum' },
        { label: 'Segmental or complete infarction from vessel thrombosis', detail: 'without active bleeding' },
      ],
      implication: 'Most isolated extravasation still settles without surgery. Stent or drain for persistent urinary extravasation; embolise ongoing arterial bleeding. UPJ disruption needs repair.',
    },
    {
      grade: 5,
      criteria: [
        { label: 'Main renal artery or vein laceration, or avulsion of the hilum' },
        { label: 'Devascularised kidney with active bleeding' },
        { label: 'Shattered kidney', detail: 'with loss of identifiable parenchymal anatomy' },
      ],
      implication: 'Renal exploration is usually required, especially with haemodynamic instability or an expanding/pulsatile haematoma.',
    },
  ],
};

const URETER: AastScale = {
  organ: 'ureter',
  label: 'Ureter',
  edition: 'AAST (Moore 1992)',
  citation: CITATIONS.aastLowerGu,
  rules: [
    'Advance one grade for bilateral injuries up to Grade III.',
    'Haematuria is unreliable in ureteric injury and is often absent — a normal urinalysis does not exclude it.',
  ],
  grades: [
    {
      grade: 1,
      criteria: [{ label: 'Contusion or haematoma', detail: 'without devascularisation' }],
      implication: 'Observation; stent if there is any concern about viability.',
    },
    {
      grade: 2,
      criteria: [{ label: 'Laceration <50% of the circumference' }],
      implication: 'Primary repair over a stent, or stent alone for a small defect.',
    },
    {
      grade: 3,
      criteria: [{ label: 'Laceration ≥50% of the circumference' }],
      implication: 'Primary repair over a stent; debride to healthy tissue.',
    },
    {
      grade: 4,
      criteria: [{ label: 'Complete transection' }],
      implication: 'Tension-free spatulated anastomosis over a stent; reimplant if distal.',
    },
    {
      grade: 5,
      criteria: [{ label: 'Complete transection with extensive devascularisation' }],
      implication: 'Reconstruction — ureteroureterostomy, reimplant ± psoas hitch/Boari flap, or ileal substitution. Damage control with ligation plus nephrostomy if unstable.',
    },
  ],
};

const BLADDER: AastScale = {
  organ: 'bladder',
  label: 'Bladder',
  edition: 'AAST (Moore 1992)',
  citation: CITATIONS.aastLowerGu,
  rules: [
    'Advance one grade for multiple injuries up to Grade III.',
    'The intraperitoneal / extraperitoneal distinction drives management more than the grade number does.',
  ],
  grades: [
    {
      grade: 1,
      criteria: [
        { label: 'Contusion or intramural haematoma' },
        { label: 'Partial-thickness laceration' },
      ],
      implication: 'Catheter drainage alone.',
    },
    {
      grade: 2,
      criteria: [{ label: 'Extraperitoneal laceration <2 cm' }],
      implication: 'Catheter drainage; cystogram before removal.',
    },
    {
      grade: 3,
      criteria: [
        { label: 'Extraperitoneal laceration >2 cm' },
        { label: 'Intraperitoneal laceration <2 cm' },
      ],
      implication: 'Extraperitoneal: usually catheter drainage. Intraperitoneal: open repair.',
    },
    {
      grade: 4,
      criteria: [{ label: 'Intraperitoneal laceration >2 cm' }],
      implication: 'Open repair.',
    },
    {
      grade: 5,
      criteria: [
        { label: 'Laceration extending into the bladder neck or ureteric orifice (trigone)' },
      ],
      implication: 'Open repair. Bladder-neck involvement must be repaired to protect continence; check ureteric efflux and stent or reimplant if involved.',
    },
  ],
};

const URETHRA: AastScale = {
  organ: 'urethra',
  label: 'Urethra',
  edition: 'AAST (Moore 1992)',
  citation: CITATIONS.aastLowerGu,
  rules: [
    'Perform a retrograde urethrogram before catheterisation whenever urethral injury is suspected.',
    'Blood at the meatus, inability to void, or a high-riding prostate should stop you catheterising blindly.',
  ],
  grades: [
    {
      grade: 1,
      criteria: [{ label: 'Contusion', detail: 'blood at the meatus with normal urethrography' }],
      implication: 'Observation; catheter if voiding is impaired.',
    },
    {
      grade: 2,
      criteria: [{ label: 'Stretch injury', detail: 'elongation without extravasation' }],
      implication: 'Observation or gentle catheter drainage.',
    },
    {
      grade: 3,
      criteria: [{ label: 'Partial disruption', detail: 'extravasation with contrast still reaching the bladder' }],
      implication: 'Suprapubic or gently placed urethral catheter; most heal without early repair.',
    },
    {
      grade: 4,
      criteria: [{ label: 'Complete disruption, separation <2 cm', detail: 'extravasation with no contrast reaching the bladder' }],
      implication: 'Suprapubic diversion with delayed urethroplasty, or early endoscopic realignment.',
    },
    {
      grade: 5,
      criteria: [
        { label: 'Complete disruption, separation ≥2 cm' },
        { label: 'Extension into the prostate or vagina' },
      ],
      implication: 'Suprapubic diversion and delayed reconstruction. Associated rectal or vaginal injury needs immediate exploration.',
    },
  ],
};

export const AAST_SCALES: AastScale[] = [KIDNEY, URETER, BLADDER, URETHRA];

/** Risk banding for a grade — drives the low/moderate/high colour rule. */
export function gradeBand(grade: AastGrade): 'low' | 'moderate' | 'high' {
  if (grade <= 2) return 'low';
  if (grade === 3) return 'moderate';
  return 'high';
}
