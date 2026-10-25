/**
 * Urinary tract dilation (UTD) classification — Nguyen et al., J Pediatr Urol
 * 2014 (PMID 25435247), as set out in text in Campbell-Walsh-Wein 12th ed,
 * ch 22 (Herndon & Zee). The thresholds below come from that chapter's text,
 * not its figures:
 *
 *  Prenatal  A1  APD 4 to <7 mm before 28 weeks, or 7 to <10 mm from 28 weeks,
 *                with central calyceal dilation at most; everything else normal.
 *            A2–3 APD ≥7 mm (<28 wk) / ≥10 mm (≥28 wk), or any other abnormal
 *                parameter (peripheral calyces, parenchyma, ureter, bladder).
 *            Below 4 / 7 mm with nothing else is physiologic.
 *  Postnatal P1  APD 10 to <15 mm or central calyceal dilation.
 *            P2  APD ≥15 mm, peripheral calyceal or ureteral dilation.
 *            P3  as above with abnormal parenchyma or bladder.
 *            APD <10 mm with nothing else is non-pathologic.
 *
 * The highest-risk feature present decides the group.
 */
import type { RiskBand } from '@/components/calculators/primitives';

export type Calyces = 'none' | 'central' | 'peripheral';

export interface PrenatalInput {
  gaWeeks: number;
  apdMm: number;
  calyces: Calyces;
  /** Abnormal parenchymal thickness/appearance, dilated ureter, or abnormal bladder. */
  otherAbnormal: boolean;
}

export interface PostnatalInput {
  apdMm: number;
  calyces: Calyces;
  ureterDilated: boolean;
  /** Thinning, abnormal echogenicity, lost corticomedullary differentiation or cysts. */
  parenchymaAbnormal: boolean;
  bladderAbnormal: boolean;
}

export type PrenatalGroup = 'normal' | 'A1' | 'A2-3';
export type PostnatalGroup = 'normal' | 'P1' | 'P2' | 'P3';

export function classifyPrenatal(i: PrenatalInput): PrenatalGroup {
  const [low, high] = i.gaWeeks < 28 ? [4, 7] : [7, 10];
  if (i.otherAbnormal || i.calyces === 'peripheral' || i.apdMm >= high) return 'A2-3';
  if (i.apdMm >= low || i.calyces === 'central') return 'A1';
  return 'normal';
}

export function classifyPostnatal(i: PostnatalInput): PostnatalGroup {
  if (i.parenchymaAbnormal || i.bladderAbnormal) return 'P3';
  if (i.apdMm >= 15 || i.calyces === 'peripheral' || i.ureterDilated) return 'P2';
  if (i.apdMm >= 10 || i.calyces === 'central') return 'P1';
  return 'normal';
}

export interface UtdPlan {
  label: string;
  band: RiskBand;
  steps: string[];
}

/** Follow-up per group, worded from Campbell ch 22 (Herndon & Zee). */
export const PRENATAL_PLAN: Record<PrenatalGroup, UtdPlan> = {
  normal: {
    label: 'Physiologic renal pelvis',
    band: 'low',
    steps: ['APD below 4 mm before 28 weeks or below 7 mm after 28 weeks, with nothing else abnormal, is physiologic.'],
  },
  A1: {
    label: 'UTD A1 — low risk',
    band: 'moderate',
    steps: [
      'If found before 28 weeks, repeat the ultrasound after 32 weeks.',
      'Postnatal ultrasound after 48 hours of life.',
    ],
  },
  'A2-3': {
    label: 'UTD A2–3 — increased risk',
    band: 'high',
    steps: [
      'Serial prenatal ultrasound until delivery: the dilation can progress (changing the delivery plan) and a second anomaly is more likely.',
      'Postnatal ultrasound after 48 hours of life.',
      'Bilateral dilation of kidneys, ureters and bladder with reduced amniotic fluid suggests lower urinary tract obstruction (e.g. valves): decompress the bladder promptly after birth, start prophylaxis and evaluate early.',
    ],
  },
};

export const POSTNATAL_PLAN: Record<PostnatalGroup, UtdPlan> = {
  normal: {
    label: 'Non-pathologic dilation',
    band: 'low',
    steps: ['APD below 10 mm with no calyceal, ureteral, parenchymal or bladder abnormality.'],
  },
  P1: {
    label: 'UTD P1 — low risk (≈ SFU 2)',
    band: 'low',
    steps: [
      'Repeat ultrasound at 3–6 months of age.',
      'Antibiotic prophylaxis and VCUG are not recommended.',
      'Most resolve, usually by 4 years — but VUR can still be present (up to 31%), so counsel about febrile UTI.',
    ],
  },
  P2: {
    label: 'UTD P2 — intermediate risk (≈ SFU 3)',
    band: 'moderate',
    steps: [
      'Antibiotic prophylaxis and VCUG are at the physician’s discretion; decide with the family (UTI risk, chance of VUR, natural history).',
      'VCUG can be done as an outpatient with the first postnatal ultrasound visit.',
      'Renal scintigraphy is optional; many surgeons use it to assess function and drainage.',
    ],
  },
  P3: {
    label: 'UTD P3 — high risk (≈ SFU 4)',
    band: 'high',
    steps: [
      'Antibiotic prophylaxis, VCUG and MAG3 renogram are recommended.',
      'Second ultrasound at 1 month, which can be combined with the VCUG.',
      'If P3 persists, obtain a MAG3 renal scan (with VCUG if not yet done).',
      'Without VUR, prophylaxis can continue until UPJ surgery or 1 year of age — most UTIs occur in the first year.',
    ],
  },
};

/** The first postnatal scan is done after 48 hours, once early fluid shifts have settled. */
export const FIRST_POSTNATAL_SCAN_HOURS = 48;
