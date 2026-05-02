# JobShop — AI Job Copilot

World-class swipe-first job discovery experience. Built with React + Vite + TypeScript + Tailwind + Framer Motion.

## Run

```bash
npm install   # or: bun install / pnpm install
npm run dev
```

Open http://localhost:8080

## Features

- Velocity-aware swipe deck with spring physics (← / → keys, ⌘Z to undo)
- AI tailoring loader → CV + cover letter preview
- **Editable keyword chips** with AI suggestions, drives live highlighting
- **Resume drafts** — edits persist in localStorage and reload when you revisit
- **Swipe rate insight** — live apply-rate, avg match score, sent count
- **History panel with filters**: All / Drafts / Sent / Skipped
- **First-run tutorial overlay** with 3 walkthrough steps
- `prefers-reduced-motion` fallbacks across all animations
- Dashboard with stats + activity timeline

## Routes

- `/` — Landing
- `/swipe` — Core swipe deck
- `/apply` — AI-tailored CV + cover letter with keyword editor
- `/dashboard` — Stats & activity

## Stack

- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS v3 (semantic design tokens — see `src/index.css`)
- Framer Motion · React Router 6 · shadcn/ui · lucide-react
