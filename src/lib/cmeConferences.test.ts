import { describe, expect, it } from 'vitest';
import type { Conference } from '@/data/conferences';
import { dueForLogging, setStatus, toggleAttending } from './cmeConferences';

const conf = (id: string, endDate: string): Conference => ({
  id,
  name: id.toUpperCase(),
  fullName: `${id} congress`,
  organisation: 'Org',
  startDate: endDate,
  endDate,
  city: 'Jeddah',
  country: 'Saudi Arabia',
  url: 'https://example.org',
  notes: '',
});

describe('attending conferences', () => {
  it('toggles on and off, keeping a snapshot', () => {
    const on = toggleAttending([], conf('aau', '2026-11-07'));
    expect(on).toEqual([expect.objectContaining({ id: 'aau', organisation: 'Org', status: 'pending' })]);
    expect(toggleAttending(on, conf('aau', '2026-11-07'))).toEqual([]);
  });

  it('is due from its last day until logged or dismissed', () => {
    let list = toggleAttending([], conf('b', '2026-11-07'));
    list = toggleAttending(list, conf('a', '2026-10-01'));
    expect(dueForLogging(list, '2026-11-06').map((x) => x.id)).toEqual(['a']);
    expect(dueForLogging(list, '2026-11-07').map((x) => x.id)).toEqual(['a', 'b']);
    list = setStatus(list, 'a', 'logged');
    list = setStatus(list, 'b', 'dismissed');
    expect(dueForLogging(list, '2026-12-01')).toEqual([]);
  });
});
