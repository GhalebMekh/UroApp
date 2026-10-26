import { EMERGENCIES } from '@/data/oncall';
import { ChevronRightIcon } from '@/components/icons';
import { DashCard } from './DashCard';

/** One tap from Home to the first-30-minutes pathway for each emergency. */
export function OnCallCard({ onOpen }: { onOpen: (emergencyId: string) => void }) {
  return (
    <DashCard title="On call · next 30 minutes" tone="crimson">
      <ul className="space-y-2">
        {EMERGENCIES.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onOpen(e.id)}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-[12px] border border-line bg-navy px-3.5 py-2.5 text-left transition-colors hover:border-crimson/60"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-crimson" />
              <span className="flex-1 text-[14px] font-semibold">{e.name}</span>
              <ChevronRightIcon className="shrink-0 text-[16px] text-muted-2" />
            </button>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}
