import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SearchIcon } from './icons';

export type HeroTone = 'violet' | 'emergency' | 'pediatric';

const TONE_BG: Record<HeroTone, string> = {
  violet: 'bg-violet-hero',
  emergency: 'bg-emergency-hero',
  pediatric: 'bg-peds-hero',
};

/** How far (px) the bubbles lean toward a finger on the header. */
const PULL = 22;

/**
 * The coloured band every screen opens with. Owner, 2026-11-22: keep the
 * section colours and moving bubbles from before, with the unslop edits —
 * each band is one hue (no violet-to-blue blend), the bubbles are soft, drift
 * slowly, and lean a little toward where you touch the header, then float back.
 * Reduce Motion stops both. Pulled up under the top bar so the colour runs to
 * the top of the screen.
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
  const layer = useRef<HTMLSpanElement>(null);
  const still = useRef(false);

  useEffect(() => {
    still.current = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  function lean(e: PointerEvent<HTMLElement>) {
    const el = layer.current;
    if (!el || still.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1 … 1
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.transform = `translate(${(x * PULL).toFixed(1)}px, ${(y * PULL).toFixed(1)}px)`;
  }

  function release() {
    if (layer.current) layer.current.style.transform = 'translate(0px, 0px)';
  }

  return (
    <header
      onPointerDown={lean}
      onPointerMove={(e) => {
        // Follow a finger, or a mouse only while its button is held.
        if (e.pointerType !== 'mouse' || e.buttons) lean(e);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      className={cn(
        'relative -mt-[calc(4rem+env(safe-area-inset-top))] overflow-hidden pt-[calc(4rem+env(safe-area-inset-top))]',
        // Bleed the colour under side insets; the padding keeps the content clear of them.
        'bleed-safe-x',
        TONE_BG[tone],
      )}
    >
      {/* Two soft bubbles: they drift on their own (inner spans) and lean toward a touch (outer layer). */}
      <span
        ref={layer}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      >
        <span className="absolute -right-16 -top-12 h-72 w-72 animate-drift-a rounded-full bg-white/[0.08]" />
        <span className="absolute -bottom-20 left-1/3 h-44 w-44 animate-drift-b rounded-full bg-white/[0.06]" />
      </span>
      {/* Bottom space leaves room for the PageSheet's rounded edge to overlap. */}
      <div className={cn('relative mx-auto max-w-wrap px-4 pt-4 sm:px-6 md:pt-6', className ?? 'pb-12 md:pb-14')}>
        {children}
      </div>
    </header>
  );
}

/** A screen's header: section label, title, one-line description, then any controls. */
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
  /** Right-aligned beside the section label, e.g. an "All calculators" link. */
  action?: { label: string; onClick: () => void };
  /** Controls shown under the description: search, tabs, filters. */
  children?: ReactNode;
}) {
  return (
    <HeroShell tone={tone}>
      {(eyebrow || action) && (
        <div className="mb-1 flex min-h-[24px] items-center justify-between gap-3">
          <div className="text-[13px] text-white/75">{eyebrow}</div>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="-my-2.5 min-h-[44px] shrink-0 px-1 text-[13px] font-medium text-white/90 transition-colors hover:text-white"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
      <h1 className="font-display text-[28px] font-medium leading-[1.15] text-white md:text-[32px]">{title}</h1>
      {lede && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/80">{lede}</p>}
      {children && <div className="mt-5">{children}</div>}
    </HeroShell>
  );
}

/** Segmented tabs on the coloured header: a translucent track, the selected tab in white. */
export function HeroTabs<T extends string>({
  items,
  value,
  onChange,
  className,
  dense,
}: {
  items: { id: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  /** Tighter side padding, for five tabs at phone width. */
  dense?: boolean;
}) {
  return (
    <div
      className={cn('grid gap-1 rounded-[12px] border border-white/15 bg-white/[0.10] p-1', className)}
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
              'flex min-h-[44px] items-center justify-center gap-1.5 rounded-[8px] py-2 text-[13px] font-medium transition-colors',
              dense ? 'px-1' : 'px-2',
              active ? 'bg-white text-navy' : 'text-white/85 hover:bg-white/10',
            )}
          >
            {it.label}
            {it.count !== undefined && <span className="font-mono text-[12px] opacity-60">{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Wrap-around chips on the coloured header (for longer option lists). */
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
              'min-h-[44px] rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors',
              active
                ? 'border-white bg-white text-navy'
                : 'border-white/20 bg-white/[0.10] text-white/90 hover:bg-white/[0.16]',
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/** The search field on the coloured header. */
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
    <label className="flex min-h-[48px] w-full items-center gap-3 rounded-[12px] border border-white/20 bg-white/[0.12] px-4 focus-within:border-white/60 sm:max-w-md">
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
 * The navy sheet a screen's content sits on: rounded top corners overlapping
 * the bottom of the coloured header, so the page reads as layered.
 */
export function PageSheet({ children }: { children: ReactNode }) {
  return <div className="relative -mt-6 rounded-t-[24px] bg-navy">{children}</div>;
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
