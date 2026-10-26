/**
 * Date helpers for the conference list and the Home "next congress" card.
 * Dates are yyyy-mm-dd local calendar days (see lib/date).
 */
import type { Conference } from '@/data/conferences';

/** Format a conference's span, collapsing same-month ranges (e.g. "4–7 Nov 2026"). */
export function formatSpan(start: string, end: string): string {
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

/** Whole days from `today` until the start date (0 if already started). */
export function daysUntil(start: string, today: string): number {
  const t = new Date(`${today}T00:00:00`).getTime();
  const s = new Date(`${start}T00:00:00`).getTime();
  return Math.max(0, Math.round((s - t) / 86_400_000));
}

/** Conferences that have not finished by `today`, soonest first. */
export function upcomingConferences(list: readonly Conference[], today: string): Conference[] {
  return list.filter((c) => c.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
}
