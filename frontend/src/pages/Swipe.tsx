import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SwipeDeck } from "@/components/SwipeDeck";
import { LoaderState } from "@/components/LoaderState";
import { TopNav } from "@/components/TopNav";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { SwipeRateInsight } from "@/components/SwipeRateInsight";
import { type Job } from "@/data/jobs";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const mapBackendJobToFrontend = (job: any): Job => ({
  id: String(job.id),
  title: job.title,
  company: job.company,
  companyLogo: job.company[0] || "J",
  location: job.location || "Remote",
  remote: (job.location || "").toLowerCase().includes("remote"),
  salary: job.salary || "Not specified",
  type: "Full-time",
  matchScore: job.match_score || 50,
  matchReason: "High match based on your profile skills",
  matchingSkills: [],
  missingSkills: [],
  description: job.description || "",
  posted: "Just now",
});

type Phase = "swipe" | "loading";

export default function Swipe() {
  const [phase, setPhase] = useState<Phase>("swipe");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs?status=new&limit=50`);
      const data = await response.json();
      setJobs(data.map(mapBackendJobToFrontend));
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job: Job) => {
    setActiveJob(job);
    setPhase("loading");
  };

  const handleReject = async (job: Job) => {
    try {
      await fetch(`${API_URL}/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
    } catch (error) {
      console.error("Error rejecting job:", error);
    }
  };

  const handleLoaderDone = () => {
    if (activeJob) {
      navigate("/apply", { state: { job: activeJob } });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderState onComplete={() => {}} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-10">
      <TopNav />
      <TutorialOverlay />

      <main className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
          <p className="text-sm text-muted-foreground">Swipe right to apply · left to skip · ← / → on keyboard</p>
        </div>

        <SwipeRateInsight />

        <div className="relative mt-5 w-full max-w-[420px] flex-1" style={{ minHeight: 720 }}>
          <AnimatePresence mode="wait">
            {phase === "swipe" && (
              <motion.div
                key="swipe"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SwipeDeck 
                  jobs={jobs} 
                  onApply={handleApply} 
                  onReject={handleReject}
                  onEmpty={() => fetchJobs()} 
                />
              </motion.div>
            )}

            {phase === "loading" && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <LoaderState onComplete={handleLoaderDone} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
