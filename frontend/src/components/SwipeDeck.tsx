import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Heart, X, RotateCcw, Undo2 } from "lucide-react";
import { type Job } from "@/data/jobs";
import { JobCard } from "./JobCard";
import { AnimatedButton } from "./AnimatedButton";
import { historyStore } from "@/hooks/useSwipeHistory";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SwipeDeckProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onReject?: (job: Job) => void;
  onEmpty?: () => void;
}

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 450;

export function SwipeDeck({ jobs, onApply, onReject, onEmpty }: SwipeDeckProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [exitVelocity, setExitVelocity] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -20], [1, 0]);
  const bgGlowRight = useTransform(x, [0, 200], [0, 0.35]);
  const bgGlowLeft = useTransform(x, [-200, 0], [0.35, 0]);

  const visibleJobs = useMemo(() => jobs.slice(index, index + 3), [index, jobs]);

  const completeSwipe = useCallback(
    (dir: "left" | "right", velocity = 0) => {
      const job = jobs[index];
      if (!job || exitDir) return;
      setExitDir(dir);
      setExitVelocity(velocity);

      const delay = reduced ? 0 : 240;
      window.setTimeout(() => {
        if (dir === "right") {
          historyStore.add(job, "apply", "draft");
          onApply(job);
        } else {
          historyStore.add(job, "skip");
          onReject?.(job);
        }
        setHistory((h) => [...h, index]);
        setIndex((i) => {
          const next = i + 1;
          if (next >= jobs.length) onEmpty?.();
          return next;
        });
        x.set(0);
        setExitDir(null);
        setExitVelocity(0);
      }, delay);
    },
    [index, jobs, onApply, onReject, onEmpty, x, reduced, exitDir]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) completeSwipe("right", velocity);
    else if (offset < -SWIPE_THRESHOLD || velocity < -VELOCITY_THRESHOLD) completeSwipe("left", velocity);
  };

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      // Remove the most recent matching record for this job (best-effort)
      const last = historyStore.all().find((r) => r.job.id === jobs[prev]?.id);
      if (last) historyStore.remove(last.id);
      setIndex(prev);
      x.set(0);
      return h.slice(0, -1);
    });
  }, [x, jobs]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") completeSwipe("right");
      else if (e.key === "ArrowLeft") completeSwipe("left");
      else if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [completeSwipe, undo]);

  const reset = () => {
    setIndex(0);
    setHistory([]);
  };

  if (index >= jobs.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <motion.div
          initial={reduced ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl border border-border bg-card/50 p-10 backdrop-blur-xl shadow-elevated max-w-md"
        >
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-5">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">You're all caught up</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We're hunting for more matches tailored to your profile.
          </p>
          <AnimatedButton variant="outline" className="mt-6" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reshuffle
          </AnimatedButton>
        </motion.div>
      </div>
    );
  }

  // Exit physics: scale exit distance with velocity for a punchy feel
  const exitX = exitDir
    ? (exitDir === "right" ? 1 : -1) * Math.max(600, Math.abs(exitVelocity) * 0.6)
    : 0;

  return (
    <div className="relative flex h-full w-full flex-col items-center">
      {/* Background swipe glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-l from-success/30 to-transparent"
        style={{ opacity: bgGlowRight }}
      />
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-destructive/30 to-transparent"
        style={{ opacity: bgGlowLeft }}
      />

      {/* Card stack */}
      <div className="relative w-full max-w-[420px] flex-1" style={{ minHeight: 600 }}>
        <AnimatePresence>
          {visibleJobs
            .slice()
            .reverse()
            .map((job, revIdx) => {
              const stackIdx = visibleJobs.length - 1 - revIdx;
              const isTop = stackIdx === 0;

              if (isTop) {
                return (
                  <motion.div
                    key={job.id}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
                    style={{ x, rotate: reduced ? 0 : rotate, zIndex: 30 }}
                    drag={reduced ? false : "x"}
                    dragElastic={0.65}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    initial={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 20 }}
                    animate={
                      exitDir
                        ? {
                            x: exitX,
                            rotate: reduced ? 0 : exitDir === "right" ? 28 : -28,
                            opacity: 0,
                            transition: reduced
                              ? { duration: 0.15 }
                              : { type: "spring", stiffness: 260, damping: 28, velocity: exitVelocity },
                          }
                        : { scale: 1, opacity: 1, y: 0 }
                    }
                    transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.8 }}
                    whileTap={reduced ? undefined : { cursor: "grabbing" }}
                  >
                    <JobCard job={job} isTop />

                    {/* Like / Nope overlays */}
                    <motion.div
                      style={{ opacity: likeOpacity }}
                      className="pointer-events-none absolute top-10 left-8 -rotate-12 rounded-2xl border-4 border-success px-5 py-2 text-2xl font-black tracking-widest text-success shadow-success"
                    >
                      APPLY
                    </motion.div>
                    <motion.div
                      style={{ opacity: nopeOpacity }}
                      className="pointer-events-none absolute top-10 right-8 rotate-12 rounded-2xl border-4 border-destructive px-5 py-2 text-2xl font-black tracking-widest text-destructive shadow-destructive"
                    >
                      SKIP
                    </motion.div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={job.id}
                  className="absolute inset-0"
                  initial={reduced ? false : { scale: 0.92 - stackIdx * 0.04, y: 16 + stackIdx * 8, opacity: 0 }}
                  animate={{
                    scale: 1 - stackIdx * 0.04,
                    y: stackIdx * 14,
                    opacity: 1 - stackIdx * 0.25,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  style={{ zIndex: 30 - stackIdx, filter: `blur(${stackIdx * 0.5}px)` }}
                >
                  <JobCard job={job} />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Action bar */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <motion.button
          whileHover={reduced ? undefined : { scale: 1.08, y: -2 }}
          whileTap={reduced ? undefined : { scale: 0.92 }}
          onClick={() => completeSwipe("left")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-card/70 text-destructive shadow-card backdrop-blur-xl transition-shadow hover:shadow-destructive"
          aria-label="Skip job"
        >
          <X className="h-7 w-7" strokeWidth={2.5} />
        </motion.button>

        <motion.button
          whileHover={reduced ? undefined : { scale: 1.08, y: -2 }}
          whileTap={reduced ? undefined : { scale: 0.92 }}
          onClick={undo}
          disabled={history.length === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground shadow-card backdrop-blur-xl transition-all hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Undo last swipe"
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-5 w-5" />
        </motion.button>

        <div className="text-center min-w-[64px]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground tabular-nums">
            {Math.min(index + 1, jobs.length)} / {jobs.length}
          </div>
          <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-primary"
              initial={false}
              animate={{ width: `${((index + 1) / jobs.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
        </div>


        <motion.button
          whileHover={reduced ? undefined : { scale: 1.08, y: -2 }}
          whileTap={reduced ? undefined : { scale: 0.92 }}
          onClick={() => completeSwipe("right")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-success text-success-foreground shadow-success transition-shadow"
          aria-label="Apply to job"
        >
          <Heart className="h-7 w-7 fill-current" strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}
