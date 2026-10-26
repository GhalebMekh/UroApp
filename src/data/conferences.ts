/**
 * Upcoming urology conferences.
 *
 * The list lives in conferences.json. It is built into the app (so the screen
 * works offline and in App Review) and is also fetched from GitHub when online
 * (lib/conferencesFeed), so editing that file updates every installed app
 * without a release — see docs/CONFERENCES.md.
 *
 * Every date, venue and URL is verified against the official congress site or
 * organiser before it is added — not written from memory (CLAUDE.md).
 * Conferences are only listed once their dates are confirmed. Always re-check
 * the official website before booking — dates can change.
 */
import bundledFeed from './conferences.json';

export interface Conference {
  id: string;
  /** Short display name, e.g. "EAU 2027". */
  name: string;
  /** Full congress title. */
  fullName: string;
  /** Organising society (short). */
  organisation: string;
  /** First day, yyyy-mm-dd (inclusive). */
  startDate: string;
  /** Last day, yyyy-mm-dd (inclusive). */
  endDate: string;
  city: string;
  country: string;
  /** Official congress or society website. */
  url: string;
  /** Whether the venue is in the Gulf/MENA region (owner focus). */
  regional?: boolean;
  notes: string;
}

export interface ConferenceFeed {
  /** When the list was last edited (ISO date-time); the newest copy wins. */
  updatedAt: string;
  conferences: Conference[];
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const day = (v: unknown): v is string => typeof v === 'string' && ISO_DAY.test(v) && !Number.isNaN(Date.parse(v));

function isConference(x: unknown): x is Conference {
  if (!x || typeof x !== 'object') return false;
  const c = x as Record<string, unknown>;
  return (
    text(c.id) &&
    text(c.name) &&
    text(c.fullName) &&
    text(c.organisation) &&
    text(c.city) &&
    text(c.country) &&
    typeof c.notes === 'string' &&
    day(c.startDate) &&
    day(c.endDate) &&
    c.endDate >= c.startDate &&
    // The list comes over the network: links must be plain https pages.
    typeof c.url === 'string' &&
    c.url.startsWith('https://') &&
    (c.regional === undefined || typeof c.regional === 'boolean')
  );
}

/** Structural check — a malformed or tampered list is ignored, never shown. */
export function isConferenceFeed(x: unknown): x is ConferenceFeed {
  if (!x || typeof x !== 'object') return false;
  const f = x as Record<string, unknown>;
  if (typeof f.updatedAt !== 'string' || Number.isNaN(Date.parse(f.updatedAt))) return false;
  if (!Array.isArray(f.conferences) || !f.conferences.every(isConference)) return false;
  const ids = f.conferences.map((c: Conference) => c.id);
  return new Set(ids).size === ids.length;
}

/** The copy built into the app. */
export const BUNDLED_CONFERENCE_FEED: ConferenceFeed = isConferenceFeed(bundledFeed)
  ? bundledFeed
  : { updatedAt: '1970-01-01T00:00:00Z', conferences: [] };

/** The built-in list (the screens use lib/conferencesFeed, which may have a newer one). */
export const CONFERENCES: Conference[] = BUNDLED_CONFERENCE_FEED.conferences;
