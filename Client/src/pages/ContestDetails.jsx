import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, HelpCircle, Award, FileText, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getContestDetails } from "@/services/contest";

function pad(n) {
  return String(n).padStart(2, "0");
}

function CornerTicks() {
  return (
    <>
      <span className="pointer-events-none absolute left-3 top-3 h-2 w-2 border-l border-t border-foreground/30" />
      <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 border-r border-t border-foreground/30" />
      <span className="pointer-events-none absolute left-3 bottom-3 h-2 w-2 border-l border-b border-foreground/30" />
      <span className="pointer-events-none absolute right-3 bottom-3 h-2 w-2 border-r border-b border-foreground/30" />
    </>
  );
}

function SectionLabel({ index, children }) {
  return (
    <div className="flex items-center gap-3 mb-3.5 select-none">
      <span className="font-mono text-xs tabular-nums text-muted-foreground border border-border/80 rounded w-6 h-6 flex items-center justify-center shrink-0 bg-muted/30 font-semibold">
        {index}
      </span>
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground font-mono">
        {children}
      </h2>
      <div className="h-px bg-border/60 flex-1 ml-2" />
    </div>
  );
}

const DEFAULT_INSTRUCTIONS = [
  "The assessment timer initializes immediately upon entry and cannot be paused, extended, or reset under any circumstances.",
  "Marking Scheme: You will be awarded +1.00 mark for every correct selection and penalized -0.25 marks for every incorrect selection. Unattempted questions receive 0 marks.",
  "Proctoring Protocol: Automated systems monitor browser window focus. Minimizing the browser, switching tabs, or opening external applications will log an infraction. Upon the 3rd infraction, your examination will be automatically terminated and submitted.",
  "Question Palette: You may navigate freely between questions at any time during the active session using the numbered sidebar palette.",
  "Submission & Review: Clicking submit will prompt a confirmation screen showing your attempted and unattempted counts. Answer keys and final score breakdowns remain locked until the assessment window concludes.",
];

export default function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getContestDetails(id)
      .then((data) => {
        if (active) {
          setContest(
            data || {
              id,
              title: "CodeBase Weekly Assessment",
              duration: "30 mins",
              totalQuestions: 20,
              week: 1,
              instructions: DEFAULT_INSTRUCTIONS,
            }
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setContest({
            id,
            title: "CodeBase Weekly Assessment",
            duration: "30 mins",
            totalQuestions: 20,
            week: 1,
            instructions: DEFAULT_INSTRUCTIONS,
          });
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-xs font-mono text-muted-foreground animate-pulse">
            // LOADING ASSESSMENT MANIFEST...
          </p>
        </div>
      </>
    );
  }

  if (!contest) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-mono">Assessment record not found.</p>
        </div>
      </>
    );
  }

  const instructionsList =
    contest.instructions && contest.instructions.length > 0
      ? contest.instructions
      : DEFAULT_INSTRUCTIONS;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background text-foreground p-6 md:p-10 selection:bg-foreground selection:text-background">
        {/* Widened to max-w-4xl to prevent side emptiness and vertical congestion */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Reliable Back Navigation (Fixed to /contests with history fallback) */}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/contests");
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all w-fit group bg-transparent border-0 cursor-pointer p-0"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Contests
          </button>

          {/* Header Manifest */}
          <header className="pb-6 border-b border-border/60 space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border/40">
              <FileText className="h-3.5 w-3.5" /> Assessment Brief
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {contest.title}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              Week № {pad(contest.week || 1)} · Please review all examination rules before entering the secure hall.
            </p>
          </header>

          {/* Assessment Parameters — Generous Hairline Grid */}
          <section className="space-y-3">
            <SectionLabel index="01">Parameters & Grading</SectionLabel>
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60 rounded-xl overflow-hidden border border-border/60 shadow-xs">
              <CornerTicks />
              {[
                { icon: HelpCircle, label: "Questions", value: `${contest.totalQuestions || 20} Qs` },
                { icon: Clock, label: "Duration", value: contest.duration || "30 mins" },
                { icon: Award, label: "Marking Scheme", value: "+1.0 / -0.25" },
                { icon: ShieldAlert, label: "Proctoring", value: "Strict (3-Strike)" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-card p-5 flex flex-col justify-between min-h-[90px]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-[10px] uppercase tracking-widest font-mono font-medium">{label}</span>
                  </div>
                  <p className="font-mono text-base font-bold tabular-nums text-foreground mt-2">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Instructions — Breathable Numbered Ledger */}
          <section className="space-y-3">
            <SectionLabel index="02">Examination Rules</SectionLabel>
            <div className="border border-border/60 rounded-xl divide-y divide-border/60 overflow-hidden bg-card shadow-xs">
              {instructionsList.map((line, i) => (
                <div key={i} className="flex items-start gap-4 p-5 hover:bg-muted/10 transition-colors">
                  <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground border border-border/60 bg-muted/30 rounded w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                    {pad(i + 1)}
                  </span>
                  <span className="text-sm text-foreground/90 leading-relaxed font-sans">
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Standard Examination Declaration & Action Gate */}
          <section className="space-y-5 pt-2">
            <label className="flex items-start gap-3.5 p-5 border border-border/80 rounded-xl cursor-pointer hover:bg-muted/20 transition-all bg-card shadow-xs select-none">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-background text-foreground focus:ring-1 focus:ring-foreground focus:ring-offset-0 cursor-pointer accent-foreground shrink-0"
              />
              <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-mono">
                I confirm that I have read and understood all assessment instructions. I agree to abide by the <strong className="text-foreground">marking scheme</strong> and strict automated proctoring protocols throughout the examination.
              </span>
            </label>

            <Button
              size="lg"
              className="w-full h-12 rounded-xl font-bold text-xs sm:text-sm font-mono uppercase tracking-widest transition-all shadow-sm"
              disabled={!acknowledged}
              onClick={() => navigate(`/contest/${id}/test`)}
            >
              <span>Begin Assessment</span>
              <span className="ml-2 font-normal">→</span>
            </Button>
          </section>

        </div>
      </div>
    </>
  );
}