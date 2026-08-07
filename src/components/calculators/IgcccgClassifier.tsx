import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';

type Histology = 'nonseminoma' | 'seminoma';
type Prognosis = { code: string; band: RiskBand };

const GOOD: Prognosis = { code: 'Good prognosis', band: 'low' };
const INTERMEDIATE: Prognosis = { code: 'Intermediate prognosis', band: 'moderate' };
const POOR: Prognosis = { code: 'Poor prognosis', band: 'high' };

interface State {
  site: string; // 'gonadal' | 'mediastinal'
  npvm: string; // 'no' | 'yes'  (non-pulmonary visceral metastases)
  markers: string; // 'good' | 'intermediate' | 'poor'  (non-seminoma only)
}

/**
 * IGCCCG prognostic classification for metastatic germ cell tumours (1997).
 * Marker bands: AFP (ng/mL), hCG (IU/L), LDH (× ULN) — highest category counts.
 */
export function IgcccgClassifier() {
  const [histology, setHistology] = useState<Histology>('nonseminoma');
  const [s, setS] = useState<State>({ site: '', npvm: '', markers: '' });

  function classify(): Prognosis | null {
    if (histology === 'seminoma') {
      // Seminoma: AFP must be normal; only non-pulmonary visceral mets split good/intermediate.
      if (s.npvm === '') return null;
      return s.npvm === 'yes' ? INTERMEDIATE : GOOD;
    }
    // Non-seminoma
    if (s.site === '' || s.npvm === '' || s.markers === '') return null;
    if (s.site === 'mediastinal' || s.npvm === 'yes' || s.markers === 'poor') return POOR;
    if (s.markers === 'intermediate') return INTERMEDIATE;
    return GOOD;
  }

  const result = classify();

  return (
    <CalcCard
      title="IGCCCG germ cell prognosis"
      subtitle="Metastatic germ cell tumour — good / intermediate / poor risk"
      citation={CITATIONS.igcccg}
    >
      <SegmentedField<Histology>
        label="Histology"
        value={histology}
        onChange={(h) => {
          setHistology(h);
          setS({ site: '', npvm: '', markers: '' });
        }}
        options={[
          { value: 'nonseminoma', label: 'Non-seminoma' },
          { value: 'seminoma', label: 'Seminoma' },
        ]}
      />

      {histology === 'nonseminoma' && (
        <>
          <SegmentedField<string>
            label="Primary site"
            value={s.site || null}
            onChange={(site) => setS((p) => ({ ...p, site }))}
            options={[
              { value: 'gonadal', label: 'Testis / retroperitoneal' },
              { value: 'mediastinal', label: 'Mediastinal' },
            ]}
          />
          <SegmentedField<string>
            label="Markers (highest of AFP / hCG / LDH)"
            value={s.markers || null}
            onChange={(markers) => setS((p) => ({ ...p, markers }))}
            options={[
              { value: 'good', label: 'AFP<1000, hCG<5000, LDH<1.5×' },
              { value: 'intermediate', label: '1000–10k / 5000–50k / 1.5–10×' },
              { value: 'poor', label: '>10k / >50k / >10×' },
            ]}
          />
        </>
      )}

      {histology === 'seminoma' && (
        <p className="mb-3.5 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
          Pure seminoma requires a normal AFP. Any primary site qualifies; there is no poor-prognosis
          seminoma group.
        </p>
      )}

      <SegmentedField<string>
        label="Non-pulmonary visceral metastases"
        value={s.npvm || null}
        onChange={(npvm) => setS((p) => ({ ...p, npvm }))}
        options={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes (e.g. liver, bone, brain)' },
        ]}
      />

      <ResultRow
        score={result ? result.code.split(' ')[0] : '—'}
        band={result?.band}
        caption={result ? result.code : 'Select all factors'}
      />
    </CalcCard>
  );
}
