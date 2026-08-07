import { BrandMark } from './BrandMark';
import { SearchIcon } from './icons';
import { TIER_LABEL, useEntitlements } from '@/lib/entitlements';

/** Persistent top bar — sticky, blurred, safe-area aware (CLAUDE.md). */
export function TopBar({
  onOpenSearch,
  canGoBack = false,
  onBack,
}: {
  onOpenSearch: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
}) {
  const { tier } = useEntitlements();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-navy/[0.78] pt-safe backdrop-blur-[14px]">
      <div className="mx-auto flex h-16 max-w-wrap items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          {canGoBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-navy-2 text-[20px] leading-none text-muted transition-colors hover:border-violet hover:text-violet-soft"
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
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-navy-2 text-[18px] text-muted transition-colors hover:border-violet hover:text-violet-soft"
          >
            <SearchIcon />
          </button>
          <span className="rounded-full border border-line bg-navy-2 px-3 py-1 text-[12px] font-semibold text-violet-soft">
            {TIER_LABEL[tier]}
          </span>
        </div>
      </div>
    </header>
  );
}
