import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { AnimatedButton } from "@/components/AnimatedButton";

const FEATURES = [
  { icon: Zap, label: "Apply in one swipe" },
  { icon: Target, label: "AI-matched roles" },
  { icon: Sparkles, label: "Auto-tailored CVs" },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/30 blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">JobShop</span>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-32 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 backdrop-blur-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">AI Job Copilot · Live</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter"
        >
          Find your next job
          <br />
          in <span className="text-gradient">seconds.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
        >
          Swipe through AI-curated roles. Apply with one tap. Let your copilot
          tailor every CV and cover letter automatically.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <Link to="/swipe">
            <AnimatedButton size="lg" className="min-w-[200px]">
              Start swiping <ArrowRight className="h-4 w-4" />
            </AnimatedButton>
          </Link>
          <Link to="/dashboard">
            <AnimatedButton size="lg" variant="outline">
              View dashboard
            </AnimatedButton>
          </Link>
        </motion.div>

        {/* Feature row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid w-full grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl transition-all hover:border-primary/40 hover:bg-card/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary-soft">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{f.label}</span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Floating preview card hint */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 text-xs text-muted-foreground"
        >
          Trusted by candidates from Stripe · Linear · Vercel · Notion
        </motion.div>
      </main>
    </div>
  );
}
