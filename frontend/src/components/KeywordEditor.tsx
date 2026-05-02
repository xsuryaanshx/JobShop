import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordEditorProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  suggestions?: string[];
  className?: string;
}

/**
 * Inline chip editor for CV keywords. Add via Enter / comma, remove via X / Backspace.
 */
export function KeywordEditor({ keywords, onChange, suggestions = [], className }: KeywordEditorProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (keywords.some((k) => k.toLowerCase() === v.toLowerCase())) return;
    onChange([...keywords, v]);
    setDraft("");
  };

  const remove = (kw: string) => onChange(keywords.filter((k) => k !== kw));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && draft === "" && keywords.length) {
      remove(keywords[keywords.length - 1]);
    }
  };

  const fresh = suggestions.filter((s) => !keywords.some((k) => k.toLowerCase() === s.toLowerCase()));

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/60 bg-background/60 p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence initial={false}>
          {keywords.map((kw) => (
            <motion.span
              key={kw}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[11px] font-medium ring-1 ring-primary/25"
            >
              {kw}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(kw);
                }}
                aria-label={`Remove ${kw}`}
                className="rounded-full p-0.5 hover:bg-primary/25 transition-colors"
              >
                <X className="h-2.5 w-2.5" strokeWidth={3} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => add(draft)}
          placeholder={keywords.length === 0 ? "Add a keyword and press Enter" : "Add…"}
          className="flex-1 min-w-[100px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none px-1 py-0.5"
        />
      </div>

      {fresh.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-2.5 w-2.5 text-primary" /> AI suggests
          </span>
          {fresh.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-0.5 rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Plus className="h-2.5 w-2.5" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
