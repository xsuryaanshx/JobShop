import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit3, Send, ArrowLeft, FileText, Mail, Check, Loader2, Sparkles } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { AnimatedButton } from "@/components/AnimatedButton";
import { MatchBadge } from "@/components/MatchBadge";
import { type Job } from "@/data/jobs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { historyStore } from "@/hooks/useSwipeHistory";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type SendState = "idle" | "sending" | "sent";

export default function Apply() {
  const navigate = useNavigate();
  const location = useLocation();
  const job: Job = (location.state as { job?: Job })?.job;
  const [state, setState] = useState<SendState>("idle");
  const [tailoredCV, setTailoredCV] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!job) {
      navigate("/swipe");
      return;
    }

    const fetchTailoredData = async () => {
      try {
        const response = await fetch(`${API_URL}/tailor-cv/${job.id}`, {
          method: 'POST'
        });
        const data = await response.json();
        setTailoredCV(data.tailored_cv);
        setCoverLetter(data.cover_letter);
      } catch (error) {
        console.error("Error tailoring CV:", error);
        toast.error("Failed to tailor CV with AI");
      } finally {
        setLoading(false);
      }
    };
    fetchTailoredData();
  }, [job, navigate]);

  const handleApply = async () => {
    if (state !== "idle") return;
    setState("sending");
    try {
      const response = await fetch(`${API_URL}/apply/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tailored_cv: tailoredCV, cover_letter: coverLetter })
      });
      if (!response.ok) throw new Error("Apply failed");
      
      historyStore.markSent(job.id);
      setState("sent");
      toast.success(`Application sent to ${job.company}`, {
        description: "We'll notify you the moment they respond.",
      });
      setTimeout(() => navigate("/swipe"), 1500);
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("Failed to send application");
      setState("idle");
    }
  };

  if (!job) return null;

  return (
    <div className="relative min-h-screen pt-24 pb-16 bg-background">
      <TopNav />

      <main className="relative mx-auto max-w-6xl px-4">
        <button
          onClick={() => navigate("/swipe")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to discover
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl shadow-card"
        >
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{job.company}</div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.location} · {job.salary}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <MatchBadge score={job.matchScore} size="lg" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground">AI generated</div>
              <div className="text-sm font-semibold">CV + Cover letter</div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Tailoring your application with AI...</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CV preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl shadow-card"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary-soft">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold">Tailored CV</span>
                </div>
              </div>

              <div className="rounded-2xl bg-background/60 border border-border p-5 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {tailoredCV}
              </div>
            </motion.div>

            {/* Cover letter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl shadow-card"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary-soft">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold">Cover Letter</span>
                </div>
              </div>

              <div className="rounded-2xl bg-background/60 border border-border p-5 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {coverLetter}
              </div>
            </motion.div>
          </div>
        )}

        {/* Actions */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3"
          >
            <AnimatedButton variant="outline" size="lg" onClick={() => navigate("/swipe")}>
              Back
            </AnimatedButton>
            <AnimatedButton
              size="lg"
              variant={state === "sent" ? "success" : "primary"}
              onClick={handleApply}
              disabled={state !== "idle"}
              className="min-w-[180px]"
            >
              {state === "sent" ? (
                <>
                  <Check className="h-4 w-4" /> Sent
                </>
              ) : state === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Apply now <Send className="h-4 w-4" />
                </>
              )}
            </AnimatedButton>
          </motion.div>
        )}
      </main>
    </div>
  );
}
