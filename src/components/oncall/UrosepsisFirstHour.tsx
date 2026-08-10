import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CitationNote } from '@/components/CitationNote';
import { SegmentedField } from '@/components/calculators/primitives';
import {
  QSOFA_CRITERIA,
  UROSEPSIS_CITATIONS,
  assess,
  type QsofaCriterion,
  type Urgency,
} from '@/data/urosepsis';

const URGENCY_ACCENT: Record<Urgency, { text: string; border: string; bg: string }> = {
  immediate: { text: 'text-crimson', border: 'border-crimson', bg: 'bg-crimson/[0.08]' },
  urgent: { text: 'text-amber', border: 'border-amber', bg: 'bg-amber/[0.08]' },
  monitor: { text: 'text-teal', border: 'border-teal', bg: 'bg-teal/[0.08]' },
};

/**
 * Urosepsis recognition and the first hour.
 * Deliberately not a bare qSOFA calculator — see the note in data/urosepsis.ts.
 */
export function UrosepsisFirstHour() {
  const [qsofa, setQsofa] = useState<Partial<Record<QsofaCriterion['key'], boolean>>>({});
  const [vasopressors, setVasopressors] = useState(false);
  const [lactate, setLactate] = useState(false);

  const result = assess(qsofa, vasopressors, lactate);
  const accent = URGENCY_ACCENT[result.urgency];

  return (
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[21px] font-semibold">Urosepsis — the first hour</h3>
      <p className="mb-[18px] text-[13px] text-muted-2">
        Recognition, timings and source control for the septic urological patient
      </p>

      <div className="mb-[18px] rounded-[12px] border border-amber/40 bg-amber/[0.08] px-4 py-3 text-[12.5px] text-amber">
        Surviving Sepsis 2021 recommends <strong>against</strong> qSOFA as a single screening tool
        (strong recommendation). Screen with NEWS2. qSOFA below is an escalation prompt — it
        predicts death and prolonged ICU stay, it does not rule sepsis out.
      </div>

      <div className="mb-[7px] text-[13px] font-semibold text-muted">qSOFA</div>
      {QSOFA_CRITERIA.map((c) => (
        <SegmentedField<'no' | 'yes'>
          key={c.key}
          label={`${c.label} — ${c.detail}`}
          value={qsofa[c.key] ? 'yes' : 'no'}
          onChange={(v) => setQsofa((p) => ({ ...p, [c.key]: v === 'yes' }))}
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ]}
        />
      ))}

      <div className="mb-[7px] mt-5 text-[13px] font-semibold text-muted">
        Septic shock criteria (Sepsis-3)
      </div>
      <SegmentedField<'no' | 'yes'>
        label="Vasopressors needed to hold MAP ≥65 mmHg"
        value={vasopressors ? 'yes' : 'no'}
        onChange={(v) => setVasopressors(v === 'yes')}
        options={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ]}
      />
      <SegmentedField<'no' | 'yes'>
        label="Serum lactate >2 mmol/L despite fluids"
        value={lactate ? 'yes' : 'no'}
        onChange={(v) => setLactate(v === 'yes')}
        options={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ]}
      />

      {/* Result */}
      <div className={cn('mt-[18px] rounded-[14px] border bg-steel px-[18px] py-[15px]', accent.border)}>
        <div className="flex items-baseline gap-3.5">
          <div className={cn('min-w-[64px] font-display text-[32px] font-semibold', accent.text)}>
            {result.qsofaScore}
            <span className="text-[16px] text-muted-2">/3</span>
          </div>
          <div className={cn('text-[13px] font-semibold', accent.text)}>{result.headline}</div>
        </div>

        <div className={cn('mt-3.5 rounded-[10px] border px-3 py-2.5', accent.border, accent.bg)}>
          <div className="text-[13px] text-ink">{result.antimicrobial.text}</div>
          {result.antimicrobial.timing && (
            <div className={cn('mt-1 font-mono text-[12px] font-semibold', accent.text)}>
              {result.antimicrobial.timing}
            </div>
          )}
        </div>
      </div>

      <div className="mt-[18px]">
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-teal">
          Do now
        </div>
        <ol className="space-y-2.5">
          {result.steps.map((s, i) => (
            <li key={s.text} className="flex gap-3 text-[14px]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-steel font-mono text-[12px] text-violet-soft">
                {i + 1}
              </span>
              <span className="text-muted">
                {s.text}
                {s.timing && (
                  <span className="ml-2 whitespace-nowrap rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted-2">
                    {s.timing}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Antibiotics do not treat an obstructed kidney. If there is obstruction and sepsis,
        decompression is the definitive intervention — escalate for it early.
      </p>

      <CitationNote citation={UROSEPSIS_CITATIONS.definitions} />
      <CitationNote citation={UROSEPSIS_CITATIONS.management} />
    </section>
  );
}
