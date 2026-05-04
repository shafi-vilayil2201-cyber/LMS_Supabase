import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { getDailyHabits } from "../../services/db";
import { BookOpen, FileText, Dumbbell, CheckCircle, XCircle, Flame, TrendingUp, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

const habitDefs = [
  { key: "topicCompleted", label: "Topic Study", sub: "Watch lecture + read notes", icon: BookOpen, pts: 10, color: NAVY },
  { key: "quizAttended", label: "Daily Quiz", sub: "10-question practice quiz", icon: FileText, pts: 10, color: TEAL },
  { key: "newspaperRead", label: "Newspaper Reading", sub: "Mark 5+ headlines", icon: FileText, pts: 10, color: SAFFRON },
  { key: "exerciseDone", label: "Exercise", sub: "30+ minutes physical activity", icon: Dumbbell, pts: 10, color: GOLD },
];

export default function DailyHabitsPage() {
  const { currentUser } = useAuthStore();
  const { toast } = useToast();
  const [habits, setHabits] = useState<any[]>([]);
  const [todayChecked, setTodayChecked] = useState<Record<string, boolean>>({
    topicCompleted: false, quizAttended: false, newspaperRead: false, exerciseDone: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyHabits().then((h) => {
      const userHabits = h.filter((x: any) => x.userId === currentUser?.id).slice(0, 7);
      setHabits(userHabits);
      const today = userHabits[0];
      if (today) {
        setTodayChecked({
          topicCompleted: today.topicCompleted,
          quizAttended: today.quizAttended,
          newspaperRead: today.newspaperRead,
          exerciseDone: today.exerciseDone,
        });
      }
      setLoading(false);
    });
  }, [currentUser]);

  const toggleHabit = (key: string) => {
    setTodayChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const todayScore = Object.values(todayChecked).filter(Boolean).length * 10;
  const todayDisciplineScore = (todayScore / 40) * 4;

  function handleSubmit() {
    toast({ title: "Habits saved!", description: `Today's discipline score: ${todayDisciplineScore.toFixed(1)} / 4` });
  }

  const chartData = habits.slice(0, 7).reverse().map((h, i) => ({
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(h.date).getDay()],
    score: h.disciplineScore,
    max: 4,
  }));

  const streak = currentUser?.studyStreak ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Daily Habit Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your daily discipline — 40% of your weekly review score</p>
      </div>

      {/* Streak + Score */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Flame, label: "Current Streak", val: `${streak} days`, color: SAFFRON },
          { icon: TrendingUp, label: "Today's Score", val: `${todayScore} / 40 pts`, color: TEAL },
          { icon: Award, label: "Discipline Rating", val: `${todayDisciplineScore.toFixed(1)} / 4`, color: GOLD },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-5 text-center">
              <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3"
                style={{ background: `${s.color}18` }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>{s.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Today's Checklist */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>
            Today's Habits — {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
          </h2>
          <div className="text-xs text-muted-foreground">{Object.values(todayChecked).filter(Boolean).length}/4 completed</div>
        </div>
        <div className="space-y-3 mb-6">
          {habitDefs.map((h) => {
            const Icon = h.icon;
            const done = todayChecked[h.key];
            return (
              <div key={h.key} data-testid={`habit-row-${h.key}`}
                onClick={() => toggleHabit(h.key)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                  done ? "border-green-200 bg-green-50" : "border-border hover:bg-muted/30"}`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? "#22c55e" : `${h.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: done ? "white" : h.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: NAVY }}>{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.sub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold" style={{ color: done ? "#16a34a" : "#9ca3af" }}>+{h.pts} pts</span>
                  {done
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm font-semibold" style={{ color: NAVY }}>Discipline Score</p>
            <p className="text-xs text-muted-foreground">Contributes {todayDisciplineScore.toFixed(2)} pts to weekly review</p>
          </div>
          <button onClick={handleSubmit} data-testid="button-save-habits"
            className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: SAFFRON }}>
            Save Today's Habits
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-bold text-base mb-5" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>7-Day Habit History</h2>
        {habits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-habit-history">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Date</th>
                  {habitDefs.map((h) => (
                    <th key={h.key} className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">{h.label.split(" ")[0]}</th>
                  ))}
                  <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {habits.map((h) => (
                  <tr key={h.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">
                      {new Date(h.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    {["topicCompleted", "quizAttended", "newspaperRead", "exerciseDone"].map((k) => (
                      <td key={k} className="text-center py-2.5 px-3">
                        {(h as any)[k]
                          ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          : <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                      </td>
                    ))}
                    <td className="text-center py-2.5 px-3">
                      <span className="font-bold text-xs" style={{ color: h.disciplineScore >= 3 ? "#16a34a" : h.disciplineScore >= 2 ? GOLD : "#dc2626" }}>
                        {h.disciplineScore}/4
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-muted-foreground text-center py-8">No habit history found.</p>}
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-bold text-base mb-5" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Discipline Score Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v} pts`, "Score"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }} />
              <Bar dataKey="score" fill={SAFFRON} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
