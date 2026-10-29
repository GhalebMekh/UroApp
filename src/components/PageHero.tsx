import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SearchIcon } from './icons';

export type HeroTone = 'violet' | 'emergency' | 'pediatric';

const TONE_BG: Record<HeroTone, string> = {
  violet: 'bg-violet-hero',
  emergency: 'bg-emergency-hero',
  pediatric: 'bg-peds-hero',
};

/**
 * The gradient band every screen opens with. It is pulled up under the top bar
 * (which stays clear over it until the page scrolls — see TopBar `overHero`),
 * so the colour runs to the top of the screen as on Home.
 */
export function HeroShell({
  tone = 'violet',
  className,
  children,
}: {
  tone?: HeroTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <header
      className={cn(
        'relative -mt-[calc(4rem+env(safe-area-inset-top))] overflow-hidden pt-[calc(4rem+env(safe-area-inset-top))]',
        TONE_BG[tone],
      )}
    >
      {/* Soft light shapes, purely decorative. */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 rounded-full bg-white/[0.09]" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-white/[0.06]" />
      {/* Default bottom space leaves room for the PageSheet's rounded edge to overlap. */}
      <div className={cn('relative mx-auto max-w-wrap px-4 pt-4 sm:px-6 md:pt-6', className ?? 'pb-12 md:pb-14')}>
        {children}
      </div>
    </header>
  );
}

/** A screen's header: eyebrow (section), title, one-line description, then any controls. */
export function PageHero({
  eyebrow,
  title,
  lede,
  tone,
  action,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: HeroTone;
  /** Right-aligned beside the eyebrow, e.g. an "All calculators →" link. */
  action?: { label: string; onClick: () => void };
  /** Controls shown under the description: search, tabs, filters. */
  children?: ReactNode;
}) {
  return (
    <HeroShell tone={tone}>
      {(eyebrow || action) && (
        <div className="mb-1 flex min-h-[24px] items-center justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">{eyebrow}</div>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="-my-2.5 min-h-[44px] shrink-0 px-1 text-[12.5px] font-semibold text-white/90 transition-colors hover:text-white"
            >
              {action.label} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}
      <h1 className="font-display text-[30px] font-bold leading-[1.1] text-white md:text-[36px]">{title}</h1>
      {lede && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/80">{lede}</p>}
      {children && <div className="mt-5">{children}</div>}
    </HeroShell>
  );
}

/** Segmented tabs styled for the gradient header. */
export function HeroTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('grid gap-1 rounded-[13px] border border-white/20 bg-white/[0.10] p-1', className)}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            aria-pressed={active}
            className={cn(
              'flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[13px] font-semibold transition-colors',
              active ? 'bg-white text-violet-deep shadow-sm' : 'text-white/85 hover:bg-white/10',
            )}
          >
            {it.label}
            {it.count !== undefined && <span className={cn('text-[11px]', active ? 'opacity-60' : 'opacity-70')}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Wrap-around chips styled for the gradient header (for longer option lists). */
export function HeroChips<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: ReactNode }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            aria-pressed={active}
            className={cn(
              'min-h-[44px] rounded-[11px] border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              active ? 'border-white bg-white text-violet-deep' : 'border-white/25 bg-white/[0.10] text-white/90 hover:bg-white/[0.18]',
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/** The search field styled for the gradient header. */
export function HeroSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="flex min-h-[48px] w-full items-center gap-3 rounded-[14px] border border-white/20 bg-white/[0.12] px-4 focus-within:border-white/60 sm:max-w-md">
      <SearchIcon className="shrink-0 text-[18px] text-white/75" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/65 focus:outline-none"
      />
    </label>
  );
}

/**
 * The navy sheet a screen's content sits on: full width, rounded top corners,
 * overlapping the bottom of the PageHero so the page reads as layered, as on Home.
 */
export function PageSheet({ children }: { children: ReactNode }) {
  return <div className="relative -mt-6 rounded-t-[26px] bg-navy">{children}</div>;
}

/**
 * The content area under a PageHero, on a PageSheet. `narrow` keeps reading-width
 * screens to one centred column (`true` = 2xl, `'wide'` = 3xl for forms with
 * side-by-side fields).
 */
export function PageBody({
  narrow = false,
  className,
  children,
}: {
  narrow?: boolean | 'wide';
  className?: string;
  children: ReactNode;
}) {
  return (
    <PageSheet>
      <div className={cn('mx-auto max-w-wrap px-4 pb-12 pt-6 sm:px-6', className)}>
        {narrow ? (
          <div className={cn('mx-auto space-y-6', narrow === 'wide' ? 'max-w-3xl' : 'max-w-2xl')}>{children}</div>
        ) : (
          children
        )}
      </div>
    </PageSheet>
  );
}
