import { StarIcon } from '@/components/icons';
import { useToolPrefs } from '@/lib/toolPrefs';
import { Wrap } from './section';
import { ToolChip } from './ToolChip';
import { isKnownCalculator } from './calculatorTitles';

/**
 * Pinned and recently used calculators. Renders nothing until there is
 * something to show, so a first-time user still sees the landing page as-is.
 */
export function YourTools({ onOpenCalculator }: { onOpenCalculator: (id: string) => void }) {
  const { favourites, recents } = useToolPrefs();
  // Ignore ids for calculators that no longer exist, and don't repeat pins under Recent.
  const pinned = favourites.filter(isKnownCalculator);
  const recent = recents.filter((id) => isKnownCalculator(id) && !pinned.includes(id));
  if (pinned.length === 0 && recent.length === 0) return null;

  return (
    <section className="border-b border-line pb-8 pt-8">
      <Wrap>
        <h2 className="mb-4 font-display text-[22px] font-semibold">Your tools</h2>

        {pinned.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber">
              <StarIcon filled className="text-[12px]" /> Pinned
            </div>
            <div className="flex flex-wrap gap-2">
              {pinned.map((id) => (
                <ToolChip key={id} id={id} onOpen={onOpenCalculator} />
              ))}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-2">
              Recently used
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((id) => (
                <ToolChip key={id} id={id} onOpen={onOpenCalculator} />
              ))}
            </div>
          </div>
        )}

        {pinned.length === 0 && (
          <p className="mt-4 text-[12px] text-muted-2">
            Tap the star on any calculator to pin it here.
          </p>
        )}
      </Wrap>
    </section>
  );
}
