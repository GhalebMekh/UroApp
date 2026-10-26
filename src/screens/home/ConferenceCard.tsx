import { useMemo } from 'react';
import { daysUntil, formatSpan, upcomingConferences } from '@/lib/conferenceDates';
import { useConferenceFeed } from '@/lib/conferencesFeed';
import { todayISO } from '@/lib/date';
import { DashCard } from './DashCard';

/** The next congress on the calendar. Hidden when none are listed. */
export function ConferenceCard({ onOpen }: { onOpen: () => void }) {
  const feed = useConferenceFeed();
  const today = useMemo(() => todayISO(), []);
  const next = useMemo(() => upcomingConferences(feed.conferences, today)[0], [feed, today]);
  if (!next) return null;
  const days = daysUntil(next.startDate, today);

  return (
    <DashCard title="Next congress" action={{ label: 'All', onClick: onOpen }}>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[44px] w-full items-start justify-between gap-3 rounded-[12px] border border-line bg-navy px-3.5 py-3 text-left transition-colors hover:border-violet/60"
      >
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold">{next.name}</span>
          <span className="mt-0.5 block text-[12.5px] text-muted">{next.fullName}</span>
          <span className="mt-1 block text-[12px] text-muted-2">
            {formatSpan(next.startDate, next.endDate)} · {next.city}
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-line bg-steel px-2.5 py-1 font-mono text-[11px] text-violet-soft">
          {days === 0 ? 'On now' : days === 1 ? 'Tomorrow' : `in ${days} days`}
        </span>
      </button>
    </DashCard>
  );
}
