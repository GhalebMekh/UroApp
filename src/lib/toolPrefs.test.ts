import { describe, expect, it } from 'vitest';
import { MAX_RECENTS, normalizePrefs, pruneUnknown, pushRecent, toggleFavourite } from './toolPrefs';
import { CALCULATORS } from '@/components/calculators/registry';
import { SEARCH_INDEX } from '@/data/searchIndex';

describe('toggleFavourite', () => {
  it('adds an id at the end, preserving pin order', () => {
    expect(toggleFavourite(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes an id that is already pinned', () => {
    expect(toggleFavourite(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('pushRecent', () => {
  it('puts the latest use first', () => {
    expect(pushRecent(['a', 'b'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it('moves an existing id to the front instead of duplicating it', () => {
    expect(pushRecent(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it('caps the list', () => {
    const many = ['1', '2', '3', '4', '5'];
    expect(pushRecent(many, 'x')).toEqual(['x', '1', '2', '3', '4']);
    expect(pushRecent(many, 'x').length).toBe(MAX_RECENTS);
  });
});

describe('pruneUnknown', () => {
  it('drops ids that are no longer in the registry', () => {
    expect(pruneUnknown(['ipss', 'gone'], new Set(['ipss']))).toEqual(['ipss']);
  });
});

describe('normalizePrefs', () => {
  it('survives empty, malformed or legacy storage', () => {
    expect(normalizePrefs(null)).toEqual({ favourites: [], recents: [] });
    expect(normalizePrefs('junk')).toEqual({ favourites: [], recents: [] });
    expect(normalizePrefs({ favourites: 'nope', recents: [1, 'a'] })).toEqual({ favourites: [], recents: ['a'] });
  });

  it('removes duplicate ids and caps recents', () => {
    const p = normalizePrefs({ favourites: ['a', 'a'], recents: ['1', '2', '3', '4', '5', '6', '7'] });
    expect(p.favourites).toEqual(['a']);
    expect(p.recents.length).toBe(MAX_RECENTS);
  });
});

describe('registry ids', () => {
  it('are unique — favourites and recents are keyed on them', () => {
    const ids = CALCULATORS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('are carried by every calculator search result, so search opens the calculator itself', () => {
    // Without calcId, search lands on the Calculators list top — often the wrong tab.
    const calcResults = SEARCH_INDEX.filter((i) => i.screen === 'calculators');
    expect(calcResults.length).toBe(CALCULATORS.length);
    for (const r of calcResults) {
      expect(CALCULATORS.some((c) => c.id === r.calcId), `${r.label} has calcId ${r.calcId}`).toBe(true);
    }
  });
});
