import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField } from './primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import { cn } from '@/lib/cn';
import { CHARLSON_CONDITIONS, charlsonScore, type CharlsonInput, type ConditionKey } from '@/lib/charlson';

/** Charlson Comorbidity Index (Charlson 1987). */
export function CharlsonIndex() {
  const [conditions, setConditions] = useState<Partial<Record<ConditionKey, boolean>>>({});
  const [diabetes, setDiabetes] = useState<CharlsonInput['diabetes']>('none');
  const [liver, setLiver] = useState<CharlsonInput['liver']>('none');
  const [malignancy, setMalignancy] = useState<CharlsonInput['malignancy']>('none');

  const score = charlsonScore({ conditions, diabetes, liver, malignancy });
  const toggle = (k: ConditionKey) => setConditions((c) => ({ ...c, [k]: !c[k] }));

  return (
    <CalcCard
      title="Charlson Comorbidity Index"
      subtitle="Weighted comorbidity burden — tap every condition present"
      citation={CITATIONS.charlson}
    >
      <div className="mb-3.5">
        <div className="mb-[7px] text-[13px] font-semibold text-muted">Conditions</div>
        <div className="flex flex-wrap gap-2">
          {CHARLSON_CONDITIONS.map((c) => {
            const on = !!conditions[c.key];
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c.key)}
                className={cn(
                  'min-h-[44px] rounded-[10px] border px-3 py-2 text-left text-[12px] transition-colors',
                  on ? 'border-violet bg-violet/[0.18] font-semibold text-violet-soft' : 'border-line bg-navy text-muted hover:border-violet',
                )}
              >
                {c.label} <span className="font-mono text-muted-2">+{c.weight}</span>
              </button>
            );
          })}
        </div>
      </div>

      <SegmentedField<CharlsonInput['diabetes']>
        label="Diabetes"
        value={diabetes}
        onChange={setDiabetes}
        options={[
          { value: 'none', label: 'None' },
          { value: 'uncomplicated', label: 'Diabetes +1' },
          { value: 'endOrgan', label: 'End-organ damage +2' },
        ]}
      />
      <SegmentedField<CharlsonInput['liver']>
        label="Liver disease"
        value={liver}
        onChange={setLiver}
        options={[
          { value: 'none', label: 'None' },
          { value: 'mild', label: 'Mild +1' },
          { value: 'moderateSevere', label: 'Moderate–severe +3' },
        ]}
      />
      <SegmentedField<CharlsonInput['malignancy']>
        label="Malignancy"
        value={malignancy}
        onChange={setMalignancy}
        options={[
          { value: 'none', label: 'None' },
          { value: 'any', label: 'Any malignancy +2' },
          { value: 'metastatic', label: 'Metastatic +6' },
        ]}
      />

      <ResultRow score={score} caption="Charlson Comorbidity Index (unadjusted for age)" />

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Developed to predict 1-year mortality in medical inpatients; later shown to predict 3–5-year
        mortality after surgery. In that 1994 validation, each extra point carried about the same
        relative risk of death as each extra decade of age (≈ 1.4 per unit) — so weigh age alongside
        the score, for instance when judging a 10-year life expectancy.
      </p>
      <CitationNote citation={CITATIONS.charlson1994} />
    </CalcCard>
  );
}
