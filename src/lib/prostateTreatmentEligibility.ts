/**
 * Prostate volume → BPH treatment eligibility windows (EAU 2021, signature Rezum feature).
 * Size-based mapping to surgical and medical options.
 */

export interface TreatmentEligibility {
  medical: boolean;
  rezum: boolean;
  urolift: boolean;
  turp: boolean;
  holepAblation: boolean;
  openProstatectomy: boolean;
}

export interface ProstateTreatmentResult {
  volumeMl: number;
  eligible: TreatmentEligibility;
  recommendations: string[];
}

export function prostateTreatmentEligibility(volumeMl: number): ProstateTreatmentResult {
  const eligible: TreatmentEligibility = {
    medical: volumeMl < 90,
    rezum: volumeMl >= 15 && volumeMl <= 80,
    urolift: volumeMl >= 20 && volumeMl <= 80,
    turp: volumeMl >= 15 && volumeMl <= 45,
    holepAblation: volumeMl > 45,
    openProstatectomy: volumeMl > 75,
  };

  const recommendations: string[] = [];
  if (eligible.medical) recommendations.push('Alpha-blocker ± 5-ARI (initial management)');
  if (eligible.rezum) recommendations.push('Rezum (transurethral water vapor thermal therapy)');
  if (eligible.urolift) recommendations.push('UroLift (minimally invasive urethral lift)');
  if (eligible.turp) recommendations.push('TURP (gold standard for 15–45 mL)');
  if (eligible.holepAblation) recommendations.push('HoLEP / bipolar TURP (for >45 mL)');
  if (eligible.openProstatectomy) recommendations.push('Open prostatectomy (for >75 mL with high morbidity)');

  return { volumeMl, eligible, recommendations };
}
