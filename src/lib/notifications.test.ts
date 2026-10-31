import { describe, expect, it } from 'vitest';
import type { Conference } from '@/data/conferences';
import { normalizePrefs, planConferenceAlerts } from './notifications';

const conf = (id: string, startDate: string, endDate = startDate): Conference => ({
  id,
  name: id.toUpperCase(),
  fullName: id,
  organisation: 'Org',
  startDate,
  endDate,
  city: 'Jeddah',
  country: 'Saudi Arabia',
  url: 'https://example.org',
  notes: '',
});

const list = [conf('aau', '2026-12-03', '2026-12-05'), conf('wcet', '2026-11-09', '2026-11-13')];
const now = new Date('2026-10-31T12:00:00');

describe('planConferenceAlerts', () => {
  it('plans nothing when off', () => {
    expect(planConferenceAlerts(list, new Set(), 'off', now)).toEqual([]);
  });

  it('only includes attended conferences in "attending" mode', () => {
    const a = planConferenceAlerts(list, new Set(['aau']), 'attending', now);
    expect(a.map((x) => x.title)).toEqual(['AAU is in 2 weeks', 'AAU starts tomorrow']);
    expect(a[0]!.at.getDate()).toBe(19); // 3 Dec − 14 days, 09:00
    expect(a[0]!.at.getHours()).toBe(9);
  });

  it('skips alerts already in the past and sorts by time', () => {
    const a = planConferenceAlerts(list, new Set(), 'all', now);
    // WCET's 2-week alert (26 Oct) has passed; its day-before alert remains.
    expect(a.map((x) => x.title)).toEqual(['WCET starts tomorrow', 'AAU is in 2 weeks', 'AAU starts tomorrow']);
    expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
    expect(a.every((x) => x.screen === 'conferences')).toBe(true);
  });
});

describe('normalizePrefs', () => {
  it('defaults everything to off', () => {
    expect(normalizePrefs(null)).toEqual({ weekly: false, conferences: 'off' });
    expect(normalizePrefs({ weekly: 'yes', conferences: 'some' })).toEqual({ weekly: false, conferences: 'off' });
    expect(normalizePrefs({ weekly: true, conferences: 'all' })).toEqual({ weekly: true, conferences: 'all' });
  });
});
