import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  HelpCircle,
  Award,
  Inbox,
  ArrowRight,
  ChevronRight,
  Calendar,
  Users,
  Layers,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getContestsList, getUserContestStats } from "@/services/contest";

const TABS = ["All", "Available", "Scheduled", "Completed"];

function formatScheduledDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// Subtle corner ticks for the proctored exam motif
function CornerTicks({ className = "" }) {
  return (
    <>
      <span className={`pointer-events-none absolute left-2.5 top-2.5 h-2 w-2 border-l border-t border-foreground/20 ${className}`} />
      <span className={`pointer-events-none absolute right-2.5 top-2.5 h-2 w-2 border-r border-t border-foreground/20 ${className}`} />
      <span className={`pointer-events-none absolute left-2.5 bottom-2.5 h-2 w-2 border-l border-b border-foreground/20 ${className}`} />
      <span className={`pointer-events-none absolute right-2.5 bottom-2.5 h-2 w-2 border-r border-b border-foreground/20 ${className}`} />
    </>
  );
}

// Geometric Numbered Section Label
function SectionLabel({ index, children }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 select-none">
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground border border-border/80 rounded w-5 h-5 flex items-center justify-center shrink-0 bg-muted/30">
        {index}
      </span>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
        {children}
      </h2>
      <div className="h-px bg-border/60 flex-1 ml-2" />
    </div>
  );
}

// ─── Available Contest: Professional Standard Card ──────────────────────────
function AvailableCard({ contest }) {
  return (
    <Card className="relative rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs overflow-hidden">
      <CornerTicks />
      <CardContent className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-foreground">
              Live Assessment
            </span>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground border border-border/60 bg-muted/30 px-2 py-0.5 rounded">
            Week № {pad(contest.week)}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1.5 leading-snug text-foreground">
          {contest.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-xl leading-relaxed">
          Starts an independent {contest.duration} timer upon entry. Complete the assessment before the active window closes.
        </p>

        {/* Geometric hairline grid with +1/-0.25 marking scheme */}
        <div className="grid grid-cols-3 gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60 mb-6 max-w-md">
          {[
            { icon: HelpCircle, label: "Questions", value: `${contest.totalQuestions} Qs` },
            { icon: Clock, label: "Duration", value: contest.duration },
            { icon: Award, label: "Marking", value: "+1 / -0.25" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-card p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9px] uppercase tracking-widest font-mono">{label}</span>
              </div>
              <p className="font-mono text-xs sm:text-sm font-bold tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <Button
          size="sm"
          className="h-9 px-6 rounded-lg font-semibold text-xs tracking-wide transition-all shadow-none"
          asChild
        >
          <Link to={`/contest/${contest.id}`}>
            Start Contest <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AvailableCardSkeleton() {
  return <div className="rounded-xl bg-muted/40 h-[220px] animate-pulse border border-border/50" />;
}

// ─── Scheduled Contest: Minimalist Row with Left Accent ─────────────────────
function ScheduledCard({ contest }) {
  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-muted/30 hover:border-border transition-all overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground/20 group-hover:bg-foreground transition-colors" />
      
      <div className="flex items-start gap-3.5 pl-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 border border-border/40 font-mono text-xs text-muted-foreground shrink-0 mt-0.5 sm:mt-0">
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground tracking-tight">{contest.title}</span>
            <span className="text-[10px] font-mono text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded">
              W{pad(contest.week)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground font-mono">
            <span>{contest.duration}</span>
            <span className="text-border">•</span>
            <span>{contest.totalQuestions} Qs</span>
            <span className="text-border">•</span>
            <span className="text-foreground/80 font-sans font-medium">
              Opens {formatScheduledDate(contest.startsAt)}
            </span>
          </div>
        </div>
      </div>

      <Badge variant="outline" className="shrink-0 rounded font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 self-start sm:self-center border-border/80 text-muted-foreground">
        Scheduled
      </Badge>
    </div>
  );
}

// ─── Completed: Unboxed Ledger List ─────────────────────────────────────────
function CompletedRow({ contest }) {
  return (
    <Link
      to={`/leaderboard?contest=${contest.id}`}
      className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <span className="font-mono text-xs font-medium text-muted-foreground w-8 shrink-0 border border-border/60 bg-muted/20 rounded py-0.5 text-center group-hover:border-foreground/40 group-hover:text-foreground transition-colors">
          {pad(contest.week)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {contest.title}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono sm:hidden mt-0.5">
            {contest.participants?.toLocaleString()} candidates
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Users className="h-3 w-3 text-muted-foreground/70" />
          <span>{contest.participants?.toLocaleString()} candidates</span>
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center border border-dashed border-border/60 rounded-xl bg-transparent">
      <Inbox className="h-5 w-5 text-muted-foreground" />
      <p className="text-xs font-mono text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Contest() {
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [contests, setContests] = useState({ live: [], upcoming: [], past: [] });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([getContestsList(), getUserContestStats()]).then(([contestsData, statsData]) => {
      if (!active) return;
      setContests(contestsData || { live: [], upcoming: [], past: [] });
      setStats(statsData);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const showAvailable = activeTab === "All" || activeTab === "Available";
  const showScheduled = activeTab === "All" || activeTab === "Scheduled";
  const showCompleted = activeTab === "All" || activeTab === "Completed";

  const hasAvailable = loading || contests.live.length > 0;
  const hasScheduled = loading || contests.upcoming.length > 0;
  const hasCompleted = loading || contests.past.length > 0;

  // Dynamic Section Indexing: Computes sequential numbers (01, 02, 03) based on active view
  const sectionIndices = useMemo(() => {
    let count = 0;
    const indices = {};
    if (showAvailable && hasAvailable) indices.available = pad(++count);
    if (showScheduled && hasScheduled) indices.scheduled = pad(++count);
    if (showCompleted && hasCompleted) indices.completed = pad(++count);
    return indices;
  }, [showAvailable, showScheduled, showCompleted, hasAvailable, hasScheduled, hasCompleted]);

  const nothingToShow = useMemo(() => {
    if (loading) return false;
    if (activeTab === "Available") return contests.live.length === 0;
    if (activeTab === "Scheduled") return contests.upcoming.length === 0;
    if (activeTab === "Completed") return contests.past.length === 0;
    return contests.live.length === 0 && contests.upcoming.length === 0 && contests.past.length === 0;
  }, [activeTab, contests, loading]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background text-foreground p-6 selection:bg-foreground selection:text-background">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Unboxed Header + Inline Geometric Ledger Stats */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border/60">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                <Layers className="h-3 w-3" /> Assessment Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Contests
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Proctored evaluations under structured time constraints.
              </p>
            </div>

            {/* Inline Hairline Stats Ledger */}
            {!loading && stats && (
              <div className="grid grid-cols-3 gap-px bg-border/80 rounded-lg overflow-hidden border border-border/80 shrink-0 self-start sm:self-end">
                {[
                  { label: "Attempted", value: stats.attempted },
                  { label: "Best Rank", value: stats.bestRank ? `#${stats.bestRank}` : "—" },
                  { label: "Avg Score", value: `${stats.avgScore}%` },
                ].map((s) => (
                  <div key={s.label} className="bg-card px-3.5 py-1.5 text-center min-w-[76px]">
                    <p className="font-mono text-xs sm:text-sm font-bold text-foreground tabular-nums leading-tight">
                      {s.value}
                    </p>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </header>

          {/* Segmented Navigation Tabs */}
          <nav className="flex items-center gap-1 border-b border-border/60 pb-px overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border-b-2 -mb-px whitespace-nowrap ${
                    isActive
                      ? "border-foreground text-foreground font-bold bg-muted/20"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {nothingToShow && <EmptyState label="No evaluations found in the selected ledger register." />}

          {/* Available Contest */}
          {showAvailable && hasAvailable && (
            <section className="space-y-3">
              <SectionLabel index={sectionIndices.available}>Available Now</SectionLabel>
              {loading ? <AvailableCardSkeleton /> : <AvailableCard contest={contests.live[0]} />}
            </section>
          )}

          {/* Scheduled Assessments */}
          {showScheduled && hasScheduled && (
            <section className="space-y-3">
              <SectionLabel index={sectionIndices.scheduled}>Scheduled Assessments</SectionLabel>
              <div className="space-y-2">
                {loading
                  ? [0, 1].map((i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse border border-border/40" />)
                  : contests.upcoming.map((c) => <ScheduledCard key={c.id} contest={c} />)}
              </div>
            </section>
          )}

          {/* Completed Ledger */}
          {showCompleted && hasCompleted && (
            <section className="space-y-3">
              <SectionLabel index={sectionIndices.completed}>Completed Register</SectionLabel>
              <div className="divide-y divide-border/60 border-t border-b border-border/60 py-1">
                {loading
                  ? [0, 1, 2, 3].map((i) => <div key={i} className="h-11 my-1 bg-muted/40 rounded animate-pulse" />)
                  : contests.past.map((c) => <CompletedRow key={c.id} contest={c} />)}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}