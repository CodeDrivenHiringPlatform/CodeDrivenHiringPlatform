import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users, BarChart2, Clock, TrendingUp,
  ChevronRight, Activity, Plus, Trash2, Edit, Shield,
  BookOpen, Calendar, UserCheck, Eye, HelpCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

// Services
import {
  getUserCounts,
  getUsers,
  deleteUser,
  getAllQuestionSets,
  getQuestionSetById,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
} from "@/services/admin";

const CATEGORIES = [
  "Networking",
  "Operating Systems",
  "Databases",
  "DSA",
  "Computer Architecture",
  "Programming",
  "Cybersecurity",
  "Cloud & DevOps",
];

const sidebarItems = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "contests", label: "Contests", icon: Calendar },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "recruiters", label: "Recruiters", icon: UserCheck },
];

// ── Modals & Badges ─────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-base">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <span className="text-xl leading-none">&times;</span>
          </Button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel}>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>
      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

function StatusBadge({ status }) {
  const map = {
    live: "bg-green-100 text-green-700 border-green-200",
    upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    ended: "bg-muted text-muted-foreground border-border",
    ROLE_CANDIDATE: "bg-blue-100 text-blue-700 border-blue-200",
    ROLE_RECRUITER: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return <Badge className={`border text-xs whitespace-nowrap ${map[status] || ""}`}>{status}</Badge>;
}

function getContestStatus(startTime, endTime) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
}

// ── Overview Section ──────────────────────────────────────────────────────────

function Overview({ counts, setActiveSection }) {
  const platformStats = [
    { label: "Total Candidates", value: counts.candidates ?? 0, icon: Users, change: "Registered", up: true },
    { label: "Total Recruiters", value: counts.recruiters ?? 0, icon: UserCheck, change: "Registered", up: true },
    { label: "Active Contests", value: counts.activeContests ?? 0, icon: Calendar, change: "Live Now", up: true },
    { label: "Upcoming Contests", value: counts.upcomingContests ?? 0, icon: Clock, change: "Scheduled", up: true },
    { label: "Total Problems", value: counts.totalProblems ?? 0, icon: HelpCircle, change: "Available", up: true },
    { label: "Total Platform Users", value: counts.total ?? 0, icon: Activity, change: "Overall", up: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platformStats.map(({ label, value, icon: Icon, change, up }) => (
          <Card key={label} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <div className="p-1.5 bg-muted rounded-lg">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-green-600" : "text-red-500"}`}>
                <TrendingUp className="h-3 w-3" />{change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Manage Contests", icon: Calendar, color: "bg-green-50 border-green-200 text-green-700", section: "contests" },
          { label: "Candidates List", icon: Users, color: "bg-blue-50 border-blue-200 text-blue-700", section: "candidates" },
          { label: "Recruiters List", icon: UserCheck, color: "bg-purple-50 border-purple-200 text-purple-700", section: "recruiters" },
        ].map(({ label, icon: Icon, color, section }) => (
          <Card
            key={label}
            onClick={() => setActiveSection(section)}
            className={`rounded-2xl border cursor-pointer hover:shadow-md transition-shadow ${color}`}
          >
            <CardContent className="p-4 sm:p-5 flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm truncate">{label}</span>
              <ChevronRight className="h-4 w-4 ml-auto shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Contests Section ──────────────────────────────────────────────────────────

function ContestsSection({ refreshCounts }) {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    topic: CATEGORIES[0],
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 30,
    totalMarks: 100,
    questions: [],
  });

  const fetchContests = async () => {
    setLoading(true);
    const res = await getAllQuestionSets();
    if (res?.status && res?.data) {
      setContests(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      topic: CATEGORIES[0],
      description: "",
      startTime: "",
      endTime: "",
      durationMinutes: 30,
      totalMarks: 100,
      questions: [{ questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }],
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    const res = await getQuestionSetById(id);
    if (res?.status && res?.data) {
      const data = res.data;
      setEditingId(id);
      setFormData({
        title: data.title || "",
        topic: data.topic || CATEGORIES[0],
        description: data.description || "",
        startTime: data.startTime ? data.startTime.slice(0, 16) : "",
        endTime: data.endTime ? data.endTime.slice(0, 16) : "",
        durationMinutes: data.durationMinutes || 30,
        totalMarks: data.totalMarks || 100,
        questions:
          data.questions?.length > 0
            ? data.questions.map((q) => ({
                questionId: q.questionId,
                questionText: q.questionText || "",
                options: q.options?.length === 4 ? q.options : ["", "", "", ""],
                correctAnswerIndex: q.correctAnswerIndex ?? 0,
              }))
            : [{ questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }],
      });
      setModalOpen(true);
    }
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...formData.questions];
    updated[qIndex][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[optIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const addQuestionField = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
      ],
    });
  };

  const removeQuestionField = (index) => {
    if (formData.questions.length === 1) {
      toast.error("Contest must have at least one question");
      return;
    }
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Start time and End time are required");
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error("End time must be after Start time");
      return;
    }
    if (formData.durationMinutes <= 0) {
      toast.error("Duration must be greater than 0 minutes");
      return;
    }
    if (formData.totalMarks <= 0) {
      toast.error("Total Marks must be greater than 0");
      return;
    }

    const formatIsoDirection = (dt) => {
      if (!dt) return dt;
      return dt.length === 16 ? `${dt}:00.000Z` : dt;
    };

    const payload = {
      ...formData,
      startTime: formatIsoDirection(formData.startTime),
      endTime: formatIsoDirection(formData.endTime),
    };

    let res;
    if (editingId) {
      res = await updateQuestionSet(editingId, payload);
    } else {
      res = await createQuestionSet(payload);
    }

    if (res?.status) {
      setModalOpen(false);
      fetchContests();
      refreshCounts();
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteQuestionSet(id);
    if (res?.status) {
      fetchContests();
      refreshCounts();
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {modalOpen && (
        <Modal
          title={editingId ? "Edit MCQ Contest Set" : "Create MCQ Contest Set"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Weekly Technical Assessment #1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Topic <span className="text-red-500">*</span></Label>
                  <select
                    required
                    className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Total Marks <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Description <span className="text-red-500">*</span></Label>
                <Input
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the contest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Start Time <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Time <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duration (Mins) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Questions ({formData.questions.length})</h3>
                <Button type="button" variant="outline" size="sm" onClick={addQuestionField}>
                  <Plus className="h-4 w-4 mr-1" /> Add Question
                </Button>
              </div>

              {formData.questions.map((q, qIndex) => (
                <Card key={qIndex} className="p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Question #{qIndex + 1}</span>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={() => removeQuestionField(qIndex)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <Input
                    required
                    placeholder="Enter question text *"
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="space-y-1">
                        <Label className="text-[10px]">
                          Option {optIndex + 1} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          placeholder={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label className="text-xs">Correct Option <span className="text-red-500">*</span></Label>
                    <select
                      required
                      className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs mt-1"
                      value={q.correctAnswerIndex}
                      onChange={(e) => handleQuestionChange(qIndex, "correctAnswerIndex", Number(e.target.value))}
                    >
                      {q.options.map((_, idx) => (
                        <option key={idx} value={idx}>Option {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Save Changes" : "Create Set"}</Button>
            </div>
          </form>
        </Modal>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg">MCQ Contests</h2>
          <p className="text-sm text-muted-foreground">{contests.length} contest question sets configured</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" /> New Contest Set
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading contests...</div>
        ) : contests.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No contests found</div>
        ) : (
          <div className="divide-y divide-border overflow-x-auto">
            {contests.map((c) => {
              const status = getContestStatus(c.startTime, c.endTime);
              return (
                <div key={c.id} className="flex items-center gap-4 px-4 py-4 min-w-[600px]">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.topic} • {c.questions?.length || 0} Questions • {c.durationMinutes} Mins • {c.totalMarks} Marks
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge status={status} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(c.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400"
                        onClick={() =>
                          setConfirmAction({
                            message: `Delete contest set "${c.title}"?`,
                            onConfirm: () => handleDelete(c.id),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Candidates Section ────────────────────────────────────────────────────────

function CandidatesSection({ refreshCounts }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCandidate, setViewCandidate] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    const res = await getUsers("ROLE_CANDIDATE", 0, 50);
    if (res?.status && res?.data?.content) {
      setCandidates(res.data.content);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleDelete = async (id) => {
    const res = await deleteUser(id);
    if (res?.status) {
      fetchCandidates();
      refreshCounts();
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {viewCandidate && (
        <Modal title="Candidate Profile" onClose={() => setViewCandidate(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="text-xl">{viewCandidate.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-lg truncate">{viewCandidate.name}</p>
                <p className="text-sm text-muted-foreground truncate mb-1">{viewCandidate.email}</p>
                <StatusBadge status={viewCandidate.role} />
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setViewCandidate(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg">Candidates</h2>
          <p className="text-sm text-muted-foreground">{candidates.length} registered candidates</p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading candidates...</div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No candidates found</div>
        ) : (
          <div className="divide-y divide-border overflow-x-auto">
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-4 py-4 min-w-[400px]">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>{c.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={c.role} />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => setViewCandidate(c)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400"
                      onClick={() =>
                        setConfirmAction({
                          message: `Delete candidate ${c.name}?`,
                          onConfirm: () => handleDelete(c.id),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Recruiters Section ────────────────────────────────────────────────────────

function RecruitersSection({ refreshCounts }) {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchRecruiters = async () => {
    setLoading(true);
    const res = await getUsers("ROLE_RECRUITER", 0, 50);
    if (res?.status && res?.data?.content) {
      setRecruiters(res.data.content);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleDelete = async (id) => {
    const res = await deleteUser(id);
    if (res?.status) {
      fetchRecruiters();
      refreshCounts();
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg">Recruiters</h2>
          <p className="text-sm text-muted-foreground">{recruiters.length} registered recruiters</p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading recruiters...</div>
        ) : recruiters.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No recruiters found</div>
        ) : (
          <div className="divide-y divide-border overflow-x-auto">
            {recruiters.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-4 min-w-[450px]">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={r.role} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400"
                    onClick={() =>
                      setConfirmAction({
                        message: `Remove ${r.name}?`,
                        onConfirm: () => handleDelete(r.id),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Main Dashboard Shell ──────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [counts, setCounts] = useState({
    candidates: 0,
    activeContests: 0,
    total: 0,
    upcomingContests: 0,
    totalProblems: 0,
    recruiters: 0,
  });

  const loadCounts = async () => {
    const res = await getUserCounts();
    if (res?.status && res?.data) {
      setCounts(res.data);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <Overview counts={counts} setActiveSection={setActiveSection} />;
      case "contests":
        return <ContestsSection refreshCounts={loadCounts} />;
      case "candidates":
        return <CandidatesSection refreshCounts={loadCounts} />;
      case "recruiters":
        return <RecruitersSection refreshCounts={loadCounts} />;
      default:
        return <Overview counts={counts} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <div className="h-16 border-b border-border bg-background flex items-center justify-center shrink-0">
        <Navbar />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-20 lg:w-60 border-r border-border bg-muted/10 shrink-0 overflow-y-auto">
          <nav className="flex-1 px-3 py-6 space-y-2">
            {sidebarItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === id
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={label}
              >
                <Icon className="h-5 w-5 shrink-0 mx-auto lg:mx-0" />
                <span className="hidden lg:block truncate">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 pb-20 md:pb-8">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{renderSection()}</div>
        </main>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md flex justify-around p-2 z-40">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
                activeSection === id ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}