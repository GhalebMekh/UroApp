import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { initDB, getArticles } from './db.js';
import { getWeeklyTopic } from './topics.js';
import { fetchWeeklyArticles } from './pmcFetcher.js';
import { insertArticles } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
await initDB();

// ============ ENDPOINTS ============

// GET /api/articles
// Query parameters: subspecialty (optional), week (optional)
app.get('/api/articles', async (req, res) => {
  try {
    const { subspecialty } = req.query;
    const articles = await getArticles(subspecialty);

    res.json({
      success: true,
      count: articles.length,
      week: getWeeklyTopic().week,
      subspecialties: ['oncology', 'endourology', 'pediatric', 'reconstructive'],
      articles
    });
  } catch (e) {
    console.error('GET /api/articles error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  const { topic, week } = getWeeklyTopic();
  res.json({
    status: 'ok',
    server: 'UroApp Articles',
    week,
    topic,
    time: new Date().toISOString()
  });
});

// POST /api/fetch (manual trigger for testing)
app.post('/api/fetch', async (req, res) => {
  try {
    console.log('Manual fetch triggered');
    const { topic } = getWeeklyTopic();
    const articles = await fetchWeeklyArticles(topic);
    await insertArticles(articles);

    res.json({
      success: true,
      message: `Fetched ${articles.length} articles`,
      articles: articles.slice(0, 5)
    });
  } catch (e) {
    console.error('POST /api/fetch error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ============ CRON JOBS ============

// Run every Sunday at 2 AM UTC
cron.schedule('0 2 * * 0', async () => {
  console.log('\n⏰ Running scheduled weekly article fetch');
  try {
    const { topic, week } = getWeeklyTopic();
    console.log(`Week ${week}: "${topic}"`);

    const articles = await fetchWeeklyArticles(topic);
    if (articles.length > 0) {
      await insertArticles(articles);
      console.log(`✅ Inserted ${articles.length} articles`);
    }
  } catch (e) {
    console.error('❌ Scheduled fetch failed:', e.message);
  }
});

// Also run immediately at startup (optional, for testing)
const { topic, week } = getWeeklyTopic();
console.log(`\n🚀 Server starting - Week ${week}: "${topic}"`);
console.log(`📚 First fetch will run at: ${new Date(new Date().getTime() + 3600000).toISOString()}`);

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`\n✨ UroApp Articles API running on http://localhost:${PORT}`);
  console.log(`   GET  /api/articles`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/fetch (manual trigger)\n`);
});
