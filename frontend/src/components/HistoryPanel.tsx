import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, X, Heart, SkipForward, Send, Trash2, Inbox } from "lucide-react";
import { useSwipeHistory, historyStore } from "@/hooks/useSwipeHistory";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Filter = "all" | "drafts" | "sent" | "skipped";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "drafts", label: "Drafts" },
  { id: "sent", label: "Sent" },
  { id: "skipped", label: "Skipped" },
];

export function HistoryPanel() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const history = useSwipeHistory();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const applied = history.filter((h) => h.action === "apply");
  const drafts = applied.filter((h) => h.status !== "sent");
  const sent = applied.filter((h) => h.status === "sent").length;
  const skipped = history.filter((h) => h.action === "skip");

  const filtered = history.filter((h) => {
    if (filter === "drafts") return h.action === "apply" && h.status !== "sent";
    if (filter === "sent") return h.action === "apply" && h.status === "sent";
    if (filter === "skipped") return h.action === "skip";
    return true;
  });

  const counts: Record<Filter, number> = {
    all: history.length,
    drafts: drafts.length,
    sent,
    skipped: skipped.length,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 text-xs font-semibold text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground hover:bg-secondary"
        aria-label="Open swipe history"
      >
        <History className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">History</span>
        {history.length > 0 && (
          <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {history.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.1 : 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.aside
              role="dialog"
              aria-label="Swipe history"
              initial={reduced ? { opacity: 0 } : { x: "100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: reduced ? "tween" : "spring", stiffness: 320, damping: 36, duration: reduced ? 0.15 : undefined }}
              className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border/60 bg-card/95 backdrop-blur-2xl shadow-elevated"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 p-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Swipe history</div>
                  <h2 className="mt-0.5 text-xl font-bold tracking-tight">
                    {history.length} swipe{history.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Close history"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Stats strip */}
              {history.length > 0 && (
                <div className="grid grid-cols-3 gap-2 border-b border-border/60 px-5 py-4">
                  <Stat label="Drafts" value={drafts.length} tone="success" />
                  <Stat label="Sent" value={sent} tone="primary" />
                  <Stat label="Skipped" value={skipped.length} tone="muted" />
                </div>
              )}

              {/* Filter tabs */}
              {history.length > 0 && (
                <div className="flex items-center gap-1 border-b border-border/60 px-3 py-2 overflow-x-auto">
                  {FILTERS.map((f) => {
                    const active = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={cn(
                          "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap",
                          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="history-filter-pill"
                            className="absolute inset-0 rounded-full bg-secondary"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative">{f.label}</span>
                        <span
                          className={cn(
                            "relative inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                            active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {counts[f.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* List */}
              <div className="flex-1 overflow-y-auto p-3">
                {history.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center px-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/60">
                      <Inbox className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">No swipes yet</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your swipe activity will show up here so you can revisit, resume drafts, and track sent applications.
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center px-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/60">
                      <Inbox className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Nothing in this filter yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {filtered.map((rec) => {
                      const isApply = rec.action === "apply";
                      const isSent = rec.status === "sent";
                      return (
                        <li key={rec.id}>
                          <div
                            className={cn(
                              "group flex items-center gap-3 rounded-2xl border p-3 transition-colors",
                              isApply
                                ? "border-success/20 bg-success/5 hover:bg-success/10"
                                : "border-border/60 bg-secondary/30 hover:bg-secondary/50"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                                isApply ? "bg-gradient-success text-success-foreground" : "bg-secondary text-muted-foreground"
                              )}
                            >
                              {isApply ? (
                                <Heart className="h-4 w-4 fill-current" />
                              ) : (
                                <SkipForward className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold">{rec.job.title}</span>
                                {isSent && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                                    <Send className="h-2.5 w-2.5" /> Sent
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {rec.job.company} · {timeAgo(rec.timestamp)}
                              </div>
                            </div>

                            {isApply && !isSent && (
                              <button
                                onClick={() => {
                                  setOpen(false);
                                  navigate("/apply", { state: { job: rec.job } });
                                }}
                                className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-transform hover:scale-105"
                              >
                                Resume
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {history.length > 0 && (
                <div className="border-t border-border/60 p-4">
                  <button
                    onClick={() => {
                      if (window.confirm("Clear all swipe history?")) historyStore.clear();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear history
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "success" | "primary" | "muted" }) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : "text-muted-foreground";
  return (
    <div className="rounded-xl bg-secondary/30 p-2.5 text-center">
      <div className={cn("text-lg font-bold tabular-nums leading-tight", toneClass)}>{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
