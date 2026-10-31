import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { getJSON } from '@/lib/storage';
import { todayISO } from '@/lib/date';
import { hasAccess, useEntitlements } from '@/lib/entitlements';
import { FEATURE_TIER } from '@/lib/featureTiers';
import {
  CME_ACTIVITIES_KEY,
  CME_TARGET_KEY,
  cmeReminder,
  normalizeActivity,
  normalizeTarget,
  type CmeActivity,
  type CmeReminder,
} from '@/lib/cme';
import { dueForLogging, loadAttending, type AttendingConference } from '@/lib/cmeConferences';
import { DashCard } from './DashCard';

/**
 * CPD nudges on Home: the renewal reminder (cycle ends within a few months and
 * the target isn't met) and attended conferences waiting to be logged.
 * Hidden when there is nothing to say, or without the CME tracker's tier.
 */
export function CmeCard({ onOpen }: { onOpen: () => void }) {
  const { tier } = useEntitlements();
  const allowed = hasAccess(tier, FEATURE_TIER.cme);
  const today = useMemo(() => todayISO(), []);
  const [reminder, setReminder] = useState<CmeReminder | null>(null);
  const [due, setDue] = useState<AttendingConference[]>([]);

  useEffect(() => {
    if (!allowed) return;
    void Promise.all([getJSON<unknown>(CME_ACTIVITIES_KEY, []), getJSON<unknown>(CME_TARGET_KEY, null), loadAttending()]).then(
      ([a, t, att]) => {
        const list = Array.isArray(a) ? a.map(normalizeActivity).filter((x): x is CmeActivity => x !== null) : [];
        setReminder(cmeReminder(list, normalizeTarget(t), today));
        setDue(dueForLogging(att, today));
      },
    );
  }, [allowed, today]);

  if (!allowed || (!reminder && due.length === 0)) return null;

  return (
    <DashCard title="CME / CPD" action={{ label: 'Open', onClick: onOpen }}>
      <div className="space-y-2">
        {reminder && (
          <button
            type="button"
            onClick={onOpen}
            className={cn(
              'flex min-h-[44px] w-full flex-col rounded-[12px] border px-3.5 py-3 text-left',
              reminder.daysLeft < 0 ? 'border-crimson/50 bg-crimson/[0.10]' : 'border-amber/50 bg-amber/[0.10]',
            )}
          >
            <span className="text-[14px] font-semibold">
              {reminder.daysLeft < 0 ? `Cycle ended ${reminder.remaining} h short` : `${reminder.remaining} h to go`}
            </span>
            <span className="mt-0.5 text-[12.5px] text-muted">
              {reminder.daysLeft < 0
                ? 'Check with your licensing body.'
                : `${reminder.daysLeft} day${reminder.daysLeft === 1 ? '' : 's'} left · about ${reminder.perMonth} h a month`}
            </span>
          </button>
        )}
        {due.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={onOpen}
            className="flex min-h-[44px] w-full flex-col rounded-[12px] border border-line bg-navy px-3.5 py-3 text-left hover:border-violet/60"
          >
            <span className="text-[14px] font-semibold">Log {c.name}?</span>
            <span className="mt-0.5 text-[12.5px] text-muted">You marked it as attending. Add the hours from your certificate.</span>
          </button>
        ))}
      </div>
    </DashCard>
  );
}
