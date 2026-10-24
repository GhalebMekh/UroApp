import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

/* ── fake device storage: one Map per simulated device ─────────────────────── */
const devices = { phone: new Map<string, string>(), ipad: new Map<string, string>() };
let current = devices.phone;
const use = (d: keyof typeof devices) => (current = devices[d]);

vi.mock('./storage', () => ({
  getJSON: async (k: string, fallback: unknown) => (current.has(k) ? JSON.parse(current.get(k)!) : fallback),
  setJSON: async (k: string, v: unknown) => void current.set(k, JSON.stringify(v)),
  removeItem: async (k: string) => void current.delete(k),
}));

const { SYNCED, forgetSync, syncAll } = await import('./sync');

/* ── fake Supabase `user_data` table (one user; RLS is the database's job) ─── */
type Row = { key: string; value: unknown; version: number };
let table = new Map<string, Row>();

function fakeClient(): SupabaseClient {
  const from = () => ({
    select: () => ({
      eq: (_c: string, key: string) => ({
        maybeSingle: async () => ({ data: table.get(key) ?? null, error: null }),
      }),
    }),
    insert: async (row: Row) => {
      if (table.has(row.key)) return { error: { code: '23505', message: 'duplicate' } };
      table.set(row.key, structuredClone(row));
      return { error: null };
    },
    update: (patch: Partial<Row>) => ({
      eq: (_c: string, key: string) => ({
        eq: (_c2: string, version: number) => ({
          select: async () => {
            const row = table.get(key);
            if (!row || row.version !== version) return { data: [], error: null };
            table.set(key, { ...row, ...structuredClone(patch) } as Row);
            return { data: [{ version: patch.version }], error: null };
          },
        }),
      }),
    }),
  });
  return { from } as unknown as SupabaseClient;
}

const LOG = 'uroapp.oplog.v1';
const read = (k: string) => (current.has(k) ? JSON.parse(current.get(k)!) : undefined);
const write = (k: string, v: unknown) => current.set(k, JSON.stringify(v));
const entry = (id: string, procedure: string) => ({ id, date: '2026-10-01', procedure });

beforeEach(() => {
  devices.phone.clear();
  devices.ipad.clear();
  table = new Map();
  use('phone');
});

describe('what syncs', () => {
  it('never includes the ward list or MDT sheets', () => {
    expect(SYNCED.map((s) => s.key)).not.toContain('uroapp.rounding.v1');
    expect(SYNCED.map((s) => s.key)).not.toContain('uroapp.mdt.v1');
  });

  it('matches the keys the database allows, and nothing else', () => {
    const sql = readFileSync('supabase/migrations/0001_profiles_and_sync.sql', 'utf8');
    const constraint = /check \(key in \(([^)]*)\)\)/.exec(sql)?.[1] ?? '';
    const allowed = [...constraint.matchAll(/'(uroapp\.[a-z.]+\.v\d)'/g)].map((m) => m[1]);
    expect(new Set(allowed)).toEqual(new Set(SYNCED.map((s) => s.key)));
  });
});

describe('two devices', () => {
  it('backs up, then brings both devices’ cases together', async () => {
    const client = fakeClient();
    write(LOG, [entry('a', 'TURBT')]);
    expect(await syncAll(client)).toBe(false); // uploaded; phone unchanged

    use('ipad');
    write(LOG, [entry('b', 'PCNL')]);
    expect(await syncAll(client)).toBe(true); // ipad gained the phone's case
    expect(read(LOG).map((e: { id: string }) => e.id).sort()).toEqual(['a', 'b']);

    use('phone');
    expect(await syncAll(client)).toBe(true);
    expect(read(LOG).map((e: { id: string }) => e.id).sort()).toEqual(['a', 'b']);
  });

  it('carries a deletion across devices', async () => {
    const client = fakeClient();
    write(LOG, [entry('a', 'TURBT'), entry('b', 'PCNL')]);
    await syncAll(client);
    use('ipad');
    await syncAll(client);

    write(LOG, [entry('a', 'TURBT')]); // deleted b on the iPad
    await syncAll(client);
    use('phone');
    await syncAll(client);
    expect(read(LOG)).toEqual([entry('a', 'TURBT')]);
  });

  it('restores from the backup after local data is wiped without a deletion (Forgot PIN / sign-out)', async () => {
    const client = fakeClient();
    write(LOG, [entry('a', 'TURBT')]);
    await syncAll(client);

    await forgetSync(true); // removes local data and the snapshot together
    expect(read(LOG)).toBeUndefined();
    expect(await syncAll(client)).toBe(true);
    expect(read(LOG)).toEqual([entry('a', 'TURBT')]);
    expect(table.get(LOG)?.value).toEqual([entry('a', 'TURBT')]); // cloud copy untouched
  });

  it('re-merges instead of overwriting when another device wrote first', async () => {
    const client = fakeClient();
    write(LOG, [entry('a', 'TURBT')]);
    await syncAll(client);

    // The iPad's write lands between the phone's read and its write.
    const realFrom = client.from.bind(client);
    let raced = false;
    (client as unknown as { from: typeof client.from }).from = ((t: string) => {
      const q = realFrom(t) as unknown as { update: (p: Partial<Row>) => unknown };
      const realUpdate = q.update;
      q.update = (p: Partial<Row>) => {
        if (!raced) {
          raced = true;
          const row = table.get(LOG)!;
          table.set(LOG, { ...row, value: [...(row.value as unknown[]), entry('c', 'URS')], version: row.version + 1 });
        }
        return realUpdate(p);
      };
      return q;
    }) as typeof client.from;

    write(LOG, [entry('a', 'TURBT'), entry('b', 'PCNL')]);
    await syncAll(client);
    const ids = (table.get(LOG)!.value as { id: string }[]).map((e) => e.id).sort();
    expect(ids).toEqual(['a', 'b', 'c']);
  });
});
