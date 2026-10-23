import { useState } from 'react';
import { CalcCard, NumberField, ResultRow, SegmentedField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';
import {
  DST_CUTOFF,
  dstResult,
  imagingCategory,
  needsAldosteroneRenin,
  needsMetanephrines,
  type Appearance,
  type DstUnit,
  type ImagingCategory,
  type SizeBand,
} from '@/lib/adrenalWorkup';

type YN = 'no' | 'yes';
const YES_NO = [
  { value: 'no' as const, label: 'No' },
  { value: 'yes' as const, label: 'Yes' },
];

/** What each imaging category means, in our words, with the guideline's own number. */
const CATEGORY: Record<ImagingCategory, { band: RiskBand; score: string; head: string; body: string }> = {
  'no-ct': {
    band: 'none',
    score: '—',
    head: 'Unenhanced CT first',
    body: 'Non-contrast CT is the recommended first test to show whether the mass is homogeneous and lipid-rich (R.2.2).',
  },
  benign: {
    band: 'low',
    score: 'R.2.3',
    head: 'Benign — no further imaging',
    body: 'Homogeneous and ≤ 10 HU is a lipid-rich adenoma. No further imaging is needed, whatever the size.',
  },
  'r2.4': {
    band: 'moderate',
    score: 'R.2.4',
    head: 'Probably benign — one more step',
    body: 'Homogeneous, 11–20 HU, under 4 cm. If the hormone work-up shows no significant excess: immediate additional imaging to avoid follow-up, or repeat non-contrast CT/MRI at 12 months.',
  },
  'r2.5': {
    band: 'high',
    score: 'R.2.5',
    head: 'Relevant risk of malignancy',
    body: 'At least 4 cm and heterogeneous or above 20 HU. Discuss at MDT; surgery is usually the choice, after full staging (at least chest CT and/or FDG-PET/CT). If not operated, re-image at 6–12 months.',
  },
  'r2.6': {
    band: 'moderate',
    score: 'R.2.6',
    head: 'Indeterminate — malignancy still unlikely',
    body: 'Individualised MDT discussion; usually immediate additional imaging, per local expertise. If still indeterminate and not operated, re-image at 6–12 months.',
  },
};

/** Adrenal incidentaloma work-up (ESE/ENSAT 2023). */
export function AdrenalIncidentaloma() {
  const [ctDone, setCtDone] = useState<YN>('yes');
  const [hu, setHu] = useState('');
  const [size, setSize] = useState<SizeBand | null>(null);
  const [appearance, setAppearance] = useState<Appearance | null>(null);
  const [htn, setHtn] = useState<YN>('no');
  const [hypoK, setHypoK] = useState<YN>('no');
  const [dstUnit, setDstUnit] = useState<DstUnit>('nmol');
  const [dst, setDst] = useState('');
  const [overt, setOvert] = useState<YN>('no');

  const huValue = ctDone === 'yes' ? Number.parseFloat(hu) : null;
  const imagingReady = ctDone === 'no' || (hu.trim() !== '' && size !== null && appearance !== null);
  const category = imagingReady
    ? imagingCategory({ hu: huValue, size: size ?? 'lt4', appearance: appearance ?? 'homogeneous' })
    : null;
  const c = category ? CATEGORY[category] : null;

  const dstOutcome = dst.trim() ? dstResult(Number.parseFloat(dst), dstUnit, overt === 'yes') : null;
  const cutoff = `${DST_CUTOFF[dstUnit]} ${dstUnit === 'nmol' ? 'nmol/L' : 'µg/dL'}`;

  return (
    <CalcCard
      title="Adrenal incidentaloma"
      subtitle="Imaging category and hormone work-up — ESE/ENSAT 2023"
      citation={CITATIONS.eseAdrenal2023}
    >
      <div className="mb-[7px] text-[12px] font-semibold uppercase tracking-[0.1em] text-violet-soft">Imaging</div>
      <SegmentedField<YN> label="Unenhanced (non-contrast) CT done?" value={ctDone} onChange={setCtDone} options={YES_NO} />
      {ctDone === 'yes' && (
        <>
          <NumberField label="Unenhanced attenuation" value={hu} onChange={setHu} unit="HU" placeholder="e.g. 8" step="1" />
          <SegmentedField<SizeBand>
            label="Size"
            value={size}
            onChange={setSize}
            options={[
              { value: 'lt4', label: '< 4 cm' },
              { value: 'ge4', label: '≥ 4 cm' },
            ]}
          />
          <SegmentedField<Appearance>
            label="Appearance"
            value={appearance}
            onChange={setAppearance}
            options={[
              { value: 'homogeneous', label: 'Homogeneous' },
              { value: 'heterogeneous', label: 'Heterogeneous' },
            ]}
          />
        </>
      )}

      <ResultRow
        score={c ? c.score : '—'}
        band={c?.band}
        caption={c ? <><span className="font-semibold">{c.head}.</span> {c.body}</> : 'Enter HU, size and appearance.'}
      />

      <div className="mb-[7px] mt-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-violet-soft">Hormone work-up</div>
      <SegmentedField<YN> label="Hypertension" value={htn} onChange={setHtn} options={YES_NO} />
      <SegmentedField<YN> label="Unexplained hypokalaemia" value={hypoK} onChange={setHypoK} options={YES_NO} />

      <ul className="mb-4 space-y-1.5 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12.5px] text-muted">
        <li>
          <span className="text-ink">Everyone:</span> clinical assessment for hormone excess, and a 1 mg
          overnight dexamethasone suppression test (R.3.1–3.2). It may be skipped in frail patients with
          limited life expectancy.
        </li>
        <li>
          <span className="text-ink">Metanephrines</span> (plasma free or urinary fractionated):{' '}
          {category === null
            ? 'needed unless imaging shows a typical benign adenoma.'
            : needsMetanephrines(category)
              ? 'yes — features are not those of a typical benign adenoma (R.3.9).'
              : 'not required — typical benign adenoma on unenhanced CT.'}
        </li>
        <li>
          <span className="text-ink">Aldosterone/renin ratio:</span>{' '}
          {needsAldosteroneRenin(htn === 'yes', hypoK === 'yes')
            ? 'yes — hypertension or unexplained hypokalaemia (R.3.10).'
            : 'only with hypertension or unexplained hypokalaemia (R.3.10).'}
        </li>
        <li>
          <span className="text-ink">Biopsy:</span> not recommended, unless there is a history of
          extra-adrenal malignancy (R.2.7).
        </li>
      </ul>

      <SegmentedField<DstUnit>
        label="Post-dexamethasone cortisol — units"
        value={dstUnit}
        onChange={setDstUnit}
        options={[
          { value: 'nmol', label: 'nmol/L' },
          { value: 'ugdl', label: 'µg/dL' },
        ]}
      />
      <NumberField
        label="Post-dexamethasone cortisol (optional)"
        value={dst}
        onChange={setDst}
        unit={dstUnit === 'nmol' ? 'nmol/L' : 'µg/dL'}
        placeholder={`cut-off ${cutoff}`}
        step="0.1"
        min="0"
      />
      <SegmentedField<YN> label="Clinical features of overt Cushing's syndrome" value={overt} onChange={setOvert} options={YES_NO} />

      {dstOutcome && (
        <p
          className={
            dstOutcome === 'excluded'
              ? 'rounded-[10px] border border-teal/40 bg-teal/[0.08] px-3 py-2.5 text-[12.5px] text-teal'
              : 'rounded-[10px] border border-amber/40 bg-amber/[0.08] px-3 py-2.5 text-[12.5px] text-amber'
          }
        >
          {dstOutcome === 'excluded' && `≤ ${cutoff}: autonomous cortisol secretion excluded (R.3.3).`}
          {dstOutcome === 'macs' &&
            `Above ${cutoff} without overt features: mild autonomous cortisol secretion (MACS, R.3.4). Confirm ACTH-independence and repeat the test; screen for hypertension, type 2 diabetes (R.3.6) and vertebral fractures (R.3.7); discuss surgery if comorbidities and a unilateral mass (R.3.8).`}
          {dstOutcome === 'overt' &&
            `Above ${cutoff} with overt features: this is not MACS by definition — assess for overt Cushing's syndrome.`}
        </p>
      )}

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        <span className="font-semibold text-amber">Washout CT is not used to call a lesion benign here.</span>{' '}
        The familiar cut-offs (absolute 60%, relative 40%) came from the 2016 guideline; the 2023 update
        rates their evidence in incidentalomas as very low, and in one study they missed 22% and 8% of
        malignant tumours. If washout is done, the delayed phase needs at least 10 minutes.
      </p>
    </CalcCard>
  );
}
