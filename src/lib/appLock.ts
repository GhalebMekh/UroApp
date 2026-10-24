/**
 * On-device app lock for the private sections (inpatient list, logbook, MDT,
 * CME). The user sets their own PIN; Face ID / Touch ID can unlock instead.
 *
 * What this is: a lock that keeps someone who picks up the phone out of the
 * ward list and logbook. What it is not: encryption — the data itself still
 * sits in app storage, and a short PIN hash can be brute-forced by anyone who
 * can read that storage. No server is involved and nothing leaves the device.
 */
import { getJSON, removeItem, setJSON } from './storage';
import { syncBaseKey } from './syncMerge';

const KEY = 'uroapp.applock.v1';

/** Storage keys of the data the lock protects; "Forgot PIN" erases these. */
export const PRIVATE_DATA_KEYS = [
  'uroapp.rounding.v1',
  'uroapp.oplog.v1',
  'uroapp.mdt.v1',
  'uroapp.cme.v1',
  'uroapp.cme.target.v1',
] as const;

/** Leaving the app for longer than this locks the private sections again. */
export const RELOCK_AFTER_MS = 5 * 60_000;

/** Wrong PINs allowed before each further attempt is delayed. */
export const FREE_ATTEMPTS = 5;

const PBKDF2_ITERATIONS = 150_000;

export interface LockSettings {
  enabled: boolean;
  /** Hex salt and PBKDF2-SHA-256 hash of the PIN; empty when disabled. */
  salt: string;
  hash: string;
  /** Offer Face ID / Touch ID on the lock screen. */
  biometrics: boolean;
  /** Consecutive wrong PINs, kept across restarts so a relaunch doesn't reset the delay. */
  failures: number;
  /** Epoch ms before which no PIN attempt is accepted. */
  blockedUntil: number;
}

export const LOCK_OFF: LockSettings = {
  enabled: false,
  salt: '',
  hash: '',
  biometrics: false,
  failures: 0,
  blockedUntil: 0,
};

export function isValidPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

/** Delay after the n-th consecutive wrong PIN: none for the first few, then 30 s doubling to 15 min. */
export function lockoutMs(failures: number): number {
  if (failures < FREE_ATTEMPTS) return 0;
  return Math.min(30_000 * 2 ** (failures - FREE_ATTEMPTS), 15 * 60_000);
}

/** Whether time spent outside the app means the private sections should lock again. */
export function shouldRelock(hiddenAt: number | null, now: number): boolean {
  return hiddenAt !== null && now - hiddenAt >= RELOCK_AFTER_MS;
}

const toHex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function newSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(salt), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

export async function createSettings(pin: string, biometrics: boolean): Promise<LockSettings> {
  if (!isValidPin(pin)) throw new Error('PIN must be 4–8 digits.');
  const salt = newSalt();
  return { ...LOCK_OFF, enabled: true, salt, hash: await hashPin(pin, salt), biometrics };
}

export type PinResult =
  | { status: 'ok'; next: LockSettings }
  | { status: 'wrong'; next: LockSettings; waitMs: number }
  | { status: 'blocked'; next: LockSettings; waitMs: number };

/** Checks a PIN attempt, applying the wrong-attempt delay. Returns the settings to persist. */
export async function checkPin(settings: LockSettings, pin: string, now: number): Promise<PinResult> {
  if (now < settings.blockedUntil) {
    return { status: 'blocked', next: settings, waitMs: settings.blockedUntil - now };
  }
  if ((await hashPin(pin, settings.salt)) === settings.hash) {
    return { status: 'ok', next: { ...settings, failures: 0, blockedUntil: 0 } };
  }
  const failures = settings.failures + 1;
  const waitMs = lockoutMs(failures);
  return { status: 'wrong', next: { ...settings, failures, blockedUntil: now + waitMs }, waitMs };
}

export function normalizeSettings(raw: unknown): LockSettings {
  if (!raw || typeof raw !== 'object') return LOCK_OFF;
  const r = raw as Partial<Record<keyof LockSettings, unknown>>;
  const salt = typeof r.salt === 'string' && /^[0-9a-f]{32}$/.test(r.salt) ? r.salt : '';
  const hash = typeof r.hash === 'string' && /^[0-9a-f]{64}$/.test(r.hash) ? r.hash : '';
  // An "enabled" lock without a usable hash could never be opened — treat it as off.
  if (r.enabled !== true || !salt || !hash) return LOCK_OFF;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);
  return {
    enabled: true,
    salt,
    hash,
    biometrics: r.biometrics === true,
    failures: Math.floor(num(r.failures)),
    blockedUntil: num(r.blockedUntil),
  };
}

export async function loadLock(): Promise<LockSettings> {
  return normalizeSettings(await getJSON<unknown>(KEY, null));
}

export async function saveLock(settings: LockSettings): Promise<void> {
  await setJSON(KEY, settings);
}

/**
 * "Forgot PIN": the only way back in without the PIN is to wipe what it
 * protected. The sync snapshots go too, so a signed-in user's next sync
 * restores the backup instead of mirroring the wipe to the cloud.
 */
export async function eraseLockedData(): Promise<void> {
  await Promise.all(PRIVATE_DATA_KEYS.flatMap((k) => [removeItem(syncBaseKey(k)), removeItem(k)]));
  await saveLock(LOCK_OFF);
}
