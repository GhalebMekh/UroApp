import { StarIcon } from '@/components/icons';
import { useToolPrefs } from '@/lib/toolPrefs';
import { DashCard } from './DashCard';
import { ToolChip as Chip } from './ToolChip';
import { isKnownCalculator } from './calculatorTitles';

/** Pinned and recently used calculators, with a hint until there are any. */
export function ToolsCard({
  onOpenCalculator,
  onBrowse,
}: {
  onOpenCalculator: (id: string) => void;
  onBrowse: () => void;
}) {
  const { favourites, recents } = useToolPrefs();
  // Ignore ids for calculators that no longer exist, and don't repeat pins under Recent.
  const pinned = favourites.filter(isKnownCalculator);
  const recent = recents.filter((id) => isKnownCalculator(id) && !pinned.includes(id));

  return (
    <DashCard title="Your tools" action={{ label: 'All calculators', onClick: onBrowse }}>
      {pinned.length > 0 && (
        <div className="mb-4">
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
        <div className="mb-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-2">Recently used</div>
          <div className="flex flex-wrap gap-2">
            {recent.map((id) => (
              <Chip key={id} id={id} onOpen={onOpenCalculator} />
            ))}
          </div>
        </div>
      )}

      {pinned.length === 0 && (
        <p className="rounded-[12px] border border-dashed border-line px-4 py-3 text-[13px] text-muted">
          Tap the <StarIcon className="inline align-[-2px] text-[13px] text-amber" /> on any calculator to pin
          it here{recent.length === 0 ? '; the ones you open will appear too.' : '.'}
        </p>
      )}
    </DashCard>
  );
}
