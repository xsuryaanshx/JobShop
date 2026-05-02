# 🚀 Quick Deploy to GitHub Pages + Railway

## ⚡ Fastest Deployment (10 minutes total)

### Step 1: Get OpenRouter API Key (2 min)
1. Go to https://openrouter.ai/keys
2. Sign up (free)
3. Create key → Copy it

### Step 2: Deploy Backend to Railway (3 min)
1. Go to https://railway.app
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Add environment variables:
   - `OPENROUTER_API_KEY` = your key from step 1
   - `PORT` = 5000
5. Click "Deploy"
6. Go to Settings → Networking → "Generate Domain"
7. **Copy your Railway URL** (e.g., `https://xxx.railway.app`)

### Step 3: Deploy Frontend to GitHub Pages (5 min)
1. Go to your GitHub repo → Settings → Pages
2. Source: Select "GitHub Actions"
3. Go to Settings → Secrets and variables → Actions
4. Click "New repository secret"
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-url.railway.app/api` (use your Railway URL + /api)
5. Push any commit to trigger deployment:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push
   ```

### Step 4: Access Your App
Wait 2-3 minutes, then open:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## ✅ Done!

Your job automation system is live on the internet!

### What You Can Do Now:
- ✅ Swipe jobs from anywhere
- ✅ Auto-scraping runs 24/7
- ✅ AI tailors your CV
- ✅ Share the URL (optional)

---

## 📱 For Local Development

```bash
# Backend
cd backend
npm install
echo "OPENROUTER_API_KEY=your-key" > .env
npm start

# Frontend (new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev

# Open: http://localhost:3000
```

---

## 🔄 To Update Your Live Site

```bash
git add .
git commit -m "Your changes"
git push
```

- **Frontend**: Auto-deploys via GitHub Actions (2-3 min)
- **Backend**: Auto-deploys via Railway (1-2 min)

---

## 📚 Full Documentation

- **Complete Guide:** See `DEPLOYMENT.md`
- **Features & Usage:** See `README.md`
- **Quick Start:** See `QUICKSTART.md`

---

**Need help?** Check the troubleshooting section in `DEPLOYMENT.md`

**Happy job hunting! 🎯**
