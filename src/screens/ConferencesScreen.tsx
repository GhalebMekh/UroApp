import { useMemo, useState } from 'react';
import { CONFERENCES, type Conference } from '@/data/conferences';
import { saveICS, type CalendarEvent } from '@/lib/ics';
import { todayISO } from '@/lib/date';

/** Format a conference's span, collapsing same-month ranges (e.g. "4–7 Nov 2026"). */
function formatSpan(start: string, end: string): string {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const mon = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' });
  const yr = (d: Date) => d.getFullYear();
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${mon(s)} ${yr(s)}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} ${mon(s)} – ${e.getDate()} ${mon(e)} ${yr(s)}`;
  }
  return `${s.getDate()} ${mon(s)} ${yr(s)} – ${e.getDate()} ${mon(e)} ${yr(e)}`;
}

/** Whole days from today until the start date (0 if already started). */
function daysUntil(start: string): number {
  const t = new Date(`${todayISO()}T00:00:00`).getTime();
  const s = new Date(`${start}T00:00:00`).getTime();
  return Math.max(0, Math.round((s - t) / 86_400_000));
}

function toEvent(c: Conference): CalendarEvent {
  return {
    uid: `${c.id}@uroapp`,
    startDate: c.startDate,
    endDate: c.endDate,
    title: `${c.name} — ${c.fullName}`,
    location: `${c.city}, ${c.country}`,
    url: c.url,
    description: `${c.organisation}. ${c.notes} More: ${c.url}`,
  };
}

export function ConferencesScreen() {
  const [exportError, setExportError] = useState(false);

  const upcoming = useMemo(() => {
    const today = todayISO();
    return CONFERENCES.filter((c) => c.endDate >= today).sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    );
  }, []);

  function addOne(c: Conference) {
    setExportError(false);
    if (!saveICS(c.id, [toEvent(c)])) setExportError(true);
  }

  function addAll() {
    setExportError(false);
    if (!saveICS('urology-conferences', upcoming.map(toEvent))) setExportError(true);
  }

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            Calendar
          </div>
          <h2 className="font-display text-[28px] font-semibold">Conferences</h2>
          <p className="mt-3 text-[14px] text-muted">
            Upcoming urology congresses — dates, venue and the official website. Add any one to
            your calendar, or add them all at once. Always confirm on the official site before
            booking; dates can change.
          </p>
        </header>

        {upcoming.length > 1 && (
          <button
            type="button"
            onClick={addAll}
            className="min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            📅 Add all {upcoming.length} to calendar (.ics)
          </button>
        )}

        {exportError && (
          <p className="rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
            Could not create the calendar file in this browser. Open the official website and add
            the dates manually.
          </p>
        )}

        <div className="space-y-4">
          {upcoming.map((c) => {
            const days = daysUntil(c.startDate);
            return (
              <div key={c.id} className="rounded-[16px] border border-line bg-navy-2 p-5">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[16px] font-semibold">{c.name}</h3>
                      {c.regional && (
                        <span className="rounded-full border border-teal/50 bg-teal/[0.12] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-teal">
                          Regional
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted">{c.fullName}</p>
                  </div>
                  {days > 0 && (
                    <span className="whitespace-nowrap text-[11px] font-semibold text-muted-2">
                      in {days} day{days === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <dl className="mb-3 space-y-1 text-[13px]">
                  <div className="flex gap-2">
                    <dt className="w-16 flex-shrink-0 font-semibold text-ink">Dates</dt>
                    <dd className="font-mono text-ink">{formatSpan(c.startDate, c.endDate)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 flex-shrink-0 font-semibold text-ink">Where</dt>
                    <dd className="text-muted">
                      {c.city}, {c.country}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 flex-shrink-0 font-semibold text-ink">Host</dt>
                    <dd className="text-muted">{c.organisation}</dd>
                  </div>
                </dl>

                <p className="mb-4 text-[13px] leading-relaxed text-muted">{c.notes}</p>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center rounded-[8px] border border-line bg-navy px-3 py-1.5 text-[12px] font-semibold text-violet-soft transition-colors hover:border-violet"
                  >
                    Official website ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => addOne(c)}
                    className="inline-flex min-h-[44px] items-center rounded-[8px] border border-line bg-navy px-3 py-1.5 text-[12px] font-semibold text-teal transition-colors hover:border-teal"
                  >
                    📅 Add to calendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[12px] text-muted-2">
          Dates and venues were verified against each congress’s official source when this list was
          compiled. On iOS, opening the downloaded .ics file offers “Add to Calendar”.
        </p>
      </div>
    </div>
  );
}
