import { describe, expect, it } from 'vitest';
import {
  FREE_ATTEMPTS,
  LOCK_OFF,
  RELOCK_AFTER_MS,
  checkPin,
  createSettings,
  hashPin,
  isValidPin,
  lockoutMs,
  normalizeSettings,
  shouldRelock,
} from './appLock';

describe('isValidPin', () => {
  it('accepts 4–8 digits only', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('12345678')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('123456789')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin(' 1234')).toBe(false);
  });
});

describe('hashPin', () => {
  it('is deterministic for a salt and differs across salts', async () => {
    const salt = '00'.repeat(16);
    expect(await hashPin('1234', salt)).toBe(await hashPin('1234', salt));
    expect(await hashPin('1234', salt)).not.toBe(await hashPin('1234', '01'.repeat(16)));
    expect(await hashPin('1234', salt)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('createSettings', () => {
  it('stores a salted hash, never the PIN', async () => {
    const s = await createSettings('2468', true);
    expect(s.enabled).toBe(true);
    expect(s.biometrics).toBe(true);
    expect(JSON.stringify(s)).not.toContain('2468');
  });

  it('rejects an invalid PIN', async () => {
    await expect(createSettings('12', false)).rejects.toThrow();
  });
});

describe('checkPin', () => {
  it('unlocks with the right PIN and clears failures', async () => {
    const s = { ...(await createSettings('2468', false)), failures: 3 };
    const r = await checkPin(s, '2468', 1000);
    expect(r.status).toBe('ok');
    expect(r.next.failures).toBe(0);
  });

  it('counts wrong PINs and starts delaying after the free attempts', async () => {
    let s = await createSettings('2468', false);
    for (let i = 1; i < FREE_ATTEMPTS; i++) {
      const r = await checkPin(s, '0000', 0);
      expect(r.status).toBe('wrong');
      expect(r.status === 'wrong' && r.waitMs).toBe(0);
      s = r.next;
    }
    const r = await checkPin(s, '0000', 0);
    expect(r.status === 'wrong' && r.waitMs).toBe(30_000);
    expect(r.next.blockedUntil).toBe(30_000);
  });

  it('refuses even the right PIN while blocked', async () => {
    const s = { ...(await createSettings('2468', false)), failures: 5, blockedUntil: 10_000 };
    const r = await checkPin(s, '2468', 5_000);
    expect(r.status).toBe('blocked');
    expect(r.status === 'blocked' && r.waitMs).toBe(5_000);
    expect((await checkPin(s, '2468', 10_000)).status).toBe('ok');
  });
});

describe('lockoutMs', () => {
  it('doubles from 30 s and caps at 15 min', () => {
    expect(lockoutMs(FREE_ATTEMPTS - 1)).toBe(0);
    expect(lockoutMs(FREE_ATTEMPTS)).toBe(30_000);
    expect(lockoutMs(FREE_ATTEMPTS + 1)).toBe(60_000);
    expect(lockoutMs(FREE_ATTEMPTS + 20)).toBe(15 * 60_000);
  });
});

describe('shouldRelock', () => {
  it('relocks only after the grace period away from the app', () => {
    expect(shouldRelock(null, 1e9)).toBe(false);
    expect(shouldRelock(0, RELOCK_AFTER_MS - 1)).toBe(false);
    expect(shouldRelock(0, RELOCK_AFTER_MS)).toBe(true);
  });
});

describe('normalizeSettings', () => {
  it('round-trips valid settings', async () => {
    const s = await createSettings('2468', true);
    expect(normalizeSettings(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it('treats junk or an enabled lock without a hash as off', () => {
    expect(normalizeSettings(null)).toEqual(LOCK_OFF);
    expect(normalizeSettings('x')).toEqual(LOCK_OFF);
    expect(normalizeSettings({ enabled: true, salt: 'zz', hash: '' })).toEqual(LOCK_OFF);
  });
});
