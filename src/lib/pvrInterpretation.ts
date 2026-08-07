/**
 * PVR (post-void residual) contextual interpretation.
 * Contextual bands based on EAU/AUA LUTS guidelines.
 */

export type PvrBand = 'normal' | 'borderline' | 'elevated';

export interface PvrResult {
  volume: number;
  band: PvrBand;
  interpretation: string;
}

export function pvrInterpretation(volumeMl: number): PvrResult {
  let band: PvrBand;
  let interpretation: string;

  if (volumeMl < 50) {
    band = 'normal';
    interpretation = 'Normal — complete emptying';
  } else if (volumeMl < 100) {
    band = 'borderline';
    interpretation = 'Borderline — monitor for progression';
  } else {
    band = 'elevated';
    interpretation = 'Elevated — consider further evaluation';
  }

  return { volume: volumeMl, band, interpretation };
}
