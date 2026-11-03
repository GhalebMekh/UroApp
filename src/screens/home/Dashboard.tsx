import { useState, type ReactNode } from 'react';
import type { Screen, ScreenLink } from '@/navigation';
import { normalizeLayout, useHomeLayout, type HomeCard } from '@/lib/homeLayout';
import { HomeHeader } from './HomeHeader';
import { OnCallCard } from './OnCallCard';
import { ToolsCard } from './ToolsCard';
import { QuickAccess } from './QuickAccess';
import { PracticeCard } from './PracticeCard';
import { ConferenceCard } from './ConferenceCard';
import { CmeCard } from './CmeCard';
import { HomeEditor } from './HomeEditor';
import { DEFAULT_QUICK, TILE_IDS } from './quickTiles';

/**
 * The installed app's Home: a working dashboard rather than a sales page —
 * a gradient header (greeting, profile, search) with the cards overlapping it.
 * The user picks the card order, hides cards and pins quick-access tiles
 * (owner, 2026-11-03), via "Edit Home" at the foot of the page.
 *
 * Layout reflows with the window, which is what lets one build serve the
 * iPhone, the iPhone Duo folded and unfolded, and iPad (including Split View):
 *   - under 640 px: one column, in the user's order;
 *   - 640–1023 px: two columns;
 *   - 1024 px and up: three columns, densely packed.
 */
export function Dashboard({
  onNavigate,
  onOpenCalculator,
  onOpenLink,
  onOpenSearch,
  onOpenRehearsal,
}: {
  onNavigate: (s: Screen) => void;
  onOpenCalculator: (id: string) => void;
  onOpenLink: (link: ScreenLink) => void;
  onOpenSearch: () => void;
  onOpenRehearsal: (procedureId?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const layout = normalizeLayout(useHomeLayout(), TILE_IDS);
  const quick = layout.quick ?? DEFAULT_QUICK;

  const cards: Record<HomeCard, ReactNode> = {
    oncall: <OnCallCard onOpen={(id) => onOpenLink({ residency: { section: 'oncall', emergency: id } })} />,
    tools: <ToolsCard onOpenCalculator={onOpenCalculator} onBrowse={() => onNavigate('calculators')} />,
    quick: <QuickAccess ids={quick} onOpenLink={onOpenLink} />,
    practice: <PracticeCard onOpen={onOpenRehearsal} />,
    conference: <ConferenceCard onOpen={() => onNavigate('conferences')} />,
    cme: <CmeCard onOpen={() => onNavigate('cme')} />,
  };
  const shown = layout.order.filter((c) => !layout.hidden.includes(c));

  return (
    <>
      <HomeHeader onOpenSearch={onOpenSearch} onOpenProfile={() => onNavigate('more')} />

      <div className="relative mx-auto -mt-10 max-w-wrap px-4 sm:px-6 md:-mt-12">
        {editing ? (
          <HomeEditor layout={layout} quick={quick} onDone={() => setEditing(false)} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-flow-row-dense lg:grid-cols-3">
              {shown.map((c) => (
                <div key={c} className={c === 'quick' ? 'grid sm:col-span-2' : 'grid'}>
                  {cards[c]}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="min-h-[44px] rounded-full border border-line px-5 text-[13.5px] font-semibold text-muted transition-colors hover:text-ink"
              >
                Edit Home
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
