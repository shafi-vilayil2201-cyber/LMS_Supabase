import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { getWeeklyBlocks, getCourses } from "../../services/db";
import { ChevronLeft, CheckCircle, Lock, BookOpen, FileText, Calendar, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

const dailyTasks = [
  { day: "Monday", topic: "Read + watch lecture", quiz: "10 MCQs", notes: "Submit summary" },
  { day: "Tuesday", topic: "Deep dive + mapping", quiz: "10 MCQs", notes: "Case study" },
  { day: "Wednesday", topic: "Previous year questions", quiz: "10 MCQs", notes: "Answer writing" },
  { day: "Thursday", topic: "Revision + current events", quiz: "10 MCQs", notes: "News linkage" },
  { day: "Friday", topic: "Mock test + analysis", quiz: "Full test 50 MCQs", notes: "Error log" },
  { day: "Saturday", topic: "Comprehensive review", quiz: "20 MCQs", notes: "Mains practice" },
];

export default function WeeklyCoursePage() {
  const params = useParams<{ id: string; weekId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [block, setBlock] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [blocks, courses] = await Promise.all([getWeeklyBlocks(), getCourses()]);
      const b = blocks.find((wb: any) => wb.id === params.weekId);
      const c = courses.find((co: any) => co.id === params.id);
      setBlock(b); setCourse(c); setLoading(false);
    }
    load();
  }, [params.id, params.weekId]);

  function toggleTask(key: string) {
    setCompleted((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  }

  function handleBookReviewer() {
    toast({ title: "Review booking opened!", description: "Go to Mentors page to select your reviewer." });
    setLocation("/mentors");
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>;
  if (!block) return <div className="text-center py-20 text-muted-foreground">Week not found.</div>;

  const totalTasks = dailyTasks.length * 3;
  const pct = Math.round((completed.size / totalTasks) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => setLocation(`/courses/${params.id}`)} data-testid="button-back"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Course
      </button>

      {/* Week Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2545 100%)` }}>
        <div className="absolute right-6 top-4 opacity-10"><BookOpen className="w-28 h-28" /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/10 text-white/80">
              Week {block.weekNumber} · Month {block.monthNumber}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={block.status === "completed" ? { background: "#f0fdf4", color: "#16a34a" } :
                block.status === "in_review" ? { background: `${GOLD}30`, color: GOLD } : { background: "rgba(255,255,255,0.1)", color: "white/60" }}>
              {block.status === "in_review" ? "In Review" : block.status === "completed" ? "Completed" : "Active"}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif" }}>{block.title}</h1>
          <p className="text-white/60 text-sm">{course?.title}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {block.topics.map((t: string) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-white/80">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Score / unlock status */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold text-sm mb-4" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Week Review Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Discipline Score", val: block.disciplineScore ?? 0, max: 4, color: SAFFRON },
            { label: "Oral Interview", val: block.reviewScore ?? 0, max: 3, color: TEAL },
            { label: "Prelims MCQ", val: null, max: 3, color: GOLD },
            { label: "Mains Writing", val: null, max: 3, color: "#7c3aed" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-muted/40">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="font-bold" style={{ color: s.val != null ? NAVY : "#9ca3af", fontFamily: "Inter, sans-serif" }}>
                {s.val != null ? `${s.val}/${s.max}` : `—/${s.max}`}
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                <div className="h-full rounded-full" style={{ width: s.val != null ? `${(s.val / s.max) * 100}%` : "0%", background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl"
          style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}20` }}>
          <div>
            <p className="text-sm font-bold" style={{ color: NAVY }}>
              Total: {((block.disciplineScore ?? 0) + (block.reviewScore ?? 0)).toFixed(1)} / 10
            </p>
            <p className="text-xs text-muted-foreground">Need 7.5 to unlock Week {block.weekNumber + 1}</p>
          </div>
          {block.status !== "completed" && (
            <button onClick={handleBookReviewer} data-testid="button-book-reviewer"
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: SAFFRON }}>
              Book Reviewer
            </button>
          )}
          {block.status === "completed" && block.totalScore >= 7.5 && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
              <CheckCircle className="w-5 h-5" /> Unlocked!
            </div>
          )}
        </div>
      </div>

      {/* Daily Task Tracker */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-sm" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Weekly Task Tracker</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${SAFFRON}15`, color: SAFFRON }}>
            {completed.size}/{totalTasks} done · {pct}%
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-tasks">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Day</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5 inline" /> Topic
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">
                  <FileText className="w-3.5 h-3.5 inline" /> Quiz
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 inline" /> Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyTasks.map((task) => (
                <tr key={task.day} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-3 text-xs font-semibold" style={{ color: NAVY }}>{task.day}</td>
                  {[
                    { key: `${task.day}-topic`, desc: task.topic },
                    { key: `${task.day}-quiz`, desc: task.quiz },
                    { key: `${task.day}-notes`, desc: task.notes },
                  ].map((cell) => {
                    const done = completed.has(cell.key);
                    return (
                      <td key={cell.key} className="py-3 px-3 text-center">
                        <button onClick={() => toggleTask(cell.key)}
                          data-testid={`task-${cell.key}`}
                          className={`w-full py-1.5 px-2 rounded-lg text-xs transition-all border ${
                            done ? "border-green-200 bg-green-50 text-green-700" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"}`}>
                          {done ? <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-green-500" /> : null}
                          {done ? "Done" : cell.desc}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
