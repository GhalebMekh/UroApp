import { useAccount } from '@/lib/accountContext';
import { ROLE_LABEL } from '@/lib/profile';
import { PersonIcon, SearchIcon } from '@/components/icons';
import { HeroShell } from '@/components/PageHero';
import { initialsOf } from './homeText';

/**
 * Home's coloured header. Unslop pass (owner, 2026-11-22): the title names the
 * day instead of greeting ("Good afternoon"); the name and role sit under it.
 * The dashboard cards overlap its lower edge.
 */
export function HomeHeader({ onOpenSearch, onOpenProfile }: { onOpenSearch: () => void; onOpenProfile: () => void }) {
  const { status, profile } = useAccount();
  const now = new Date();
  const signedIn = status === 'signedIn';
  const name = signedIn ? profile.displayName.trim() : '';
  const initials = initialsOf(name);
  const byline = [name, signedIn && profile.role ? ROLE_LABEL[profile.role] : '', signedIn ? profile.institution : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <HeroShell className="pb-16 md:pb-20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-medium leading-[1.15] text-white md:text-[32px]">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h1>
          {byline && <p className="mt-1 truncate text-[14px] text-white/80">{byline}</p>}
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label={signedIn ? 'Your profile and account' : 'Sign in, account and settings'}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/30 bg-white/[0.16] text-[15px] font-medium text-white transition-colors hover:bg-white/25"
        >
          {initials || <PersonIcon className="text-[20px]" />}
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenSearch}
        className="mt-5 flex min-h-[48px] w-full items-center gap-3 rounded-[12px] border border-white/20 bg-white/[0.12] px-4 text-left text-[14px] text-white/75 transition-colors hover:bg-white/[0.18] md:max-w-md"
      >
        <SearchIcon className="shrink-0 text-[18px]" />
        <span className="truncate">Search</span>
      </button>
    </HeroShell>
  );
}
