import { describe, expect, it } from 'vitest';
import { asItems, mergeCollection, mergeSynced, mergeValue } from './syncMerge';

const a = { id: 'a', note: 'one' };
const b = { id: 'b', note: 'two' };
const c = { id: 'c', note: 'three' };

describe('mergeCollection', () => {
  it('first sync on a second device keeps both sides (no base yet)', () => {
    expect(mergeCollection(undefined, [a], [b])).toEqual([a, b]);
  });

  it('keeps additions made on both devices since the last sync', () => {
    expect(mergeCollection([a], [a, b], [a, c])).toEqual([a, b, c]);
  });

  it('applies a deletion made on either side', () => {
    expect(mergeCollection([a, b], [a], [a, b])).toEqual([a]);
    expect(mergeCollection([a, b], [a, b], [a])).toEqual([a]);
  });

  it('takes the side that edited an item', () => {
    const a2 = { ...a, note: 'edited' };
    expect(mergeCollection([a], [a2], [a])).toEqual([a2]);
    expect(mergeCollection([a], [a], [a2])).toEqual([a2]);
  });

  it('prefers this device when both edited the same item', () => {
    const local = { ...a, note: 'phone' };
    const remote = { ...a, note: 'ipad' };
    expect(mergeCollection([a], [local], [remote])).toEqual([local]);
  });

  it('never lets a deletion silently discard an edit', () => {
    const edited = { ...a, note: 'edited' };
    expect(mergeCollection([a], [], [edited])).toEqual([edited]);
    expect(mergeCollection([a], [edited], [])).toEqual([edited]);
  });

  it('returns local unchanged when nothing changed remotely', () => {
    expect(mergeCollection([a, b], [b, a, c], [a, b])).toEqual([b, a, c]);
  });

  it('ignores junk entries', () => {
    expect(asItems([a, null, 3, { note: 'no id' }, { id: 7 }])).toEqual([a]);
    expect(mergeCollection('x', { y: 1 }, [a])).toEqual([a]);
  });
});

describe('mergeValue', () => {
  it('takes whichever side changed since the base', () => {
    expect(mergeValue({ h: 20 }, { h: 30 }, { h: 20 })).toEqual({ h: 30 });
    expect(mergeValue({ h: 20 }, { h: 20 }, { h: 40 })).toEqual({ h: 40 });
  });

  it('prefers local when both changed, and fills a missing side', () => {
    expect(mergeValue({ h: 20 }, { h: 30 }, { h: 40 })).toEqual({ h: 30 });
    expect(mergeValue(undefined, { h: 30 }, undefined)).toEqual({ h: 30 });
    expect(mergeValue(undefined, undefined, { h: 40 })).toEqual({ h: 40 });
  });
});

describe('mergeSynced', () => {
  it('dispatches on kind', () => {
    expect(mergeSynced('collection', [], [a], [b])).toEqual([a, b]);
    expect(mergeSynced('value', 1, 1, 2)).toBe(2);
  });
});
