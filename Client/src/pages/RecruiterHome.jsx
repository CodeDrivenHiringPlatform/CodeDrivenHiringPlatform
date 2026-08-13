import React from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Search, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Users, 
  UserCheck, 
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Recruiter Illustration Asset
import RecruiterHomeSvg from "../assets/RecruiterHome.svg"; 

export default function RecruiterHome() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card rounded-3xl p-6 sm:p-10 border shadow-sm">
          <div className="lg:col-span-7 space-y-6 text-left">
            <Badge variant="secondary" className="px-3 py-1 text-sm rounded-full gap-1.5 inline-flex items-center">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Recruiter Portal</span>
            </Badge>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Source & Hire Verified Engineering Talent with <span className="text-primary">codehire</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Bypass generic resume screening. Discover top-tier developers evaluated on real-world algorithmic challenges, proctored contest scores, and verified skill metrics.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="px-6 rounded-xl font-semibold gap-2" asChild>
                <Link to="/leaderboard">
                  <Search className="w-4 h-4" /> Explore Leaderboard
                </Link>
              </Button>
            </div>

            {/* Quick Proof Pills */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Proctored Scores</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Verified Rankings</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Direct Candidate Profiles</span>
              </div>
            </div>
          </div>

          {/* Recruiter Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <img 
              src={RecruiterHomeSvg} 
              alt="Recruiter Sourcing Talent Illustration" 
              className="w-full max-w-md lg:max-w-none h-auto object-contain drop-shadow-md"
            />
          </div>
        </section>

        {/* RECRUITER WORKFLOW MODULES */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recruiter Suite</h2>
              <p className="text-muted-foreground text-sm">Target candidates based on objective benchmark performance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Module 1: Talent Leaderboard */}
            <Card className="rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">Talent Leaderboard</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Browse candidates ranked by global ratings, contest accuracy, speed, and consistency.
                </p>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-amber-600 dark:text-amber-400 font-medium" asChild>
                  <Link to="/leaderboard">
                    Open Leaderboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Module 2: Candidate Profile Inspection */}
            <Card className="rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">Candidate Profiles</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Click any candidate on the leaderboard to review their full contest history, submission metrics, and verified skill sets.
                </p>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-primary font-medium" asChild>
                  <Link to="/leaderboard">
                    Inspect Profiles via Leaderboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* VETTING MATRIX DETAILS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Why Source on codehire?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-2">
                <ShieldCheck className="text-emerald-500 w-6 h-6" />
                <h3 className="font-semibold text-base">Anti-Cheat Validated</h3>
                <p className="text-xs text-muted-foreground">
                  Timings and proctored contests ensure score authenticity.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-2">
                <Zap className="text-amber-500 w-6 h-6" />
                <h3 className="font-semibold text-base">Speed & Precision</h3>
                <p className="text-xs text-muted-foreground">
                  Filter candidate performance by solve speed and clean executions.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-2">
                <Users className="text-blue-500 w-6 h-6" />
                <h3 className="font-semibold text-base">Pre-Vetted Pool</h3>
                <p className="text-xs text-muted-foreground">
                  Direct access to developers regularly sharpening core data structures.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-xl">
                <Building2 className="w-6 h-6 text-primary" />
                <span>codehire <span className="text-xs font-normal text-muted-foreground">(Recruiter Edition)</span></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Empowering recruiters and engineering teams to identify, evaluate, and recruit verified tech talent through objective code benchmarking.
              </p>
            </div>

            {/* Platform Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Recruiter Portal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/leaderboard" className="hover:text-foreground transition-colors">Global Leaderboard</Link></li>
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