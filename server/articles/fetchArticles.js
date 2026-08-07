import { initDB, insertArticles, deleteOldArticles } from './db.js';
import { getWeeklyTopic } from './topics.js';
import { fetchWeeklyArticles } from './pmcFetcher.js';

async function main() {
  try {
    console.log('🚀 Starting weekly article fetch...');

    // Initialize database
    await initDB();

    // Get this week's topic
    const { topic, week } = getWeeklyTopic();
    console.log(`📅 Week ${week}: "${topic}"`);

    // Fetch from PMC
    const articles = await fetchWeeklyArticles(topic);

    if (articles.length === 0) {
      console.log('⚠️  No articles fetched this week');
      return;
    }

    // Insert into database
    await insertArticles(articles);
    console.log(`✅ Inserted ${articles.length} articles into database`);

    // Clean up articles older than 90 days
    const deleted = await deleteOldArticles(90);
    console.log(`🗑️  Cleaned up ${deleted} old articles`);

    console.log('✨ Weekly fetch complete!');
  } catch (e) {
    console.error('❌ Error during fetch:', e.message);
    process.exit(1);
  }
}

main();
