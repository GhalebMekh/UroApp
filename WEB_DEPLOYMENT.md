# UroApp Web Platform — Deployment Guide

## Overview

UroApp now includes:
- **Backend** (`server/main/`) — Multi-user authentication + patient database
- **Web App** (`web/`) — React frontend for on-duty residency use
- **Mobile App** (existing) — Offline-first iOS/Android wrap (unchanged)

All residents share the web platform; each logs in with their own account and manages their own patients.

---

## Local Testing

### 1. Install dependencies

```bash
# Backend
cd server/main
npm install

# Web app
cd ../../web
npm install
```

### 2. Start backend (port 3002)

```bash
cd server/main
npm run dev
```

Output: `✨ UroApp Backend on http://localhost:3002`

### 3. Start web app (port 3000)

```bash
cd web
npm run dev
```

Output: `➜ Local: http://localhost:3000`

### 4. Test login

- **Sign up**: Create account with email/password
- **Log in**: Use same credentials
- **Add patient**: Click "New Patient" in sidebar
- **SOAP notes**: Add progress notes to patient record

---

## Production Deployment (Render.com)

### Backend Deployment

1. **Commit to GitHub**
   ```bash
   git add server/main/ web/ WEB_DEPLOYMENT.md
   git commit -m "Add multi-user web platform with patient management"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to https://dashboard.render.com
   - Click **New +** → **Web Service**
   - Connect your GitHub repo (UroApp)
   - Fill in:
     - **Name**: `uroapp-backend`
     - **Root Directory**: `server/main`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node index.js`
     - **Environment**: `production`
     - **Plan**: Free tier OK (upgrades to $7/mo for always-on)
   - Click **Create Web Service**

3. **Get the backend URL**
   - Render assigns: `https://uroapp-backend.onrender.com`
   - Copy this URL for the web app config

### Web App Deployment

1. **Create Static Site on Render**
   - Click **New +** → **Static Site**
   - Connect same GitHub repo
   - Fill in:
     - **Name**: `uroapp-web`
     - **Root Directory**: `web`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Environment Variables**:
       - `VITE_API_BASE` = `https://uroapp-backend.onrender.com` (your backend URL)
   - Click **Create Static Site**

2. **Configure API proxy** (in `web/vite.config.js`)
   ```js
   // Already configured — dev uses localhost:3002, production uses env var
   ```

3. **Get the web URL**
   - Render assigns: `https://uroapp-web.onrender.com`

---

## Database & Persistence

**SQLite database** (`server/main/uroapp.db`) on Render's free tier:
- Persists between restarts
- Stores users, patients, SOAP notes
- Auto-cleaned old data (optional cron job)

**For scale** (100+ concurrent residents):
- Upgrade to PostgreSQL on Render (free tier available, $15/mo paid)
- Update `db.js` to use PostgreSQL client

---

## Security Notes

⚠️ **JWT_SECRET** — set a strong secret in production:
```bash
# On Render dashboard → Environment
JWT_SECRET=your-super-secret-key-min-32-chars
```

✓ **Password hashing** — bcryptjs (10 rounds)
✓ **CORS** — enabled for web app origin
✓ **Patient data** — scoped to logged-in resident only

⚠️ **HIPAA compliance** — this is NOT HIPAA-certified. For real patient data:
- Add data encryption at rest
- Add audit logging
- Add access controls
- Work with compliance/legal team

---

## URLs After Deployment

- **Backend API**: https://uroapp-backend.onrender.com/api/*
- **Web App**: https://uroapp-web.onrender.com
- **Mobile App** (unchanged): Downloads via TestFlight or App Store

---

## Troubleshooting

**"Backend not responding"**
- Check backend URL in web app config
- Ensure `VITE_API_BASE` env var is set on Render
- Render free tier sleeps after 15 min — upgrade to paid for always-on

**"Patients not saving"**
- Check backend logs: Render dashboard → Backend service → Logs
- Ensure database file is writable

**"Sign-in loop"**
- Clear browser cookies/localStorage
- Check JWT_SECRET is consistent across restarts

---

## Residents' Quick Start

1. Go to https://uroapp-web.onrender.com
2. **Sign up** with hospital email
3. **Log in**
4. Create **New Patient** (sidebar)
5. Add patient details → Save
6. Add **SOAP notes** each round
7. Notes auto-save and persist between sessions

---

## Next Steps

- Add role-based access (attendings vs. residents)
- Add patient search / filtering
- Add surgical schedule / procedure tracking
- Add integration with hospital EMR (requires API)
- Add offline sync (for mobile + web)

---

Questions? Check backend logs and web console (F12).
