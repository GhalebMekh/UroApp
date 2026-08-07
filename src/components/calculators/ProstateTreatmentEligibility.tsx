import { useState } from 'react';
import { CalcCard, NumberField } from './primitives';
import { CITATIONS } from '@/data/citations';
import { prostateTreatmentEligibility } from '@/lib/prostateTreatmentEligibility';

export function ProstateTreatmentEligibility() {
  const [volumeMl, setVolumeMl] = useState<number | null>(null);
  const result = volumeMl !== null ? prostateTreatmentEligibility(volumeMl) : null;

  return (
    <CalcCard title="Prostate volume → BPH treatment" subtitle="Size-based treatment eligibility windows (EAU 2023)" citation={CITATIONS.prostateTreatment}>
      <NumberField
        label="Prostate volume (mL)"
        value={volumeMl !== null ? String(volumeMl) : ''}
        onChange={(v) => {
          const n = parseInt(v, 10);
          setVolumeMl(Number.isFinite(n) ? n : null);
        }}
      />

      {result && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold text-muted">Eligible treatments:</div>
          {result.recommendations.map((rec, i) => (
            <div key={i} className="rounded-[10px] border border-line bg-navy px-3 py-2 text-sm text-muted">
              • {rec}
            </div>
          ))}
          <div className="mt-3 rounded-[10px] border border-line bg-navy-2 p-2.5 text-xs text-muted-2">
            Medical (alpha/5-ARI): {result.eligible.medical ? '✓' : '✗'} | Rezum: {result.eligible.rezum ? '✓' : '✗'} |
            UroLift: {result.eligible.urolift ? '✓' : '✗'} | TURP: {result.eligible.turp ? '✓' : '✗'} |
            HoLEP: {result.eligible.holepAblation ? '✓' : '✗'} | Open RP: {result.eligible.openProstatectomy ? '✓' : '✗'}
          </div>
        </div>
      )}
    </CalcCard>
  );
}
