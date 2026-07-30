import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Trophy, 
  BarChart3, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  CalendarClock,
  Clock,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getUpcomingContests } from "@/services/contest";

// Visual illustration asset
import CandidateHomeSvg from "../assets/CandidateHome.svg"; 

export default function Home() {
  const [featuredContest, setFeaturedContest] = useState(null);
  const [loadingContest, setLoadingContest] = useState(true);

  useEffect(() => {
    const fetchFeaturedContest = async () => {
      try {
        const res = await getUpcomingContests();
        if ((res?.status || res?.success) && res.data?.length > 0) {
          setFeaturedContest(res.data[0]); // Pick the upcoming contest
        }
      } catch (err) {
        console.error("Failed to load featured contest:", err);
      } finally {
        setLoadingContest(false);
      }
    };

    fetchFeaturedContest();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card rounded-3xl p-6 sm:p-10 border shadow-sm">
          <div className="lg:col-span-7 space-y-6 text-left">
            <Badge variant="secondary" className="px-3 py-1 text-sm rounded-full gap-1.5 inline-flex items-center">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Next-Gen Coding Practice</span>
            </Badge>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Crack Coding Interviews & Land Your Dream Role with <span className="text-primary">codehire</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Solve real-world programming questions, compete in timed contests, track your algorithmic rankings, and get hired by top engineering teams.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="px-6 rounded-xl font-semibold gap-2" asChild>
                <Link to="/problems">
                  Start Practicing <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-6 rounded-xl font-semibold" asChild>
                <Link to="/contests">View Contests</Link>
              </Button>
            </div>

            {/* Quick Proof Pills */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Curated Problem Sets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automated Evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Live Leaderboards</span>
              </div>
            </div>
          </div>

          {/* Candidate Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <img 
              src={CandidateHomeSvg} 
              alt="Candidate Coding Illustration" 
              className="w-full max-w-md lg:max-w-none h-auto object-contain drop-shadow-md"
            />
          </div>
        </section>

        {/* FEATURED MODULES */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Platform Modules</h2>
              <p className="text-muted-foreground text-sm">Jump right into your preparation workflow.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Module 1: Problems */}
            <Card className="rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Code2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">Problem Set</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Master core algorithms, data structures, and practical coding patterns.
                </p>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-primary font-medium" asChild>
                  <Link to="/problems">
                    Solve Problems <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Module 2: Contests */}
            <Card className="rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">MCQ Contests</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Participate in timed technical challenges under interview constraints.
                </p>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-amber-600 dark:text-amber-400 font-medium" asChild>
                  <Link to="/contests">
                    Join Contests <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Module 3: Leaderboard */}
            <Card className="rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">Leaderboard</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Track performance rankings, benchmark scores, and climb the leaderboard.
                </p>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-blue-600 dark:text-blue-400 font-medium" asChild>
                  <Link to="/leaderboard">
                    View Rankings <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* UPCOMING CONTEST FEATURE BANNER */}
        <section>
          <Card className="rounded-2xl border bg-gradient-to-br from-card to-secondary/20">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {loadingContest ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Checking upcoming contests...
                </div>
              ) : featuredContest ? (
                /* CASE A: Active or Upcoming Contest Found */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Upcoming Contest</Badge>
                        <Badge variant="outline">{featuredContest.topic || "General"}</Badge>
                      </div>
                      <h3 className="text-2xl font-bold pt-1">{featuredContest.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {featuredContest.description}
                      </p>
                    </div>
                    <Trophy className="w-10 h-10 text-amber-500 shrink-0 hidden sm:block" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-background/80 border text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Duration</span>
                      <span className="font-semibold text-foreground">{featuredContest.durationMinutes} Mins</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Total Marks</span>
                      <span className="font-semibold text-foreground">{featuredContest.totalMarks} Points</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Start Time</span>
                      <span className="font-semibold text-foreground">{formatDate(featuredContest.startTime)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">End Time</span>
                      <span className="font-semibold text-foreground">{formatDate(featuredContest.endTime)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="rounded-xl font-semibold" asChild>
                      <Link to="/contests">View All Contests</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                /* CASE B: No Contests Currently Scheduled */
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-xl font-bold">Stay Tuned for Upcoming Contests!</h3>
                    <p className="text-sm text-muted-foreground">
                      We're curating new technical challenges for you. Check back soon or start sharpening your skills with practice problems today.
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-xl mt-2" asChild>
                    <Link to="/problems">Explore Problems</Link>
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-card mt-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Brand Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Code2 className="w-6 h-6 text-primary" />
          <span>codehire</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
          Empowering candidates to level up their technical skills, prepare for coding evaluations, and build great engineering careers.
        </p>
      </div>

      {/* Platform Links */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Platform</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li><Link to="/problems" className="hover:text-foreground transition-colors">Problems List</Link></li>
          <li><Link to="/contests" className="hover:text-foreground transition-colors">MCQ Contests</Link></li>
          <li><Link to="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
        </ul>
      </div>

    </div>

    <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} codehire. All rights reserved.
    </div>
  </div>
</footer>
    </div>
  );
}