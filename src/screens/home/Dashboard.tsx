import type { Screen, ScreenLink } from '@/navigation';
import { HomeHeader } from './HomeHeader';
import { OnCallCard } from './OnCallCard';
import { ToolsCard } from './ToolsCard';
import { QuickAccess } from './QuickAccess';
import { PracticeCard } from './PracticeCard';
import { ConferenceCard } from './ConferenceCard';

/**
 * The installed app's Home: a working dashboard rather than a sales page —
 * a gradient header (greeting, profile, search) with the cards overlapping it.
 *
 * Layout reflows with the window, which is what lets one build serve the
 * iPhone, the iPhone Duo folded and unfolded, and iPad (including Split View),
 * and re-flow live when the Duo is opened or closed:
 *   - under 640 px (iPhone, Duo outer display, narrow Split View): one column,
 *     in reading order;
 *   - 640–1023 px (Duo inner display, iPad portrait, iPhone landscape): two columns;
 *   - 1024 px and up (iPad landscape): three columns, with the rehearsal card
 *     back-filling the first row beside on-call and tools.
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
  return (
    <>
      <HomeHeader onOpenSearch={onOpenSearch} onOpenProfile={() => onNavigate('more')} />

      <div className="relative mx-auto -mt-10 max-w-wrap px-4 sm:px-6 md:-mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-flow-row-dense lg:grid-cols-3">
          <OnCallCard onOpen={(id) => onOpenLink({ residency: { section: 'oncall', emergency: id } })} />
          <ToolsCard onOpenCalculator={onOpenCalculator} onBrowse={() => onNavigate('calculators')} />
          <QuickAccess onOpenLink={onOpenLink} className="sm:col-span-2" />
          <PracticeCard onOpen={onOpenRehearsal} />
          <ConferenceCard onOpen={() => onNavigate('conferences')} />
        </div>
      </div>
    </>
  );
}
