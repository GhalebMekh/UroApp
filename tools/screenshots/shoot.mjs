/**
 * App Store screenshots, taken from a local production build of the app.
 *
 *   1. npm run build            (in the app root)
 *   2. serve dist on :4173      (vite preview — the "uroapp-build" launch config)
 *   3. npm run shoot            (here; first time: npm install — it uses the installed Edge)
 *
 * Writes JPEGs to store/screenshots/<device>/ (git-ignored) at the sizes App Store
 * Connect accepts. The data shown is sample data seeded into the browser's
 * storage for the shoot — pinned calculators and rehearsal history only; no
 * patient data exists anywhere in the app.
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE = process.env.SHOT_URL ?? 'http://localhost:4173/';
const OUT = new URL('../../store/screenshots/', import.meta.url);

/** CSS viewport × scale = the pixel size App Store Connect asks for. */
const DEVICES = [
  { name: 'iphone-6.3', width: 402, height: 874, scale: 3, mobile: true }, // 1206 × 2622
  { name: 'iphone-6.9', width: 440, height: 956, scale: 3, mobile: true }, // 1320 × 2868
  // Landscape: the three-column dashboard fills it; portrait left half the page empty.
  { name: 'ipad-13', width: 1376, height: 1032, scale: 2, mobile: false }, // 2752 × 2064
];

// A Monday morning in Jeddah, two days before AAU 2026.
const NOW = new Date('2026-11-02T08:30:00+03:00');
const DAY = 86_400_000;

function seed(now) {
  const at = (daysAgo) => new Date(now - daysAgo * DAY).toISOString();
  const attempt = (procedureId, daysAgo, correct, total) => ({
    id: `${procedureId}-${daysAgo}`,
    procedureId,
    mode: 'order',
    at: at(daysAgo),
    correct,
    total,
  });
  return {
    'CapacitorStorage.uroapp.disclaimer.v1': 'true',
    'CapacitorStorage.uroapp.tools.v1': JSON.stringify({
      favourites: ['capra', 'renal', 'ipss'],
      recents: ['psa', 'eortc', 'stone-passage'],
    }),
    'CapacitorStorage.uroapp.rehearsal.v1': JSON.stringify([
      attempt('pcnl', 19, 8, 10),
      attempt('turp', 16, 9, 10),
      attempt('pyeloplasty', 4, 5, 7),
      attempt('turbt', 2, 10, 10),
    ]),
  };
}

const wait = (page, ms) => page.waitForTimeout(ms);

async function nav(page, label) {
  await page.locator('nav button', { hasText: label }).first().click();
  await wait(page, 350);
}

async function tap(page, text, scope = 'main') {
  await page.locator(`${scope} button`, { hasText: text }).first().click();
  await wait(page, 450);
}

/**
 * Scroll so the element found by `find` (run in the page) sits `offset` px below
 * everything pinned to the top — the top bar and, on Residency, its section tabs.
 */
async function scrollToElement(page, find, arg, offset) {
  await page.evaluate(
    ([findSrc, a, off]) => {
      const el = new Function('a', `return (${findSrc})(a)`)(a);
      if (!el) return;
      // Measure pinned bars where they sit at the top of the page.
      window.scrollTo(0, 0);
      const pinned = [...document.querySelectorAll('body header, main .sticky')]
        .map((bar) => bar.getBoundingClientRect())
        .filter((r) => r.top < 160) // only bars pinned at the top, not sticky bits further down
        .reduce((max, r) => Math.max(max, r.bottom), 0);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - pinned - off);
    },
    [find.toString(), arg, offset],
  );
  await wait(page, 400);
}

const scrollTo = (page, selector, offset = 12) =>
  scrollToElement(page, (sel) => document.querySelector(sel), selector, offset);

/** Scroll to the first leaf element whose text starts with `text` (case-insensitive). */
const scrollToText = (page, text, offset = 12) =>
  scrollToElement(
    page,
    (t) =>
      [...document.querySelectorAll('main h2, main h3, main div, main span, main label')].find(
        (e) => e.childElementCount === 0 && e.textContent?.trim().toLowerCase().startsWith(t.toLowerCase()),
      ),
    text,
    offset,
  );

async function home(page) {
  await nav(page, 'Home');
  await page.evaluate(() => window.scrollTo(0, 0));
}

const SHOTS = [
  ['01-home', async (page) => home(page)],
  [
    '02-calculator',
    async (page, device) => {
      await home(page);
      await tap(page, 'UCSF-CAPRA');
      await tap(page, '≥ 50');
      await page.locator('main select').first().selectOption('1');
      await tap(page, '4/5 secondary');
      await tap(page, 'T1 / T2');
      await tap(page, '< 34%');
      // Phones: bring the result into view under the inputs.
      if (device.mobile) await scrollToText(page, 'PSA at diagnosis', 4);
    },
  ],
  [
    '03-oncall',
    async (page) => {
      await home(page);
      await tap(page, 'Testicular torsion');
      await page.evaluate(() => window.scrollTo(0, 0));
    },
  ],
  [
    '04-procedure',
    async (page) => {
      await nav(page, 'Residency');
      await tap(page, 'OR');
      await tap(page, 'Procedures');
      await page.locator('main select').first().selectOption('pcnl');
      await wait(page, 300);
      await scrollToText(page, 'Danger zones & bail-outs');
    },
  ],
  [
    '05-rehearsal',
    async (page, device) => {
      await home(page);
      await tap(page, 'Percutaneous nephrolithotomy');
      await tap(page, 'Danger zones');
      await page.evaluate(() => window.scrollTo(0, 0));
      if (device.mobile) await scrollToText(page, 'Question 1 of', 16);
    },
  ],
  [
    '06-consent',
    async (page) => {
      await nav(page, 'Residency');
      await tap(page, 'OR');
      await tap(page, 'Consent');
      const select = page.locator('main select').first();
      const turp = await select.locator('option', { hasText: 'TURP' }).first().getAttribute('value');
      if (turp) await select.selectOption(turp);
      await wait(page, 300);
      await scrollTo(page, 'main .overflow-hidden');
    },
  ],
  [
    '07-pediatrics',
    async (page, device) => {
      await nav(page, 'Clinical');
      await tap(page, 'Pediatrics');
      if (device.mobile) await tap(page, 'Scrotal pain in children');
      await page.evaluate(() => window.scrollTo(0, 0));
    },
  ],
  [
    '08-calculators',
    async (page) => {
      await nav(page, 'Clinical');
      await tap(page, 'Calculators');
      await page.evaluate(() => window.scrollTo(0, 0));
    },
  ],
];

// Drives an installed browser (Edge by default, SHOT_CHANNEL=chrome for Chrome), so no
// separate browser download is needed. Note: off Apple hardware the system heading font
// renders as Segoe UI, not SF Pro — final store images are best taken on iOS.
const browser = await chromium.launch({ channel: process.env.SHOT_CHANNEL ?? 'msedge' });
try {
  for (const device of DEVICES) {
    const dir = new URL(`${device.name}/`, OUT);
    mkdirSync(dir, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.scale,
      isMobile: device.mobile,
      hasTouch: true,
      locale: 'en-GB',
      timezoneId: 'Asia/Riyadh',
      colorScheme: 'dark',
      // The app honours reduced motion, so scrolls land instantly instead of being caught mid-animation.
      reducedMotion: 'reduce',
    });
    await context.addInitScript((entries) => {
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
    }, seed(NOW.getTime()));
    const page = await context.newPage();
    await page.clock.setFixedTime(NOW);

    for (const [name, prepare] of SHOTS) {
      // Fresh app per shot, so one screen's state never leaks into the next.
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await wait(page, 600);
      await prepare(page, device);
      await wait(page, 400);
      // JPEG: App Store Connect rejects images with an alpha channel, which PNG captures can carry.
      await page.screenshot({ path: fileURLToPath(new URL(`${name}.jpg`, dir)), type: 'jpeg', quality: 92 });
      console.log(`${device.name}/${name}.jpg`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
