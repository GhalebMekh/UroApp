import { useState } from 'react';
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
  TestisIcon,
  StagingIcon,
} from '@/components/icons';

const ORGAN_ICON: Record<OncologyOrgan, (p: { className?: string }) => JSX.Element> = {
  prostate: ProstateIcon,
  bladder: BladderIcon,
  kidney: KidneyIcon,
  testis: TestisIcon,
  general: StagingIcon,
};

/** Calculators workspace — a one-line group toggle reveals that group's list. */
export function CalculatorsScreen() {
  const [category, setCategory] = useState<CalcCategory>('oncological');
  const group = CALC_GROUPS.find((g) => g.category === category)!;
  const entries = CALCULATORS.filter((c) => c.category === category);

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
                  {organCalcs.map(({ id, Component }) => (
                    <Component key={id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Non-oncology: flat list */
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {entries.map(({ id, Component }) => (
            <Component key={id} />
          ))}
        </div>
      )}
    </div>
  );
}
