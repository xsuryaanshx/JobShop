import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, X, Keyboard, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const KEY = "jobshop:tutorial-seen:v1";

const STEPS = [
  {
    icon: ArrowRight,
    title: "Swipe right to apply",
    body: "Drag the card right or tap the heart. Your AI copilot drafts a tailored CV automatically.",
    tone: "success" as const,
  },
  {
    icon: ArrowLeft,
    title: "Swipe left to skip",
    body: "Not interested? Drag left or tap the cross. We use this to refine your matches.",
    tone: "destructive" as const,
  },
  {
    icon: Keyboard,
    title: "Power-user shortcuts",
    body: "Use ← / → on your keyboard. Press ⌘Z to undo your last swipe. Open History anytime.",
    tone: "primary" as const,
  },
];

export function TutorialOverlay() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) {
        const t = setTimeout(() => setOpen(true), 350);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const close = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  };

  const current = STEPS[step];
  const Icon = current.icon;

  const toneClass =
    current.tone === "success"
      ? "from-success to-success"
      : current.tone === "destructive"
      ? "from-destructive to-destructive"
      : "from-primary to-accent";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-label="Swipe tutorial"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-border/60 bg-card/95 p-6 backdrop-blur-2xl shadow-elevated relative overflow-hidden">
              {/* glow */}
              <div className={`pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${toneClass} opacity-20 blur-3xl`} />

              <button
                onClick={close}
                aria-label="Close tutorial"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3 w-3" />
                  Welcome
                </div>

                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-5"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass} shadow-glow`}>
                    {current.tone === "success" ? (
                      <Heart className="h-6 w-6 text-success-foreground fill-current" />
                    ) : (
                      <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
                    )}
                  </div>

                  <h3 className="mt-5 text-2xl font-bold tracking-tight">{current.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{current.body}</p>
                </motion.div>

                {/* Progress dots */}
                <div className="mt-6 flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setStep(i)}
                      aria-label={`Go to step ${i + 1}`}
                      className="h-1.5 rounded-full transition-colors"
                      animate={{
                        width: i === step ? 24 : 6,
                        backgroundColor: i === step ? "hsl(var(--primary))" : "hsl(var(--border))",
                      }}
                    />
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    onClick={close}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip
                  </button>
                  <motion.button
                    whileHover={reduced ? undefined : { scale: 1.04 }}
                    whileTap={reduced ? undefined : { scale: 0.96 }}
                    onClick={next}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
                  >
                    {step < STEPS.length - 1 ? "Next" : "Start swiping"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
