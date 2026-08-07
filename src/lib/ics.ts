/**
 * Minimal RFC 5545 iCalendar (.ics) generation for all-day, multi-day events.
 * Opening the file on iOS offers "Add to Calendar".
 */
import { saveFile } from './print';

export interface CalendarEvent {
  uid: string;
  /** yyyy-mm-dd (first day, inclusive). */
  startDate: string;
  /** yyyy-mm-dd (last day, inclusive). */
  endDate: string;
  title: string;
  location?: string;
  url?: string;
  description?: string;
}

/** yyyy-mm-dd → yyyymmdd. */
function icsDate(iso: string): string {
  return iso.replace(/-/g, '');
}

/** Add one day to a yyyy-mm-dd date (all-day DTEND is exclusive in RFC 5545). */
function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Escape a text value per RFC 5545 (backslash, comma, semicolon, newline). */
function esc(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Fold a content line to <=75 octets per RFC 5545 (continuation lines start with a space). */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    chunks.push(' ' + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) chunks.push(' ' + rest);
  return chunks.join('\r\n');
}

function eventBlock(e: CalendarEvent, stamp: string): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(e.startDate)}`,
    `DTEND;VALUE=DATE:${icsDate(nextDay(e.endDate))}`,
    `SUMMARY:${esc(e.title)}`,
  ];
  if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
  if (e.url) lines.push(`URL:${esc(e.url)}`);
  if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
  lines.push('END:VEVENT');
  return lines.map(fold).join('\r\n');
}

/** Build a complete VCALENDAR document for one or more events. */
export function buildICS(events: CalendarEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UroApp//Conferences//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.map((e) => eventBlock(e, stamp)),
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Build and save/share an .ics file for the given events. */
export function saveICS(fileStem: string, events: CalendarEvent[]): boolean {
  return saveFile(fileStem, 'ics', 'text/calendar', buildICS(events));
}
