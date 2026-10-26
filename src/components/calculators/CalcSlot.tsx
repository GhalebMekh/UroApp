import type { ComponentType, SyntheticEvent } from 'react';
import { cn } from '@/lib/cn';
import { StarIcon } from '@/components/icons';
import { markToolUsed, toggleFavouriteTool, useToolPrefs } from '@/lib/toolPrefs';

/**
 * Wraps one calculator: a pin star in the corner, and records "used" on the
 * first real interaction. Doing it here means no calculator needs to know
 * about favourites or recents.
 */
export function CalcSlot({ id, title, Component }: { id: string; title: string; Component: ComponentType }) {
  const { favourites } = useToolPrefs();
  const pinned = favourites.includes(id);

  // Any click or edit inside the calculator counts as use — except the star itself.
  const recordUse = (e: SyntheticEvent) => {
    if ((e.target as HTMLElement).closest('[data-fav-toggle]')) return;
    markToolUsed(id);
  };

  return (
    <div
      onClickCapture={recordUse}
      onChangeCapture={recordUse}
      // The h3 padding stops a long title running under the star.
      className="relative [&>section>h3]:pr-11"
    >
      <button
        type="button"
        data-fav-toggle
        onClick={() => toggleFavouriteTool(id)}
        aria-pressed={pinned}
        aria-label={pinned ? `Unpin ${title} from Home` : `Pin ${title} to Home`}
        className={cn(
          'absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full text-[19px] transition-colors',
          pinned ? 'text-amber' : 'text-muted-2 hover:text-ink',
        )}
      >
        <StarIcon filled={pinned} />
      </button>
      <Component />
    </div>
  );
}
