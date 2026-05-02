import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, FileText, Send } from "lucide-react";

const STEPS = [
  { icon: Sparkles, label: "Analyzing job requirements" },
  { icon: FileText, label: "Optimizing your CV" },
  { icon: Send, label: "Generating application" },
];

interface LoaderStateProps {
  onComplete: () => void;
}

export function LoaderState({ onComplete }: LoaderStateProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 750)
    );
    const done = setTimeout(onComplete, STEPS.length * 750 + 400);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Orbital loader */}
      <div className="relative h-40 w-40">
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-glow" />
        </motion.div>
        <motion.div
          className="absolute inset-3 rounded-full border border-accent/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent shadow-glow-accent" />
        </motion.div>
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </motion.div>
      </div>

      {/* Steps */}
      <div className="mt-10 space-y-3 w-72">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  done
                    ? "bg-success/20 text-success"
                    : active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-sm font-medium ${
                  done ? "text-muted-foreground line-through" : active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {active && (
                <motion.div
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
