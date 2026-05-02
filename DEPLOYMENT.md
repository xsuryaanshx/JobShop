# 🚀 Deployment Guide - GitHub Pages + Railway

## 📋 Overview

**Architecture:**
- **Frontend:** GitHub Pages (Static hosting - FREE ✅)
- **Backend:** Railway (Node.js hosting - FREE $5/month credit ✅)
- **Database:** SQLite (Included with backend)
- **AI:** OpenRouter API (FREE tier ✅)

**Total Cost:** $0 per month (on free tiers)

---

## 🎯 Step-by-Step Deployment

### Part 1: Deploy Backend to Railway (5 minutes)

#### 1. Create Railway Account
1. Go to https://railway.app/
2. Click **"Start a New Project"**
3. Sign in with GitHub

#### 2. Deploy Backend
1. Click **"Deploy from GitHub repo"**
2. Select your repository
3. Railway auto-detects Node.js
4. Click **"Add variables"** and add:
   ```
   OPENROUTER_API_KEY=your-openrouter-key-here
   PORT=5000
   ```
5. Click **"Deploy"**

#### 3. Get Backend URL
1. Wait for deployment (~2 minutes)
2. Click **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Copy URL (e.g., `https://job-backend-production.up.railway.app`)

**Your backend is live!** ✅

---

### Part 2: Deploy Frontend to GitHub Pages (3 minutes)

#### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 2. Configure GitHub Pages
1. Go to your repo on GitHub
2. Click **"Settings"** → **"Pages"**
3. Source: **"GitHub Actions"**

#### 3. Add Backend URL Secret
1. Go to **"Settings"** → **"Secrets and variables"** → **"Actions"**
2. Click **"New repository secret"**
3. Name: `VITE_API_URL`
4. Value: Your Railway backend URL + `/api`
   ```
   https://job-backend-production.up.railway.app/api
   ```
5. Click **"Add secret"**

#### 4. Trigger Deployment
```bash
git add .
git commit -m "Configure for deployment"
git push
```

**Wait 2-3 minutes** for GitHub Actions to build and deploy.

#### 5. Access Your Site
Your site will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

**Frontend is live!** ✅

---

## 🔧 Alternative: Deploy Everything to Railway

**Easier option** - Deploy both frontend and backend together:

### 1. Single Deployment
```bash
# Railway will auto-detect and deploy both
railway login
railway init
railway up
```

### 2. Configure Start Command
In Railway dashboard:
- **Build Command:** `npm install && cd frontend && npm install && npm run build`
- **Start Command:** `node backend/server.js`

### 3. Serve Frontend from Backend
Add to `backend/server.js` (before `app.listen`):

```javascript
// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});
```

**Done!** Everything runs on one Railway URL.

---

## 🌍 Alternative Free Hosting Options

### Backend Options:
1. **Railway** (Recommended) - $5/month free credit
2. **Render** - 750 hours/month free
3. **Fly.io** - 3 shared VMs free
4. **Vercel** - Serverless functions (requires adaptation)

### Frontend Options:
1. **GitHub Pages** (Recommended) - Unlimited
2. **Netlify** - 100GB bandwidth/month
3. **Vercel** - Unlimited
4. **Cloudflare Pages** - Unlimited

---

## 📝 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Setup Backend
```bash
cd backend
npm install
npx playwright install chromium

# Create .env file
echo "OPENROUTER_API_KEY=your-key-here" > .env
echo "PORT=5000" >> .env

npm start
```

### 3. Setup Frontend (New Terminal)
```bash
cd frontend
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

npm run dev
```

### 4. Open Browser
```
http://localhost:3000
```

---

## 🔄 Update Deployed Site

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push
# GitHub Actions auto-deploys
```

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push
# Railway auto-deploys
```

---

## 🐛 Troubleshooting

### Frontend shows "Failed to fetch"
**Problem:** Backend URL not configured

**Fix:**
1. Check GitHub secret `VITE_API_URL` is correct
2. Verify Railway backend is running
3. Check Railway logs for errors

### Railway build fails
**Problem:** Playwright installation

**Fix:**
Add to `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npx playwright install-deps chromium"
  }
}
```

### GitHub Pages shows 404
**Problem:** Base URL mismatch

**Fix:**
Edit `frontend/vite.config.ts`:
```typescript
base: '/your-repo-name/'  // If using project site
// OR
base: '/'  // If using username.github.io
```

### CORS errors
**Problem:** Backend not allowing frontend origin

**Fix:**
Edit `backend/server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://YOUR_USERNAME.github.io', 'http://localhost:3000']
}));
```

---

## 🔒 Security Checklist

- [x] Never commit `.env` files
- [x] Use GitHub Secrets for API keys
- [x] Enable HTTPS (automatic on GitHub Pages & Railway)
- [x] Add CORS restrictions in backend
- [x] Rate limit API endpoints
- [x] Review Railway logs regularly

---

## 📊 Monitoring

### Railway Dashboard
- **Logs:** Real-time backend logs
- **Metrics:** CPU, Memory, Network usage
- **Deployments:** Version history

### GitHub Actions
- **Workflows:** Build/deploy status
- **Artifacts:** Build outputs
- **Logs:** Detailed build logs

---

## 💰 Cost Breakdown

### Free Tier Limits

**Railway:**
- $5/month credit (renews monthly)
- ~500 hours/month runtime
- 512 MB RAM
- 1 GB disk

**GitHub Pages:**
- 100 GB bandwidth/month
- Unlimited repositories
- Unlimited deployments

**OpenRouter (Free Models):**
- Claude 3.5 Haiku: Limited requests/day
- Check: https://openrouter.ai/docs/limits

**Total:** $0/month if staying within limits

---

## 🚀 Production Optimization

### 1. Enable Caching
Add to `backend/server.js`:
```javascript
const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
```

### 2. Add Rate Limiting
```bash
cd backend
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Database Backups
Add to cron job:
```javascript
cron.schedule('0 0 * * *', () => {
  // Backup jobs.db daily
  fs.copyFileSync('./jobs.db', `./backups/jobs-${Date.now()}.db`);
});
```

---

## 📚 Helpful Commands

```bash
# View Railway logs
railway logs

# Redeploy Railway
railway up

# Test production build locally
cd frontend
npm run build
npm run preview

# Check bundle size
cd frontend
npm run build
ls -lh dist/

# Update dependencies
npm update
```

---

## 🎉 You're Done!

Your job automation system is now live on the internet!

**Frontend:** `https://YOUR_USERNAME.github.io/YOUR_REPO/`  
**Backend:** `https://your-backend.railway.app`

### What Works Now:
✅ Tinder swipe interface accessible from anywhere  
✅ Auto-scraping runs 24/7 on Railway  
✅ AI CV tailoring with OpenRouter  
✅ Real-time job matching  
✅ Mobile-responsive design  

### Next Steps:
1. Share the URL with friends (if you want)
2. Monitor Railway usage
3. Set up email notifications (optional)
4. Add more job sources (optional)

**Happy job hunting from anywhere! 🎯**
