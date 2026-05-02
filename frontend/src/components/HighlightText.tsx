import { useMemo } from "react";

interface HighlightTextProps {
  text: string;
  keywords: string[];
  className?: string;
}

/**
 * Renders text with case-insensitive whole-word highlighting for any keyword.
 * Used in the CV preview + cover letter so users see the AI tailoring at a glance.
 */
export function HighlightText({ text, keywords, className }: HighlightTextProps) {
  const parts = useMemo(() => {
    const cleaned = keywords.filter(Boolean).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (cleaned.length === 0) return [{ text, match: false }];
    const regex = new RegExp(`(${cleaned.join("|")})`, "gi");
    return text.split(regex).map((segment) => ({
      text: segment,
      match: cleaned.some((k) => new RegExp(`^${k}$`, "i").test(segment)),
    }));
  }, [text, keywords]);

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            className="rounded-md bg-primary/15 px-1 py-0.5 text-foreground font-medium ring-1 ring-primary/25"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  );
}
