import { useMemo, useState } from 'react';
import {
  DRUG_INTERACTIONS,
  INTERACTION_CATEGORIES,
  SEVERITY_META,
  type DrugInteraction,
  type InteractionSeverity,
} from '@/data/drugInteractions';
import { cn } from '@/lib/cn';
import { ChevronRightIcon } from '@/components/icons';
import { HeroSearch, PageBody, PageHero } from '@/components/PageHero';

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

/**
 * One interaction. Collapsed it shows the pair and the severity — the severity
 * is never hidden — and tapping reveals effect, management and source.
 */
function InteractionCard({ item, defaultOpen }: { item: DrugInteraction; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[14px] border border-line bg-navy-2">
      {/* min-w-0 lets the drug names wrap instead of forcing the badge off-screen
          on a phone (flex children default to min-width:auto). */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[52px] w-full flex-wrap items-center justify-between gap-2 rounded-[14px] px-4 py-3 text-left transition-colors hover:bg-steel"
      >
        <span className="min-w-0 flex-1 break-words text-[14px] font-semibold leading-snug">
          {item.drugA}
          <span className="mx-1.5 text-violet-soft">⟷</span>
          {item.drugB}
        </span>
        <span className="flex items-center gap-2">
          <SeverityBadge severity={item.severity} />
          <ChevronRightIcon
            className={cn('text-[16px] text-muted-2 transition-transform', open && 'rotate-90')}
          />
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4">
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
      )}
    </div>
  );
}

/** Open the matches automatically once a search has narrowed the list this far. */
const AUTO_OPEN_AT = 3;

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
  const autoOpen = query.trim() !== '' && filtered.length <= AUTO_OPEN_AT;

  return (
    <>
      <PageHero
        eyebrow="Pharmacology"
        title="Drug interactions"
        lede="High-yield drug–drug interactions relevant to urology practice, grouped by drug class and sorted by severity. Tap one for its effect and management."
      >
        <HeroSearch
          value={query}
          onChange={setQuery}
          placeholder="Search a drug or class (e.g. tamsulosin, warfarin)…"
          label="Search drug interactions"
        />
      </PageHero>

      <PageBody narrow>

        {/* Prominent clinical-judgment disclaimer (required) */}
        <div className="rounded-[14px] border border-amber/50 bg-amber/[0.10] px-5 py-4">
          <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-amber">
            Decision support only
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            This is a curated, guideline-grounded reference — <strong>not</strong> a comprehensive
            interaction checker. It does not capture every drug, dose, or patient-specific factor.
            Always verify against current prescribing information and a full interaction database,
            and treat every entry as one input to your own clinical judgment. The final decision
            rests with the treating clinician.
          </p>
        </div>

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
                    <InteractionCard
                      // Re-key on the query so a narrowing search can open the matches.
                      key={`${item.id}:${autoOpen}`}
                      item={item}
                      defaultOpen={autoOpen}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
