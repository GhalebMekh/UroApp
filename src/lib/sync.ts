/**
 * Cloud backup and sync for a signed-in user (Supabase `user_data` table).
 *
 * What syncs: logbook, CME record + target, tool favourites.
 * What never syncs: the inpatient ward list and MDT case sheets — both hold
 * initials, ages and clinical detail (owner decisions 2026-10-24). They are not
 * in SYNCED, and the database rejects their keys outright as well.
 *
 * Each key is one JSON document with a version number. A sync reads the
 * remote copy, merges it three-way with this device's copy (lib/syncMerge),
 * and writes back only if the version is still the one it read, so two
 * devices syncing at once can't overwrite each other.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getJSON, removeItem, setJSON } from './storage';
import { mergeSynced, sameJson, syncBaseKey, type SyncKind } from './syncMerge';

export const SYNCED: ReadonlyArray<{ key: string; kind: SyncKind }> = [
  { key: 'uroapp.oplog.v1', kind: 'collection' },
  { key: 'uroapp.cme.v1', kind: 'collection' },
  { key: 'uroapp.cme.target.v1', kind: 'value' },
  { key: 'uroapp.tools.v1', kind: 'value' },
];

export const SYNCED_KEYS: ReadonlySet<string> = new Set(SYNCED.map((s) => s.key));

const TABLE = 'user_data';
const MAX_ATTEMPTS = 3;

/** True while sync itself is writing local storage, so those writes don't schedule another sync. */
let applying = false;
export const isApplyingSync = () => applying;

interface RemoteRow {
  key: string;
  value: unknown;
  version: number;
}

async function readRemote(client: SupabaseClient, key: string): Promise<RemoteRow | null> {
  const { data, error } = await client.from(TABLE).select('key, value, version').eq('key', key).maybeSingle();
  if (error) throw error;
  return (data as RemoteRow | null) ?? null;
}

/** Writes `value` if the remote version is still `expected`; false means someone else wrote first. */
async function writeRemote(
  client: SupabaseClient,
  key: string,
  value: unknown,
  expected: RemoteRow | null,
): Promise<boolean> {
  if (!expected) {
    const { error } = await client.from(TABLE).insert({ key, value, version: 1 });
    if (!error) return true;
    if (error.code === '23505') return false; // another device created it first
    throw error;
  }
  const { data, error } = await client
    .from(TABLE)
    .update({ value, version: expected.version + 1, updated_at: new Date().toISOString() })
    .eq('key', key)
    .eq('version', expected.version)
    .select('version');
  if (error) throw error;
  return (data ?? []).length > 0;
}

async function syncKey(client: SupabaseClient, key: string, kind: SyncKind): Promise<boolean> {
  const local = await getJSON<unknown>(key, undefined);
  const base = await getJSON<unknown>(syncBaseKey(key), undefined);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const remote = await readRemote(client, key);
    if (local === undefined && !remote) return false; // never used on any device yet
    const merged = mergeSynced(kind, base, local, remote?.value);

    if (!remote || !sameJson(merged, remote.value)) {
      if (!(await writeRemote(client, key, merged, remote))) continue; // lost the race — re-read and re-merge
    }

    // Edited on this device while we were talking to the server? Leave both the
    // data and the snapshot alone; that edit already scheduled the next sync,
    // which will merge it with what was just uploaded.
    if (!sameJson(await getJSON<unknown>(key, undefined), local)) return false;

    // "Nothing saved" and "empty list" are the same to the screens.
    const emptyBoth = local === undefined && Array.isArray(merged) && merged.length === 0;
    const changedLocal = !emptyBoth && !sameJson(merged, local);
    applying = true;
    try {
      if (changedLocal) await setJSON(key, merged);
      await setJSON(syncBaseKey(key), merged);
    } finally {
      applying = false;
    }
    return changedLocal;
  }
  throw new Error('Another device kept syncing at the same time. Try again in a moment.');
}

/** Syncs every key; resolves to true if this device's data changed (screens should reload). */
export async function syncAll(client: SupabaseClient): Promise<boolean> {
  let changed = false;
  for (const { key, kind } of SYNCED) {
    if (await syncKey(client, key, kind)) changed = true;
  }
  return changed;
}

/**
 * Forget what was last synced (sign-out, account deletion). Optionally also
 * removes the synced data from this device — for a phone that changes hands.
 */
export async function forgetSync(removeLocalData: boolean): Promise<void> {
  applying = true;
  try {
    await Promise.all(
      SYNCED.flatMap(({ key }) => [removeItem(syncBaseKey(key)), ...(removeLocalData ? [removeItem(key)] : [])]),
    );
  } finally {
    applying = false;
  }
}
