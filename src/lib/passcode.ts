/**
 * Access passcode for the deployed site.
 *
 * The passphrase is hashed at build time (see vite.config.ts), so only its
 * SHA-256 reaches the bundle. This keeps out anyone who merely has the URL and
 * keeps the on-device ward round list off a borrowed phone — but it is not
 * server-side access control: the bundle is public, so the hash can be attacked
 * offline. It does not encrypt anything stored on the device.
 */
import { getJSON, setJSON } from './storage';

const KEY = 'uroapp.unlocked.v1';

/** Set at build time from VITE_APP_PASSCODE; empty string means no gate. */
const EXPECTED = __PASSCODE_HASH__;

export const passcodeEnabled = EXPECTED !== '';

export function isUnlocked(): Promise<boolean> {
  return getJSON<boolean>(KEY, false);
}

/** Notifies the gate that this device was locked, so it re-renders in place. */
const listeners = new Set<() => void>();

export function onLock(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Clears this device's unlock so it can be handed over locked. */
export async function lockApp(): Promise<void> {
  await setJSON(KEY, false);
  listeners.forEach((l) => l());
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Checks an attempt and, on success, remembers the unlock on this device. */
export async function tryUnlock(entry: string): Promise<boolean> {
  if ((await sha256(entry.trim())) !== EXPECTED) return false;
  await setJSON(KEY, true);
  return true;
}
