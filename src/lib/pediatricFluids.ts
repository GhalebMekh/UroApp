/**
 * Paediatric maintenance IV fluids — Holliday-Segar (Pediatrics 1957).
 * 4-2-1 rule per hour; 100-50-20 mL/kg per day. Pure functions, no UI.
 */

export interface MaintenanceFluids {
  perHour: number; // mL/hr
  perDay: number; // mL/day
}

/** Holliday-Segar maintenance requirement for a given weight in kg. */
export function maintenanceFluids(weightKg: number): MaintenanceFluids | null {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;

  let perHour: number;
  if (weightKg <= 10) {
    perHour = 4 * weightKg;
  } else if (weightKg <= 20) {
    perHour = 40 + 2 * (weightKg - 10);
  } else {
    perHour = 60 + 1 * (weightKg - 20);
  }

  let perDay: number;
  if (weightKg <= 10) {
    perDay = 100 * weightKg;
  } else if (weightKg <= 20) {
    perDay = 1000 + 50 * (weightKg - 10);
  } else {
    perDay = 1500 + 20 * (weightKg - 20);
  }

  return { perHour, perDay };
}

/** Weight-based resuscitation bolus volume (mL) for a given mL/kg. */
export function bolusVolume(weightKg: number, mlPerKg: number): number | null {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  return weightKg * mlPerKg;
}
