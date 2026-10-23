import { CALCULATORS } from '@/components/calculators/registry';
import { StarIcon } from '@/components/icons';
import { useToolPrefs } from '@/lib/toolPrefs';
import { Wrap } from './section';

const TITLE = new Map(CALCULATORS.map((c) => [c.id, c.title]));

function Chip({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      className="min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-3.5 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:border-violet"
    >
      {TITLE.get(id)}
    </button>
  );
}

/**
 * Pinned and recently used calculators. Renders nothing until there is
 * something to show, so a first-time user still sees the landing page as-is.
 */
export function YourTools({ onOpenCalculator }: { onOpenCalculator: (id: string) => void }) {
  const { favourites, recents } = useToolPrefs();
  // Ignore ids for calculators that no longer exist, and don't repeat pins under Recent.
  const pinned = favourites.filter((id) => TITLE.has(id));
  const recent = recents.filter((id) => TITLE.has(id) && !pinned.includes(id));
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
                <Chip key={id} id={id} onOpen={onOpenCalculator} />
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
                <Chip key={id} id={id} onOpen={onOpenCalculator} />
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
