import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';
import { imdcRisk, type ImdcFactors } from '@/lib/imdcHeng';

const FACTORS: { key: keyof ImdcFactors; label: string }[] = [
  { key: 'kpsBelow80', label: 'Karnofsky performance status < 80%' },
  { key: 'lessThanOneYearToTreatment', label: '< 1 year from diagnosis to systemic therapy' },
  { key: 'lowHaemoglobin', label: 'Haemoglobin below the lower limit of normal' },
  { key: 'highCorrectedCalcium', label: 'Corrected calcium above the upper limit of normal' },
  { key: 'highNeutrophils', label: 'Neutrophil count above the upper limit of normal' },
  { key: 'highPlatelets', label: 'Platelet count above the upper limit of normal' },
];

const RISK_LABEL: Record<string, string> = {
  favorable: 'Favorable (0 factors)',
  intermediate: 'Intermediate (1–2 factors)',
  poor: 'Poor (3–6 factors)',
};
const RISK_BAND: Record<string, RiskBand> = { favorable: 'low', intermediate: 'moderate', poor: 'high' };

const empty: ImdcFactors = {
  kpsBelow80: false,
  lessThanOneYearToTreatment: false,
  lowHaemoglobin: false,
  highCorrectedCalcium: false,
  highNeutrophils: false,
  highPlatelets: false,
};

/** IMDC (Heng) risk model for metastatic renal cell carcinoma. */
export function ImdcHengRisk() {
  const [factors, setFactors] = useState<ImdcFactors>(empty);
  const result = imdcRisk(factors);

  return (
    <CalcCard
      title="IMDC (Heng) risk"
      subtitle="Prognosis for metastatic renal cell carcinoma on systemic therapy"
      citation={CITATIONS.imdcHeng}
    >
      {FACTORS.map((f) => (
        <SegmentedField<'no' | 'yes'>
          key={f.key}
          label={f.label}
          value={factors[f.key] ? 'yes' : 'no'}
          onChange={(v) => setFactors((p) => ({ ...p, [f.key]: v === 'yes' }))}
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ]}
        />
      ))}

      <ResultRow score={result.count} band={RISK_BAND[result.risk]} caption={RISK_LABEL[result.risk]} />
    </CalcCard>
  );
}
