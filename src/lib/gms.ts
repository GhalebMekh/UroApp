/**
 * GMS hypospadias score — Glans, Meatus, Shaft, each 1–4, total 3–12
 * (Merriman et al., J Pediatr Urol 2013; PMID 23683961).
 *
 * Component wording paraphrases the definitions table in the PREDICT-H protocol
 * (Abbas et al., 2025; PMID 40870940). Severity bands mild 3–6 / moderate 7–9 /
 * severe 10–12 are those of the 2026 systematic review (Choudhury et al.;
 * PMID 41958805). In the original series, complications occurred in 5.6% with
 * GMS ≤ 6 and in 25.0% above 6 (Merriman 2013 abstract). Scored at surgery:
 * Campbell ch 45 notes office assessment underestimates curvature.
 */
import type { RiskBand } from '@/components/calculators/primitives';

export type GmsPoint = 1 | 2 | 3 | 4;

export const GLANS: Record<GmsPoint, string> = {
  1: 'Good-sized glans; healthy, deeply grooved urethral plate',
  2: 'Adequate glans; adequate, grooved plate',
  3: 'Small glans; narrow plate with some fibrosis or flat areas',
  4: 'Very small glans; plate indistinct, very narrow or flat',
};

export const MEATUS: Record<GmsPoint, string> = {
  1: 'Glanular',
  2: 'Coronal sulcus',
  3: 'Mid or distal shaft',
  4: 'Proximal shaft or penoscrotal',
};

export const SHAFT: Record<GmsPoint, string> = {
  1: 'No chordee',
  2: 'Mild chordee (< 30°)',
  3: 'Moderate chordee (30–60°)',
  4: 'Severe chordee (> 60°)',
};

export type GmsSeverity = 'mild' | 'moderate' | 'severe';

export function gmsTotal(g: GmsPoint, m: GmsPoint, s: GmsPoint): number {
  return g + m + s;
}

export function gmsSeverity(total: number): GmsSeverity {
  if (total <= 6) return 'mild';
  if (total <= 9) return 'moderate';
  return 'severe';
}

export const SEVERITY_BAND: Record<GmsSeverity, RiskBand> = {
  mild: 'low',
  moderate: 'moderate',
  severe: 'high',
};
