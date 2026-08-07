# Deploying UroApp Articles Server to Render.com

This guide walks through deploying the automated weekly articles server to Render.com, a free hosting platform.

## Prerequisites

- GitHub account with UroApp repo
- Render.com account (free tier available at https://render.com)

## Step 1: Push to GitHub

Make sure your UroApp repository is on GitHub and includes the `server/articles/` directory.

```bash
git add server/articles/
git commit -m "Add weekly articles server with PMC integration"
git push origin main
```

## Step 2: Create a Web Service on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository (UroApp)
4. Fill in the form:
   - **Name**: `uroapp-articles` (or similar)
   - **Root Directory**: `server/articles`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment**: `production`
   - **Plan**: Free tier is fine
5. Click **Create Web Service**

Render will deploy your server. You'll get a public URL like:
```
https://uroapp-articles.onrender.com
```

## Step 3: Add the Cron Job

Once the web service is deployed, add a scheduled cron job:

1. In the Render dashboard, click **New +** → **Cron Job**
2. Fill in:
   - **Name**: `uroapp-weekly-fetch`
   - **Runtime**: `Node`
   - **Schedule**: `0 2 * * 0` (Every Sunday at 2:00 AM UTC)
   - **Command**: 
     ```bash
     curl https://uroapp-articles.onrender.com/api/fetch
     ```
   - **Notifications**: Leave as is (or set up email alerts)

3. Click **Create Cron Job**

The cron job will now run every Sunday at 2 AM UTC, fetching the week's articles.

## Step 4: Update the UroApp Frontend

In your UroApp `.env.local` (or `.env`), set:

```bash
VITE_ARTICLES_API=https://uroapp-articles.onrender.com
```

Or update your deployment environment variables if deploying the frontend elsewhere.

## Step 5: Test

### Check server health:
```bash
curl https://uroapp-articles.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "server": "UroApp Articles",
  "week": 32,
  "topic": "..."
}
```

### Manually trigger a fetch:
```bash
curl -X POST https://uroapp-articles.onrender.com/api/fetch
```

### Query articles:
```bash
curl "https://uroapp-articles.onrender.com/api/articles?subspecialty=oncology"
```

## Monitoring & Troubleshooting

### View Logs

In the Render dashboard:
1. Select your web service
2. Click **Logs** to see real-time server output
3. Check for errors during the cron job run (every Sunday 2 AM UTC)

### Common Issues

**"Database file not found"**
- SQLite creates the database automatically on first run. Wait a few seconds after deployment and try again.

**"No articles fetched"**
- Check the NCBI rate limits (3 requests per second). The PMC API sometimes has timeouts.
- Render's free tier may have slow network. Premium tier has better performance.

**Cron job not running**
- Verify the job is **enabled** in the Render dashboard
- Check the schedule syntax: `0 2 * * 0` (minute hour day-of-month month day-of-week)

## Database Persistence

By default, Render's free tier doesn't persist data between restarts. To keep articles:

### Option A: Use Render's PostgreSQL (free tier available)
1. Create a PostgreSQL instance on Render (free tier)
2. Update `db.js` to use the PostgreSQL connection string
3. Point to it via environment variable

### Option B: Use a cloud SQLite service
Services like Turso (turso.tech) offer free SQLite hosting with REST API.

For now, the articles will repopulate weekly via the cron job, so data loss is acceptable.

## Pricing

- **Web Service (Free Tier)**: $0/month (sleeps after 15 min inactivity)
- **Cron Job (Free Tier)**: $0/month
- **PostgreSQL (Free Tier)**: $0/month (1 instance, 256 MB storage)

If you hit rate limits or need always-on hosting, upgrade to paid tier (~$7–15/month).

## Advanced: Custom Domain

If you want a branded URL (articles.uroapp.clinic):
1. Register a domain
2. In Render dashboard, go to **Settings** → **Custom Domains**
3. Point your domain's DNS to Render's nameservers
4. Render auto-provisions SSL/HTTPS

## Updating the Server Code

After making changes to `server/articles/`:

```bash
git add server/articles/
git commit -m "Update articles server"
git push origin main
```

Render auto-deploys on git push. The cron job will use the updated code next run.

---

**Questions?** Check [Render docs](https://render.com/docs) or the server [README.md](./README.md).
