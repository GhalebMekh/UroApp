/**
 * Urinary catheter record for the inpatient rounding tool.
 *
 * Deliberately contains no scored clinical thresholds (e.g. oliguria cut-offs) —
 * everything here is arithmetic or a documentation field, so nothing needs a
 * citation. If a threshold is ever added it must carry its primary source, per
 * CLAUDE.md.
 *
 * De-identified, on-device only (see the rounding tool's PHI rules).
 */

export type CatheterTip = '' | 'regular' | 'coude';
export type CatheterChannels = '' | '2-way' | '3-way';
export type UrineColour = '' | 'clear' | 'straw' | 'concentrated' | 'pink' | 'frank' | 'clots';

export const TIP_LABELS: Record<Exclude<CatheterTip, ''>, string> = {
  regular: 'Regular',
  coude: 'Coudé tip',
};

export const CHANNEL_LABELS: Record<Exclude<CatheterChannels, ''>, string> = {
  '2-way': '2-way',
  '3-way': '3-way',
};

/** Ordered clear → frankly bloody, so the list reads as a severity gradient. */
export const COLOUR_LABELS: Record<Exclude<UrineColour, ''>, string> = {
  clear: 'Clear',
  straw: 'Straw',
  concentrated: 'Concentrated',
  pink: 'Pink / blood-tinged',
  frank: 'Frank haematuria',
  clots: 'Haematuria with clots',
};

/** Colours that should read as a warning in the UI. */
export const ALERT_COLOURS: UrineColour[] = ['frank', 'clots'];

export interface UrineEntry {
  id: string;
  /** ISO datetime of the reading. */
  datetime: string;
  /** Total volume drained into the bag, mL. */
  volume: string;
  /** Irrigant instilled over the same period, mL. Only meaningful on CBI. */
  irrigation: string;
  colour: UrineColour;
}

export interface Catheter {
  present: boolean;
  /** ISO date of insertion. */
  inserted: string;
  /** French gauge. */
  size: string;
  tip: CatheterTip;
  channels: CatheterChannels;
  /** Continuous bladder irrigation running. */
  cbi: boolean;
  fixation: string;
  log: UrineEntry[];
}

export function emptyCatheter(): Catheter {
  return {
    present: false,
    inserted: '',
    size: '',
    tip: '',
    channels: '',
    cbi: false,
    fixation: '',
    log: [],
  };
}

const num = (v: string): number | null => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Days the catheter has been in situ, counting the insertion day as day 1.
 * Returns null if no valid insertion date. Catheter-days matter because
 * infection risk accumulates with dwell time.
 */
export function catheterDays(inserted: string, now: Date = new Date()): number | null {
  if (!inserted.trim()) return null;

  // The <input type="date"> value is a LOCAL calendar date, so both sides must be
  // compared in local terms. Using UTC here undercounts by a day during the hours
  // when the local date is already ahead of the UTC date (e.g. 00:00–03:00 in
  // UTC+3). Date.UTC is used only as epoch arithmetic over local components,
  // which also sidesteps DST.
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(inserted.trim());
  let startDay: number;
  if (ymd) {
    startDay = Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  } else {
    const start = new Date(inserted);
    if (Number.isNaN(start.getTime())) return null;
    startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  }

  const nowDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((nowDay - startDay) / 86_400_000);
  return diff < 0 ? null : diff + 1;
}

/**
 * True urine output for an entry.
 *
 * On CBI the bag collects irrigant AND urine, so the drained volume overstates
 * output. Net = drained − irrigant in. Off CBI the drained volume IS the output.
 * Returns null when the drained volume is missing or not a number.
 */
export function netOutput(entry: UrineEntry, cbi: boolean): number | null {
  const drained = num(entry.volume);
  if (drained === null) return null;
  if (!cbi) return drained;
  const irrigant = num(entry.irrigation) ?? 0;
  return drained - irrigant;
}

/**
 * A negative net output on CBI means more fluid went in than came out — the
 * catheter may be blocked (clot) and the bladder filling. This is a prompt to
 * go and look, not a diagnosis.
 */
export function isRetaining(entry: UrineEntry, cbi: boolean): boolean {
  const net = netOutput(entry, cbi);
  return cbi && net !== null && net < 0;
}

/** CBI runs through the third channel, so it requires a 3-way catheter. */
export function cbiChannelMismatch(c: Catheter): boolean {
  return c.cbi && c.channels === '2-way';
}

/** One-line description, e.g. "16 Fr 3-way, Coudé tip · on CBI · day 4". */
export function describeCatheter(c: Catheter, now: Date = new Date()): string {
  if (!c.present) return '';
  const head = [c.size.trim() && `${c.size.trim()} Fr`, c.channels && CHANNEL_LABELS[c.channels]]
    .filter(Boolean)
    .join(' ');
  const parts = [head, c.tip && TIP_LABELS[c.tip]].filter(Boolean);
  let out = parts.join(', ');
  if (c.cbi) out += `${out ? ' · ' : ''}on CBI`;
  const days = catheterDays(c.inserted, now);
  if (days !== null) out += `${out ? ' · ' : ''}day ${days}`;
  return out;
}
