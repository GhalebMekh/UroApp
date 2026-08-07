import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField } from './primitives';
import { CITATIONS } from '@/data/citations';
import { stoneScore, type StoneSelection } from '@/lib/stoneScore';

const BAND_LABEL = {
  low: 'Low risk — ureteral stone probability ≤ 40%',
  moderate: 'Moderate risk — probability ~65%',
  high: 'High risk — probability ≥ 85%',
} as const;

const empty: StoneSelection = {
  sex: null,
  painDuration: null,
  race: null,
  nausea: null,
  hematuria: null,
};

/** STONE score for uncomplicated ureteral stone prediction in ER (Moore 2014). */
export function StoneScore() {
  const [sel, setSel] = useState<StoneSelection>(empty);
  const result = stoneScore(sel);

  return (
    <CalcCard
      title="STONE score"
      subtitle="Clinical prediction rule for ureteral stone in ER"
      citation={CITATIONS.stoneScore}
    >
      <SegmentedField
        label="Sex"
        value={sel.sex}
        onChange={(sex) => setSel((p) => ({ ...p, sex }))}
        options={[
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
        ]}
      />
      <SegmentedField
        label="Duration of pain to presentation"
        value={sel.painDuration}
        onChange={(painDuration) => setSel((p) => ({ ...p, painDuration }))}
        options={[
          { value: 'lt6h', label: '< 6 hours' },
          { value: '6to24h', label: '6–24 hours' },
          { value: 'gt24h', label: '> 24 hours' },
        ]}
      />
      <SegmentedField
        label="Race / ethnicity"
        value={sel.race}
        onChange={(race) => setSel((p) => ({ ...p, race }))}
        options={[
          { value: 'black', label: 'Black' },
          { value: 'nonblack', label: 'Non-Black' },
        ]}
      />
      <SegmentedField
        label="Nausea and vomiting"
        value={sel.nausea}
        onChange={(nausea) => setSel((p) => ({ ...p, nausea }))}
        options={[
          { value: 'none', label: 'Neither' },
          { value: 'nausea', label: 'Nausea only' },
          { value: 'vomiting', label: 'Vomiting' },
        ]}
      />
      <SegmentedField<'true' | 'false'>
        label="Red blood cells on urine dipstick"
        value={sel.hematuria ? 'true' : sel.hematuria === false ? 'false' : null}
        onChange={(v) => setSel((p) => ({ ...p, hematuria: v === 'true' }))}
        options={[
          { value: 'false', label: 'Absent' },
          { value: 'true', label: 'Present' },
        ]}
      />

      <ResultRow
        score={result ? result.total : '—'}
        band={result?.band}
        caption={result ? BAND_LABEL[result.band] : 'Select all fields'}
      />
    </CalcCard>
  );
}
