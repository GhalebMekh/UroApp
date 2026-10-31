/**
 * Conferences the user marks "I'm attending", so the CME tracker can offer to
 * log them once they end.
 *
 * Each entry is a snapshot of the conference, because finished congresses
 * drop out of the remote list (data/conferences.json). Kept on this device.
 * Credit hours are never guessed — the user enters them from the certificate.
 */
import type { Conference } from '@/data/conferences';
import { getJSON, setJSON } from './storage';

export const ATTENDING_KEY = 'uroapp.conf.attending.v1';

export interface AttendingConference {
  id: string;
  name: string;
  fullName: string;
  organisation: string;
  startDate: string;
  endDate: string;
  /** pending = not yet logged or dismissed. */
  status: 'pending' | 'logged' | 'dismissed';
}

function normalize(raw: unknown): AttendingConference[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is AttendingConference =>
      !!x &&
      typeof x === 'object' &&
      typeof (x as AttendingConference).id === 'string' &&
      typeof (x as AttendingConference).endDate === 'string' &&
      ['pending', 'logged', 'dismissed'].includes((x as AttendingConference).status),
  );
}

export async function loadAttending(): Promise<AttendingConference[]> {
  return normalize(await getJSON<unknown>(ATTENDING_KEY, []));
}

export function saveAttending(list: AttendingConference[]): Promise<void> {
  return setJSON(ATTENDING_KEY, list);
}

/** Add or remove a conference from the attending list. */
export function toggleAttending(list: AttendingConference[], c: Conference): AttendingConference[] {
  if (list.some((a) => a.id === c.id)) return list.filter((a) => a.id !== c.id);
  const { id, name, fullName, organisation, startDate, endDate } = c;
  return [...list, { id, name, fullName, organisation, startDate, endDate, status: 'pending' }];
}

/** Attended conferences that have reached their last day and are not yet logged or dismissed. */
export function dueForLogging(list: AttendingConference[], today: string): AttendingConference[] {
  return list
    .filter((a) => a.status === 'pending' && a.endDate <= today)
    .sort((x, y) => x.endDate.localeCompare(y.endDate));
}

export function setStatus(
  list: AttendingConference[],
  id: string,
  status: AttendingConference['status'],
): AttendingConference[] {
  return list.map((a) => (a.id === id ? { ...a, status } : a));
}
