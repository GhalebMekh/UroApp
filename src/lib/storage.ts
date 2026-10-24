/**
 * Persistence layer. CLAUDE.md: never raw `localStorage`. Backed by
 * @capacitor/preferences, which ships an official web implementation — so this
 * works today in the browser preview and needs zero call-site changes once the
 * native Capacitor wrap lands (Sprint 3). Store only de-identified data here.
 */
import { Preferences } from '@capacitor/preferences';

/** Notified after every write or removal — cloud sync uses it to know what changed. */
const changeListeners = new Set<(key: string) => void>();

export function onStorageChange(listener: (key: string) => void): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

export async function getItem(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value });
  } catch {
    /* storage unavailable — ignore */
  }
  changeListeners.forEach((l) => l(key));
}

export async function removeItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch {
    /* ignore */
  }
  changeListeners.forEach((l) => l(key));
}

/** Read and JSON-parse a value, returning `fallback` if absent or malformed. */
export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await setItem(key, JSON.stringify(value));
}
