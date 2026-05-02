import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  label: string;
  variant: "match" | "miss";
}

export function SkillTag({ label, variant }: SkillTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border backdrop-blur-sm transition-colors",
        variant === "match"
          ? "border-success/30 bg-success/10 text-success"
          : "border-warning/30 bg-warning/10 text-warning"
      )}
    >
      {variant === "match" ? <Check className="h-3 w-3" strokeWidth={3} /> : <AlertCircle className="h-3 w-3" strokeWidth={2.5} />}
      {label}
    </span>
  );
}
