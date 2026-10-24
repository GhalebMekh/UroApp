import type { Screen } from '@/navigation';

/**
 * Preview mode limits the public web build while the App Store release is the
 * real product. Set VITE_PREVIEW_MODE=true on the web host; native builds leave
 * it unset and behave normally, so this never affects what ships to the store.
 *
 * The locked workspaces stay visible and tappable in the hubs on purpose — the
 * point is a shop window, not a smaller app.
 */
export const previewMode = import.meta.env.VITE_PREVIEW_MODE === 'true';

/** Workspaces that stay fully usable in a preview build. */
const OPEN: ReadonlySet<Screen> = new Set<Screen>([
  'home',
  'clinical',
  'academic',
  'calculators',
  'guidelines',
  'more',
]);

export function isLocked(screen: Screen): boolean {
  return previewMode && !OPEN.has(screen);
}

/** What the lock card says in place of each withheld workspace. */
const COPY: Partial<Record<Screen, { title: string; blurb: string }>> = {
  residency: {
    title: 'Residency',
    blurb:
      'The ward round list, on-call pathways, operative logbook, procedure reference and bilingual consent — the day-to-day tools for a shift.',
  },
  imaging: {
    title: 'Imaging',
    blurb: 'PI-RADS, Bosniak and VI-RADS criteria with the management each category implies.',
  },
  instruments: {
    title: 'Instruments',
    blurb: 'Theatre instrument reference for scrubbing in on an unfamiliar list.',
  },
  mdt: { title: 'MDT', blurb: 'Prepare and present cases for the multidisciplinary meeting.' },
  cme: { title: 'CME tracker', blurb: 'Log and total your continuing education credits.' },
  pediatrics: {
    title: 'Pediatrics',
    blurb: 'Weight-based fluids, antibiotic dosing and the paediatric urology essentials.',
  },
  surveillance: {
    title: 'Surveillance schedules',
    blurb:
      'Risk-stratified follow-up calendars for NMIBC, prostate, renal, UTUC, testis, stones and testosterone.',
  },
  conferences: { title: 'Conferences', blurb: 'Upcoming urology congresses and their dates.' },
  rehearsal: {
    title: 'Operative rehearsal',
    blurb: 'Rebuild the steps of an operation against the clock before you scrub in.',
  },
  scenarios: {
    title: 'Intra-op scenarios',
    blurb: 'Work branching intra-operative decision cases and see where each choice leads.',
  },
  drugs: {
    title: 'Drug interactions',
    blurb: 'Urology-relevant drug pairs with severity, effect and management, each entry sourced.',
  },
  articles: {
    title: 'Weekly reads',
    blurb: 'A curated feed of new urology literature from PubMed Central.',
  },
};

export function lockCopy(screen: Screen): { title: string; blurb: string } {
  return COPY[screen] ?? { title: 'This workspace', blurb: 'Part of the full UroApp release.' };
}
