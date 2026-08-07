import { describe, expect, it } from 'vitest';
import { stoneScore, type StoneSelection } from './stoneScore';

const base: StoneSelection = {
  sex: null,
  painDuration: null,
  race: null,
  nausea: null,
  hematuria: null,
};

describe('stoneScore', () => {
  it('reproduces the minimum score (all lowest-point fields -> 0, low risk)', () => {
    const sel: StoneSelection = {
      sex: 'female',
      painDuration: 'gt24h',
      race: 'black',
      nausea: 'none',
      hematuria: false,
    };
    expect(stoneScore(sel)).toEqual({ total: 0, band: 'low' });
  });

  it('reproduces the maximum score (all highest-point fields -> 13, high risk)', () => {
    const sel: StoneSelection = {
      sex: 'male',
      painDuration: 'lt6h',
      race: 'nonblack',
      nausea: 'vomiting',
      hematuria: true,
    };
    expect(stoneScore(sel)).toEqual({ total: 13, band: 'high' });
  });

  it('boundary: 5 is low, 6 is moderate, 9 is moderate, 10 is high', () => {
    // 5 = 0+0+0+2+3 (female, >24h, black, vomiting, hematuria)
    expect(
      stoneScore({ sex: 'female', painDuration: 'gt24h', race: 'black', nausea: 'vomiting', hematuria: true }),
    ).toEqual({ total: 5, band: 'low' });
    // 6 = 2+0+0+1+3 (male, >24h, black, nausea, hematuria)
    expect(
      stoneScore({ sex: 'male', painDuration: 'gt24h', race: 'black', nausea: 'nausea', hematuria: true }),
    ).toEqual({ total: 6, band: 'moderate' });
    // 9 = 2+1+0+2+3+1 (male, 6-24h, black, vomiting, hematuria)
    expect(
      stoneScore({ sex: 'male', painDuration: '6to24h', race: 'black', nausea: 'vomiting', hematuria: true }),
    ).toEqual({ total: 8, band: 'moderate' });
    // 11 = 2+1+3+2+3 (male, 6-24h, non-black, vomiting, hematuria)
    expect(
      stoneScore({ sex: 'male', painDuration: '6to24h', race: 'nonblack', nausea: 'vomiting', hematuria: true }),
    ).toEqual({ total: 11, band: 'high' });
  });

  it('returns null until every field is selected', () => {
    expect(stoneScore(base)).toBeNull();
    expect(stoneScore({ ...base, sex: 'male' })).toBeNull();
    expect(stoneScore({ ...base, sex: 'male', painDuration: 'lt6h' })).toBeNull();
  });

  it('pain duration scoring: <6h=3, 6-24h=1, >24h=0', () => {
    const baseCase: StoneSelection = { sex: 'female', race: 'black', nausea: 'none', hematuria: false, painDuration: 'gt24h' };
    expect(stoneScore({ ...baseCase, painDuration: 'lt6h' })).toEqual({ total: 3, band: 'low' });
    expect(stoneScore({ ...baseCase, painDuration: '6to24h' })).toEqual({ total: 1, band: 'low' });
    expect(stoneScore({ ...baseCase, painDuration: 'gt24h' })).toEqual({ total: 0, band: 'low' });
  });

  it('nausea/vomiting scoring: none=0, nausea=1, vomiting=2', () => {
    const baseCase: StoneSelection = { sex: 'female', painDuration: 'gt24h', race: 'black', hematuria: false, nausea: 'none' };
    expect(stoneScore({ ...baseCase, nausea: 'none' })).toEqual({ total: 0, band: 'low' });
    expect(stoneScore({ ...baseCase, nausea: 'nausea' })).toEqual({ total: 1, band: 'low' });
    expect(stoneScore({ ...baseCase, nausea: 'vomiting' })).toEqual({ total: 2, band: 'low' });
  });
});
