import { describe, expect, it } from 'vitest';
import { SEARCH_INDEX } from '@/data/searchIndex';
import { normalize, searchItems } from './search';

const top = (q: string, n = 3) => searchItems(SEARCH_INDEX, q).slice(0, n).map((i) => i.label);

describe('searchItems', () => {
  it('finds renal cell carcinoma from "renal cancer"', () => {
    expect(top('renal cancer', 1)).toEqual(['Renal cell carcinoma']);
  });

  it('leads "stricture" with the urethral stricture guideline', () => {
    const first = searchItems(SEARCH_INDEX, 'stricture')[0];
    expect(first).toBeDefined();
    expect(first!.label + first!.sub).toMatch(/urethra/i);
  });

  it('matches words in any order and UK spellings', () => {
    expect(top('cancer bladder')).toContain('Bladder cancer');
    expect(normalize('Haematuria Paediatric')).toBe('hematuria pediatric');
  });

  it('returns nothing for an empty query', () => {
    expect(searchItems(SEARCH_INDEX, '  ')).toEqual([]);
  });
});
