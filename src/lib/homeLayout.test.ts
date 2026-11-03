import { describe, expect, it } from 'vitest';
import { HOME_CARDS, MAX_QUICK, moveItem, normalizeLayout, toggleTile } from './homeLayout';

describe('homeLayout', () => {
  it('fills in missing cards and drops unknown ones', () => {
    const l = normalizeLayout({ order: ['cme', 'bogus', 'cme'], hidden: ['tools', 'x'] });
    expect(l.order[0]).toBe('cme');
    expect([...l.order].sort()).toEqual([...HOME_CARDS].sort());
    expect(l.hidden).toEqual(['tools']);
    expect(l.quick).toBeNull();
  });

  it('keeps only known quick tiles, capped', () => {
    const known = new Set(['a', 'b']);
    expect(normalizeLayout({ quick: ['a', 'zz', 'b', 'a'] }, known).quick).toEqual(['a', 'b']);
    const many = Array.from({ length: 12 }, (_, i) => `t${i}`);
    expect(normalizeLayout({ quick: many }).quick).toHaveLength(MAX_QUICK);
  });

  it('moves items within bounds', () => {
    expect(moveItem(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b'], 'a', -1)).toEqual(['a', 'b']);
  });

  it('toggles tiles up to the cap', () => {
    expect(toggleTile(['a'], 'a')).toEqual([]);
    const full = Array.from({ length: MAX_QUICK }, (_, i) => `t${i}`);
    expect(toggleTile(full, 'new')).toEqual(full);
  });
});
