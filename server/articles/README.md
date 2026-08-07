# UroApp Weekly Articles Server

Automated weekly urology article aggregation from PubMed Central.

## Local Development

```bash
npm install
npm run dev
```

The server runs on `http://localhost:3001`.

### Manual Test

Trigger a fetch manually:

```bash
curl -X POST http://localhost:3001/api/fetch
```

Get articles:

```bash
curl http://localhost:3001/api/articles?subspecialty=oncology
```

Health check:

```bash
curl http://localhost:3001/api/health
```

## Deployment to Render.com

1. Push this directory to GitHub as part of your UroApp repo
2. Create a new **Web Service** on Render.com
3. **Build command**: `npm install`
4. **Start command**: `node index.js`
5. Add a **Cron Job**:
   - Command: `curl https://your-render-app.onrender.com/api/fetch`
   - Schedule: `0 2 * * 0` (Sundays at 2 AM UTC)
6. Set **environment variable**: `PORT=3001`

## How It Works

1. **52-week topics** — Defined in `topics.js`, cycles through urology subspecialties
2. **Weekly cron job** — Every Sunday, fetches articles from PubMed for this week's topic
3. **Database** — SQLite stores articles with subspecialty tags
4. **REST API** — App queries `/api/articles?subspecialty=oncology` to get fresh content
5. **Cache management** — Deletes articles older than 90 days

## Topics Covered

- Oncology (prostate, bladder, kidney, testicular, UTUC)
- Endourology (stones, ureteroscopy, PCNL, cystoscopy)
- Pediatric (hydronephrosis, VUR, cryptorchidism)
- Reconstructive (stricture disease, urinary reconstruction)

## Subspecialties

- `oncology`
- `endourology`
- `pediatric`
- `reconstructive`
