#!/usr/bin/env node
/**
 * Monthly health check of the conference list (src/data/conferences.json),
 * run by .github/workflows/conferences-check.yml.
 *
 * It never edits the list — dates are only ever added by a person after
 * checking the official site (CLAUDE.md). It reports:
 *   - fewer than MIN_UPCOMING upcoming congresses (time to add the next ones);
 *   - official websites that no longer load;
 *   - past congresses that can be tidied away (the app already hides them).
 *
 * Writes conference-report.md, appends it to the job summary, and sets the
 * step output `attention=true|false` for the workflow's issue step.
 * Exit code 1 only when the file itself is malformed.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../src/data/conferences.json', import.meta.url);
const MIN_UPCOMING = 3;
const TIMEOUT_MS = 15_000;
// Status codes from sites that refuse automated requests rather than being down.
const BLOCKED = new Set([401, 403, 405, 406, 429, 503]);
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const today = new Date().toISOString().slice(0, 10);

function problemsWith(feed) {
  const problems = [];
  if (!feed || typeof feed !== 'object') return ['The file is not a JSON object.'];
  if (typeof feed.updatedAt !== 'string' || Number.isNaN(Date.parse(feed.updatedAt))) {
    problems.push('`updatedAt` is missing or not a date.');
  }
  if (!Array.isArray(feed.conferences)) return [...problems, '`conferences` is not a list.'];
  const seen = new Set();
  for (const c of feed.conferences) {
    const label = c?.id ?? '(no id)';
    for (const key of ['id', 'name', 'fullName', 'organisation', 'city', 'country']) {
      if (typeof c?.[key] !== 'string' || !c[key].trim()) problems.push(`${label}: \`${key}\` is empty.`);
    }
    if (typeof c?.notes !== 'string') problems.push(`${label}: \`notes\` is missing.`);
    for (const key of ['startDate', 'endDate']) {
      if (!ISO_DAY.test(c?.[key] ?? '') || Number.isNaN(Date.parse(c[key]))) {
        problems.push(`${label}: \`${key}\` must be yyyy-mm-dd.`);
      }
    }
    if (c?.endDate < c?.startDate) problems.push(`${label}: ends before it starts.`);
    if (typeof c?.url !== 'string' || !c.url.startsWith('https://')) problems.push(`${label}: \`url\` must start with https://.`);
    if (c?.regional !== undefined && typeof c.regional !== 'boolean') problems.push(`${label}: \`regional\` must be true or false.`);
    if (seen.has(label)) problems.push(`${label}: duplicate id.`);
    seen.add(label);
  }
  return problems;
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; UroApp conference link check)' },
    });
    if (res.ok) return { state: 'ok', detail: String(res.status) };
    if (BLOCKED.has(res.status)) return { state: 'blocked', detail: String(res.status) };
    return { state: 'broken', detail: String(res.status) };
  } catch (err) {
    return { state: 'broken', detail: err?.name === 'TimeoutError' ? 'timed out' : 'no response' };
  }
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function finish(report, attention) {
  writeFileSync('conference-report.md', report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
  output('attention', attention ? 'true' : 'false');
  console.log(report);
}

let feed;
try {
  feed = JSON.parse(readFileSync(FILE, 'utf8'));
} catch (err) {
  finish(`## Conference list\n\nThe file could not be read as JSON: ${err.message}\n`, true);
  process.exit(1);
}

const structural = problemsWith(feed);
if (structural.length > 0) {
  // Installed apps ignore a malformed remote list and keep their last good copy,
  // so nobody sees bad data — but the update will not reach anyone until fixed.
  finish(
    `## Conference list is malformed\n\nInstalled apps will ignore it until this is fixed:\n\n${structural.map((p) => `- ${p}`).join('\n')}\n`,
    true,
  );
  process.exit(1);
}

const upcoming = feed.conferences
  .filter((c) => c.endDate >= today)
  .sort((a, b) => a.startDate.localeCompare(b.startDate));
const past = feed.conferences.filter((c) => c.endDate < today);
const links = await Promise.all(upcoming.map((c) => checkUrl(c.url)));

const icon = { ok: 'OK', blocked: 'could not check (site blocks automated requests)', broken: 'NOT LOADING' };
const rows = upcoming.map(
  (c, i) => `| ${c.name} | ${c.startDate} to ${c.endDate} | ${c.city} | [site](${c.url}) — ${icon[links[i].state]} (${links[i].detail}) |`,
);
const broken = upcoming.filter((_, i) => links[i].state === 'broken');

const reasons = [];
if (upcoming.length < MIN_UPCOMING) {
  reasons.push(
    `Only ${upcoming.length} upcoming congress${upcoming.length === 1 ? '' : 'es'} listed (aim for at least ${MIN_UPCOMING}). Add the next confirmed dates — check each on the official site first.`,
  );
}
for (const c of broken) reasons.push(`${c.name}: the official website did not load — check whether it moved.`);

let report = `## Conference list check — ${today}\n\n`;
report += reasons.length ? `**Needs attention**\n\n${reasons.map((r) => `- ${r}`).join('\n')}\n\n` : 'Nothing needs attention.\n\n';
report += `List last updated ${feed.updatedAt.slice(0, 10)}. ${upcoming.length} upcoming:\n\n`;
report += upcoming.length ? `| Congress | Dates | City | Website |\n|---|---|---|---|\n${rows.join('\n')}\n\n` : '_None._\n\n';
if (past.length) {
  report += `Finished and can be removed (the app already hides them): ${past.map((c) => c.name).join(', ')}.\n\n`;
}
report += 'How to update: docs/CONFERENCES.md. Remember to bump `updatedAt`.\n';

finish(report, reasons.length > 0);
