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
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[21px] font-semibold">{title}</h3>
      <p className="mb-[18px] text-[13px] text-muted-2">{subtitle}</p>
      {children}
      <CitationNote citation={citation} />
    </section>
  );
}

/** The score / interpretation block at the bottom of each calculator. */
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
    <div className="mt-[18px] flex items-baseline gap-3.5 rounded-[14px] border border-line bg-steel px-[18px] py-[15px]">
      <div className="min-w-[64px] font-display text-[32px] font-semibold">
        {score}
      </div>
      <div className={cn('text-[13px]', BAND_TEXT[band])}>{caption}</div>
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
      <div className="mb-[7px] text-[13px] font-semibold text-muted">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex min-h-[44px] min-w-[84px] flex-1 items-center justify-center rounded-[10px] border px-[7px] py-[9px] text-center text-[12px] transition-colors',
                on
                  ? 'border-violet bg-violet/[0.18] font-semibold text-violet-soft'
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
      <div className="mb-[7px] text-[13px] font-semibold text-muted">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13px] text-ink outline-none focus:border-violet"
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
      <label className="mb-[7px] block text-[13px] font-semibold text-muted">
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
          className="w-full bg-transparent py-[11px] font-mono text-[14px] text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && (
          <span className="shrink-0 text-[12px] text-muted-2">{unit}</span>
        )}
      </div>
    </div>
  );
}
