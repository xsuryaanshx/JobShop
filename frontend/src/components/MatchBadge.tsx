import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatchBadge({ score, size = "md", className }: MatchBadgeProps) {
  const sizes = {
    sm: { ring: 44, stroke: 3, text: "text-xs", sub: "text-[8px]" },
    md: { ring: 64, stroke: 4, text: "text-base", sub: "text-[9px]" },
    lg: { ring: 96, stroke: 5, text: "text-2xl", sub: "text-[10px]" },
  }[size];

  const radius = (sizes.ring - sizes.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const tone =
    score >= 90 ? "hsl(var(--success))" : score >= 80 ? "hsl(var(--primary))" : "hsl(var(--accent))";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: sizes.ring, height: sizes.ring }}>
      <svg width={sizes.ring} height={sizes.ring} className="-rotate-90">
        <circle
          cx={sizes.ring / 2}
          cy={sizes.ring / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={sizes.stroke}
          fill="none"
          opacity={0.5}
        />
        <motion.circle
          cx={sizes.ring / 2}
          cy={sizes.ring / 2}
          r={radius}
          stroke={tone}
          strokeWidth={sizes.stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${tone})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold tabular-nums leading-none", sizes.text)} style={{ color: tone }}>
          {score}
        </span>
        <span className={cn("font-medium uppercase tracking-wider text-muted-foreground mt-0.5", sizes.sub)}>match</span>
      </div>
    </div>
  );
}
