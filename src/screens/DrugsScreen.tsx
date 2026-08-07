import { useMemo, useState } from 'react';
import {
  DRUG_INTERACTIONS,
  INTERACTION_CATEGORIES,
  SEVERITY_META,
  type DrugInteraction,
  type InteractionSeverity,
} from '@/data/drugInteractions';
import { cn } from '@/lib/cn';

const BAND_STYLES: Record<'high' | 'moderate' | 'low', string> = {
  high: 'border-crimson/50 bg-crimson/[0.12] text-crimson',
  moderate: 'border-amber/50 bg-amber/[0.12] text-amber',
  low: 'border-teal/50 bg-teal/[0.12] text-teal',
};

/** Rank so the most dangerous interactions sort first within a group. */
const SEVERITY_ORDER: Record<InteractionSeverity, number> = {
  contraindicated: 0,
  major: 1,
  moderate: 2,
  minor: 3,
};

function SeverityBadge({ severity }: { severity: InteractionSeverity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        'inline-flex flex-shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]',
        BAND_STYLES[meta.band],
      )}
    >
      {meta.label}
    </span>
  );
}

function InteractionCard({ item }: { item: DrugInteraction }) {
  return (
    <div className="rounded-[14px] border border-line bg-navy-2 p-5">
      {/* min-w-0 lets the drug names wrap instead of forcing the badge off-screen
          on a phone (flex children default to min-width:auto). */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 break-words text-[14px] font-semibold leading-snug">
          {item.drugA}
          <span className="mx-1.5 text-violet-soft">⟷</span>
          {item.drugB}
        </div>
        <SeverityBadge severity={item.severity} />
      </div>

      <dl className="space-y-2 text-[13px]">
        <div>
          <dt className="font-semibold text-ink">Effect</dt>
          <dd className="text-muted">{item.effect}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Management</dt>
          <dd className="text-muted">{item.management}</dd>
        </div>
      </dl>

      <div className="mt-3 text-[12px] text-muted-2">
        {item.source.url ? (
          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-violet transition-colors hover:text-violet-soft"
          >
            {item.source.label} ↗
          </a>
        ) : (
          <span>Source: {item.source.label}</span>
        )}
      </div>
    </div>
  );
}

export function DrugsScreen() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? DRUG_INTERACTIONS.filter((d) =>
          `${d.drugA} ${d.drugB} ${d.category} ${d.effect}`.toLowerCase().includes(q),
        )
      : DRUG_INTERACTIONS;
    return [...list].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [query]);

  const groups = INTERACTION_CATEGORIES
    .map((category) => ({
      category,
      items: filtered.filter((d) => d.category === category),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            Pharmacology
          </div>
          <h2 className="font-display text-[28px] font-semibold">Drug interactions</h2>
          <p className="mt-3 text-[14px] text-muted">
            High-yield drug–drug interactions relevant to urology practice, grouped by
            drug class and sorted by severity.
          </p>
        </header>

        {/* Prominent clinical-judgment disclaimer (required) */}
        <div className="rounded-[14px] border border-amber/50 bg-amber/[0.10] px-5 py-4">
          <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-amber">
            ⚠ Decision support only
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            This is a curated, guideline-grounded reference — <strong>not</strong> a comprehensive
            interaction checker. It does not capture every drug, dose, or patient-specific factor.
            Always verify against current prescribing information and a full interaction database,
            and treat every entry as one input to your own clinical judgment. The final decision
            rests with the treating clinician.
          </p>
        </div>

        {/* Search */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a drug or class (e.g. tamsulosin, warfarin, ciprofloxacin)…"
          className="w-full rounded-[11px] border border-line bg-navy px-4 py-3 text-[14px] text-ink placeholder:text-muted-2 focus:border-violet focus:outline-none"
        />

        {/* Severity legend */}
        <div className="flex flex-wrap gap-2">
          {(['contraindicated', 'major', 'moderate', 'minor'] as InteractionSeverity[]).map((s) => (
            <SeverityBadge key={s} severity={s} />
          ))}
        </div>

        {/* Grouped results */}
        {groups.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-muted">
            No interactions match “{query}”.
          </p>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.category}>
                <h3 className="mb-3 text-[14px] font-semibold uppercase tracking-[0.05em] text-violet-soft">
                  {group.category}
                  <span className="ml-1.5 text-[12px] text-muted-2">({group.items.length})</span>
                </h3>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <InteractionCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
