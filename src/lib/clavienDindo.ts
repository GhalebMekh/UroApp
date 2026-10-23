/**
 * Clavien–Dindo classification of surgical complications.
 *
 * PRIMARY SOURCE: Dindo D, Demartines N, Clavien PA. Classification of surgical
 * complications: a new proposal with evaluation in a cohort of 6336 patients
 * and results of a survey. Ann Surg 2004;240(2):205-13. PMID 15273542.
 * Grade definitions as reproduced in Campbell-Walsh-Wein ch. 20 (Complications
 * in Urology), which also notes the scale's limits: it grades the TREATMENT a
 * complication needed, not its severity as felt; it does not cover
 * intraoperative complications; and it may not suit paediatric urology.
 */

export type CdGrade = 'I' | 'II' | 'IIIa' | 'IIIb' | 'IVa' | 'IVb' | 'V';

export const CD_GRADES: CdGrade[] = ['I', 'II', 'IIIa', 'IIIb', 'IVa', 'IVb', 'V'];

/** Our own short wording of each grade. */
export const CD_DEFINITION: Record<CdGrade, string> = {
  I: 'Off the normal course, but no drugs or interventions beyond antiemetics, antipyretics, analgesics, diuretics, electrolytes or physiotherapy. Includes wound infections opened at the bedside.',
  II: 'Needed drugs beyond those allowed in grade I. Blood transfusion and total parenteral nutrition count here.',
  IIIa: 'Needed a surgical, endoscopic or radiological intervention — not under general anaesthesia.',
  IIIb: 'Needed a surgical, endoscopic or radiological intervention under general anaesthesia.',
  IVa: 'Life-threatening, needing IC/ICU care: single-organ dysfunction (including dialysis).',
  IVb: 'Life-threatening, needing IC/ICU care: multi-organ dysfunction.',
  V: 'Death of the patient.',
};

/** Short label for a dropdown. */
export const CD_SHORT: Record<CdGrade, string> = {
  I: 'I — no treatment beyond basic drugs',
  II: 'II — other drugs, transfusion or TPN',
  IIIa: 'IIIa — intervention, no GA',
  IIIb: 'IIIb — intervention under GA',
  IVa: 'IVa — ICU, single organ',
  IVb: 'IVb — ICU, multi-organ',
  V: 'V — death',
};

export interface CdAnswers {
  died: boolean;
  /** Life-threatening and managed in IC/ICU — includes brain haemorrhage, ischaemic stroke and subarachnoid haemorrhage, but NOT transient ischaemic attack. */
  icu: boolean;
  multiOrgan: boolean;
  /** Surgical, endoscopic or radiological intervention. */
  intervention: boolean;
  generalAnaesthesia: boolean;
  /** Drugs beyond the grade I list, blood transfusion, or TPN. */
  otherDrugs: boolean;
}

/**
 * Walks the scale from most to least severe, so the highest applicable grade
 * wins — the scale ranks by the most invasive treatment needed.
 */
export function gradeFromAnswers(a: CdAnswers): CdGrade {
  if (a.died) return 'V';
  if (a.icu) return a.multiOrgan ? 'IVb' : 'IVa';
  if (a.intervention) return a.generalAnaesthesia ? 'IIIb' : 'IIIa';
  if (a.otherDrugs) return 'II';
  return 'I';
}

/** Severity order, for sorting and "highest grade" summaries. */
export function cdRank(g: CdGrade): number {
  return CD_GRADES.indexOf(g);
}

/** "IIIb-d" when the complication is still present at discharge. */
export function cdLabel(g: CdGrade, disabilityAtDischarge: boolean): string {
  return disabilityAtDischarge ? `${g}-d` : g;
}

/** Colour band by position on the scale (an ordering, not a clinical cut-off). */
export function cdBand(g: CdGrade): 'low' | 'moderate' | 'high' {
  const r = cdRank(g);
  if (r <= 1) return 'low';
  if (r <= 3) return 'moderate';
  return 'high';
}

export function isCdGrade(v: unknown): v is CdGrade {
  return typeof v === 'string' && (CD_GRADES as string[]).includes(v);
}
