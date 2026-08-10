import { describe, expect, it } from 'vitest';
import {
  catheterDays,
  cbiChannelMismatch,
  describeCatheter,
  emptyCatheter,
  isRetaining,
  netOutput,
  type Catheter,
  type UrineEntry,
} from './catheter';

const entry = (volume: string, irrigation = ''): UrineEntry => ({
  id: 'x',
  datetime: '2026-08-09T08:00:00.000Z',
  volume,
  irrigation,
  colour: '',
});

// `now` is always built with the local-time constructor `new Date(y, m, d, h, min)`.
// Pinning a UTC instant instead (e.g. '2026-08-09T23:00:00Z') makes these tests
// timezone-dependent, because that instant falls on a different local calendar
// day either side of UTC — and the dwell count follows the clinician's local date.
describe('catheterDays', () => {
  it('counts the insertion day as day 1', () => {
    expect(catheterDays('2026-08-09', new Date(2026, 7, 9, 23, 0))).toBe(1);
  });

  it('increments per calendar day', () => {
    expect(catheterDays('2026-08-05', new Date(2026, 7, 9, 1, 0))).toBe(5);
  });

  it('counts LOCAL calendar days, not UTC days', () => {
    // Regression: found in the browser at 01:40 local (UTC+3), where the local
    // date was already 9 Aug but the UTC date was still 8 Aug — the old UTC-based
    // comparison reported day 3 instead of day 4. `new Date(y, m, d, h, min)`
    // builds a LOCAL time, so this reproduces the skew in any timezone ahead of UTC.
    expect(catheterDays('2026-08-06', new Date(2026, 7, 9, 0, 30))).toBe(4);
    // ...and the mirror case late in the day, for timezones behind UTC.
    expect(catheterDays('2026-08-06', new Date(2026, 7, 9, 23, 30))).toBe(4);
  });

  it('returns null for a missing or unparseable date', () => {
    expect(catheterDays('', new Date())).toBeNull();
    expect(catheterDays('not-a-date', new Date())).toBeNull();
  });

  it('returns null if the insertion date is in the future', () => {
    expect(catheterDays('2026-08-20', new Date(2026, 7, 9, 0, 0))).toBeNull();
  });
});

describe('netOutput', () => {
  it('is the drained volume when CBI is off', () => {
    expect(netOutput(entry('450'), false)).toBe(450);
  });

  it('subtracts the irrigant when CBI is on — the bag holds irrigant plus urine', () => {
    expect(netOutput(entry('2400', '2000'), true)).toBe(400);
  });

  it('ignores the irrigant field when CBI is off', () => {
    expect(netOutput(entry('2400', '2000'), false)).toBe(2400);
  });

  it('treats a blank irrigant as zero on CBI', () => {
    expect(netOutput(entry('900', ''), true)).toBe(900);
  });

  it('returns null when the drained volume is missing', () => {
    expect(netOutput(entry(''), false)).toBeNull();
    expect(netOutput(entry('abc'), true)).toBeNull();
  });
});

describe('isRetaining', () => {
  it('flags more irrigant in than fluid out on CBI — possible blocked catheter', () => {
    expect(isRetaining(entry('1800', '2000'), true)).toBe(true);
  });

  it('does not flag a normal CBI balance', () => {
    expect(isRetaining(entry('2400', '2000'), true)).toBe(false);
  });

  it('never flags when CBI is off', () => {
    expect(isRetaining(entry('100', '2000'), false)).toBe(false);
  });
});

describe('cbiChannelMismatch', () => {
  it('flags CBI ordered through a 2-way catheter', () => {
    const c: Catheter = { ...emptyCatheter(), present: true, cbi: true, channels: '2-way' };
    expect(cbiChannelMismatch(c)).toBe(true);
  });

  it('accepts CBI on a 3-way', () => {
    const c: Catheter = { ...emptyCatheter(), present: true, cbi: true, channels: '3-way' };
    expect(cbiChannelMismatch(c)).toBe(false);
  });

  it('does not flag when CBI is off', () => {
    const c: Catheter = { ...emptyCatheter(), present: true, cbi: false, channels: '2-way' };
    expect(cbiChannelMismatch(c)).toBe(false);
  });
});

describe('describeCatheter', () => {
  it('is empty when there is no catheter', () => {
    expect(describeCatheter(emptyCatheter())).toBe('');
  });

  it('summarises size, channels, tip, CBI and dwell day', () => {
    const c: Catheter = {
      ...emptyCatheter(),
      present: true,
      size: '22',
      channels: '3-way',
      tip: 'coude',
      cbi: true,
      inserted: '2026-08-06',
    };
    expect(describeCatheter(c, new Date(2026, 7, 9, 10, 0))).toBe(
      '22 Fr 3-way, Coudé tip · on CBI · day 4',
    );
  });

  it('omits fields that are not filled in', () => {
    const c: Catheter = { ...emptyCatheter(), present: true, size: '16' };
    expect(describeCatheter(c, new Date(2026, 7, 9, 10, 0))).toBe('16 Fr');
  });
});
