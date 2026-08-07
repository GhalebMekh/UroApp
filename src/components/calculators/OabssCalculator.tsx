import { useState } from 'react';
import { CalcCard, ResultRow, NumberField } from './primitives';
import { CITATIONS } from '@/data/citations';
import { oabssScore, type OabssScores } from '@/lib/oabss';

export function OabssCalculator() {
  const [scores, setScores] = useState<OabssScores>({
    daytimeFreq: null,
    nocturia: null,
    urgency: null,
    urgencyIncontinence: null,
  });

  const result = oabssScore(scores);

  return (
    <CalcCard
      title="OABSS"
      subtitle="Overactive Bladder Symptom Score (4 questions)"
      citation={CITATIONS.oabss}
    >
      <NumberField
        label="Daytime frequency (0–2)"
        value={scores.daytimeFreq !== null ? String(scores.daytimeFreq) : ''}
        onChange={(v) => {
          const n = parseInt(v, 10);
          setScores((p) => ({ ...p, daytimeFreq: Number.isFinite(n) ? Math.min(n, 2) : null }));
        }}
      />
      <NumberField
        label="Nocturia (0–3)"
        value={scores.nocturia !== null ? String(scores.nocturia) : ''}
        onChange={(v) => {
          const n = parseInt(v, 10);
          setScores((p) => ({ ...p, nocturia: Number.isFinite(n) ? Math.min(n, 3) : null }));
        }}
      />
      <NumberField
        label="Urgency (0–5)"
        value={scores.urgency !== null ? String(scores.urgency) : ''}
        onChange={(v) => {
          const n = parseInt(v, 10);
          setScores((p) => ({ ...p, urgency: Number.isFinite(n) ? Math.min(n, 5) : null }));
        }}
      />
      <NumberField
        label="Urgency incontinence (0–5)"
        value={scores.urgencyIncontinence !== null ? String(scores.urgencyIncontinence) : ''}
        onChange={(v) => {
          const n = parseInt(v, 10);
          setScores((p) => ({ ...p, urgencyIncontinence: Number.isFinite(n) ? Math.min(n, 5) : null }));
        }}
      />

      <ResultRow
        score={result ? result.total : '—'}
        band={result?.band}
        caption={
          result
            ? result.band === 'low'
              ? 'Mild OAB symptoms (0–5)'
              : result.band === 'moderate'
                ? 'Moderate OAB symptoms (6–10)'
                : 'Severe OAB symptoms (11–15)'
            : 'Enter all four scores'
        }
      />
    </CalcCard>
  );
}
