import { useEffect, useMemo, useState } from 'react';
import { PROCEDURES } from '@/data/procedures';
import { getJSON } from '@/lib/storage';
import { REFRESH_BELOW_PCT, REHEARSAL_STORAGE_KEY, dueForRefresh, normalizeAttempts, type Attempt } from '@/lib/rehearsal';
import { ChevronRightIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { DashCard } from './DashCard';

const NAME = new Map(PROCEDURES.map((p) => [p.id, p.name]));
const SHOWN = 3;

function ago(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

/** Operative rehearsal reminders: what is due for a refresh, or an invitation to start. */
export function PracticeCard({ onOpen }: { onOpen: (procedureId?: string) => void }) {
  const [history, setHistory] = useState<Attempt[] | null>(null);

  useEffect(() => {
    void getJSON<unknown>(REHEARSAL_STORAGE_KEY, []).then((raw) => setHistory(normalizeAttempts(raw)));
  }, []);

  const practised = useMemo(() => new Set(history?.map((a) => a.procedureId) ?? []).size, [history]);
  const due = useMemo(
    () => (history ? dueForRefresh(history, PROCEDURES.map((p) => p.id), new Date()) : []),
    [history],
  );

  return (
    <DashCard title="Keep practising" tone="teal" action={{ label: 'Rehearsal', onClick: () => onOpen() }}>
      {history === null ? null : practised === 0 ? (
        <>
          <p className="text-[13px] text-muted">
            Drill the steps, the next move and the danger zones of {PROCEDURES.length} operations before your list.
          </p>
          <button
            type="button"
            onClick={() => onOpen()}
            className="mt-4 min-h-[44px] w-full rounded-[11px] bg-violet py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start rehearsing
          </button>
        </>
      ) : due.length === 0 ? (
        <p className="text-[13px] text-muted">
          Nothing due for a refresh — {practised} of {PROCEDURES.length} operations practised.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {due.slice(0, SHOWN).map((d) => {
              const pct = d.progress.lastPct ?? 0;
              return (
                <li key={d.procedureId}>
                  <button
                    type="button"
                    onClick={() => onOpen(d.procedureId)}
                    className="flex min-h-[48px] w-full items-center gap-3 rounded-[12px] border border-line bg-navy px-3.5 py-2.5 text-left transition-colors hover:border-violet/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[14px] font-semibold leading-snug">{NAME.get(d.procedureId)}</span>
                      <span className="block text-[12px] text-muted-2">
                        Last{' '}
                        <span className={cn('font-mono', pct < REFRESH_BELOW_PCT ? 'text-amber' : 'text-teal')}>
                          {pct}%
                        </span>{' '}
                        · {ago(d.daysSince)}
                      </span>
                    </span>
                    <ChevronRightIcon className="shrink-0 text-[16px] text-muted-2" />
                  </button>
                </li>
              );
            })}
          </ul>
          {due.length > SHOWN && (
            <p className="mt-2 text-[12px] text-muted-2">and {due.length - SHOWN} more due</p>
          )}
        </>
      )}
    </DashCard>
  );
}
