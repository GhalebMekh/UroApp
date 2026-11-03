import type { ScreenLink } from '@/navigation';
import { hasAccess, useEntitlements, TIER_LABEL } from '@/lib/entitlements';
import { FEATURE_TIER, PAYWALL_ENABLED } from '@/lib/featureTiers';
import { DashCard } from './DashCard';
import { tileById, type Tile } from './quickTiles';

/** Launcher for the user's pinned workspaces: 4 per row on a phone, one row of 8 when wide. */
export function QuickAccess({
  ids,
  onOpenLink,
  className,
}: {
  ids: readonly string[];
  onOpenLink: (link: ScreenLink) => void;
  className?: string;
}) {
  const { tier } = useEntitlements();
  const tiles = ids.map(tileById).filter((t): t is Tile => !!t);

  return (
    <DashCard title="Quick access" className={className}>
      {tiles.length === 0 ? (
        <p className="text-[13px] text-muted">No shortcuts pinned. Tap Edit Home to add some.</p>
      ) : (
        <div className="grid grid-cols-4 gap-1 md:grid-cols-8">
          {tiles.map(({ id, label, Icon, link, feature }) => {
            const required = feature ? FEATURE_TIER[feature] : null;
            const locked = PAYWALL_ENABLED && required !== null && !hasAccess(tier, required);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onOpenLink(link)}
                className="group relative flex min-h-[44px] flex-col items-center gap-2 rounded-[12px] px-1 py-2.5 text-center transition-colors hover:bg-steel"
              >
                <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-line bg-navy text-[20px] text-violet-soft transition-colors group-hover:border-violet/60">
                  <Icon />
                </span>
                <span className="text-[11.5px] font-semibold leading-tight text-muted transition-colors group-hover:text-ink">
                  {label}
                </span>
                {locked && required && (
                  <span className="absolute right-1 top-1 rounded-[5px] bg-violet/[0.18] px-1 py-px text-[9px] font-semibold uppercase tracking-[0.04em] text-violet-soft">
                    {TIER_LABEL[required]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </DashCard>
  );
}
