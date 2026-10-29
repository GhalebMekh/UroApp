import { useAccount } from '@/lib/accountContext';
import { ROLE_LABEL } from '@/lib/profile';
import { PersonIcon, SearchIcon } from '@/components/icons';
import { HeroShell } from '@/components/PageHero';
import { greetingFor, initialsOf } from './homeText';

/**
 * Home's gradient header: date, greeting, the profile button and search.
 * The dashboard cards below overlap its lower edge.
 */
export function HomeHeader({ onOpenSearch, onOpenProfile }: { onOpenSearch: () => void; onOpenProfile: () => void }) {
  const { status, profile } = useAccount();
  const now = new Date();
  const signedIn = status === 'signedIn';
  const name = signedIn ? profile.displayName.trim() : '';
  const initials = initialsOf(name);
  const byline = signedIn
    ? [profile.role ? ROLE_LABEL[profile.role] : '', profile.institution].filter(Boolean).join(' · ')
    : '';

  return (
    // Extra bottom space: the dashboard cards overlap the band's lower edge.
    <HeroShell className="pb-16 md:pb-20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="font-display text-[30px] font-bold leading-[1.1] text-white md:text-[36px]">
            {greetingFor(now.getHours())}
            {name && (
              <>
                ,<br className="sm:hidden" /> {name}
              </>
            )}
          </h1>
          {byline && <p className="mt-1.5 truncate text-[13px] text-white/80">{byline}</p>}
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label={signedIn ? 'Your profile and account' : 'Sign in, account and settings'}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/30 bg-white/[0.16] text-[16px] font-semibold text-white transition-colors hover:bg-white/25"
        >
          {initials || <PersonIcon className="text-[22px]" />}
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenSearch}
        className="mt-5 flex min-h-[48px] w-full items-center gap-3 rounded-[14px] border border-white/20 bg-white/[0.12] px-4 text-left text-[14px] text-white/80 transition-colors hover:bg-white/[0.18] md:max-w-md"
      >
        <SearchIcon className="shrink-0 text-[18px]" />
        <span className="truncate">Search calculators, guidelines and tools</span>
      </button>
    </HeroShell>
  );
}
