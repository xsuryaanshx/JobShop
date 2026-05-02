import { motion } from "framer-motion";
import { MapPin, Briefcase, DollarSign, Wifi } from "lucide-react";
import { type Job } from "@/data/jobs";
import { MatchBadge } from "./MatchBadge";
import { SkillTag } from "./SkillTag";

interface JobCardProps {
  job: Job;
  isTop?: boolean;
}

const LOGO_GRADIENTS = [
  "from-blue-500 to-purple-600",
  "from-pink-500 to-orange-500",
  "from-emerald-500 to-cyan-500",
  "from-violet-500 to-fuchsia-500",
  "from-amber-500 to-rose-500",
  "from-indigo-500 to-sky-500",
  "from-rose-500 to-purple-600",
];

export function JobCard({ job, isTop = false }: JobCardProps) {
  const gradient = LOGO_GRADIENTS[parseInt(job.id) % LOGO_GRADIENTS.length];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-card shadow-card grain">
      {/* Glow accent */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex h-full flex-col p-7">
        {/* Header */}
        <div className="flex items-start justify-between">
          <motion.div
            initial={isTop ? { scale: 0.8, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-lg`}
          >
            {job.companyLogo}
          </motion.div>
          <MatchBadge score={job.matchScore} size="md" />
        </div>

        {/* Title */}
        <div className="mt-6">
          <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight text-foreground">
            {job.title}
          </h2>
          <p className="mt-1 text-base font-medium text-muted-foreground">{job.company}</p>
        </div>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
          {job.remote && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Wifi className="h-3 w-3" />
              Remote
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Briefcase className="h-3 w-3" />
            {job.type}
          </span>
        </div>

        {/* Salary */}
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/30 p-3 backdrop-blur-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary-soft">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Compensation</div>
            <div className="text-sm font-semibold text-foreground">{job.salary}</div>
          </div>
        </div>

        {/* AI Match reason */}
        <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-primary-soft p-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">AI Insight</span>
          </div>
          <p className="mt-1 text-sm leading-snug text-foreground/90">
            {job.matchScore}% match — {job.matchReason}
          </p>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {job.description}
        </p>

        {/* Skills */}
        <div className="mt-auto pt-5 space-y-2.5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Your matching skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.matchingSkills.slice(0, 5).map((s) => (
                <SkillTag key={s} label={s} variant="match" />
              ))}
            </div>
          </div>
          {job.missingSkills.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Skills to grow
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.missingSkills.map((s) => (
                  <SkillTag key={s} label={s} variant="miss" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
