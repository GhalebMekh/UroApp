import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField, type RiskBand } from '@/components/calculators/primitives';
import { CITATIONS } from '@/data/citations';

interface Factor {
  key: string;
  label: string;
  points: number;
}

// TWIST factors and points (Barbosa 2013). Total 0–7.
const FACTORS: Factor[] = [
  { key: 'swelling', label: 'Testicular swelling', points: 2 },
  { key: 'hard', label: 'Hard testis', points: 2 },
  { key: 'highriding', label: 'High-riding testis', points: 1 },
  { key: 'cremasteric', label: 'Absent cremasteric reflex', points: 1 },
  { key: 'nausea', label: 'Nausea / vomiting', points: 1 },
];

function band(total: number): { band: RiskBand; label: string } {
  if (total <= 2) return { band: 'low', label: 'Low risk (0–2) — torsion unlikely; consider ruling out' };
  if (total <= 4) return { band: 'moderate', label: 'Intermediate (3–4) — ultrasound' };
  return { band: 'high', label: 'High risk (5–7) — urgent surgical exploration' };
}

/** TWIST score for suspected testicular torsion (Barbosa 2013). */
export function TwistScore() {
  const [state, setState] = useState<Record<string, boolean>>({});

  const total = FACTORS.reduce((sum, f) => sum + (state[f.key] ? f.points : 0), 0);
  const result = band(total);

  return (
    <CalcCard
      title="TWIST score"
      subtitle="Testicular Workup for Ischemia and Suspected Torsion"
      citation={CITATIONS.twist}
    >
      {FACTORS.map((f) => (
        <SegmentedField<'no' | 'yes'>
          key={f.key}
          label={`${f.label} (+${f.points})`}
          value={state[f.key] ? 'yes' : 'no'}
          onChange={(v) => setState((p) => ({ ...p, [f.key]: v === 'yes' }))}
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ]}
        />
      ))}

      <ResultRow score={total} band={result.band} caption={result.label} />

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        A high score supports urgent exploration without waiting for imaging; a low score helps rule
        torsion out. Clinical judgement overrides the score.
      </p>
    </CalcCard>
  );
}
