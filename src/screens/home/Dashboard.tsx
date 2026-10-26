import type { Screen, ScreenLink } from '@/navigation';
import { useAccount } from '@/lib/accountContext';
import { ROLE_LABEL } from '@/lib/profile';
import { SearchIcon } from '@/components/icons';
import { OnCallCard } from './OnCallCard';
import { ToolsCard } from './ToolsCard';
import { QuickAccess } from './QuickAccess';
import { PracticeCard } from './PracticeCard';
import { ConferenceCard } from './ConferenceCard';

function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * The installed app's Home: a working dashboard rather than a sales page.
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
  const { status, profile } = useAccount();
  const now = new Date();
  const name = status === 'signedIn' ? profile.displayName : '';
  const byline =
    status === 'signedIn'
      ? [profile.role ? ROLE_LABEL[profile.role] : '', profile.institution].filter(Boolean).join(' · ')
      : '';

  return (
    <div className="mx-auto max-w-wrap px-4 pt-6 sm:px-6 md:pt-8">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <header className="min-w-0">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="font-display text-[28px] font-semibold leading-tight md:text-[32px]">
            {greetingFor(now.getHours())}
            {name && `, ${name}`}
          </h1>
          {byline && <p className="mt-1 truncate text-[13px] text-muted">{byline}</p>}
        </header>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex min-h-[48px] w-full items-center gap-3 rounded-[14px] border border-line bg-navy-2 px-4 text-left text-[14px] text-muted-2 transition-colors hover:border-violet md:max-w-sm"
        >
          <SearchIcon className="shrink-0 text-[18px]" />
          <span className="truncate">Search calculators, guidelines and tools</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-flow-row-dense lg:grid-cols-3">
        <OnCallCard onOpen={(id) => onOpenLink({ residency: { section: 'oncall', emergency: id } })} />
        <ToolsCard onOpenCalculator={onOpenCalculator} onBrowse={() => onNavigate('calculators')} />
        <QuickAccess onOpenLink={onOpenLink} className="sm:col-span-2" />
        <PracticeCard onOpen={onOpenRehearsal} />
        <ConferenceCard onOpen={() => onNavigate('conferences')} />
      </div>
    </div>
  );
}
