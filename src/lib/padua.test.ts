import { describe, expect, it } from 'vitest';
import { paduaScore, type PaduaSelection } from './padua';

const base: PaduaSelection = {
  longitudinal: null,
  exophytic: null,
  rim: null,
  sinus: null,
  collectingSystem: null,
  size: null,
};

describe('paduaScore', () => {
  it('reproduces the minimum score (all lowest-point axes -> 6, low risk)', () => {
    const sel: PaduaSelection = {
      longitudinal: 'polar',
      exophytic: 'ge50',
      rim: 'lateral',
      sinus: 'no',
      collectingSystem: 'no',
      size: 'le4',
    };
    expect(paduaScore(sel)).toEqual({ total: 6, band: 'low' });
  });

  it('reproduces the maximum score (all highest-point axes -> 14, high risk)', () => {
    const sel: PaduaSelection = {
      longitudinal: 'middle',
      exophytic: 'endophytic',
      rim: 'medial',
      sinus: 'yes',
      collectingSystem: 'yes',
      size: 'gt7',
    };
    expect(paduaScore(sel)).toEqual({ total: 14, band: 'high' });
  });

  it('boundary: 7 is low, 8 is moderate, 9 is moderate, 10 is high', () => {
    // 7 = 1+1+1+1+1+2 (bump size to 4to7)
    expect(
      paduaScore({ longitudinal: 'polar', exophytic: 'ge50', rim: 'lateral', sinus: 'no', collectingSystem: 'no', size: '4to7' }),
    ).toEqual({ total: 7, band: 'low' });
    // 8 = bump exophytic to lt50 on top of the 7-case's size
    expect(
      paduaScore({ longitudinal: 'polar', exophytic: 'lt50', rim: 'lateral', sinus: 'no', collectingSystem: 'no', size: '4to7' }),
    ).toEqual({ total: 8, band: 'moderate' });
    // 9 = bump size to gt7 on top of the 8-case
    expect(
      paduaScore({ longitudinal: 'polar', exophytic: 'lt50', rim: 'lateral', sinus: 'no', collectingSystem: 'no', size: 'gt7' }),
    ).toEqual({ total: 9, band: 'moderate' });
    // 10 = bump sinus to yes on top of the 9-case
    expect(
      paduaScore({ longitudinal: 'polar', exophytic: 'lt50', rim: 'lateral', sinus: 'yes', collectingSystem: 'no', size: 'gt7' }),
    ).toEqual({ total: 10, band: 'high' });
  });

  it('returns null until every axis is selected', () => {
    expect(paduaScore(base)).toBeNull();
    expect(paduaScore({ ...base, longitudinal: 'polar' })).toBeNull();
  });
});
