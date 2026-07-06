import { useState, useEffect, type FormEvent } from "react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import {
  BookOpen,
  FileText,
  Dumbbell,
  CheckCircle,
  XCircle,
  Flame,
  TrendingUp,
  Award,
  Clock,
  Plus,
  Compass,
  Moon,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// ─── Design Colors ───────────────────────────────────────────────────────────
const NAVY = "#0A1628";
const GREEN = "#009E2C";
const GOLD = "#EAB308";
const TEAL = "#1A7F8E";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Habit {
  id: string;
  title: string;
  description: string;
  habitType: "Study" | "Revision" | "Reading" | "MockTest" | "CurrentAffairs" | "Exercise" | "Meditation" | "Sleep" | "Custom";
  reminderTime: string;
  isReminderEnabled: boolean;
  isActive: boolean;
  targetMinutes: number;
  points: number;
  isCompletedToday: boolean;
  completedMinutesToday: number;
}

interface FocusSession {
  id: string;
  topic: string;
  plannedMinutes: number;
  status: "active" | "completed" | "cancelled";
}

interface NightReview {
  submitted: boolean;
  completedTasks?: string;
  blockers?: string;
  tomorrowFirstAction?: string;
  productivityScore?: number;
}

export default function DailyHabitsPage() {
  const { currentUser } = useAuthStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // local state storage for persistence warning message
  const [localSaveWarning, setLocalSaveWarning] = useState<string | null>(null);

  // ─── Core Accountability States ─────────────────────────────────────────────
  const [habits, setHabits] = useState<Habit[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [nightReview, setNightReview] = useState<NightReview>({ submitted: false });
  const [streak, setStreak] = useState(currentUser?.studyStreak ?? 0);
  
  // Morning Plan
  const [morningPlan, setMorningPlan] = useState({
    plannedHours: 8,
    actualHours: 4.5,
    tasksPlanned: 5,
    tasksCompleted: 3,
    primaryFocusSubject: "Indian Polity & Modern History",
  });

  // History and Trends (last 7 days demo)
  const [history, setHistory] = useState<any[]>([]);

  // Modals
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // ─── Default Fallback Habits ────────────────────────────────────────────────
  const defaultHabits: Habit[] = [
    {
      id: "h-1",
      title: "Topic Study",
      description: "Watch syllabus video & take notes",
      habitType: "Study",
      reminderTime: "09:00",
      isReminderEnabled: true,
      isActive: true,
      targetMinutes: 180,
      points: 10,
      isCompletedToday: false,
      completedMinutesToday: 0,
    },
    {
      id: "h-2",
      title: "Daily Quiz",
      description: "Attend daily standard MCQ quiz",
      habitType: "MockTest",
      reminderTime: "14:00",
      isReminderEnabled: true,
      isActive: true,
      targetMinutes: 20,
      points: 10,
      isCompletedToday: false,
      completedMinutesToday: 0,
    },
    {
      id: "h-3",
      title: "Newspaper Reading",
      description: "Read Editorial pages in The Hindu",
      habitType: "Reading",
      reminderTime: "08:00",
      isReminderEnabled: true,
      isActive: true,
      targetMinutes: 60,
      points: 10,
      isCompletedToday: false,
      completedMinutesToday: 0,
    },
    {
      id: "h-4",
      title: "Exercise",
      description: "Aerobic cardio workout session",
      habitType: "Exercise",
      reminderTime: "18:00",
      isReminderEnabled: true,
      isActive: true,
      targetMinutes: 30,
      points: 10,
      isCompletedToday: false,
      completedMinutesToday: 0,
    },
  ];

  // ─── Initialize Data ────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    // Simulate Loading APIs
    const timer = setTimeout(() => {
      try {
        // Fallback or local storage logic
        const savedHabits = localStorage.getItem("igen-local-habits");
        if (savedHabits) {
          setHabits(JSON.parse(savedHabits));
        } else {
          setHabits(defaultHabits);
        }

        // Demo focus sessions
        setFocusSessions([
          { id: "fs-1", topic: "Preamble & Fundamental Rights", plannedMinutes: 90, status: "completed" },
          { id: "fs-2", topic: "Vedic Period Revision", plannedMinutes: 60, status: "active" },
          { id: "fs-3", topic: "CSAT Mock Questions", plannedMinutes: 45, status: "cancelled" },
        ]);

        // Demo History
        setHistory([
          { date: "2026-07-05", study: true, test: true, read: true, exec: true, score: 4.0 },
          { date: "2026-07-04", study: true, test: false, read: true, exec: true, score: 3.0 },
          { date: "2026-07-03", study: true, test: true, read: false, exec: false, score: 2.0 },
          { date: "2026-07-02", study: true, test: true, read: true, exec: true, score: 4.0 },
          { date: "2026-07-01", study: false, test: false, read: true, exec: true, score: 2.0 },
          { date: "2026-06-30", study: true, test: true, read: true, exec: false, score: 3.0 },
          { date: "2026-06-29", study: true, test: true, read: true, exec: true, score: 4.0 },
        ]);

        // Load night review if stored
        const savedReview = localStorage.getItem("igen-local-night-review");
        if (savedReview) {
          setNightReview(JSON.parse(savedReview));
        }

        setErrorState(null);
      } catch (err: any) {
        setErrorState("Failed to load dashboard accountability data.");
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  // ─── Local State Helper to Sync localStorage ────────────────────────────────
  const saveHabitsStateLocally = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem("igen-local-habits", JSON.stringify(newHabits));
  };

  // ─── Toggling Habit Status ──────────────────────────────────────────────────
  const handleToggleHabit = (habitId: string) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const newCompletedState = !targetHabit.isCompletedToday;
    const newHabits = habits.map((h) =>
      h.id === habitId ? { ...h, isCompletedToday: newCompletedState } : h
    );

    saveHabitsStateLocally(newHabits);

    // Calculate score for save message
    const completedCount = newHabits.filter((h) => h.isCompletedToday).length;
    const totalPoints = newHabits.reduce((acc, h) => acc + h.points, 0);
    const earnedPoints = newHabits.reduce((acc, h) => acc + (h.isCompletedToday ? h.points : 0), 0);
    const score = totalPoints > 0 ? Number(((earnedPoints / totalPoints) * 4).toFixed(1)) : 0.0;

    // Display warning message
    setLocalSaveWarning(
      `Saved locally for now. Backend complete-habit API is pending. Discipline score: ${score} / 4`
    );
    
    // Toast notification
    toast({
      title: "Discipline score updated",
      description: `Discipline Rating: ${score} / 4. Saved locally.`,
    });
  };

  // ─── Custom Habit Creation ──────────────────────────────────────────────────
  const handleCreateCustomHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const title = getString(formData, "title");
    const description = getString(formData, "description");
    const habitType = getString(formData, "habitType") as Habit["habitType"];
    const reminderTime = getString(formData, "reminderTime");
    const isReminderEnabled = formData.get("isReminderEnabled") === "on";
    const targetMinutes = getNumber(formData, "targetMinutes");
    const points = getNumber(formData, "points");

    // Validations
    if (!title) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    if (title.length > 150) {
      toast({ title: "Validation Error", description: "Title must be max 150 characters.", variant: "destructive" });
      return;
    }
    if (description.length > 500) {
      toast({ title: "Validation Error", description: "Description must be max 500 characters.", variant: "destructive" });
      return;
    }
    if (!/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(reminderTime)) {
      toast({ title: "Validation Error", description: "Reminder Time must be in HH:mm format.", variant: "destructive" });
      return;
    }
    if (targetMinutes < 0 || targetMinutes > 1440) {
      toast({ title: "Validation Error", description: "Target Minutes must be between 0 and 1440.", variant: "destructive" });
      return;
    }
    if (points < 0 || points > 100) {
      toast({ title: "Validation Error", description: "Points must be between 0 and 100.", variant: "destructive" });
      return;
    }

    const newHabit: Habit = {
      id: `h-custom-${Date.now()}`,
      title,
      description,
      habitType,
      reminderTime,
      isReminderEnabled,
      isActive: true,
      targetMinutes,
      points,
      isCompletedToday: false,
      completedMinutesToday: 0,
    };

    saveHabitsStateLocally([...habits, newHabit]);
    setHabitModalOpen(false);
    event.currentTarget.reset();
    toast({ title: "Habit Created!", description: `"${title}" has been saved locally.` });
  };

  // ─── Night Review submission ────────────────────────────────────────────────
  const handleSubmitNightReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const completedTasks = getString(formData, "completedTasks");
    const blockers = getString(formData, "blockers");
    const tomorrowFirstAction = getString(formData, "tomorrowFirstAction");
    const productivityScore = getNumber(formData, "productivityScore");

    const review: NightReview = {
      submitted: true,
      completedTasks,
      blockers,
      tomorrowFirstAction,
      productivityScore,
    };

    setNightReview(review);
    localStorage.setItem("igen-local-night-review", JSON.stringify(review));
    setReviewModalOpen(false);
    toast({ title: "Night Review Submitted!", description: "Today's loop is officially concluded. Great job!" });
  };

  // ─── Calculations / Scoring Logic ───────────────────────────────────────────
  const completedHabits = habits.filter((h) => h.isCompletedToday);
  const totalPoints = habits.reduce((acc, h) => acc + h.points, 0);
  const todayPoints = habits.reduce((acc, h) => acc + (h.isCompletedToday ? h.points : 0), 0);
  
  // Discipline Rating: (todayScore / totalPoints) * 4
  const dailyDisciplineScore = totalPoints > 0 ? Number(((todayPoints / totalPoints) * 4).toFixed(1)) : 0.0;

  // Streak Qualification Rules:
  // Qualified only if: at least 75% habits completed AND score >= 3.0
  const habitCompletionRate = habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0;
  const isStreakQualified = habitCompletionRate >= 75 && dailyDisciplineScore >= 3.0;

  // Render icons mapping for habit types
  const getHabitIcon = (type: Habit["habitType"]) => {
    switch (type) {
      case "Study": return BookOpen;
      case "Revision": return Layers;
      case "Reading": return FileText;
      case "MockTest": return Compass;
      case "CurrentAffairs": return TrendingUp;
      case "Exercise": return Dumbbell;
      case "Meditation": return Clock;
      case "Sleep": return Moon;
      default: return Award;
    }
  };

  // Prepare chart trend mapping
  const chartData = history.slice().reverse().map((h) => ({
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(h.date).getDay()],
    score: h.score,
  }));

  // Add today to trend chart data
  chartData.push({
    day: "Today",
    score: dailyDisciplineScore,
  });

  // Helpers for extracting string/number from FormData
  function getString(formData: FormData, key: string): string {
    return String(formData.get(key) || "").trim();
  }
  function getNumber(formData: FormData, key: string): number {
    return Number(formData.get(key) || 0);
  }

  // ─── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Synchronizing Accountability Dashboard...</p>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Accountability Dashboard Error</h2>
        <p className="text-sm text-muted-foreground">{errorState}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Daily Accountability
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Syllabus planning, morning setup, tracked habits, focus sessions, and night review loop.
          </p>
        </div>
        <button
          onClick={() => setHabitModalOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl text-white px-4 text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: GREEN }}
        >
          <Plus className="w-4 h-4" />
          Create Custom Habit
        </button>
      </div>

      {/* ─── Local Save Warning Banner ────────────────────────────────────────── */}
      {localSaveWarning && (
        <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{localSaveWarning}</span>
        </div>
      )}

      {/* ─── Summary Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Flame, label: "Current Streak", val: `${streak} Days`, color: GREEN },
          { icon: TrendingUp, label: "Today's Points", val: `${todayPoints} / ${totalPoints} Pts`, color: TEAL },
          { icon: Award, label: "Daily Score", val: `${dailyDisciplineScore.toFixed(1)} / 4.0`, color: GOLD },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold tracking-tight">{s.val}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Main Grid Layout ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Accountability plan & list) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Habits card */}
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  Today's Habits
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {completedHabits.length} / {habits.length} Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map((habit) => {
                const Icon = getHabitIcon(habit.habitType);
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                      habit.isCompletedToday
                        ? "border-green-500 bg-green-500/10 text-foreground"
                        : "border-border bg-card/50 hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        habit.isCompletedToday ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{habit.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {habit.description || `${habit.targetMinutes} mins · ${habit.reminderTime}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className={`text-xs font-bold ${
                          habit.isCompletedToday ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                        }`}
                      >
                        +{habit.points} pts
                      </span>
                      {habit.isCompletedToday ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Morning Plan card */}
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-muted-foreground" />
              Morning Strategy & Target
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Primary Focus</span>
                <p className="text-sm font-semibold text-foreground truncate">{morningPlan.primaryFocusSubject}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Plan Hours</span>
                <p className="text-sm font-semibold text-foreground">{morningPlan.plannedHours} hrs</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Accountability Checklist</span>
                <p className="text-sm font-semibold text-foreground">
                  {morningPlan.tasksCompleted} / {morningPlan.tasksPlanned} Tasks Completed
                </p>
              </div>
            </div>

            {/* Study Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Focus Hours Progress</span>
                <span className="text-foreground">
                  {morningPlan.actualHours} / {morningPlan.plannedHours} hrs (
                  {Math.round((morningPlan.actualHours / morningPlan.plannedHours) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    background: GREEN,
                    width: `${Math.min((morningPlan.actualHours / morningPlan.plannedHours) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Focus Sessions list */}
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Focus Sessions
            </h2>
            <div className="space-y-2">
              {focusSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/30"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{session.topic}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{session.plannedMinutes} mins planned</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      session.status === "completed"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : session.status === "active"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 animate-pulse"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns (Streak, chart, night review) */}
        <div className="space-y-6">
          {/* Streak Qualification Card */}
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Streak Qualification
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {isStreakQualified ? "Qualified" : "Disqualified"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requires 75%+ habits done & score ≥ 3.0
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${
                  isStreakQualified ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {isStreakQualified ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {/* Night Review Card */}
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              Night Review
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`font-semibold ${
                    nightReview.submitted ? "text-green-500" : "text-yellow-500"
                  }`}
                >
                  {nightReview.submitted ? "Submitted" : "Pending Submission"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reviewing blockers, tomorrow's study priorities, and daily logs to conclude the loop.
              </p>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="w-full h-10 mt-2 font-semibold text-xs rounded-xl border border-border bg-muted hover:bg-muted/75 text-foreground transition"
              >
                {nightReview.submitted ? "Edit Night Review" : "Start Night Review"}
              </button>
            </div>
          </div>

          {/* Score Trend Chart */}
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-bold text-sm text-foreground mb-4">Discipline Score Trend</h2>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 4]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(0, 158, 44, 0.05)" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontSize: 10 }}
                    itemStyle={{ color: GREEN, fontSize: 10 }}
                  />
                  <Bar dataKey="score" fill={GREEN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 7-Day History Table ──────────────────────────────────────────────── */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="font-bold text-lg text-foreground mb-4">7-Day Accountability History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground text-center">Topic Study</th>
                <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground text-center">Daily Quiz</th>
                <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground text-center">Newspaper</th>
                <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground text-center">Exercise</th>
                <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {history.map((day, index) => (
                <tr key={index} className="border-b border-border/55 last:border-none">
                  <td className="py-3 px-3 text-xs font-medium text-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {day.study ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {day.test ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {day.read ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {day.exec ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-bold text-xs ${
                        day.score >= 3.0
                          ? "text-green-600 dark:text-green-400"
                          : day.score >= 2.0
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-500"
                      }`}
                    >
                      {day.score.toFixed(1)} / 4
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL DIALOGS ───────────────────────────────────────────────────── */}
      
      {/* Create Custom Habit Modal */}
      <Dialog open={habitModalOpen} onOpenChange={(open) => !open && setHabitModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Create Custom Habit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCustomHabit} className="space-y-3.5 mt-2">
            <Field label="Title (Max 150 characters)" name="title" placeholder="Daily CSAT Practice" />
            <TextArea label="Description (Max 500 characters)" name="description" placeholder="Attempt 5 practice questions." />
            
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Habit Type</span>
                <select
                  name="habitType"
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                >
                  <option value="Study">Study</option>
                  <option value="Revision">Revision</option>
                  <option value="Reading">Reading</option>
                  <option value="MockTest">Mock Test</option>
                  <option value="CurrentAffairs">Current Affairs</option>
                  <option value="Exercise">Exercise</option>
                  <option value="Meditation">Meditation</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Custom">Custom</option>
                </select>
              </label>
              
              <Field label="Reminder (HH:mm)" name="reminderTime" placeholder="07:30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Target Minutes (0-1440)" name="targetMinutes" type="number" min={0} max={1440} placeholder="30" />
              <Field label="Points (0-100)" name="points" type="number" min={0} max={100} placeholder="10" />
            </div>

            <div className="flex items-center gap-2 py-1.5">
              <input type="checkbox" name="isReminderEnabled" id="isReminderEnabled" className="w-4 h-4 rounded text-green-600 focus:ring-green-500" defaultChecked />
              <label htmlFor="isReminderEnabled" className="text-xs font-semibold text-muted-foreground select-none">
                Enable reminder notifications
              </label>
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setHabitModalOpen(false)}
                className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-4 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                style={{ background: GREEN }}
              >
                Save Habit
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Start Night Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={(open) => !open && setReviewModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Daily Night Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNightReview} className="space-y-4 mt-2">
            <TextArea
              label="What tasks did you complete today?"
              name="completedTasks"
              placeholder="e.g. Completed History chapter 4, Quiz 12, Physical exercise..."
            />
            <TextArea
              label="Describe any blockers or study distractions faced today"
              name="blockers"
              placeholder="e.g. spent extra time researching options instead of studying"
            />
            <Field
              label="Tomorrow's first action item"
              name="tomorrowFirstAction"
              placeholder="e.g. Attempt UPSC Prelims test first thing at 8 AM"
            />
            <Field
              label="Productivity Rating (1 - 10)"
              name="productivityScore"
              type="number"
              min={1}
              max={10}
              placeholder="8"
            />

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-4 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                style={{ background: GREEN }}
              >
                Submit Review
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Local UI Helper Components ──────────────────────────────────────────────

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = true,
  min,
  max,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: "text" | "number";
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: string | number;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
  required = true,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="min-h-20 w-full rounded-xl border border-input bg-background text-foreground px-3 py-2 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
      />
    </label>
  );
}
