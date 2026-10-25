import { useState } from 'react';
import { CalcCard, NumberField, ResultRow, SegmentedField } from '@/components/calculators/primitives';
import { CITATIONS } from '@/data/citations';
import { ACTIVE_TREATMENT_FROM_YEARS, ENURESIS_LABEL, classifyEnuresis } from '@/lib/enuresis';

const YES_NO = [
  { value: 'no' as const, label: 'No' },
  { value: 'yes' as const, label: 'Yes' },
];

// Summarised from Campbell ch 35 (Austin & Seth) — our wording; no doses by design.
const FIRST_LINE = [
  {
    title: 'Enuresis alarm',
    when: 'Motivated child and family; no nocturnal polyuria.',
    notes: [
      'Most effective long-term treatment; lower relapse than desmopressin (46% vs 65%).',
      'Continue until 14 consecutive dry nights; little gain if no progress by 6 weeks.',
      'About 30% stop early (skin irritation, waking others, failing to wake).',
    ],
  },
  {
    title: 'Desmopressin',
    when: 'Nocturnal polyuria with normal bladder capacity, infrequent wetting, or alarm failed or declined.',
    notes: [
      'Works from the first night; judge the response within 2 weeks.',
      'Main risk is water intoxication (hyponatraemic seizures): restrict evening fluids, and pause it during fever, vomiting, diarrhoea or heavy exercise. Nasal spray is discouraged.',
      'Relapse after stopping is common (60–70%); scheduled breaks show whether it is still needed.',
    ],
  },
];

/** Nocturnal enuresis — classification and first-line choice (reference; no dosing). */
export function EnuresisPathway() {
  const [age, setAge] = useState('');
  const [daytime, setDaytime] = useState<'no' | 'yes'>('no');
  const [dry, setDry] = useState<'no' | 'yes'>('no');

  const ageY = Number.parseFloat(age);
  const type = Number.isFinite(ageY)
    ? classifyEnuresis({ ageYears: ageY, daytimeSymptoms: daytime === 'yes', previouslyDry: dry === 'yes' })
    : null;
  const nmse = type === 'primary-nmse' || type === 'secondary-nmse';

  return (
    <CalcCard
      title="Nocturnal enuresis"
      subtitle="Classify the bedwetting, then choose a first-line treatment"
      citation={CITATIONS.cwwFunctional}
    >
      <NumberField label="Age" value={age} onChange={setAge} unit="years" min="0" />
      <SegmentedField
        label="Any daytime symptoms (wetting, urgency, frequency, holding, straining)?"
        value={daytime}
        onChange={setDaytime}
        options={YES_NO}
      />
      <SegmentedField label="Was dry for 6 months or more before?" value={dry} onChange={setDry} options={YES_NO} />

      {type && (
        <ResultRow
          score={type === 'too-young' ? '—' : nmse ? 'NMSE' : 'MSE'}
          band={type === 'too-young' ? 'none' : nmse ? 'moderate' : 'low'}
          caption={ENURESIS_LABEL[type]}
        />
      )}

      {type && type !== 'too-young' && (
        <ul className="mt-3 space-y-2 text-[13px]">
          <li className="rounded-[10px] border border-line bg-navy px-3 py-2.5 text-muted">
            Evaluate with history, a bladder diary, examination and urinalysis — exclude valves, spinal
            dysraphism and diabetes.
          </li>
          {nmse && (
            <li className="rounded-[10px] border border-violet/40 bg-violet/[0.08] px-3 py-2.5 text-ink">
              Treat constipation and the daytime bladder problem first — that alone can stop the
              wetting. Then treat any remaining enuresis as monosymptomatic.
            </li>
          )}
          {type.startsWith('secondary') && (
            <li className="rounded-[10px] border border-line bg-navy px-3 py-2.5 text-muted">
              Secondary: ask about stressful events, UTI, diabetes, obstructive sleep apnoea,
              neurogenic bladder and behavioural problems such as ADHD.
            </li>
          )}
          {ageY < ACTIVE_TREATMENT_FROM_YEARS && (
            <li className="rounded-[10px] border border-line bg-navy px-3 py-2.5 text-muted">
              Under 6 years: general advice; active treatment usually waits until the child is
              motivated.
            </li>
          )}
        </ul>
      )}

      <div className="mt-5 space-y-2.5 border-t border-line pt-4">
        <p className="text-[13px] text-muted">
          For every child: void 6–7 times a day and before bed, take fluids mostly in the morning and
          early afternoon, avoid evening caffeine and sugary drinks, and never punish wetting.
        </p>
        {FIRST_LINE.map((t) => (
          <article key={t.title} className="rounded-[14px] border border-line bg-navy p-4">
            <h4 className="text-[14.5px] font-semibold">{t.title}</h4>
            <p className="mb-2 text-[12.5px] text-violet-soft">{t.when}</p>
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted">
              {t.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </article>
        ))}
        <p className="text-[12px] text-muted-2">
          If one first-line treatment fails, offer the other; combinations (e.g. with an
          anticholinergic) are second line, tricyclics third line. Use the Voiding dysfunction kit to
          check for nocturnal polyuria.
        </p>
      </div>
    </CalcCard>
  );
}
