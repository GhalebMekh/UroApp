/**
 * The signed-in doctor's profile — about the clinician, never about patients.
 * Kept deliberately small (owner decision 2026-10-24): name, training level,
 * institution. Mirrors the `profiles` table in supabase/migrations.
 */

/** Saudi urology residency runs R1–R5. Values match the database check constraint. */
export const ROLES = ['r1', 'r2', 'r3', 'r4', 'r5', 'fellow', 'specialist', 'consultant'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  r1: 'Resident R1',
  r2: 'Resident R2',
  r3: 'Resident R3',
  r4: 'Resident R4',
  r5: 'Resident R5',
  fellow: 'Fellow',
  specialist: 'Specialist',
  consultant: 'Consultant',
};

export const NAME_MAX = 80;
export const INSTITUTION_MAX = 120;

export interface Profile {
  displayName: string;
  role: Role | '';
  institution: string;
}

export const EMPTY_PROFILE: Profile = { displayName: '', role: '', institution: '' };

export function isRole(v: unknown): v is Role {
  return typeof v === 'string' && (ROLES as readonly string[]).includes(v);
}

/** Trim and clamp user input before saving. */
export function cleanProfile(p: Profile): Profile {
  return {
    displayName: p.displayName.trim().replace(/\s+/g, ' ').slice(0, NAME_MAX),
    role: isRole(p.role) ? p.role : '',
    institution: p.institution.trim().replace(/\s+/g, ' ').slice(0, INSTITUTION_MAX),
  };
}

/** Database row (snake_case, nullable) → Profile. */
export function profileFromRow(row: unknown): Profile {
  if (!row || typeof row !== 'object') return EMPTY_PROFILE;
  const r = row as Record<string, unknown>;
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
  return {
    displayName: text(r.display_name, NAME_MAX),
    role: isRole(r.role) ? r.role : '',
    institution: text(r.institution, INSTITUTION_MAX),
  };
}

/** Profile → database row; empty fields are stored as null. */
export function profileToRow(p: Profile) {
  const c = cleanProfile(p);
  return {
    display_name: c.displayName || null,
    role: c.role || null,
    institution: c.institution || null,
  };
}

/** "Dr A. Name · Resident R3 · King Fahad Hospital" for printouts; '' when nothing is set. */
export function profileByline(p: Profile): string {
  return [p.displayName, p.role ? ROLE_LABEL[p.role] : '', p.institution].filter(Boolean).join(' · ');
}
