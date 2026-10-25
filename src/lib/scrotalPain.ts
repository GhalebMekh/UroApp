/**
 * Acute scrotum in children — Campbell-Walsh-Wein 12th ed, ch 44 (Palmer &
 * Palmer).
 *
 * Risk of orchiectomy by hours from pain onset, pooled by Visser & Heyns
 * (BJU Int 2003; PMID 12887467) from published series of 1140 patients, as
 * quoted in that chapter: ≈5% at 0–6 h, 20% at 7–12 h, 40% at 13–18 h, 60% at
 * 19–24 h, 80% beyond 24 h and 90% beyond 48 h. Delayed atrophy after
 * orchidopexy: < 10% under 12 h, 40% at 12–24 h, 75% beyond 24 h.
 */
import type { RiskBand } from '@/components/calculators/primitives';

export interface TorsionRisk {
  window: string;
  orchiectomyPct: number;
  /** Atrophy of a testis kept after detorsion, where the source gives it. */
  atrophy: string;
  band: RiskBand;
}

export function torsionRiskByHours(hours: number): TorsionRisk | null {
  if (!Number.isFinite(hours) || hours < 0) return null;
  if (hours <= 6) return { window: '0–6 h', orchiectomyPct: 5, atrophy: '< 10%', band: 'moderate' };
  if (hours <= 12) return { window: '7–12 h', orchiectomyPct: 20, atrophy: '< 10% (under 12 h)', band: 'high' };
  if (hours <= 18) return { window: '13–18 h', orchiectomyPct: 40, atrophy: '40% (12–24 h)', band: 'high' };
  if (hours <= 24) return { window: '19–24 h', orchiectomyPct: 60, atrophy: '40% (12–24 h)', band: 'high' };
  if (hours <= 48) return { window: '> 24 h', orchiectomyPct: 80, atrophy: '75%', band: 'high' };
  return { window: '> 48 h', orchiectomyPct: 90, atrophy: '75%', band: 'high' };
}
