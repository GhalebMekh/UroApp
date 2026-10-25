import { useState } from 'react';
import { CalcCard, NumberField, ResultRow, SegmentedField } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import {
  POSTNATAL_PLAN,
  PRENATAL_PLAN,
  classifyPostnatal,
  classifyPrenatal,
  type Calyces,
  type UtdPlan,
} from '@/lib/utd';

const YES_NO = [
  { value: 'no' as const, label: 'No' },
  { value: 'yes' as const, label: 'Yes' },
];
type YesNo = 'no' | 'yes';

const CALYCES = [
  { value: 'none' as const, label: 'None' },
  { value: 'central' as const, label: 'Central' },
  { value: 'peripheral' as const, label: 'Peripheral' },
];

function Plan({ plan, group }: { plan: UtdPlan; group: string }) {
  return (
    <>
      <ResultRow score={group} caption={plan.label} band={plan.band} />
      <ul className="mt-3 space-y-2">
        {plan.steps.map((s) => (
          <li key={s} className="rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[13px] text-muted">
            {s}
          </li>
        ))}
      </ul>
    </>
  );
}

/** UTD classification (Nguyen 2014) — prenatal A1/A2–3 and postnatal P1–P3 with follow-up. */
export function UtdClassification() {
  const [stage, setStage] = useState<'prenatal' | 'postnatal'>('postnatal');
  const [ga, setGa] = useState('');
  const [apd, setApd] = useState('');
  const [calyces, setCalyces] = useState<Calyces>('none');
  const [other, setOther] = useState<YesNo>('no');
  const [ureter, setUreter] = useState<YesNo>('no');
  const [parenchyma, setParenchyma] = useState<YesNo>('no');
  const [bladder, setBladder] = useState<YesNo>('no');

  const apdMm = Number.parseFloat(apd);
  const gaWeeks = Number.parseFloat(ga);
  const apdOk = Number.isFinite(apdMm) && apdMm >= 0 && apdMm < 100;
  const gaOk = Number.isFinite(gaWeeks) && gaWeeks >= 16 && gaWeeks <= 42;

  let result: { group: string; plan: UtdPlan } | null = null;
  if (stage === 'prenatal' && apdOk && gaOk) {
    const g = classifyPrenatal({ gaWeeks, apdMm, calyces, otherAbnormal: other === 'yes' });
    result = { group: g === 'normal' ? '—' : g.replace('-', '–'), plan: PRENATAL_PLAN[g] };
  } else if (stage === 'postnatal' && apdOk) {
    const g = classifyPostnatal({
      apdMm,
      calyces,
      ureterDilated: ureter === 'yes',
      parenchymaAbnormal: parenchyma === 'yes',
      bladderAbnormal: bladder === 'yes',
    });
    result = { group: g === 'normal' ? '—' : g, plan: POSTNATAL_PLAN[g] };
  }

  return (
    <CalcCard
      title="UTD classification"
      subtitle="Urinary tract dilation risk group, prenatal (A) or postnatal (P), with follow-up"
      citation={CITATIONS.utd2014}
    >
      <SegmentedField
        label="Scan"
        value={stage}
        onChange={setStage}
        options={[
          { value: 'prenatal', label: 'Prenatal' },
          { value: 'postnatal', label: 'Postnatal' },
        ]}
      />
      {stage === 'prenatal' && (
        <NumberField label="Gestational age" value={ga} onChange={setGa} unit="weeks" placeholder="e.g. 22" min="16" />
      )}
      <NumberField
        label="Anterior-posterior renal pelvic diameter (APD)"
        value={apd}
        onChange={setApd}
        unit="mm"
        placeholder="transverse plane, at the hilum"
        step="0.1"
        min="0"
      />
      <SegmentedField<Calyces> label="Calyceal dilation" value={calyces} onChange={setCalyces} options={CALYCES} />
      {stage === 'prenatal' ? (
        <SegmentedField<YesNo>
          label="Abnormal parenchyma, ureter or bladder"
          value={other}
          onChange={setOther}
          options={YES_NO}
        />
      ) : (
        <>
          <SegmentedField<YesNo> label="Ureteral dilation" value={ureter} onChange={setUreter} options={YES_NO} />
          <SegmentedField<YesNo>
            label="Parenchyma abnormal (thin, echogenic, lost corticomedullary differentiation, cysts)"
            value={parenchyma}
            onChange={setParenchyma}
            options={YES_NO}
          />
          <SegmentedField<YesNo> label="Bladder abnormal" value={bladder} onChange={setBladder} options={YES_NO} />
        </>
      )}

      {result ? (
        <Plan plan={result.plan} group={result.group} />
      ) : (
        <p className="mt-2 text-[13px] text-muted-2">
          Enter the APD{stage === 'prenatal' ? ' and gestational age (16–42 weeks)' : ''} to classify.
        </p>
      )}

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        The highest-risk finding decides the group. Do the first postnatal scan after 48 hours, once
        early fluid shifts have settled. APD correlates poorly with VUR, so decide on VCUG by UTI risk.
        Thresholds and follow-up from Campbell ch 22, which sets out the 2014 consensus.
      </p>
      <CitationNote citation={CITATIONS.cwwPerinatal} />
    </CalcCard>
  );
}
