import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField } from './primitives';
import { CITATIONS } from '@/data/citations';
import { paduaScore, type PaduaSelection } from '@/lib/padua';

const BAND_LABEL = {
  low: 'Low complexity (6–7)',
  moderate: 'Moderate complexity (8–9)',
  high: 'High complexity (10–14)',
} as const;

const empty: PaduaSelection = {
  longitudinal: null,
  exophytic: null,
  rim: null,
  sinus: null,
  collectingSystem: null,
  size: null,
};

/** PADUA nephrometry score (Ficarra 2009) — anatomic complexity for partial nephrectomy. */
export function PaduaScore() {
  const [sel, setSel] = useState<PaduaSelection>(empty);
  const result = paduaScore(sel);

  return (
    <CalcCard
      title="PADUA score"
      subtitle="Preoperative Aspects and Dimensions Used for an Anatomical classification"
      citation={CITATIONS.padua}
    >
      <SegmentedField
        label="Longitudinal (polar) location"
        value={sel.longitudinal}
        onChange={(longitudinal) => setSel((p) => ({ ...p, longitudinal }))}
        options={[
          { value: 'polar', label: 'Superior or inferior' },
          { value: 'middle', label: 'Middle' },
        ]}
      />
      <SegmentedField
        label="Exophytic rate"
        value={sel.exophytic}
        onChange={(exophytic) => setSel((p) => ({ ...p, exophytic }))}
        options={[
          { value: 'ge50', label: '≥ 50% exophytic' },
          { value: 'lt50', label: '< 50% exophytic' },
          { value: 'endophytic', label: 'Entirely endophytic' },
        ]}
      />
      <SegmentedField
        label="Renal rim"
        value={sel.rim}
        onChange={(rim) => setSel((p) => ({ ...p, rim }))}
        options={[
          { value: 'lateral', label: 'Lateral' },
          { value: 'medial', label: 'Medial' },
        ]}
      />
      <SegmentedField
        label="Renal sinus involvement"
        value={sel.sinus}
        onChange={(sinus) => setSel((p) => ({ ...p, sinus }))}
        options={[
          { value: 'no', label: 'Not involved' },
          { value: 'yes', label: 'Involved' },
        ]}
      />
      <SegmentedField
        label="Urinary collecting system"
        value={sel.collectingSystem}
        onChange={(collectingSystem) => setSel((p) => ({ ...p, collectingSystem }))}
        options={[
          { value: 'no', label: 'Not involved' },
          { value: 'yes', label: 'Dislocated / infiltrated' },
        ]}
      />
      <SegmentedField
        label="Tumour size"
        value={sel.size}
        onChange={(size) => setSel((p) => ({ ...p, size }))}
        options={[
          { value: 'le4', label: '≤ 4 cm' },
          { value: '4to7', label: '4.1 – 7 cm' },
          { value: 'gt7', label: '> 7 cm' },
        ]}
      />

      <ResultRow
        score={result ? result.total : '—'}
        band={result?.band}
        caption={result ? BAND_LABEL[result.band] : 'Select all six components'}
      />
    </CalcCard>
  );
}
