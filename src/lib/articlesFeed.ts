/**
 * Weekly reads feed.
 *
 * Two copies of the same static JSON (written by server/articles/exportFeed.js):
 *   - BUNDLED: shipped inside the app, so the screen always works — offline,
 *     on a basement ward, and during App Review.
 *   - REMOTE: refreshed weekly by a GitHub Action; fetched when online.
 * Whichever is newer wins. There is deliberately no always-on server, and no
 * developer-facing error text in the UI (the old screen told users to start a
 * server on localhost).
 */

export interface Article {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  pubDate: string;
  abstract: string;
  url: string;
  subspecialty: string;
  topic: string;
}

export interface Feed {
  generatedAt: string;
  week: number;
  topic: string;
  subspecialties: string[];
  articles: Article[];
}

export type FeedSource = 'remote' | 'bundled';

const REMOTE_URL =
  import.meta.env.VITE_ARTICLES_FEED_URL ||
  'https://raw.githubusercontent.com/GhalebMekh/UroApp/main/public/feeds/articles.json';

const BUNDLED_URL = `${import.meta.env.BASE_URL}feeds/articles.json`;

const REMOTE_TIMEOUT_MS = 6000;

/** Structural check — never render a malformed or tampered feed. */
export function isFeed(x: unknown): x is Feed {
  if (!x || typeof x !== 'object') return false;
  const f = x as Record<string, unknown>;
  return (
    typeof f.generatedAt === 'string' &&
    !Number.isNaN(Date.parse(f.generatedAt)) &&
    typeof f.topic === 'string' &&
    Array.isArray(f.articles) &&
    f.articles.every(
      (a) =>
        a &&
        typeof a === 'object' &&
        typeof (a as Article).pmid === 'string' &&
        typeof (a as Article).title === 'string' &&
        // Links must go to PubMed — the feed is data from the network.
        typeof (a as Article).url === 'string' &&
        (a as Article).url.startsWith('https://pubmed.ncbi.nlm.nih.gov/'),
    )
  );
}

/** The more recently generated of two feeds (either may be missing). */
export function pickNewer(a: Feed | null, b: Feed | null): Feed | null {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(b.generatedAt) > Date.parse(a.generatedAt) ? b : a;
}

async function fetchFeed(url: string, timeoutMs?: number): Promise<Feed | null> {
  const ctrl = new AbortController();
  const timer = timeoutMs ? window.setTimeout(() => ctrl.abort(), timeoutMs) : undefined;
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-cache' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return isFeed(data) ? data : null;
  } catch {
    return null;
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

export async function loadFeed(): Promise<{ feed: Feed; source: FeedSource } | null> {
  const [bundled, remote] = await Promise.all([
    fetchFeed(BUNDLED_URL),
    fetchFeed(REMOTE_URL, REMOTE_TIMEOUT_MS),
  ]);
  const feed = pickNewer(bundled, remote);
  if (!feed) return null;
  return { feed, source: feed === remote ? 'remote' : 'bundled' };
}
