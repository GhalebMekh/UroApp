import { EMERGENCIES } from '@/data/oncall';
import { ChevronRightIcon } from '@/components/icons';
import { DashCard } from './DashCard';

/**
 * One tap from Home to the first-30-minutes pathway for each emergency — one of
 * the two "moments" in docs/DESIGN.md. Rows are divided by hairlines inside the
 * card, not boxed (no cards inside cards).
 */
export function OnCallCard({ onOpen }: { onOpen: (emergencyId: string) => void }) {
  return (
    <DashCard title="On call · next 30 minutes" tone="crimson">
      <ul className="-mx-2 divide-y divide-line">
        {EMERGENCIES.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onOpen(e.id)}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-steel"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-crimson" />
              <span className="flex-1 text-[14px] font-medium">{e.name}</span>
              <ChevronRightIcon className="shrink-0 text-[16px] text-muted-2" />
            </button>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
