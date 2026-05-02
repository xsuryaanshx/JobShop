import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { HistoryPanel } from "./HistoryPanel";
import { ProfileDialog } from "./ProfileDialog";

export function TopNav() {
  const { pathname } = useLocation();
  const links = [
    { to: "/swipe", label: "Discover", icon: Layers },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto mt-4 max-w-5xl px-4">
        <nav className="flex items-center justify-between rounded-full border border-border/60 bg-background/60 px-4 py-2 backdrop-blur-2xl shadow-card">
          <Link to="/" className="flex items-center gap-2 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">JobShop</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.to;
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-secondary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
            <div className="ml-1 hidden sm:block h-5 w-px bg-border/60" />
            <HistoryPanel />
            <ProfileDialog />
          </div>
        </nav>
      </div>
    </header>
  );
}
