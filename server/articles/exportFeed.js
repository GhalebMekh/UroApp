/**
 * Writes this week's PubMed reading list to a static JSON feed.
 *
 * Replaces the always-on Express server for the app's purposes: a free Render
 * service sleeps after 15 minutes, so a reviewer (or a resident on the ward)
 * would wait ~50 s or see an error. Instead:
 *   - the feed is committed to public/feeds/articles.json and bundled into the
 *     app, so Weekly reads always works, including offline;
 *   - .github/workflows/weekly-articles.yml re-runs this every week and commits
 *     the result, and the app fetches that newer copy when it is online.
 *
 * Usage: node exportFeed.js   (from server/articles)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getWeeklyTopic } from './topics.js';
import { fetchWeeklyArticles } from './pmcFetcher.js';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../../public/feeds/articles.json');

const { topic, week } = getWeeklyTopic();
console.log(`Week ${week}: "${topic}"`);

const articles = await fetchWeeklyArticles(topic);

// Never overwrite a good feed with an empty one (e.g. NCBI outage).
if (articles.length === 0) {
  console.error('No articles fetched — keeping the existing feed.');
  process.exit(1);
}

const feed = {
  generatedAt: new Date().toISOString(),
  week,
  topic,
  subspecialties: ['topic', 'oncology', 'endourology', 'pediatric', 'reconstructive'],
  articles,
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(feed, null, 2)}\n`);
console.log(`Wrote ${articles.length} articles to ${OUT}`);
