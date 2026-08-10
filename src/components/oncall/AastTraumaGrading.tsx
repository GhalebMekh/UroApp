import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CitationNote } from '@/components/CitationNote';
import {
  AAST_SCALES,
  ROMAN,
  gradeBand,
  type AastGrade,
  type AastOrgan,
} from '@/data/aastTrauma';

const BAND_ACCENT = {
  low: { text: 'text-teal', border: 'border-teal', bg: 'bg-teal/[0.12]' },
  moderate: { text: 'text-amber', border: 'border-amber', bg: 'bg-amber/[0.12]' },
  high: { text: 'text-crimson', border: 'border-crimson', bg: 'bg-crimson/[0.12]' },
} as const;

/**
 * AAST organ injury grading for the genitourinary tract.
 * Reference tool: pick the organ, tap the highest criterion that matches.
 */
export function AastTraumaGrading() {
  const [organ, setOrgan] = useState<AastOrgan>('kidney');
  const [grade, setGrade] = useState<AastGrade | null>(null);

  const scale = AAST_SCALES.find((s) => s.organ === organ)!;
  const selected = grade ? scale.grades.find((g) => g.grade === grade) ?? null : null;
  const accent = grade ? BAND_ACCENT[gradeBand(grade)] : null;

  return (
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[21px] font-semibold">AAST injury grading</h3>
      <p className="mb-[18px] text-[13px] text-muted-2">
        Organ Injury Scale for genitourinary trauma — {scale.edition}
      </p>

      {/* Organ selector */}
      <div className="mb-[18px] flex flex-wrap gap-2">
        {AAST_SCALES.map((s) => (
          <button
            key={s.organ}
            type="button"
            onClick={() => {
              setOrgan(s.organ);
              setGrade(null);
            }}
            className={cn(
              'min-h-[44px] flex-1 rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              s.organ === organ
                ? 'border-violet bg-violet/[0.18] text-violet-soft'
                : 'border-line bg-navy text-muted hover:border-violet',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grade rows */}
      <div className="space-y-2">
        {scale.grades.map((entry) => {
          const on = entry.grade === grade;
          const band = BAND_ACCENT[gradeBand(entry.grade)];
          return (
            <button
              key={entry.grade}
              type="button"
              aria-pressed={on}
              onClick={() => setGrade(on ? null : entry.grade)}
              className={cn(
                'flex w-full items-start gap-3.5 rounded-[12px] border px-4 py-3 text-left transition-colors',
                on
                  ? cn(band.border, band.bg)
                  : 'border-line bg-navy hover:border-violet/60',
              )}
            >
              <span
                className={cn(
                  'mt-px min-w-[34px] shrink-0 font-display text-[19px] font-semibold',
                  on ? band.text : 'text-muted-2',
                )}
              >
                {ROMAN[entry.grade]}
              </span>
              <span className="flex-1 space-y-1.5">
                {entry.criteria.map((c) => (
                  <span key={c.label} className="block">
                    <span className="block text-[13.5px] text-ink">{c.label}</span>
                    {c.detail && (
                      <span className="block text-[12px] text-muted-2">{c.detail}</span>
                    )}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected grade implication */}
      {selected && accent && (
        <div
          className={cn(
            'mt-[18px] rounded-[14px] border bg-steel px-[18px] py-[15px]',
            accent.border,
          )}
        >
          <div className="flex items-baseline gap-3.5">
            <div className={cn('min-w-[64px] font-display text-[32px] font-semibold', accent.text)}>
              {ROMAN[selected.grade]}
            </div>
            <div className="text-[13px] text-muted">{selected.implication}</div>
          </div>
        </div>
      )}

      {/* Grading rules */}
      <div className="mt-[18px]">
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-amber">
          Grading rules
        </div>
        <ul className="space-y-1.5">
          {scale.rules.map((r) => (
            <li key={r} className="flex gap-2.5 text-[12.5px] text-muted-2">
              <span aria-hidden="true" className="text-muted-2">
                &middot;
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        The grade describes the injury, not the decision. Haemodynamic instability drives
        exploration regardless of grade.
      </p>

      <CitationNote citation={scale.citation} />
    </section>
  );
}
