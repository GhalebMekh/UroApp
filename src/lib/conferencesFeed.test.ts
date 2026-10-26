import { describe, expect, it } from 'vitest';
import { BUNDLED_CONFERENCE_FEED, isConferenceFeed, type Conference, type ConferenceFeed } from '@/data/conferences';
import bundled from '@/data/conferences.json';
import { pickNewest } from './conferencesFeed';

const conf = (o: Partial<Conference> = {}): Conference => ({
  id: 'x-2027',
  name: 'X 2027',
  fullName: 'X Congress',
  organisation: 'X Society',
  startDate: '2027-03-19',
  endDate: '2027-03-22',
  city: 'Jeddah',
  country: 'Saudi Arabia',
  url: 'https://example.org/',
  notes: '',
  ...o,
});

const feed = (updatedAt: string, conferences: Conference[] = [conf()]): ConferenceFeed => ({ updatedAt, conferences });

describe('conference feed', () => {
  it('accepts the list built into the app', () => {
    // If this fails the Conferences screen and the Home card would be empty.
    expect(isConferenceFeed(bundled)).toBe(true);
    expect(BUNDLED_CONFERENCE_FEED.conferences.length).toBeGreaterThan(0);
  });

  it('rejects malformed or unsafe entries', () => {
    expect(isConferenceFeed(null)).toBe(false);
    expect(isConferenceFeed({ conferences: [] })).toBe(false);
    expect(isConferenceFeed(feed('not a date'))).toBe(false);
    expect(isConferenceFeed(feed('2026-10-26T00:00:00Z', [conf({ url: 'http://example.org/' })]))).toBe(false);
    expect(isConferenceFeed(feed('2026-10-26T00:00:00Z', [conf({ url: 'javascript:alert(1)' })]))).toBe(false);
    expect(isConferenceFeed(feed('2026-10-26T00:00:00Z', [conf({ endDate: '2027-03-18' })]))).toBe(false);
    expect(isConferenceFeed(feed('2026-10-26T00:00:00Z', [conf({ startDate: '19/03/2027' })]))).toBe(false);
    expect(isConferenceFeed(feed('2026-10-26T00:00:00Z', [conf(), conf()]))).toBe(false); // duplicate id
  });

  it('prefers the newest list and the first one on a tie', () => {
    const old = feed('2026-10-01T00:00:00Z');
    const fresh = feed('2026-10-20T00:00:00Z');
    const sameAsFresh = feed('2026-10-20T00:00:00Z');
    expect(pickNewest(old, fresh)).toBe(fresh);
    expect(pickNewest(fresh, old)).toBe(fresh);
    expect(pickNewest(sameAsFresh, fresh)).toBe(sameAsFresh);
    expect(pickNewest(null, old, null)).toBe(old);
    expect(pickNewest(null, null)).toBeNull();
  });
});
