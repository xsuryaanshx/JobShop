const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { chromium } = require('playwright');
const cron = require('node-cron');

const app = express();

// CORS configuration for GitHub Pages
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  process.env.FRONTEND_URL, // Set this in Railway
  /https:\/\/.*\.github\.io$/ // Allow all GitHub Pages
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// SQLite Database Setup
const db = new sqlite3.Database('./jobs.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary TEXT,
    description TEXT,
    url TEXT UNIQUE NOT NULL,
    source TEXT,
    posted_date TEXT,
    status TEXT DEFAULT 'new',
    match_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    tailored_cv TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cv_text TEXT,
    skills TEXT,
    preferences TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Job Scrapers
class JobScraper {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // LinkedIn Jobs Scraper
  async scrapeLinkedIn(keywords, location, limit = 10) {
    await this.init();
    const page = await this.browser.newPage();
    const jobs = [];

    try {
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      const jobCards = await page.$$('.base-card');
      
      for (let i = 0; i < Math.min(jobCards.length, limit); i++) {
        const card = jobCards[i];
        
        const title = await card.$eval('.base-search-card__title', el => el.textContent.trim()).catch(() => '');
        const company = await card.$eval('.base-search-card__subtitle', el => el.textContent.trim()).catch(() => '');
        const location = await card.$eval('.job-search-card__location', el => el.textContent.trim()).catch(() => '');
        const jobUrl = await card.$eval('a', el => el.href).catch(() => '');

        if (title && company && jobUrl) {
          jobs.push({
            title,
            company,
            location,
            url: jobUrl,
            source: 'LinkedIn',
            posted_date: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('LinkedIn scraping error:', error);
    } finally {
      await page.close();
    }

    return jobs;
  }

  // Indeed Scraper
  async scrapeIndeed(keywords, location, limit = 10) {
    await this.init();
    const page = await this.browser.newPage();
    const jobs = [];

    try {
      const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      const jobCards = await page.$$('.job_seen_beacon');
      
      for (let i = 0; i < Math.min(jobCards.length, limit); i++) {
        const card = jobCards[i];
        
        const title = await card.$eval('h2.jobTitle span', el => el.textContent.trim()).catch(() => '');
        const company = await card.$eval('[data-testid="company-name"]', el => el.textContent.trim()).catch(() => '');
        const location = await card.$eval('[data-testid="text-location"]', el => el.textContent.trim()).catch(() => '');
        const salary = await card.$eval('.salary-snippet', el => el.textContent.trim()).catch(() => null);
        const jobUrl = await card.$eval('h2.jobTitle a', el => 'https://www.indeed.com' + el.getAttribute('href')).catch(() => '');

        if (title && company && jobUrl) {
          jobs.push({
            title,
            company,
            location,
            salary,
            url: jobUrl,
            source: 'Indeed',
            posted_date: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Indeed scraping error:', error);
    } finally {
      await page.close();
    }

    return jobs;
  }

  // Generic Company Career Page Scraper
  async scrapeCompanyCareerPage(companyUrl, companyName) {
    await this.init();
    const page = await this.browser.newPage();
    const jobs = [];

    try {
      await page.goto(companyUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Common selectors for job listings
      const selectors = [
        '.job-listing',
        '.career-item',
        '[class*="job"]',
        '[class*="position"]',
        '[role="listitem"]'
      ];

      for (const selector of selectors) {
        try {
          const items = await page.$$(selector);
          if (items.length > 0) {
            for (const item of items.slice(0, 10)) {
              const text = await item.textContent();
              const link = await item.$eval('a', el => el.href).catch(() => '');
              
              if (text && link) {
                jobs.push({
                  title: text.substring(0, 100).trim(),
                  company: companyName,
                  url: link,
                  source: `${companyName} Career Page`,
                  posted_date: new Date().toISOString()
                });
              }
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
    } catch (error) {
      console.error(`Company page scraping error for ${companyName}:`, error);
    } finally {
      await page.close();
    }

    return jobs;
  }
}

const scraper = new JobScraper();

// OpenRouter API Integration
async function callOpenRouter(prompt, model = 'anthropic/claude-3.5-haiku') {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || 'YOUR_API_KEY_HERE'}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Job Application Bot'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return data.content?.[0]?.text || data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return null;
  }
}

// Match jobs to user profile
function calculateMatchScore(job, userSkills) {
  if (!userSkills || !job.description) return 50;
  
  const skills = userSkills.toLowerCase().split(',').map(s => s.trim());
  const jobText = (job.title + ' ' + job.description).toLowerCase();
  
  let matches = 0;
  skills.forEach(skill => {
    if (jobText.includes(skill)) matches++;
  });
  
  return Math.min(100, Math.round((matches / skills.length) * 100));
}

// API Routes

// Get user profile
app.get('/api/profile', (req, res) => {
  db.get('SELECT * FROM user_profile ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// Update user profile
app.post('/api/profile', (req, res) => {
  const { cv_text, skills, preferences } = req.body;
  
  db.run(
    'INSERT INTO user_profile (cv_text, skills, preferences) VALUES (?, ?, ?)',
    [cv_text, skills, preferences],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get stats
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as count FROM jobs WHERE status = "applied"', (err, row) => {
    stats.applied = row?.count || 0;
    
    db.get('SELECT COUNT(*) as count FROM jobs WHERE status = "rejected"', (err, row) => {
      stats.rejected = row?.count || 0;
      
      db.get('SELECT COUNT(*) as count FROM jobs WHERE status = "new"', (err, row) => {
        stats.remaining = row?.count || 0;
        res.json(stats);
      });
    });
  });
});

// Get applications
app.get('/api/applications', (req, res) => {
  db.all(
    'SELECT a.*, j.title, j.company FROM applications a JOIN jobs j ON a.job_id = j.id ORDER BY a.applied_at DESC LIMIT 20',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get jobs
app.get('/api/jobs', (req, res) => {
  const { status = 'new', limit = 50 } = req.query;
  
  db.all(
    'SELECT * FROM jobs WHERE status = ? ORDER BY match_score DESC, created_at DESC LIMIT ?',
    [status, limit],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get single job
app.get('/api/jobs/:id', (req, res) => {
  db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Update job status
app.patch('/api/jobs/:id', (req, res) => {
  const { status } = req.body;
  
  db.run(
    'UPDATE jobs SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    }
  );
});

// Scrape jobs manually
app.post('/api/scrape', async (req, res) => {
  const { keywords = 'software engineer', location = 'Remote', sources = ['linkedin', 'indeed'] } = req.body;
  
  try {
    let allJobs = [];
    
    if (sources.includes('linkedin')) {
      const linkedinJobs = await scraper.scrapeLinkedIn(keywords, location);
      allJobs = allJobs.concat(linkedinJobs);
    }
    
    if (sources.includes('indeed')) {
      const indeedJobs = await scraper.scrapeIndeed(keywords, location);
      allJobs = allJobs.concat(indeedJobs);
    }
    
    // Get user skills for matching
    const userProfile = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM user_profile ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Insert jobs into database
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO jobs (title, company, location, salary, description, url, source, posted_date, match_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    allJobs.forEach(job => {
      const matchScore = calculateMatchScore(job, userProfile?.skills);
      stmt.run(
        job.title,
        job.company,
        job.location || '',
        job.salary || '',
        job.description || '',
        job.url,
        job.source,
        job.posted_date,
        matchScore
      );
    });
    
    stmt.finalize();
    
    res.json({ 
      success: true, 
      count: allJobs.length,
      jobs: allJobs 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tailor CV for a specific job
app.post('/api/tailor-cv/:jobId', async (req, res) => {
  try {
    const job = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM jobs WHERE id = ?', [req.params.jobId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const userProfile = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM user_profile ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!job || !userProfile) {
      return res.status(404).json({ error: 'Job or profile not found' });
    }
    
    const prompt = `Tailor this CV for the following job posting. Return ONLY the tailored CV text, no explanations.

MY CV:
${userProfile.cv_text}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description || 'Not provided'}

Create a tailored version that highlights relevant skills and experience for this specific role.`;

    const tailoredCV = await callOpenRouter(prompt);
    
    const coverLetterPrompt = `Write a professional cover letter for this job application:

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description || 'Not provided'}

MY BACKGROUND:
${userProfile.cv_text}

Write a compelling 3-paragraph cover letter.`;

    const coverLetter = await callOpenRouter(coverLetterPrompt);
    
    res.json({ 
      tailored_cv: tailoredCV,
      cover_letter: coverLetter
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply to job
app.post('/api/apply/:jobId', async (req, res) => {
  const { tailored_cv, cover_letter } = req.body;
  
  try {
    // Store application
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO applications (job_id, tailored_cv, cover_letter, status) VALUES (?, ?, ?, ?)',
        [req.params.jobId, tailored_cv, cover_letter, 'submitted'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // Update job status
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE jobs SET status = ? WHERE id = ?',
        ['applied', req.params.jobId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-apply mode
app.post('/api/auto-apply', async (req, res) => {
  const { minMatchScore = 70, limit = 5 } = req.body;
  
  try {
    const jobs = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM jobs WHERE status = ? AND match_score >= ? ORDER BY match_score DESC LIMIT ?',
        ['new', minMatchScore, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    const results = [];
    
    for (const job of jobs) {
      try {
        const response = await fetch(`http://localhost:5000/api/tailor-cv/${job.id}`, {
          method: 'POST'
        });
        const { tailored_cv, cover_letter } = await response.json();
        
        await fetch(`http://localhost:5000/api/apply/${job.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tailored_cv, cover_letter })
        });
        
        results.push({ job_id: job.id, status: 'success' });
      } catch (error) {
        results.push({ job_id: job.id, status: 'failed', error: error.message });
      }
    }
    
    res.json({ applied: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cron job to scrape jobs every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled job scrape...');
  
  try {
    const userProfile = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM user_profile ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!userProfile) {
      console.log('No user profile found. Skipping scrape.');
      return;
    }
    
    const preferences = JSON.parse(userProfile.preferences || '{}');
    const keywords = preferences.keywords || 'software engineer';
    const location = preferences.location || 'Remote';
    
    const linkedinJobs = await scraper.scrapeLinkedIn(keywords, location);
    const indeedJobs = await scraper.scrapeIndeed(keywords, location);
    
    const allJobs = [...linkedinJobs, ...indeedJobs];
    
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO jobs (title, company, location, salary, description, url, source, posted_date, match_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    allJobs.forEach(job => {
      const matchScore = calculateMatchScore(job, userProfile.skills);
      stmt.run(
        job.title,
        job.company,
        job.location || '',
        job.salary || '',
        job.description || '',
        job.url,
        job.source,
        job.posted_date,
        matchScore
      );
    });
    
    stmt.finalize();
    
    console.log(`Scraped ${allJobs.length} jobs successfully`);
  } catch (error) {
    console.error('Scheduled scrape error:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await scraper.close();
  db.close();
  process.exit(0);
});
