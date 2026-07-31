import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Eye,
  Home,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { getContestQuestions, submitContest } from "@/services/contest";

// ─── Pagination constants ───────────────────────────────────────────────────
const QUESTIONS_PER_TEST = 20;
const QUESTIONS_PER_PAGE = 5;
const TOTAL_PAGES = QUESTIONS_PER_TEST / QUESTIONS_PER_PAGE; // 4

// ─── Constants ───────────────────────────────────────────────────────────────
const TOTAL_TIME = 30 * 60; // 30 minutes in seconds
const MARKS_CORRECT = 1;
const MARKS_WRONG = -0.25;
const MAX_TAB_SWITCHES = 3;

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// ─── Shared geometric primitives (same identity as Contest.jsx / ContestDetails.jsx) ──

function CornerTicks() {
  return (
    <>
      <span className="pointer-events-none absolute left-2 top-2 h-1.5 w-1.5 border-l border-t border-foreground/20" />
      <span className="pointer-events-none absolute right-2 top-2 h-1.5 w-1.5 border-r border-t border-foreground/20" />
      <span className="pointer-events-none absolute left-2 bottom-2 h-1.5 w-1.5 border-l border-b border-foreground/20" />
      <span className="pointer-events-none absolute right-2 bottom-2 h-1.5 w-1.5 border-r border-b border-foreground/20" />
    </>
  );
}

// ─── Confirm Submit Modal — minimal, no marking info, exactly two options ──────
function ConfirmSubmitModal({ onConfirm, onCancel, answered, total }) {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="p-5 space-y-1.5">
          <h2 className="font-semibold text-foreground text-base">Submit test?</h2>
          <p className="text-sm text-muted-foreground">
            {unanswered > 0
              ? `${unanswered} of ${total} question${unanswered > 1 ? "s" : ""} still unanswered.`
              : `All ${total} questions answered.`}{" "}
            This can't be undone once submitted.
          </p>
        </div>
        <div className="flex border-t border-border">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors border-r border-border"
          >
            Review
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auto-submit (tab-switch) notice ────────────────────────────────────────
function TabSwitchToast({ count }) {
  return `Tab switch detected (${count}/${MAX_TAB_SWITCHES}) — the test auto-submits at ${MAX_TAB_SWITCHES}.`;
}

// ─── Results Page ────────────────────────────────────────────────────────────
const CHART_COLORS = {
  correct: "#171717",
  wrong: "#a3a3a3",
  skipped: "#e5e5e5",
};

function ResultsPage({ answers, questions, contestId, timeTaken, onReturnHome }) {
  const correct = questions.filter((q) => answers[q.id] === q.correct).length;
  const wrong = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== q.correct
  ).length;
  const skipped = questions.length - correct - wrong;

  const score = correct * MARKS_CORRECT + wrong * MARKS_WRONG;
  const maxScore = questions.length * MARKS_CORRECT;
  const pct = maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;

  const categoryStats = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      if (!map[q.category]) map[q.category] = { category: q.category, correct: 0, wrong: 0, skipped: 0, total: 0 };
      map[q.category].total++;
      if (answers[q.id] === undefined) map[q.category].skipped++;
      else if (answers[q.id] === q.correct) map[q.category].correct++;
      else map[q.category].wrong++;
    });
    return Object.values(map);
  }, [questions, answers]);

  const pieData = [
    { name: "Correct", value: correct, color: CHART_COLORS.correct },
    { name: "Wrong", value: wrong, color: CHART_COLORS.wrong },
    { name: "Skipped", value: skipped, color: CHART_COLORS.skipped },
  ].filter((d) => d.value > 0);

  const grade =
    pct >= 85 ? "Excellent" : pct >= 70 ? "Strong" : pct >= 50 ? "Fair" : "Needs work";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <div className="max-w-3xl mx-auto p-6 space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-border/60">
          <div className="space-y-1">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Result Slip
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Contest #{contestId}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onReturnHome} className="gap-1.5">
            <Home className="h-3.5 w-3.5" /> Contests
          </Button>
        </header>

        {/* Score block — hairline grid, consistent with the rest of the module */}
        <section className="relative border border-border/80 rounded-xl overflow-hidden">
          <CornerTicks />
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
                Final score
              </p>
              <p className="font-mono text-4xl font-bold tabular-nums text-foreground">
                {score.toFixed(2)}
                <span className="text-base font-normal text-muted-foreground"> / {maxScore}</span>
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">{grade} · {pct}%</p>
            </div>
            <div className="grid grid-cols-4 gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60 shrink-0">
              {[
                { label: "Correct", value: correct },
                { label: "Wrong", value: wrong },
                { label: "Skipped", value: skipped },
                { label: "Time", value: formatTime(timeTaken) },
              ].map((s) => (
                <div key={s.label} className="bg-card px-3.5 py-2.5 text-center">
                  <p className="font-mono text-sm font-bold tabular-nums text-foreground">{s.value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5 font-mono">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 sm:px-8 pb-5 text-xs font-mono text-muted-foreground">
            Marking scheme: +{MARKS_CORRECT} correct · {MARKS_WRONG} wrong · 0 skipped
          </div>
        </section>

        {/* Analytics — real charts, not a static list */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
            Analytics
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">

            {/* Category breakdown — stacked bar chart */}
            <div className="border border-border/60 rounded-xl p-4">
              <p className="text-xs font-medium text-foreground mb-3">Category breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryStats} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" hide domain={[0, "dataMax"]} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={110}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                  />
                  <Bar dataKey="correct" stackId="a" fill={CHART_COLORS.correct} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="wrong" stackId="a" fill={CHART_COLORS.wrong} />
                  <Bar dataKey="skipped" stackId="a" fill={CHART_COLORS.skipped} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Overall split — donut */}
            <div className="border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center">
              <p className="text-xs font-medium text-foreground mb-2 self-start">Overall split</p>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={38} outerRadius={58} paddingAngle={2}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1 mt-1">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                    {d.name} <span className="ml-auto font-mono text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Question review — professional collapsible ledger */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">
            Question review
          </p>
          <div className="border border-border/60 rounded-xl divide-y divide-border/60 overflow-hidden">
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct;
              const isWrong = userAns !== undefined && !isCorrect;
              const isSkipped = userAns === undefined;
              return (
                <details key={q.id} className="group">
                  <summary className="flex items-start gap-3 p-4 cursor-pointer list-none hover:bg-muted/30 transition-colors">
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground border border-border/60 bg-muted/30 rounded w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {pad(idx + 1)}
                    </span>
                    <p className="text-sm text-foreground flex-1 leading-relaxed">{q.question}</p>
                    <span className="shrink-0 mt-0.5">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-foreground" />
                      ) : isWrong ? (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <MinusCircle className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </span>
                  </summary>
                  <div className="px-4 pb-4 pl-12 space-y-1.5">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`text-xs px-2.5 py-1.5 rounded-md border font-mono ${
                          i === q.correct
                            ? "border-foreground/30 bg-muted/50 font-semibold text-foreground"
                            : i === userAns && isWrong
                            ? "border-border text-muted-foreground line-through"
                            : "border-transparent text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                        {i === q.correct && " ✓"}
                      </div>
                    ))}
                    {isSkipped && (
                      <p className="text-[11px] text-muted-foreground font-mono pt-1">Not attempted</p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ContestTest() {
  const navigate = useNavigate();
  const { id: contestId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [highlightedId, setHighlightedId] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const questionRefs = useRef({});
  const submittedRef = useRef(false);

  // Fetch the 20-question document set for this contest
  useEffect(() => {
    let active = true;
    setLoading(true);
    getContestQuestions(contestId).then((data) => {
      if (active) {
        setQuestions((data?.questions || []).slice(0, QUESTIONS_PER_TEST));
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [contestId]);

  const handleAutoSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    setTimeTaken(Math.round((Date.now() - startTimeRef.current) / 1000));
    setSubmitted(true);
  }, []);

  // Timer
  useEffect(() => {
    if (loading || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, submitted, handleAutoSubmit]);

  // Tab-switch detection — auto-submit after MAX_TAB_SWITCHES
  useEffect(() => {
    if (loading || submitted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          if (next >= MAX_TAB_SWITCHES) {
            toast.error("Test auto-submitted: tab switch limit reached.");
            handleAutoSubmit();
          } else {
            toast.warning(TabSwitchToast({ count: next }));
          }
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loading, submitted, handleAutoSubmit]);

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    const taken = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(taken);
    setSubmitted(true);
    setShowConfirm(false);
    submitContest(contestId, answers, taken);
  };

  const selectAnswer = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  };

  const goToPage = (p) => setPage(Math.max(0, Math.min(TOTAL_PAGES - 1, p)));

  // Jump to an EXACT question from the palette — switches page AND scrolls
  // to + highlights that specific question, instead of just landing on the
  // first question of its page.
  const jumpToQuestion = (idx) => {
    const targetPage = Math.floor(idx / QUESTIONS_PER_PAGE);
    const question = questions[idx];
    if (targetPage !== page) {
      setPage(targetPage);
    }
    // wait a tick for the new page's questions to render before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = questionRefs.current[question.id];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setHighlightedId(question.id);
          setTimeout(() => setHighlightedId(null), 1400);
        }
      });
    });
  };

  const answered = Object.keys(answers).length;
  const isLowTime = timeLeft <= 300;
  const pageQuestions = questions.slice(page * QUESTIONS_PER_PAGE, page * QUESTIONS_PER_PAGE + QUESTIONS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xs font-mono text-muted-foreground animate-pulse">Loading questions…</p>
      </div>
    );
  }

  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-center px-6">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Couldn't load questions for this contest.</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The backend didn't return a question set — check that the server is running and
          the <code className="font-mono">contest_question_sets</code> collection is seeded for contest #{contestId}.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate("/contests")}>
          Back to Contests
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <ResultsPage
        answers={answers}
        timeTaken={timeTaken}
        questions={questions}
        contestId={contestId}
        onReturnHome={() => navigate("/contests")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background">
      {showConfirm && (
        <ConfirmSubmitModal
          answered={answered}
          total={questions.length}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ── Compact top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2.5 gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold truncate">CONTEST #{contestId}</p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {answered}/{questions.length} answered
              {tabSwitches > 0 && (
                <span className="text-amber-600 ml-2">· {tabSwitches}/{MAX_TAB_SWITCHES} tab switches</span>
              )}
            </p>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono font-bold text-sm tabular-nums transition-colors ${
              isLowTime
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-muted/40 text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </div>

          <Button size="sm" className="shrink-0" onClick={() => setShowConfirm(true)}>
            Submit
          </Button>
        </div>
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${(answered / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question panel — compact cards to minimize scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="max-w-2xl mx-auto space-y-3">

            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Page {page + 1}/{TOTAL_PAGES} · Q{page * QUESTIONS_PER_PAGE + 1}–
              {Math.min((page + 1) * QUESTIONS_PER_PAGE, questions.length)}
            </p>

            {pageQuestions.map((q, i) => {
              const qNumber = page * QUESTIONS_PER_PAGE + i + 1;
              const isHighlighted = highlightedId === q.id;
              return (
                <div
                  key={q.id}
                  ref={(el) => (questionRefs.current[q.id] = el)}
                  className={`rounded-xl border p-4 space-y-3 transition-all scroll-mt-20 ${
                    isHighlighted ? "border-foreground ring-2 ring-foreground/30" : "border-border/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground border border-border/60 bg-muted/30 rounded w-5 h-5 flex items-center justify-center">
                        {pad(qNumber)}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded">
                        {q.category}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleFlag(q.id)}
                      className={`flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-1 rounded border transition-colors ${
                        flagged.has(q.id)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/40"
                      }`}
                    >
                      <Flag className="h-3 w-3" />
                      {flagged.has(q.id) ? "Flagged" : "Flag"}
                    </button>
                  </div>

                  <p className="text-sm font-medium text-foreground leading-snug">{q.question}</p>

                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => selectAnswer(q.id, oi)}
                          className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground/40 hover:bg-muted/40"
                          }`}
                        >
                          <span
                            className={`shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold border ${
                              selected ? "border-background/40" : "border-border text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}

            {/* Pagination controls */}
            <div className="flex items-center justify-between pt-1">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: TOTAL_PAGES }).map((_, p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-7 h-7 flex items-center justify-center text-[11px] font-mono font-bold rounded border transition-all ${
                      p === page
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" disabled={page === TOTAL_PAGES - 1} onClick={() => goToPage(page + 1)}>
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </main>

        {/* ── Question palette (sidebar) — jump-to-exact-question fixed ── */}
        <aside className="hidden md:flex flex-col w-60 border-l border-border bg-muted/10 overflow-y-auto p-4 gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">
              Palette
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((question, idx) => {
                const isAnswered = answers[question.id] !== undefined;
                const isFlagged = flagged.has(question.id);
                const inCurrentPage = Math.floor(idx / QUESTIONS_PER_PAGE) === page;
                return (
                  <button
                    key={question.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`aspect-square flex items-center justify-center text-[11px] font-mono font-bold rounded border transition-all ${
                      inCurrentPage ? "ring-1 ring-foreground/50" : ""
                    } ${
                      isFlagged
                        ? "border-foreground bg-foreground text-background"
                        : isAnswered
                        ? "border-foreground/70 bg-muted text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Legend</p>
            {[
              { swatch: "border-foreground/70 bg-muted", label: "Answered" },
              { swatch: "border-foreground bg-foreground", label: "Flagged" },
              { swatch: "border-border bg-background", label: "Not visited" },
            ].map(({ swatch, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm border ${swatch}`} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-1.5 pt-3 border-t border-border/60 font-mono">
            {[
              { label: "Answered", value: answered },
              { label: "Flagged", value: flagged.size },
              { label: "Remaining", value: questions.length - answered },
            ].map((s) => (
              <div key={s.label} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}