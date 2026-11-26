import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Citation } from '@/data/citations';
import { CitationNote } from '@/components/CitationNote';

/** Risk band — always colour-coded low=teal / moderate=amber / high=crimson. */
export type RiskBand = 'none' | 'low' | 'moderate' | 'high';

const BAND_TEXT: Record<RiskBand, string> = {
  none: 'text-muted',
  low: 'text-teal',
  moderate: 'text-amber',
  high: 'text-crimson',
};

/** Card wrapper for a single calculator, with its mandatory citation footer. */
export function CalcCard({
  title,
  subtitle,
  citation,
  children,
}: {
  title: string;
  subtitle: string;
  citation: Citation;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[20px] font-medium">{title}</h3>
      <p className="mb-5 text-[13px] text-muted">{subtitle}</p>
      {children}
      <CitationNote citation={citation} />
    </section>
  );
}

const BAND_FILL: Record<Exclude<RiskBand, 'none'>, string> = {
  low: 'bg-teal',
  moderate: 'bg-amber',
  high: 'bg-crimson',
};
const BANDS = ['low', 'moderate', 'high'] as const;
const BAND_NAME: Record<Exclude<RiskBand, 'none'>, string> = { low: 'Low', moderate: 'Moderate', high: 'High' };

/**
 * The score / interpretation block at the bottom of each calculator — one of
 * the two "moments" of the unslop direction: the score as a large mono figure,
 * and, when the result has a risk band, a three-step risk bar where only the
 * band reached carries its colour. The only place risk colours appear.
 */
export function ResultRow({
  score,
  caption,
  band = 'none',
}: {
  score: ReactNode;
  caption: ReactNode;
  band?: RiskBand;
}) {
  return (
    <div className="mt-5 rounded-[12px] border border-line bg-steel px-4 py-4 shadow-raised">
      <div className="flex items-baseline gap-4">
        <div className="min-w-[64px] font-mono text-[32px] font-medium leading-none text-ink">{score}</div>
        <div className={cn('text-[14px] leading-snug', BAND_TEXT[band])}>{caption}</div>
      </div>
      {band !== 'none' && (
        <div className="mt-4" role="img" aria-label={`Risk: ${BAND_NAME[band]}`}>
          <div className="grid grid-cols-3 gap-1">
            {BANDS.map((b) => (
              <span key={b} className={cn('h-1.5 rounded-full', b === band ? BAND_FILL[b] : 'bg-navy')} />
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-1 text-[12px] text-muted-2">
            {BANDS.map((b) => (
              <span key={b} className={cn(b === 'moderate' && 'text-center', b === 'high' && 'text-right', b === band && 'text-ink')}>
                {BAND_NAME[b]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** A labelled segmented control (one selected option among several). */
export function SegmentedField<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-3.5">
      <div className="mb-2 text-[13px] font-medium text-muted">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex min-h-[44px] min-w-[84px] flex-1 items-center justify-center rounded-[10px] border px-2 py-2 text-center text-[12px] transition-colors',
                on
                  ? 'border-violet bg-violet/[0.18] font-medium text-violet-soft'
                  : 'border-line bg-navy text-muted hover:border-violet',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A labelled <select> styled to match the design system. */
export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <div className="mb-2 text-[13px] font-medium text-muted">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-3 text-[13px] text-ink outline-none focus:border-violet"
      >
        {children}
      </select>
    </div>
  );
}

/** A labelled numeric input with optional unit suffix. */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  placeholder,
  step,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div className="mb-3.5">
      <label className="mb-2 block text-[13px] font-medium text-muted">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-[10px] border border-line bg-navy px-3 focus-within:border-violet">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          className="w-full bg-transparent py-3 font-mono text-[14px] text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && (
          <span className="shrink-0 text-[12px] text-muted-2">{unit}</span>
        )}
      </div>
    </div>
  );
}
