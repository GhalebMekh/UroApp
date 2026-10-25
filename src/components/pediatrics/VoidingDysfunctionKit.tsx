import { useState } from 'react';
import { CalcCard, NumberField, ResultRow, SegmentedField } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import {
  CAMPBELL_NORMAL_CAPACITY_PCT,
  DVSS_NORMAL_MAX,
  NOCTURNAL_POLYURIA_PCT,
  SMALL_CAPACITY_PCT,
  dvssAbove,
  iccsEbc,
  infantEbc,
  isValidDvssTotal,
  koffEbc,
  percentOfEbc,
  type Sex,
} from '@/lib/bladderCapacity';

const num = (s: string) => Number.parseFloat(s);

/** Expected bladder capacity, bladder-diary percentages and a DVSS total interpreter. */
export function VoidingDysfunctionKit() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [mvv, setMvv] = useState('');
  const [tvv, setTvv] = useState('');
  const [sex, setSex] = useState<Sex>('female');
  const [dvss, setDvss] = useState('');

  const ageY = num(age);
  const infant = Number.isFinite(ageY) && ageY < 1;
  const ebc = infant ? infantEbc(num(weight)) : iccsEbc(ageY);
  const koff = !infant ? koffEbc(ageY) : null;
  const mvvPct = ebc ? percentOfEbc(num(mvv), ebc) : null;
  const tvvPct = ebc ? percentOfEbc(num(tvv), ebc) : null;

  const dvssTotal = num(dvss);
  const dvssOk = dvss !== '' && isValidDvssTotal(dvssTotal);

  return (
    <CalcCard
      title="Voiding dysfunction kit"
      subtitle="Expected bladder capacity, bladder-diary percentages and DVSS interpretation"
      citation={CITATIONS.enuresisConsensus2026}
    >
      <NumberField label="Age" value={age} onChange={setAge} unit="years" placeholder="e.g. 7 (0.5 for 6 months)" step="0.5" min="0" />
      {infant && <NumberField label="Weight (infants under 1 year)" value={weight} onChange={setWeight} unit="kg" step="0.1" min="0" />}

      {ebc ? (
        <ResultRow
          score={<span className="font-mono">{ebc}</span>}
          caption={
            infant
              ? 'mL expected capacity — infant formula, weight × 7 (Campbell ch 28)'
              : `mL expected capacity — ICCS (age + 1) × 30, 390 mL from 12 years. Campbell’s Koff formula (age + 2) × 30 gives ${koff} mL.`
          }
        />
      ) : (
        <p className="mb-3 text-[13px] text-muted-2">Enter age 1–18 years (or weight for an infant) to calculate.</p>
      )}

      {ebc && !infant && (
        <div className="mt-4">
          <NumberField label="Maximum voided volume (diary, excluding first morning void)" value={mvv} onChange={setMvv} unit="mL" min="0" />
          {mvvPct !== null && mvv !== '' && (
            <p className={`-mt-2 mb-3 text-[13px] ${mvvPct < SMALL_CAPACITY_PCT ? 'text-amber' : 'text-teal'}`}>
              {mvvPct}% of expected —{' '}
              {mvvPct < SMALL_CAPACITY_PCT
                ? `small bladder capacity (< ${SMALL_CAPACITY_PCT}%).`
                : `not small (≥ ${SMALL_CAPACITY_PCT}%).`}{' '}
              <span className="text-muted-2">Campbell, citing ICCS, takes &gt; {CAMPBELL_NORMAL_CAPACITY_PCT}% as normal.</span>
            </p>
          )}
          <NumberField label="Total night urine (wet-diaper weight + first morning void)" value={tvv} onChange={setTvv} unit="mL" min="0" />
          {tvvPct !== null && tvv !== '' && (
            <p className={`-mt-2 mb-3 text-[13px] ${tvvPct > NOCTURNAL_POLYURIA_PCT ? 'text-amber' : 'text-teal'}`}>
              {tvvPct}% of expected —{' '}
              {tvvPct > NOCTURNAL_POLYURIA_PCT
                ? `nocturnal polyuria (> ${NOCTURNAL_POLYURIA_PCT}%).`
                : `no nocturnal polyuria (≤ ${NOCTURNAL_POLYURIA_PCT}%).`}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="mb-1 text-[14px] font-semibold">DVSS total</h4>
        <p className="mb-3 text-[12px] text-muted-2">
          Score the published Dysfunctional Voiding Symptom Score form (10 items, 0–3 each), then enter
          the total here. The questionnaire belongs to its authors and isn’t reproduced in the app.
        </p>
        <SegmentedField<Sex>
          label="Sex"
          value={sex}
          onChange={setSex}
          options={[
            { value: 'female', label: 'Girl' },
            { value: 'male', label: 'Boy' },
          ]}
        />
        <NumberField label="DVSS total" value={dvss} onChange={setDvss} unit="/ 30" min="0" step="1" />
        {dvss !== '' && !dvssOk && <p className="text-[13px] text-amber">Enter a whole number from 0 to 30.</p>}
        {dvssOk && (
          <ResultRow
            score={dvssTotal}
            band={dvssAbove(dvssTotal, sex) ? 'moderate' : 'low'}
            caption={
              dvssAbove(dvssTotal, sex)
                ? `Above the ${sex === 'female' ? 'girls’' : 'boys’'} cut-off (> ${DVSS_NORMAL_MAX[sex]}) — consistent with dysfunctional voiding.`
                : `At or below the ${sex === 'female' ? 'girls’' : 'boys’'} cut-off (${DVSS_NORMAL_MAX[sex]}).`
            }
          />
        )}
        <CitationNote citation={CITATIONS.dvss} />
      </div>

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Uroflow is unreliable when the voided volume is under 50% of expected capacity. Formulas and
        cut-offs differ between sources and are shown with theirs.
      </p>
      <CitationNote citation={CITATIONS.cwwLutdEval} />
    </CalcCard>
  );
}
