/**
 * Three-way merge for cloud sync. Each synced value is compared with the
 * snapshot taken at the last successful sync (the "base"), so the merge can
 * tell an edit from a deletion on either side:
 *
 * - collections (logbook, MDT, CME): merged item by item on `id`, so a case
 *   logged on the iPhone and another logged on the iPad both survive;
 * - plain values (CME target, tool favourites): whichever side changed wins.
 *
 * When both sides changed the same item, this device wins — except that an
 * edit always beats a deletion, so nothing typed is silently lost.
 */

export type SyncKind = 'collection' | 'value';

/**
 * Where the last-synced snapshot of a key is kept. Clearing it makes the next
 * sync treat local data as new rather than deleted — used when data is erased
 * locally for a reason other than the user deleting it (Forgot PIN, sign-out).
 */
export function syncBaseKey(key: string): string {
  return `uroapp.syncbase.v1:${key}`;
}

type Item = { id: string } & Record<string, unknown>;

export function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Items with a string id; anything else in storage is ignored for merging. */
export function asItems(v: unknown): Item[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (x): x is Item => !!x && typeof x === 'object' && typeof (x as { id?: unknown }).id === 'string',
  );
}

function byId(items: Item[]): Map<string, Item> {
  return new Map(items.map((i) => [i.id, i]));
}

export function mergeCollection(base: unknown, local: unknown, remote: unknown): Item[] {
  const B = byId(asItems(base));
  const L = byId(asItems(local));
  const R = byId(asItems(remote));

  // Local order first (it is what the user sees), then items only the other device has.
  const ids = [...new Set([...L.keys(), ...R.keys(), ...B.keys()])];
  const out: Item[] = [];
  for (const id of ids) {
    const b = B.get(id);
    const l = L.get(id);
    const r = R.get(id);
    const localChanged = !sameJson(l, b);
    const remoteChanged = !sameJson(r, b);

    let pick: Item | undefined;
    if (!localChanged) pick = r;
    else if (!remoteChanged) pick = l;
    else pick = l ?? r; // both changed: local wins, but an edit beats a deletion
    if (pick) out.push(pick);
  }
  return out;
}

export function mergeValue(base: unknown, local: unknown, remote: unknown): unknown {
  if (remote === undefined) return local;
  if (local === undefined) return remote;
  return sameJson(local, base) ? remote : local;
}

export function mergeSynced(kind: SyncKind, base: unknown, local: unknown, remote: unknown): unknown {
  return kind === 'collection' ? mergeCollection(base, local, remote) : mergeValue(base, local, remote);
}
