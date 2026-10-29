/**
 * Renders the iOS app icon and launch image from brand/icon.svg.
 *
 *   npm run icons    (here)
 *
 * Writes to out/ :
 *   AppIcon-1024.png  — 1024 × 1024, opaque
 *   Splash-2732.png   — 2732 × 2732 navy launch image with the icon centred
 * Then flatten them to RGB (App Store Connect rejects an icon with an alpha
 * channel) and copy into ios/App/App/Assets.xcassets — see docs/PUBLISHING.md.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const svg = readFileSync(here('./brand/icon.svg'), 'utf8');
mkdirSync(here('./out'), { recursive: true });

const NAVY = '#0A1628';
/** Launch image: icon about 15% of the square, so it stays centred and clear after aspect-fill cropping. */
const SPLASH_ICON = 420;

const pages = [
  {
    file: 'AppIcon-1024.png',
    size: 1024,
    html: `<body style="margin:0">${svg.replace('<svg ', '<svg style="display:block" ')}</body>`,
  },
  {
    file: 'Splash-2732.png',
    size: 2732,
    html: `<body style="margin:0;background:${NAVY};display:grid;place-items:center;height:2732px">
      <div style="width:${SPLASH_ICON}px;height:${SPLASH_ICON}px;border-radius:${Math.round(SPLASH_ICON * 0.225)}px;overflow:hidden">
        ${svg.replace('width="1024" height="1024"', `width="${SPLASH_ICON}" height="${SPLASH_ICON}" style="display:block"`)}
      </div></body>`,
  },
];

const browser = await chromium.launch({ channel: process.env.SHOT_CHANNEL ?? 'msedge' });
try {
  for (const p of pages) {
    const page = await browser.newPage({ viewport: { width: p.size, height: p.size }, deviceScaleFactor: 1 });
    await page.setContent(p.html);
    await page.screenshot({ path: here(`./out/${p.file}`), omitBackground: false });
    await page.close();
    console.log(`out/${p.file}`);
  }
} finally {
  await browser.close();
}
