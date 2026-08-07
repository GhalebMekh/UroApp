import { useState } from 'react';
import { CalcCard, ResultRow, NumberField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';
import { pvrInterpretation } from '@/lib/pvrInterpretation';

const BAND_MAP: Record<string, RiskBand> = { normal: 'low', borderline: 'moderate', elevated: 'high' };

export function PvrInterpretation() {
  const [volumeMl, setVolumeMl] = useState<number | null>(null);
  const result = volumeMl !== null ? pvrInterpretation(volumeMl) : null;

  return (
    <CalcCard title="PVR Interpretation" subtitle="Post-void residual volume contextual guide" citation={CITATIONS.pvrInterpretation}>
      <NumberField
        label="Post-void residual (mL)"
        value={volumeMl !== null ? String(volumeMl) : ''}
        onChange={(v) => {
          const n = parseInt(v, 10);
          setVolumeMl(Number.isFinite(n) ? n : null);
        }}
      />

      {result && (
        <ResultRow
          score={`${result.volume} mL`}
          band={BAND_MAP[result.band] as RiskBand}
          caption={result.interpretation}
        />
      )}
    </CalcCard>
  );
}
