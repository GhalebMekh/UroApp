import { describe, expect, it } from 'vitest';
import type { Conference } from '@/data/conferences';
import { daysUntil, formatSpan, upcomingConferences } from './conferenceDates';

const conf = (id: string, startDate: string, endDate: string): Conference => ({
  id,
  name: id,
  fullName: id,
  organisation: 'Test',
  startDate,
  endDate,
  city: 'Jeddah',
  country: 'Saudi Arabia',
  url: 'https://example.org',
  notes: '',
});

describe('conference dates', () => {
  it('collapses same-month spans and keeps cross-month ones readable', () => {
    expect(formatSpan('2026-11-04', '2026-11-07')).toBe('4–7 Nov 2026');
    expect(formatSpan('2026-10-30', '2026-11-02')).toBe('30 Oct – 2 Nov 2026');
    expect(formatSpan('2026-12-30', '2027-01-02')).toBe('30 Dec 2026 – 2 Jan 2027');
  });

  it('counts whole days to the start and never goes negative', () => {
    expect(daysUntil('2026-11-04', '2026-10-26')).toBe(9);
    expect(daysUntil('2026-11-04', '2026-11-04')).toBe(0);
    expect(daysUntil('2026-11-04', '2026-11-06')).toBe(0);
  });

  it('keeps conferences still running, drops finished ones, soonest first', () => {
    const list = [conf('later', '2027-03-19', '2027-03-22'), conf('done', '2026-10-01', '2026-10-03'), conf('now', '2026-10-25', '2026-10-28')];
    expect(upcomingConferences(list, '2026-10-26').map((c) => c.id)).toEqual(['now', 'later']);
  });
});
