import { cn } from '@/lib/cn';
import {
  DEFAULT_LAYOUT,
  MAX_QUICK,
  moveItem,
  setHomeLayout,
  updateHomeLayout,
  toggleTile,
  type HomeCard,
  type HomeLayout,
} from '@/lib/homeLayout';
import { DashCard } from './DashCard';
import { DEFAULT_QUICK, TILES, tileById } from './quickTiles';

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

/** Edit mode for Home: reorder and hide cards, choose up to MAX_QUICK quick-access tiles. */
export function HomeEditor({ layout, quick, onDone }: { layout: HomeLayout; quick: string[]; onDone: () => void }) {
  const save = updateHomeLayout;
  const pinned = (l: HomeLayout) => l.quick ?? DEFAULT_QUICK;

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
                  onClick={() => save((l) => ({ order: moveItem(l.order, card, -1) }))}>↑</button>
                <button type="button" aria-label={`Move ${CARD_LABEL[card]} down`} disabled={i === layout.order.length - 1} className={btn}
                  onClick={() => save((l) => ({ order: moveItem(l.order, card, 1) }))}>↓</button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={shown}
                  aria-label={`Show ${CARD_LABEL[card]}`}
                  onClick={() =>
                    save((l) => ({ hidden: l.hidden.includes(card) ? l.hidden.filter((c) => c !== card) : [...l.hidden, card] }))
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
        <h3 className="mb-2 text-[13px] font-semibold text-ink">On your Home</h3>
        {quick.length === 0 && <p className="mb-2 text-[13px] text-muted">Nothing pinned yet.</p>}
        <ul className="grid gap-2">
          {quick.map((id, i) => {
            const t = tileById(id);
            if (!t) return null;
            return (
              <li key={id} className="flex items-center gap-2 rounded-[12px] border border-violet/60 bg-violet/[0.12] px-3 py-1">
                <span className="text-[18px] text-violet-soft"><t.Icon /></span>
                <span className="flex-1 text-[14px] font-semibold">{t.label}</span>
                <button type="button" aria-label={`Move ${t.label} up`} disabled={i === 0} className={btn}
                  onClick={() => save((l) => ({ quick: moveItem(pinned(l), id, -1) }))}>↑</button>
                <button type="button" aria-label={`Move ${t.label} down`} disabled={i === quick.length - 1} className={btn}
                  onClick={() => save((l) => ({ quick: moveItem(pinned(l), id, 1) }))}>↓</button>
                <button type="button" aria-label={`Remove ${t.label}`} className={btn}
                  onClick={() => save((l) => ({ quick: toggleTile(pinned(l), id) }))}>✕</button>
              </li>
            );
          })}
        </ul>

        <h3 className="mb-1 mt-5 text-[13px] font-semibold text-ink">Add a shortcut</h3>
        <p className="mb-2 text-[12.5px] text-muted">
          {quick.length >= MAX_QUICK
            ? `All ${MAX_QUICK} places are used. Remove one above (✕) to add another.`
            : 'Tap + to add it to your Home.'}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TILES.filter((t) => !quick.includes(t.id)).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              disabled={quick.length >= MAX_QUICK}
              onClick={() => save((l) => ({ quick: toggleTile(pinned(l), id) }))}
              className="flex min-h-[48px] items-center gap-2 rounded-[12px] border border-line bg-navy px-3 text-left text-[13.5px] font-semibold text-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              <span className="text-[18px] text-violet-soft"><Icon /></span>
              <span className="flex-1">{label}</span>
              <span aria-hidden="true" className="text-[18px] text-violet-soft">+</span>
            </button>
          ))}
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
