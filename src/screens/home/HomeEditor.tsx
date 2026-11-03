import { cn } from '@/lib/cn';
import {
  DEFAULT_LAYOUT,
  MAX_QUICK,
  moveItem,
  setHomeLayout,
  toggleTile,
  type HomeCard,
  type HomeLayout,
} from '@/lib/homeLayout';
import { CheckIcon } from '@/components/icons';
import { DashCard } from './DashCard';
import { TILES } from './quickTiles';

const CARD_LABEL: Record<HomeCard, string> = {
  oncall: 'On-call',
  tools: 'Your tools',
  quick: 'Quick access',
  practice: 'Practice',
  conference: 'Next conference',
  cme: 'CME',
};

const btn =
  'grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border border-line text-[15px] text-muted transition-colors hover:text-ink disabled:opacity-30';

/** Edit mode for Home: reorder and hide cards, choose up to eight quick-access tiles. */
export function HomeEditor({ layout, quick, onDone }: { layout: HomeLayout; quick: string[]; onDone: () => void }) {
  const save = (patch: Partial<HomeLayout>) => setHomeLayout({ ...layout, ...patch });

  return (
    <div className="grid gap-4">
      <DashCard title="Cards" action={{ label: 'Done', onClick: onDone }}>
        <p className="mb-3 text-[13px] text-muted">Use the arrows to reorder. Switch a card off to hide it.</p>
        <ul className="grid gap-2">
          {layout.order.map((card, i) => {
            const shown = !layout.hidden.includes(card);
            return (
              <li key={card} className="flex items-center gap-2 rounded-[12px] border border-line bg-navy px-3 py-1.5">
                <span className={cn('flex-1 text-[14.5px] font-semibold', !shown && 'text-muted line-through')}>
                  {CARD_LABEL[card]}
                </span>
                <button type="button" aria-label={`Move ${CARD_LABEL[card]} up`} disabled={i === 0} className={btn}
                  onClick={() => save({ order: moveItem(layout.order, card, -1) })}>↑</button>
                <button type="button" aria-label={`Move ${CARD_LABEL[card]} down`} disabled={i === layout.order.length - 1} className={btn}
                  onClick={() => save({ order: moveItem(layout.order, card, 1) })}>↓</button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={shown}
                  aria-label={`Show ${CARD_LABEL[card]}`}
                  onClick={() =>
                    save({ hidden: shown ? [...layout.hidden, card] : layout.hidden.filter((c) => c !== card) })
                  }
                  className="grid min-h-[44px] w-14 shrink-0 place-items-center"
                >
                  <span className={cn('relative h-7 w-12 rounded-full transition-colors', shown ? 'bg-violet' : 'bg-steel')}>
                    <span className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all', shown ? 'left-[22px]' : 'left-0.5')} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </DashCard>

      <DashCard title={`Quick access · ${quick.length} of ${MAX_QUICK}`}>
        <p className="mb-3 text-[13px] text-muted">Tap to pin or unpin. Pinned shortcuts show in the order you pin them.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TILES.map(({ id, label, Icon }) => {
            const on = quick.includes(id);
            const full = !on && quick.length >= MAX_QUICK;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                disabled={full}
                onClick={() => save({ quick: toggleTile(quick, id) })}
                className={cn(
                  'flex min-h-[48px] items-center gap-2 rounded-[12px] border px-3 text-left text-[13.5px] font-semibold transition-colors disabled:opacity-40',
                  on ? 'border-violet/70 bg-violet/[0.14] text-ink' : 'border-line bg-navy text-muted',
                )}
              >
                <span className="text-[18px] text-violet-soft"><Icon /></span>
                <span className="flex-1">{label}</span>
                {on && <CheckIcon className="text-violet-soft" />}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setHomeLayout(DEFAULT_LAYOUT)}
          className="mt-4 min-h-[44px] self-start text-[13px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Reset Home to default
        </button>
      </DashCard>
    </div>
  );
}
