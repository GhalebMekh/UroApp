/**
 * Conference list delivery — the same idea as the Weekly reads feed.
 *
 * Three copies of data/conferences.json, newest `updatedAt` wins:
 *   - REMOTE: the file on GitHub main, fetched once per app session when online;
 *   - CACHED: the last remote copy this device downloaded, so an update learned
 *     online still shows offline;
 *   - BUNDLED: built into the app — always there, offline and in App Review.
 * There is no server; editing the JSON on main is the update.
 */
import { useEffect, useState } from 'react';
import { BUNDLED_CONFERENCE_FEED, isConferenceFeed, type ConferenceFeed } from '@/data/conferences';
import { getJSON, setJSON } from './storage';

const REMOTE_URL =
  import.meta.env.VITE_CONFERENCES_FEED_URL ||
  'https://raw.githubusercontent.com/GhalebMekh/UroApp/main/src/data/conferences.json';

const CACHE_KEY = 'uroapp.conferences.cache.v1';
const REMOTE_TIMEOUT_MS = 6000;

/** The most recently updated feed; on a tie the earlier argument wins (pass the remote copy first). */
export function pickNewest(...feeds: (ConferenceFeed | null)[]): ConferenceFeed | null {
  let best: ConferenceFeed | null = null;
  for (const f of feeds) {
    if (f && (!best || Date.parse(f.updatedAt) > Date.parse(best.updatedAt))) best = f;
  }
  return best;
}

async function fetchRemote(): Promise<ConferenceFeed | null> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), REMOTE_TIMEOUT_MS);
  try {
    const res = await fetch(REMOTE_URL, { signal: ctrl.signal, cache: 'no-cache' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return isConferenceFeed(data) ? data : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

let latest: ConferenceFeed = BUNDLED_CONFERENCE_FEED;
let pending: Promise<ConferenceFeed> | null = null;

/** Resolve the newest list. Network is tried once per session; later calls reuse the answer. */
export function loadConferences(): Promise<ConferenceFeed> {
  pending ??= (async () => {
    const [cachedRaw, remote] = await Promise.all([getJSON<unknown>(CACHE_KEY, null), fetchRemote()]);
    const cached = isConferenceFeed(cachedRaw) ? cachedRaw : null;
    if (remote && remote.updatedAt !== cached?.updatedAt) void setJSON(CACHE_KEY, remote);
    latest = pickNewest(remote, cached, BUNDLED_CONFERENCE_FEED) ?? BUNDLED_CONFERENCE_FEED;
    return latest;
  })();
  return pending;
}

/** The conference list for a screen: the built-in copy at once, then the newest available. */
export function useConferenceFeed(): ConferenceFeed {
  const [feed, setFeed] = useState(latest);
  useEffect(() => {
    let live = true;
    void loadConferences().then((f) => {
      if (live) setFeed(f);
    });
    return () => {
      live = false;
    };
  }, []);
  return feed;
}
