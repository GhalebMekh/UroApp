import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField, SelectField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';

// CAPRA point assignments (Cooperberg 2005). Each axis maps a choice → points.
const PSA_OPTIONS = [
  { value: '0', label: '< 6 ng/mL' },
  { value: '1', label: '≥ 6 – 10' },
  { value: '2', label: '≥ 10 – 20' },
  { value: '3', label: '≥ 20 – 30' },
  { value: '4', label: '> 30' },
];

function band(total: number): { band: RiskBand; label: string } {
  if (total <= 2) return { band: 'low', label: 'Low risk (0–2)' };
  if (total <= 5) return { band: 'moderate', label: 'Intermediate risk (3–5)' };
  return { band: 'high', label: 'High risk (6–10)' };
}

interface State {
  age: number | null;
  psa: string;
  gleason: number | null;
  t: number | null;
  cores: number | null;
}

/** UCSF-CAPRA pre-treatment prostate cancer risk (Cooperberg 2005). */
export function CapraScore() {
  const [s, setS] = useState<State>({ age: null, psa: '', gleason: null, t: null, cores: null });

  const complete =
    s.age !== null && s.psa !== '' && s.gleason !== null && s.t !== null && s.cores !== null;
  const total = (s.age ?? 0) + Number(s.psa || 0) + (s.gleason ?? 0) + (s.t ?? 0) + (s.cores ?? 0);
  const result = complete ? band(total) : null;

  return (
    <CalcCard
      title="UCSF-CAPRA"
      subtitle="Pre-treatment prostate cancer risk — recurrence after local therapy"
      citation={CITATIONS.capra}
    >
      <SegmentedField<number>
        label="Age at diagnosis"
        value={s.age}
        onChange={(age) => setS((p) => ({ ...p, age }))}
        options={[
          { value: 0, label: '< 50' },
          { value: 1, label: '≥ 50' },
        ]}
      />
      <SelectField label="PSA at diagnosis" value={s.psa} onChange={(psa) => setS((p) => ({ ...p, psa }))}>
        <option value="">Select…</option>
        {PSA_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectField>
      <SegmentedField<number>
        label="Biopsy Gleason pattern"
        value={s.gleason}
        onChange={(gleason) => setS((p) => ({ ...p, gleason }))}
        options={[
          { value: 0, label: 'No pattern 4/5' },
          { value: 1, label: '4/5 secondary' },
          { value: 3, label: '4/5 primary' },
        ]}
      />
      <SegmentedField<number>
        label="Clinical T stage"
        value={s.t}
        onChange={(t) => setS((p) => ({ ...p, t }))}
        options={[
          { value: 0, label: 'T1 / T2' },
          { value: 1, label: 'T3a' },
        ]}
      />
      <SegmentedField<number>
        label="Positive biopsy cores"
        value={s.cores}
        onChange={(cores) => setS((p) => ({ ...p, cores }))}
        options={[
          { value: 0, label: '< 34%' },
          { value: 1, label: '≥ 34%' },
        ]}
      />

      <ResultRow
        score={result ? total : '—'}
        band={result?.band}
        caption={result ? result.label : 'Select every variable (score 0–10)'}
      />
    </CalcCard>
  );
}
