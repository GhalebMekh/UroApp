import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';
import {
  PSA_LABELS,
  capraSRisk,
  capraSTotal,
  pfpFor,
  type CapraSRisk,
  type PathGleason,
  type PsaBand,
} from '@/lib/capraS';

const RISK: Record<CapraSRisk, { band: RiskBand; label: string }> = {
  low: { band: 'low', label: 'Low risk (0–2)' },
  intermediate: { band: 'moderate', label: 'Intermediate risk (3–5)' },
  high: { band: 'high', label: 'High risk (≥ 6)' },
};

const YES_NO = [
  { value: 'no' as const, label: 'No' },
  { value: 'yes' as const, label: 'Yes' },
];

type YN = 'no' | 'yes';

interface State {
  psa: PsaBand | null;
  gleason: PathGleason | null;
  margin: YN | null;
  ece: YN | null;
  svi: YN | null;
  lni: YN | null;
}

/** CAPRA-S — recurrence risk after radical prostatectomy (Cooperberg 2011). */
export function CapraSScore() {
  const [s, setS] = useState<State>({
    psa: null,
    gleason: null,
    margin: null,
    ece: null,
    svi: null,
    lni: null,
  });
  const set = <K extends keyof State>(k: K) => (v: NonNullable<State[K]>) =>
    setS((p) => ({ ...p, [k]: v }));

  const complete = Object.values(s).every((v) => v !== null);
  const total = complete
    ? capraSTotal({
        psa: s.psa!,
        gleason: s.gleason!,
        marginPositive: s.margin === 'yes',
        ece: s.ece === 'yes',
        svi: s.svi === 'yes',
        lni: s.lni === 'yes',
      })
    : null;
  const risk = total !== null ? RISK[capraSRisk(total)] : null;
  const pfp = total !== null ? pfpFor(total) : null;

  return (
    <CalcCard
      title="CAPRA-S"
      subtitle="Recurrence risk after radical prostatectomy — pre-op PSA plus surgical pathology"
      citation={CITATIONS.capraS}
    >
      <SegmentedField<PsaBand>
        label="Pre-operative PSA (ng/mL)"
        value={s.psa}
        onChange={set('psa')}
        options={(Object.keys(PSA_LABELS) as PsaBand[]).map((k) => ({ value: k, label: PSA_LABELS[k] }))}
      />
      <SegmentedField<PathGleason>
        label="Pathologic Gleason score"
        value={s.gleason}
        onChange={set('gleason')}
        options={[
          { value: '2-6', label: '≤ 6' },
          { value: '3+4', label: '3+4' },
          { value: '4+3', label: '4+3' },
          { value: '8-10', label: '8–10' },
        ]}
      />
      <SegmentedField<YN> label="Positive surgical margin" value={s.margin} onChange={set('margin')} options={YES_NO} />
      <SegmentedField<YN> label="Extracapsular extension" value={s.ece} onChange={set('ece')} options={YES_NO} />
      <SegmentedField<YN> label="Seminal vesicle invasion" value={s.svi} onChange={set('svi')} options={YES_NO} />
      <SegmentedField<YN> label="Lymph node invasion" value={s.lni} onChange={set('lni')} options={YES_NO} />

      <ResultRow
        score={total ?? '—'}
        band={risk?.band}
        caption={risk ? risk.label : 'Select every variable (score 0–12)'}
      />

      {pfp && (
        <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
          Progression-free probability at this score in the derivation cohort:{' '}
          <span className="text-ink">
            {pfp.threeYear}% at 3 years, {pfp.fiveYear}% at 5 years
          </span>
          {pfp.score === 9 && ' (scores ≥ 9 pooled)'} — {pfp.n} men.
          {pfp.n < 50 && ' Small numbers at this end of the scale; treat as approximate.'}
        </p>
      )}

      <p className="mt-2 text-[12px] text-muted-2">
        Not interchangeable with pre-treatment CAPRA: here Gleason 4+3 scores 2 points, not 3.
        Derived in a US registry (CaPSURE) with biochemical recurrence as the endpoint.
      </p>
    </CalcCard>
  );
}
