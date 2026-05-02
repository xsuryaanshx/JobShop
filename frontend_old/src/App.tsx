import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react'
import './App.css'

interface Job {
  id: number
  title: string
  company: string
  location: string
  salary: string
  description: string
  url: string
  source: string
  match_score: number
  status: string
}

interface UserProfile {
  cv_text: string
  skills: string
  preferences: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [autoMode, setAutoMode] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ applied: 0, rejected: 0, total: 0 })

  useEffect(() => {
    fetchJobs()
    fetchProfile()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs?status=new&limit=50`)
      const data = await response.json()
      setJobs(data)
      setStats(prev => ({ ...prev, total: data.length }))
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`)
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right', job: Job) => {
    if (direction === 'right') {
      // Apply to job
      setLoading(true)
      try {
        // Tailor CV
        const tailorResponse = await fetch(`${API_URL}/tailor-cv/${job.id}`, {
          method: 'POST'
        })
        const { tailored_cv, cover_letter } = await tailorResponse.json()

        // Apply
        await fetch(`${API_URL}/apply/${job.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tailored_cv, cover_letter })
        })

        setStats(prev => ({ ...prev, applied: prev.applied + 1 }))
      } catch (error) {
        console.error('Error applying:', error)
      } finally {
        setLoading(false)
      }
    } else {
      // Reject job
      await fetch(`${API_URL}/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      })
      setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }))
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handleAutoMode = async () => {
    setAutoMode(true)
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auto-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minMatchScore: 70, limit: 10 })
      })
      const data = await response.json()
      
      setStats(prev => ({ ...prev, applied: prev.applied + data.applied }))
      await fetchJobs()
    } catch (error) {
      console.error('Auto-apply error:', error)
    } finally {
      setLoading(false)
      setAutoMode(false)
    }
  }

  const handleScrapeJobs = async () => {
    setLoading(true)
    try {
      const prefs = profile?.preferences ? JSON.parse(profile.preferences) : {}
      const response = await fetch(`${API_URL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: prefs.keywords || 'software engineer',
          location: prefs.location || 'Remote',
          sources: ['linkedin', 'indeed']
        })
      })
      const data = await response.json()
      await fetchJobs()
      alert(`Scraped ${data.count} new jobs!`)
    } catch (error) {
      console.error('Scrape error:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentJob = jobs[currentIndex]

  return (
    <div className="app">
      {/* Header */}
      <motion.header
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="header-content">
          <motion.h1
            className="logo"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            🎯 JobSwipe
          </motion.h1>
          
          <div className="stats">
            <StatBadge label="Applied" value={stats.applied} color="#10b981" />
            <StatBadge label="Rejected" value={stats.rejected} color="#ef4444" />
            <StatBadge label="Remaining" value={jobs.length - currentIndex} color="#3b82f6" />
          </div>

          <motion.button
            className="profile-btn"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowProfile(!showProfile)}
          >
            ⚙️
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="main-content">
        {/* Card Stack */}
        <div className="card-container">
          <AnimatePresence mode="popLayout">
            {currentJob && currentIndex < jobs.length ? (
              <JobCard
                key={currentJob.id}
                job={currentJob}
                onSwipe={handleSwipe}
                loading={loading}
              />
            ) : (
              <motion.div
                key="empty"
                className="empty-state"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  className="empty-icon"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  🎉
                </motion.div>
                <h2>All Done!</h2>
                <p>No more jobs to review</p>
                <motion.button
                  className="primary-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleScrapeJobs}
                  disabled={loading}
                >
                  {loading ? '⏳ Scraping...' : '🔍 Find More Jobs'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {currentJob && (
          <motion.div
            className="action-buttons"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ActionButton
              icon="✖️"
              label="Reject"
              color="#ef4444"
              onClick={() => handleSwipe('left', currentJob)}
              disabled={loading}
            />
            
            <ActionButton
              icon="🤖"
              label="Auto Mode"
              color="#f59e0b"
              onClick={handleAutoMode}
              disabled={loading || autoMode}
              large
            />
            
            <ActionButton
              icon="✅"
              label="Apply"
              color="#10b981"
              onClick={() => handleSwipe('right', currentJob)}
              disabled={loading}
            />
          </motion.div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <ProfileModal
            profile={profile}
            onClose={() => setShowProfile(false)}
            onUpdate={fetchProfile}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⚡
            </motion.div>
            <p>Processing application...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Job Card Component with Swipe Gestures
function JobCard({ 
  job, 
  onSwipe, 
  loading 
}: { 
  job: Job
  onSwipe: (direction: 'left' | 'right', job: Job) => void
  loading: boolean
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  
  const rejectOpacity = useTransform(x, [-200, -50, 0], [1, 0.5, 0])
  const applyOpacity = useTransform(x, [0, 50, 200], [0, 0.5, 1])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      onSwipe(direction, job)
    }
  }

  return (
    <motion.div
      className="job-card"
      style={{ x, y, rotate, opacity }}
      drag={!loading}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ 
        scale: 0,
        opacity: 0,
        transition: { duration: 0.2 }
      }}
      transition={{ type: 'spring', damping: 20 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Swipe Overlays */}
      <motion.div className="swipe-overlay reject" style={{ opacity: rejectOpacity }}>
        <span>SKIP</span>
      </motion.div>
      <motion.div className="swipe-overlay apply" style={{ opacity: applyOpacity }}>
        <span>APPLY</span>
      </motion.div>

      {/* Match Score Badge */}
      <motion.div
        className="match-badge"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <motion.div
          className="match-circle"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `conic-gradient(#10b981 ${job.match_score}%, #1f2937 ${job.match_score}%)`
          }}
        >
          <div className="match-inner">
            <span className="match-score">{job.match_score}%</span>
            <span className="match-label">Match</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Card Content */}
      <div className="card-content">
        <motion.h2
          className="job-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {job.title}
        </motion.h2>

        <motion.div
          className="company-info"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <span className="company">🏢 {job.company}</span>
          <span className="location">📍 {job.location || 'Remote'}</span>
        </motion.div>

        {job.salary && (
          <motion.div
            className="salary"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            💰 {job.salary}
          </motion.div>
        )}

        <motion.div
          className="tags"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <span className="tag">{job.source}</span>
        </motion.div>

        <motion.a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="view-link"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Original Posting →
        </motion.a>
      </div>
    </motion.div>
  )
}

// Action Button Component
function ActionButton({
  icon,
  label,
  color,
  onClick,
  disabled = false,
  large = false
}: {
  icon: string
  label: string
  color: string
  onClick: () => void
  disabled?: boolean
  large?: boolean
}) {
  return (
    <motion.button
      className={`action-btn ${large ? 'large' : ''}`}
      style={{ '--btn-color': color } as React.CSSProperties}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      onClick={onClick}
      disabled={disabled}
    >
      <motion.span
        className="btn-icon"
        animate={{ 
          rotate: large ? [0, 10, -10, 0] : 0
        }}
        transition={{ 
          duration: 0.5,
          repeat: large ? Infinity : 0
        }}
      >
        {icon}
      </motion.span>
      <span className="btn-label">{label}</span>
    </motion.button>
  )
}

// Stat Badge Component
function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div
      className="stat-badge"
      style={{ '--stat-color': color } as React.CSSProperties}
      whileHover={{ scale: 1.05 }}
    >
      <motion.span
        className="stat-value"
        key={value}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {value}
      </motion.span>
      <span className="stat-label">{label}</span>
    </motion.div>
  )
}

// Profile Modal
function ProfileModal({ 
  profile, 
  onClose, 
  onUpdate 
}: { 
  profile: UserProfile | null
  onClose: () => void
  onUpdate: () => void
}) {
  const [cvText, setCvText] = useState(profile?.cv_text || '')
  const [skills, setSkills] = useState(profile?.skills || '')
  const [preferences, setPreferences] = useState(profile?.preferences || '{}')

  const handleSave = async () => {
    try {
      await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text: cvText, skills, preferences })
      })
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ scale: 0.8, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Your Profile</h2>
        
        <div className="form-group">
          <label>CV Text</label>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV content here..."
            rows={6}
          />
        </div>

        <div className="form-group">
          <label>Skills (comma-separated)</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, Node.js, Python, ML..."
          />
        </div>

        <div className="form-group">
          <label>Preferences (JSON)</label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder='{"keywords": "software engineer", "location": "Remote"}'
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <motion.button
            className="secondary-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
          >
            Cancel
          </motion.button>
          <motion.button
            className="primary-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
          >
            Save Profile
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default App
