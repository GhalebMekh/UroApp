import { describe, expect, it } from 'vitest';
import { isFeed, pickNewer, type Feed } from './articlesFeed';
import bundled from '../../public/feeds/articles.json';

const feed = (generatedAt: string): Feed => ({
  generatedAt,
  week: 1,
  topic: 't',
  subspecialties: [],
  articles: [],
});

describe('isFeed', () => {
  it('accepts the bundled feed shipped with the app', () => {
    // If this fails, Weekly reads would show nothing offline or in App Review.
    expect(isFeed(bundled)).toBe(true);
    expect((bundled as Feed).articles.length).toBeGreaterThan(0);
  });

  it('rejects malformed data', () => {
    expect(isFeed(null)).toBe(false);
    expect(isFeed({ articles: [] })).toBe(false);
    expect(isFeed({ ...feed('not a date') })).toBe(false);
  });

  it('rejects an article that links anywhere but PubMed', () => {
    const bad = {
      ...feed('2026-10-21T00:00:00Z'),
      articles: [{ pmid: '1', title: 'x', url: 'https://evil.example/' }],
    };
    expect(isFeed(bad)).toBe(false);
  });
});

describe('pickNewer', () => {
  it('prefers the more recently generated feed', () => {
    const old = feed('2026-10-01T00:00:00Z');
    const fresh = feed('2026-10-20T00:00:00Z');
    expect(pickNewer(old, fresh)).toBe(fresh);
    expect(pickNewer(fresh, old)).toBe(fresh);
  });

  it('falls back to whichever copy exists', () => {
    const only = feed('2026-10-01T00:00:00Z');
    expect(pickNewer(null, only)).toBe(only);
    expect(pickNewer(only, null)).toBe(only);
    expect(pickNewer(null, null)).toBeNull();
  });
});
