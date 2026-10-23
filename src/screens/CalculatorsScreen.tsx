import { useEffect, useState, type ComponentType, type SyntheticEvent } from 'react';
import { cn } from '@/lib/cn';
import {
  CALCULATORS,
  CALC_GROUPS,
  ONCOLOGY_ORGANS,
  type CalcCategory,
  type OncologyOrgan,
} from '@/components/calculators/registry';
import {
  ProstateIcon,
  BladderIcon,
  KidneyIcon,
  AdrenalIcon,
  TestisIcon,
  StagingIcon,
  StarIcon,
} from '@/components/icons';
import { markToolUsed, toggleFavouriteTool, useToolPrefs } from '@/lib/toolPrefs';

/**
 * Wraps one calculator: a pin star in the corner, and records "used" on the
 * first real interaction. Doing it here means no calculator needs to know
 * about favourites or recents.
 */
function CalcSlot({
  id,
  title,
  Component,
  highlighted,
}: {
  id: string;
  title: string;
  Component: ComponentType;
  highlighted: boolean;
}) {
  const { favourites } = useToolPrefs();
  const pinned = favourites.includes(id);

  // Any click or edit inside the calculator counts as use — except the star itself.
  const recordUse = (e: SyntheticEvent) => {
    if ((e.target as HTMLElement).closest('[data-fav-toggle]')) return;
    markToolUsed(id);
  };

  return (
    <div
      id={`calc-${id}`}
      onClickCapture={recordUse}
      onChangeCapture={recordUse}
      className={cn(
        // scroll-mt clears the fixed top bar when we scroll a calculator into view;
        // the h3 padding stops a long title running under the star.
        'relative scroll-mt-24 rounded-[20px] transition-shadow [&>section>h3]:pr-11',
        highlighted && 'ring-2 ring-violet ring-offset-2 ring-offset-navy',
      )}
    >
      <button
        type="button"
        data-fav-toggle
        onClick={() => toggleFavouriteTool(id)}
        aria-pressed={pinned}
        aria-label={pinned ? `Unpin ${title} from Home` : `Pin ${title} to Home`}
        className={cn(
          'absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full text-[19px] transition-colors',
          pinned ? 'text-amber' : 'text-muted-2 hover:text-ink',
        )}
      >
        <StarIcon filled={pinned} />
      </button>
      <Component />
    </div>
  );
}

const ORGAN_ICON: Record<OncologyOrgan, (p: { className?: string }) => JSX.Element> = {
  prostate: ProstateIcon,
  bladder: BladderIcon,
  kidney: KidneyIcon,
  adrenal: AdrenalIcon,
  testis: TestisIcon,
  general: StagingIcon,
};

/** Calculators workspace — a one-line group toggle reveals that group's list. */
export function CalculatorsScreen({
  focusId = null,
  onFocusHandled,
}: {
  /** Calculator to open: switches to its tab and scrolls it into view. */
  focusId?: string | null;
  onFocusHandled?: () => void;
}) {
  const [category, setCategory] = useState<CalcCategory>('oncological');
  const [highlight, setHighlight] = useState<string | null>(null);
  /** A calculator waiting to be scrolled to once its tab has rendered. */
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const group = CALC_GROUPS.find((g) => g.category === category)!;
  const entries = CALCULATORS.filter((c) => c.category === category);

  // Step 1: a focus request switches to the calculator's tab and queues a scroll.
  useEffect(() => {
    if (!focusId) return;
    const target = CALCULATORS.find((c) => c.id === focusId);
    onFocusHandled?.();
    if (!target) return;
    setCategory(target.category);
    setHighlight(target.id);
    setPendingScroll(target.id);
  }, [focusId, onFocusHandled]);

  // Step 2: scroll only after the tab switch has committed to the DOM. A fixed
  // timeout here raced the render — when the new tab wasn't painted yet, the
  // card wasn't found and the jump silently did nothing. Effects run after
  // commit, and this one re-runs when `category` changes, so the card exists.
  // Instant, not smooth: a long smooth scroll can be interrupted on iOS.
  useEffect(() => {
    if (!pendingScroll) return;
    const el = document.getElementById(`calc-${pendingScroll}`);
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    setPendingScroll(null);
  }, [pendingScroll, category]);

  // The highlight ring fades on its own timer, independent of focusId.
  useEffect(() => {
    if (!highlight) return;
    const t = window.setTimeout(() => setHighlight(null), 1800);
    return () => window.clearTimeout(t);
  }, [highlight]);

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Calculators
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Validated instruments.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Each score runs entirely on-device and links to its primary publication.
        Inputs stay on your device — no patient-identifiable data is stored.
      </p>

      {/* Group toggle — both on one line; tap to reveal that group's calculators. */}
      <div className="mt-8 grid max-w-md grid-cols-2 gap-1.5 rounded-[12px] border border-line bg-navy p-1">
        {CALC_GROUPS.map((g) => {
          const active = g.category === category;
          const count = CALCULATORS.filter((c) => c.category === g.category).length;
          return (
            <button
              key={g.category}
              type="button"
              onClick={() => setCategory(g.category)}
              aria-pressed={active}
              className={cn(
                'min-h-[44px] rounded-[9px] px-3 py-2.5 text-[13px] font-semibold transition-colors',
                active ? cn('bg-violet/[0.18]', g.accent) : 'text-muted hover:text-ink',
              )}
            >
              {g.label}
              <span className="ml-1.5 text-[11px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[13px] text-muted-2">{group.blurb}</p>

      {/* Oncology: show calculators grouped by organ system */}
      {category === 'oncological' ? (
        <div className="mt-8 space-y-8">
          {ONCOLOGY_ORGANS.map((organGroup) => {
            const organCalcs = entries.filter((c) => c.organ === organGroup.organ);
            if (organCalcs.length === 0) return null;
            return (
              <div key={organGroup.organ}>
                <div className="mb-4 flex items-center gap-2">
                  {(() => {
                    const Icon = ORGAN_ICON[organGroup.icon];
                    return <Icon className="text-[19px] text-violet-soft" />;
                  })()}
                  <h3 className="text-[15px] font-semibold uppercase tracking-[0.05em] text-violet-soft">
                    {organGroup.label}
                  </h3>
                  <span className="text-[12px] text-muted">({organCalcs.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {organCalcs.map(({ id, title, Component }) => (
                    <CalcSlot key={id} id={id} title={title} Component={Component} highlighted={highlight === id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Non-oncology: flat list */
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {entries.map(({ id, title, Component }) => (
            <CalcSlot key={id} id={id} title={title} Component={Component} highlighted={highlight === id} />
          ))}
        </div>
      )}
    </div>
  );
}
