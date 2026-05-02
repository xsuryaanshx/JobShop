import { motion } from "framer-motion";
import { TrendingUp, Activity } from "lucide-react";
import { useSwipeHistory } from "@/hooks/useSwipeHistory";
import { JOBS } from "@/data/jobs";

/**
 * Live insight: shows apply rate + average match score so users get a sense
 * of how selective they're being and how strong their funnel is.
 */
export function SwipeRateInsight() {
  const history = useSwipeHistory();
  const total = history.length;
  const applied = history.filter((h) => h.action === "apply").length;
  const sent = history.filter((h) => h.action === "apply" && h.status === "sent").length;
  const rate = total > 0 ? Math.round((applied / total) * 100) : 0;

  const appliedScores = history
    .filter((h) => h.action === "apply")
    .map((h) => h.job.matchScore);
  const avgMatch =
    appliedScores.length > 0
      ? Math.round(appliedScores.reduce((a, b) => a + b, 0) / appliedScores.length)
      : Math.round(JOBS.reduce((a, b) => a + b.matchScore, 0) / JOBS.length);

  const tone =
    rate >= 70
      ? { label: "Highly selective", color: "text-accent" }
      : rate >= 40
      ? { label: "Balanced", color: "text-primary" }
      : rate >= 1
      ? { label: "Casting wide", color: "text-success" }
      : { label: "Just getting started", color: "text-muted-foreground" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mx-auto w-full max-w-[420px] rounded-2xl border border-border/60 bg-card/40 px-4 py-3 backdrop-blur-xl shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-primary-soft">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Session insight</div>
            <div className={`text-xs font-semibold truncate ${tone.color}`}>{tone.label}</div>
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <Stat value={`${rate}%`} label="apply rate" />
          <div className="w-px bg-border/60" />
          <Stat value={`${avgMatch}`} label="avg match" />
          <div className="w-px bg-border/60" />
          <Stat value={`${sent}`} label="sent" tone="success" />
        </div>
      </div>

      {/* Bar */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary/60">
        <motion.div
          className="h-full rounded-full bg-gradient-primary"
          initial={false}
          animate={{ width: `${rate}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </div>

      {total >= 5 && (
        <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <TrendingUp className="h-2.5 w-2.5 text-success" />
          {applied} applies across {total} swipes today
        </div>
      )}
    </motion.div>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: "success" }) {
  return (
    <div className="text-right">
      <div className={`text-sm font-bold tabular-nums leading-none ${tone === "success" ? "text-success" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
