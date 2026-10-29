import { useEffect, useState } from 'react';
import { BrandMark } from './BrandMark';
import { SearchIcon } from './icons';
import { TIER_LABEL, useEntitlements } from '@/lib/entitlements';
import { cn } from '@/lib/cn';

/**
 * Persistent top bar — sticky, blurred, safe-area aware (CLAUDE.md).
 * `overHero`: the screen starts with a gradient header (Home), so the bar stays
 * clear over it and only takes its navy background once the page scrolls.
 */
export function TopBar({
  onOpenSearch,
  canGoBack = false,
  onBack,
  overHero = false,
}: {
  onOpenSearch: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
  overHero?: boolean;
}) {
  const { tier } = useEntitlements();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);

  const clear = overHero && !scrolled;
  const chip = clear
    ? 'border-white/25 bg-white/[0.14] text-white'
    : 'border-line bg-navy-2 text-muted hover:border-violet hover:text-violet-soft';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b pt-safe transition-colors duration-200',
        clear ? 'border-transparent bg-transparent' : 'border-line bg-navy/[0.78] backdrop-blur-[14px]',
      )}
    >
      <div className="mx-auto flex h-16 max-w-wrap items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          {canGoBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className={cn('grid h-11 w-11 place-items-center rounded-full border text-[20px] leading-none transition-colors', chip)}
            >
              ←
            </button>
          )}
          <div className="flex items-center gap-2.5 text-[18px] font-bold tracking-[-0.02em]">
            <BrandMark className="h-[30px] w-[30px] text-[17px]" />
            UroApp
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search"
            className={cn('grid h-11 w-11 place-items-center rounded-full border text-[18px] transition-colors', chip)}
          >
            <SearchIcon />
          </button>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-[12px] font-semibold',
              clear ? 'border-white/25 bg-white/[0.14] text-white' : 'border-line bg-navy-2 text-violet-soft',
            )}
          >
            {TIER_LABEL[tier]}
          </span>
        </div>
      </div>
    </header>
  );
}
