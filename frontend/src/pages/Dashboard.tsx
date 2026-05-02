import { motion } from "framer-motion";
import { TrendingUp, Heart, Calendar, Briefcase, ArrowUpRight, Loader2, Search } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Link } from "react-router-dom";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/applications`)
      ]);
      const statsData = await statsRes.json();
      const appsData = await appsRes.json();
      setStats(statsData);
      setApplications(appsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const response = await fetch(`${API_URL}/scrape`, { method: 'POST' });
      const data = await response.json();
      toast.success(`Scraped ${data.count} new jobs!`);
      fetchData();
    } catch (error) {
      console.error("Scrape error:", error);
      toast.error("Failed to scrape jobs");
    } finally {
      setScraping(false);
    }
  };

  const dashboardStats = [
    { label: "Applications sent", value: stats?.applied || 0, icon: Briefcase, iconClass: "bg-primary/15 text-primary" },
    { label: "Remaining to review", value: stats?.remaining || 0, icon: Heart, iconClass: "bg-accent/15 text-accent" },
    { label: "Rejected jobs", value: stats?.rejected || 0, icon: Calendar, iconClass: "bg-success/15 text-success" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 bg-background">
      <TopNav />

      <main className="relative mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Welcome back</div>
            <h1 className="mt-1 text-4xl font-bold tracking-tight">Your hunt, today.</h1>
          </div>
          <div className="flex gap-3">
            <AnimatedButton variant="outline" onClick={handleScrape} disabled={scraping}>
              {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {scraping ? "Scraping..." : "Find More Jobs"}
            </AnimatedButton>
            <Link to="/swipe">
              <AnimatedButton>
                Continue swiping <ArrowUpRight className="h-4 w-4" />
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {dashboardStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.iconClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-5 text-4xl font-bold tracking-tighter tabular-nums">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl shadow-card"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">Activity</div>
            </div>
          </div>

          <div className="space-y-1">
            {applications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No applications yet. Start swiping!</div>
            ) : (
              applications.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="group flex items-center justify-between gap-4 rounded-2xl p-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold">
                      {a.company[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{a.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-success">Applied</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{new Date(a.applied_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
