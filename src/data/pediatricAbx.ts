/**
 * Paediatric UTI antibiotic dosing — source: Saudi Pediatric Infectious
 * Diseases Society (SPIDS) community-acquired UTI guideline, Albarrak et al.,
 * Int J Pediatr Adolesc Med 2021;8(2):57-67 (doi 10.1016/j.ijpam.2021.03.001).
 * Doses transcribed from Table 4 (oral), Table 5 (IV) and §10.3.2 (prophylaxis).
 * Scope: children ≥ 3 months, uncomplicated community-acquired UTI, if the
 * isolate is susceptible. NOT for neonates/infants < 3 months or complicated UTI.
 * Per the clinical-safety rules: values are transcribed from the cited source,
 * never invented; the guideline does not list per-dose maxima, so none are shown.
 */
export type AbxCategory = 'oral' | 'iv' | 'prophylaxis';

export interface PedAbxDose {
  drug: string;
  category: AbxCategory;
  indication: string;
  route: string;
  /** mg/kg/day; a tuple is an inclusive range. */
  mgPerKgPerDay: number | [number, number];
  /** What the mg/kg refers to, when not the whole salt (e.g. "amoxicillin component"). */
  basis?: string;
  /** Divided doses per day (for the per-dose calculation). */
  dosesPerDay: number;
  /** Human-readable frequency. */
  frequency: string;
  note?: string;
  /** Source location within the SPIDS guideline. */
  source: string;
}

export const PED_ABX: PedAbxDose[] = [
  // ── Oral — SPIDS Table 4 (p.63) ──
  { drug: 'Amoxicillin', category: 'oral', indication: 'UTI (if susceptible)', route: 'PO', mgPerKgPerDay: 50, dosesPerDay: 3, frequency: 'divided q8h', source: 'SPIDS 2021, Table 4 (p.63)' },
  { drug: 'Amoxicillin-clavulanate', category: 'oral', indication: 'UTI · 1st-line oral', route: 'PO', mgPerKgPerDay: 45, basis: 'amoxicillin component', dosesPerDay: 3, frequency: 'divided q8h', source: 'SPIDS 2021, Table 4 (p.63)' },
  { drug: 'Co-trimoxazole', category: 'oral', indication: 'UTI (if susceptible)', route: 'PO', mgPerKgPerDay: 8, basis: 'trimethoprim component', dosesPerDay: 2, frequency: 'divided q12h', source: 'SPIDS 2021, Table 4 (p.63)' },
  { drug: 'Cefixime', category: 'oral', indication: 'UTI · oral alternative', route: 'PO', mgPerKgPerDay: 8, dosesPerDay: 1, frequency: 'once daily', source: 'SPIDS 2021, Table 4 (p.63)' },
  { drug: 'Cefuroxime', category: 'oral', indication: 'UTI · 1st-line oral', route: 'PO', mgPerKgPerDay: 30, dosesPerDay: 2, frequency: 'divided q12h', source: 'SPIDS 2021, Table 4 (p.63)' },
  { drug: 'Cefprozil', category: 'oral', indication: 'UTI · 1st-line oral', route: 'PO', mgPerKgPerDay: 30, dosesPerDay: 2, frequency: 'divided q12h', source: 'SPIDS 2021, Table 4 (p.63)' },
  { drug: 'Cephalexin', category: 'oral', indication: 'UTI · 1st-line oral', route: 'PO', mgPerKgPerDay: 50, dosesPerDay: 4, frequency: 'divided q6h', source: 'SPIDS 2021, Table 4 (p.63)' },
  { drug: 'Nitrofurantoin', category: 'oral', indication: 'Cystitis (lower UTI)', route: 'PO', mgPerKgPerDay: [5, 7], dosesPerDay: 4, frequency: 'divided q6h', source: 'SPIDS 2021, Table 4 (p.63)' },

  // ── Intravenous — SPIDS Table 5 (p.63) ──
  { drug: 'Ampicillin', category: 'iv', indication: 'UTI (if susceptible)', route: 'IV', mgPerKgPerDay: 200, dosesPerDay: 4, frequency: 'divided q6h', source: 'SPIDS 2021, Table 5 (p.63)' },
  { drug: 'Ceftriaxone', category: 'iv', indication: 'UTI · 1st-line inpatient', route: 'IV/IM', mgPerKgPerDay: [50, 75], dosesPerDay: 1, frequency: 'q24h', source: 'SPIDS 2021, Table 5 (p.63)' },
  { drug: 'Cefotaxime', category: 'iv', indication: 'UTI (if susceptible)', route: 'IV', mgPerKgPerDay: 150, dosesPerDay: 3, frequency: 'divided q8h', source: 'SPIDS 2021, Table 5 (p.63)' },
  { drug: 'Gentamicin', category: 'iv', indication: 'UTI · esp. prior ESBL', route: 'IV', mgPerKgPerDay: [5, 7.5], dosesPerDay: 1, frequency: 'once daily', note: 'Adjust subsequent doses to serum level (TDM).', source: 'SPIDS 2021, Table 5 (p.63)' },
  { drug: 'Amikacin', category: 'iv', indication: 'UTI · aminoglycoside option', route: 'IV', mgPerKgPerDay: 15, dosesPerDay: 1, frequency: 'once daily', note: 'Adjust subsequent doses to serum level (TDM).', source: 'SPIDS 2021, Table 5 (p.63)' },

  // ── Prophylaxis — SPIDS §10.3.2 (p.65), single daily dose ──
  { drug: 'Nitrofurantoin', category: 'prophylaxis', indication: 'UTI prophylaxis', route: 'PO', mgPerKgPerDay: [1, 2], dosesPerDay: 1, frequency: 'once daily', source: 'SPIDS 2021, §10.3.2 (p.65)' },
  { drug: 'Co-trimoxazole', category: 'prophylaxis', indication: 'UTI prophylaxis', route: 'PO', mgPerKgPerDay: 2, basis: 'trimethoprim component', dosesPerDay: 1, frequency: 'once daily', source: 'SPIDS 2021, §10.3.2 (p.65)' },
];
