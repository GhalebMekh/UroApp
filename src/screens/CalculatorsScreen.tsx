import { useMemo, useState, type ComponentType } from 'react';
import { cn } from '@/lib/cn';
import {
  BENIGN_TOPICS,
  CALCULATORS,
  CALC_GROUPS,
  ONCOLOGY_ORGANS,
  groupLabel,
  type CalcCategory,
  type CalcEntry,
} from '@/components/calculators/registry';
import { ORGAN_ICON, TOPIC_ICON } from '@/components/calculators/groupIcons';
import { StarIcon } from '@/components/icons';
import { HeroSearch, HeroTabs, PageBody, PageHero } from '@/components/PageHero';
import { ToolGroupCard, ToolRow } from '@/components/ToolList';
import { toggleFavouriteTool, useToolPrefs } from '@/lib/toolPrefs';
import { SPECIALTY } from '@/lib/specialty';

interface Group {
  key: string;
  label: string;
  Icon?: ComponentType<{ className?: string }>;
  /** Heading colour for the group's specialty. */
  accent: string;
  items: CalcEntry[];
}

/** One calculator in the list: tap the row to open it, the star to pin it to Home. */
function CalcRow({ entry, onOpen, showGroup = false }: { entry: CalcEntry; onOpen: (id: string) => void; showGroup?: boolean }) {
  const { favourites } = useToolPrefs();
  const pinned = favourites.includes(entry.id);
  return (
    <ToolRow
      title={entry.title}
      subtitle={showGroup ? groupLabel(entry) : undefined}
      onOpen={() => onOpen(entry.id)}
      action={
        <button
          type="button"
          onClick={() => toggleFavouriteTool(entry.id)}
          aria-pressed={pinned}
          aria-label={pinned ? `Unpin ${entry.title} from Home` : `Pin ${entry.title} to Home`}
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-full text-[17px] transition-colors',
            pinned ? 'text-amber' : 'text-muted-2 hover:text-ink',
          )}
        >
          <StarIcon filled={pinned} />
        </button>
      }
    />
  );
}

/** Kept for the session, so coming back from a calculator restores the list as it was. */
const remembered: { category: CalcCategory; query: string } = { category: 'oncological', query: '' };

function matches(entry: CalcEntry, q: string): boolean {
  return `${entry.title} ${groupLabel(entry)} ${entry.category}`.toLowerCase().includes(q);
}

/**
 * Calculators — a short, scannable list; each calculator opens on its own
 * screen (CalculatorScreen), so the top bar's back arrow returns here.
 * Groups flow into two columns from 640 px (Duo unfolded, iPad) and three from 1024 px.
 */
export function CalculatorsScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const [category, setCategoryState] = useState<CalcCategory>(remembered.category);
  const [query, setQueryState] = useState(remembered.query);
  const setCategory = (c: CalcCategory) => {
    remembered.category = c;
    setCategoryState(c);
  };
  const setQuery = (v: string) => {
    remembered.query = v;
    setQueryState(v);
  };
  const { favourites } = useToolPrefs();
  const q = query.trim().toLowerCase();
  const meta = CALC_GROUPS.find((g) => g.category === category)!;

  const pinned = useMemo(
    () => favourites.map((id) => CALCULATORS.find((c) => c.id === id)).filter((c): c is CalcEntry => !!c),
    [favourites],
  );

  const groups: Group[] = useMemo(
    () =>
      category === 'oncological'
        ? ONCOLOGY_ORGANS.map((o) => ({
            key: o.organ,
            label: o.label,
            Icon: ORGAN_ICON[o.icon],
            accent: SPECIALTY.oncology.text,
            items: CALCULATORS.filter((c) => c.organ === o.organ),
          }))
        : BENIGN_TOPICS.map((t) => ({
            key: t.topic,
            label: t.label,
            Icon: TOPIC_ICON[t.topic],
            accent: SPECIALTY[t.specialty].text,
            items: CALCULATORS.filter((c) => c.topic === t.topic),
          })),
    [category],
  ).filter((g) => g.items.length > 0);

  const results = q ? CALCULATORS.filter((c) => matches(c, q)) : [];

  return (
    <>
      <PageHero
        eyebrow="Calculators"
        title="Validated instruments"
        lede="Each score runs on your device and links to its primary publication. Inputs are never stored."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <HeroSearch
            value={query}
            onChange={setQuery}
            placeholder={`Find one of ${CALCULATORS.length} calculators`}
            label="Find a calculator"
          />
          {!q && (
            <HeroTabs
              className="sm:w-[340px]"
              value={category}
              onChange={setCategory}
              items={CALC_GROUPS.map((g) => ({
                id: g.category,
                label: g.label,
                count: CALCULATORS.filter((c) => c.category === g.category).length,
              }))}
            />
          )}
        </div>
      </PageHero>

      <PageBody className="pt-0">
        {q ? (
          <section className="mt-6 rounded-card border border-line bg-navy-2 p-1.5 sm:max-w-2xl">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-[14px] text-muted">No calculator matches “{query.trim()}”.</p>
            ) : (
              <ul>
                {results.map((c) => (
                  <CalcRow key={c.id} entry={c} onOpen={onOpen} showGroup />
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="mt-6 rounded-card border border-line bg-navy-2 p-1.5 sm:max-w-2xl">
                <h3 className="flex items-center gap-2 px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber">
                  <StarIcon filled className="text-[13px]" /> Pinned
                </h3>
                <ul>
                  {pinned.map((c) => (
                    <CalcRow key={c.id} entry={c} onOpen={onOpen} showGroup />
                  ))}
                </ul>
              </section>
            )}

            <p className="mb-3 mt-6 text-[13px] text-muted-2">{meta.blurb}</p>
            <div className="gap-4 sm:columns-2 lg:columns-3">
              {groups.map((g) => (
                <ToolGroupCard key={g.key} title={g.label} Icon={g.Icon} count={g.items.length} accent={g.accent}>
                  {g.items.map((c) => (
                    <CalcRow key={c.id} entry={c} onOpen={onOpen} />
                  ))}
                </ToolGroupCard>
              ))}
            </div>
          </>
        )}
      </PageBody>
    </>
  );
}
