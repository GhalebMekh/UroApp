/**
 * Upcoming urology conferences.
 *
 * Every date, venue and URL below was verified against the official congress
 * site or organiser at build time (July 2026) — not written from memory
 * (CLAUDE.md). Conferences are only listed when their dates are confirmed;
 * events without announced dates are omitted until they are published.
 * Always re-check the official website before booking — dates can change.
 */

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

/**
 * Kept in source in rough chronological order; the screen re-sorts by date and
 * hides events whose end date has already passed.
 */
export const CONFERENCES: Conference[] = [
  {
    id: 'aau-2026',
    name: 'AAU 2026',
    fullName: 'Arab Association of Urology Annual Congress',
    organisation: 'Arab Association of Urology (AAU)',
    startDate: '2026-11-04',
    endDate: '2026-11-07',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    url: 'https://www.aaucongress2026.com/',
    regional: true,
    notes:
      'The regional flagship, hosted in Jeddah this year. Closest major congress for Gulf/MENA trainees — the AAU also runs an oncology summit separately. Society site: araburology.org.',
  },
  {
    id: 'wcet-2026',
    name: 'WCET 2026',
    fullName: '43rd World Congress of Endourology & Uro-Technology',
    organisation: 'Endourological Society',
    startDate: '2026-11-09',
    endDate: '2026-11-13',
    city: 'Buenos Aires',
    country: 'Argentina',
    url: 'https://www.endourology.org/',
    notes:
      'The endourology and uro-technology meeting — stones, laser, robotics and minimally invasive surgery. Society site listed; a dedicated congress URL is usually published closer to the date.',
  },
  {
    id: 'siu-2026',
    name: 'SIU 2026',
    fullName: "46th Congress of the Société Internationale d'Urologie",
    organisation: "Société Internationale d'Urologie (SIU)",
    startDate: '2026-11-11',
    endDate: '2026-11-14',
    city: 'Florence',
    country: 'Italy',
    url: 'https://www.siu-urology.org/',
    notes:
      'The global society congress with a strong international and education focus. Note it overlaps closely with WCET 2026 in the same week.',
  },
  {
    id: 'eau-2027',
    name: 'EAU 2027',
    fullName: '42nd Annual Congress of the European Association of Urology',
    organisation: 'European Association of Urology (EAU)',
    startDate: '2027-03-19',
    endDate: '2027-03-22',
    city: 'Amsterdam',
    country: 'Netherlands',
    url: 'https://eaucongress.uroweb.org/',
    notes:
      "Europe's largest urology meeting, at the RAI Amsterdam. The EAU guidelines used throughout this app are presented and updated around this congress.",
  },
  {
    id: 'aua-2027',
    name: 'AUA 2027',
    fullName: '122nd Annual Meeting of the American Urological Association',
    organisation: 'American Urological Association (AUA)',
    startDate: '2027-05-21',
    endDate: '2027-05-24',
    city: 'San Diego',
    country: 'USA',
    url: 'https://www.auanet.org/AUA2027',
    notes:
      'The largest global urology meeting. The AUA guidelines used throughout this app are released and amended here.',
  },
];
