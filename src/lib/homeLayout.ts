/**
 * The user's Home arrangement (owner, 2026-11-03): card order, hidden cards,
 * and which quick-access tiles show. Persisted through lib/storage; holds only
 * ids, no clinical data.
 */
import { useSyncExternalStore } from 'react';
import { getJSON, setJSON } from './storage';

export const HOME_CARDS = ['oncall', 'tools', 'quick', 'practice', 'conference', 'cme'] as const;
export type HomeCard = (typeof HOME_CARDS)[number];

// 12 so the default 8 leave room: with every place full, new picks silently did nothing (owner, build 9).
export const MAX_QUICK = 12;

export interface HomeLayout {
  order: HomeCard[];
  hidden: HomeCard[];
  /** Quick-access tile ids, in display order; null means the default set. */
  quick: string[] | null;
}

const STORAGE_KEY = 'uroapp.home.v1';
export const DEFAULT_LAYOUT: HomeLayout = { order: [...HOME_CARDS], hidden: [], quick: null };

/** Coerce stored data into a valid layout; unknown ids dropped, missing cards appended. */
export function normalizeLayout(raw: unknown, knownTiles?: ReadonlySet<string>): HomeLayout {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const cards = (v: unknown) =>
    Array.isArray(v) ? [...new Set(v.filter((x): x is HomeCard => HOME_CARDS.includes(x as HomeCard)))] : [];
  const order = cards(r.order);
  for (const c of HOME_CARDS) if (!order.includes(c)) order.push(c);
  let quick: string[] | null = null;
  if (Array.isArray(r.quick)) {
    quick = [...new Set(r.quick.filter((x): x is string => typeof x === 'string'))]
      .filter((id) => !knownTiles || knownTiles.has(id))
      .slice(0, MAX_QUICK);
  }
  return { order, hidden: cards(r.hidden), quick };
}

/** Swap an item with its neighbour; out-of-range moves return the list unchanged. */
export function moveItem<T>(list: readonly T[], item: T, delta: -1 | 1): T[] {
  const i = list.indexOf(item);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= list.length) return [...list];
  const out = [...list];
  [out[i], out[j]] = [out[j]!, out[i]!];
  return out;
}

/** Add the tile if absent and there is room, else remove it. */
export function toggleTile(list: readonly string[], id: string): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  return list.length >= MAX_QUICK ? [...list] : [...list, id];
}

/* ── shared store ─────────────────────────────────────────────────────────── */

let state: HomeLayout = DEFAULT_LAYOUT;
let loadStarted = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loadStarted) {
    loadStarted = true;
    void getJSON<unknown>(STORAGE_KEY, null).then((raw) => {
      state = normalizeLayout(raw);
      listeners.forEach((l) => l());
    });
  }
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

export function useHomeLayout(): HomeLayout {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setHomeLayout(next: HomeLayout) {
  state = next;
  listeners.forEach((l) => l());
  void setJSON(STORAGE_KEY, state);
}

/** Apply a change to the latest layout, so quick successive taps never undo each other. */
export function updateHomeLayout(change: (current: HomeLayout) => Partial<HomeLayout>) {
  setHomeLayout({ ...state, ...change(state) });
}
