/**
 * Favourite and recently used calculators.
 *
 * One shared store so the Home strip and the star on each calculator always
 * agree, persisted through lib/storage (Capacitor Preferences — CLAUDE.md:
 * never raw localStorage). Holds only calculator ids: no inputs, no patient
 * data.
 */
import { useSyncExternalStore } from 'react';
import { getJSON, setJSON } from './storage';

/** How many recent calculators the Home strip shows. */
export const MAX_RECENTS = 5;

const STORAGE_KEY = 'uroapp.tools.v1';

export interface ToolPrefs {
  favourites: string[];
  recents: string[];
}

/* ── pure helpers (unit-tested) ───────────────────────────────────────────── */

/** Add the id if absent (appended, so pins keep the order they were made), else remove it. */
export function toggleFavourite(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Move the id to the front, drop any earlier copy, and cap the length. */
export function pushRecent(list: string[], id: string, max = MAX_RECENTS): string[] {
  return [id, ...list.filter((x) => x !== id)].slice(0, max);
}

/** Drop ids that no longer exist, e.g. after a calculator is renamed or removed. */
export function pruneUnknown(list: string[], known: ReadonlySet<string>): string[] {
  return list.filter((id) => known.has(id));
}

/** Coerce whatever is in storage into a valid shape. */
export function normalizePrefs(raw: unknown): ToolPrefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const ids = (v: unknown) =>
    Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : [];
  return { favourites: ids(r.favourites), recents: ids(r.recents).slice(0, MAX_RECENTS) };
}

/* ── shared store ─────────────────────────────────────────────────────────── */

let state: ToolPrefs = { favourites: [], recents: [] };
let loadStarted = false;
const listeners = new Set<() => void>();

function emit(next: ToolPrefs) {
  state = next;
  listeners.forEach((l) => l());
  void setJSON(STORAGE_KEY, state);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loadStarted) {
    loadStarted = true;
    void getJSON<unknown>(STORAGE_KEY, null).then((raw) => {
      state = normalizePrefs(raw);
      listeners.forEach((l) => l());
    });
  }
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

/** Re-read storage after cloud sync has replaced the saved favourites. */
export async function reloadToolPrefs(): Promise<void> {
  state = normalizePrefs(await getJSON<unknown>(STORAGE_KEY, null));
  listeners.forEach((l) => l());
}

export function useToolPrefs(): ToolPrefs {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function toggleFavouriteTool(id: string) {
  emit({ ...state, favourites: toggleFavourite(state.favourites, id) });
}

export function markToolUsed(id: string) {
  if (state.recents[0] === id) return; // already most recent — skip a write
  emit({ ...state, recents: pushRecent(state.recents, id) });
}
