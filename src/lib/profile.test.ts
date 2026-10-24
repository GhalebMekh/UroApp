import { describe, expect, it } from 'vitest';
import {
  EMPTY_PROFILE,
  NAME_MAX,
  ROLES,
  ROLE_LABEL,
  cleanProfile,
  profileByline,
  profileFromRow,
  profileToRow,
} from './profile';

describe('roles', () => {
  it('runs R1–R5 then fellow, specialist, consultant', () => {
    expect(ROLES).toEqual(['r1', 'r2', 'r3', 'r4', 'r5', 'fellow', 'specialist', 'consultant']);
    expect(ROLE_LABEL.r5).toBe('Resident R5');
  });
});

describe('cleanProfile', () => {
  it('trims, collapses spaces and clamps length', () => {
    const c = cleanProfile({ displayName: '  Dr   A  ', role: 'r3', institution: ' KFH ' });
    expect(c).toEqual({ displayName: 'Dr A', role: 'r3', institution: 'KFH' });
    expect(cleanProfile({ ...EMPTY_PROFILE, displayName: 'x'.repeat(200) }).displayName).toHaveLength(NAME_MAX);
  });

  it('drops an unknown role', () => {
    expect(cleanProfile({ ...EMPTY_PROFILE, role: 'r6' as never }).role).toBe('');
  });
});

describe('row mapping', () => {
  it('round-trips, storing empty fields as null', () => {
    const p = { displayName: 'Dr A', role: 'consultant' as const, institution: '' };
    const row = profileToRow(p);
    expect(row).toEqual({ display_name: 'Dr A', role: 'consultant', institution: null });
    expect(profileFromRow(row)).toEqual(p);
  });

  it('tolerates missing or malformed rows', () => {
    expect(profileFromRow(null)).toEqual(EMPTY_PROFILE);
    expect(profileFromRow({ role: 'boss', display_name: 3 })).toEqual(EMPTY_PROFILE);
  });
});

describe('profileByline', () => {
  it('joins whatever is set', () => {
    expect(profileByline({ displayName: 'Dr A', role: 'r2', institution: 'KFH' })).toBe(
      'Dr A · Resident R2 · KFH',
    );
    expect(profileByline({ ...EMPTY_PROFILE, role: 'fellow' })).toBe('Fellow');
    expect(profileByline(EMPTY_PROFILE)).toBe('');
  });
});
