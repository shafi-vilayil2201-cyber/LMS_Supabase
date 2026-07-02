import { useEffect, useState } from "react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { getSessions, getWeeklyReviews, getUsers } from "@/shared/services/db";
import { Calendar, Users, Star, FileText, ChevronRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

export default function MentorDashboard() {
  const { currentUser } = useAuthStore();
  const [, setLocation] = useLocation();
  const [sessions, setSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sess, rev, users] = await Promise.all([getSessions(), getWeeklyReviews(), getUsers()]);
      const mentorSessions = sess.filter((s: any) => s.mentorId === currentUser?.id);
      setSessions(mentorSessions.filter((s: any) => s.status === "Booked").slice(0, 5));
      const pendingReviews = rev.filter((r: any) => r.mentorId === currentUser?.id && r.status === "Scheduled");
      setReviews(pendingReviews.slice(0, 5));
      const sMap: Record<string, any> = {};
      users.filter((u: any) => u.role === "student").forEach((u: any) => { sMap[u.id] = u; });
      setStudentsMap(sMap);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const stats = [
    { icon: Calendar, label: "Upcoming Sessions", val: sessions.length, color: TEAL },
    { icon: FileText, label: "Pending Reviews", val: reviews.length, color: SAFFRON },
    { icon: Star, label: "Average Rating", val: `${currentUser?.rating ?? "—"}`, color: GOLD },
    { icon: Users, label: "Students Guided", val: currentUser?.studentsGuided ?? 0, color: NAVY },
  ];

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 rounded-2xl" /><div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>
          Welcome, {currentUser?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}
              className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>{s.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Upcoming Sessions</h2>
            <button onClick={() => setLocation("/mentor/sessions")} data-testid="link-all-sessions"
              className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No upcoming sessions.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const student = studentsMap[s.studentId];
                return (
                  <div key={s.id} data-testid={`card-session-${s.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: NAVY }}>{student?.name?.charAt(0) ?? "S"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{student?.name ?? "Student"}</p>
                      <p className="text-xs text-muted-foreground">{s.type} · {s.subject}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                      <p>{new Date(s.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                      <p>{new Date(s.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Queue */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Review Queue</h2>
            <button onClick={() => setLocation("/mentor/reviews")} data-testid="link-all-reviews"
              className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60" />
              <p className="text-sm text-muted-foreground">No pending reviews. Great work!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => {
                const student = studentsMap[r.studentId];
                return (
                  <div key={r.id} data-testid={`card-review-${r.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${SAFFRON}15` }}>
                      <AlertCircle className="w-4 h-4" style={{ color: SAFFRON }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{student?.name ?? "Student"}</p>
                      <p className="text-xs text-muted-foreground">Week {r.weekNumber} · Discipline: {r.disciplineScore}/4</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ background: `${SAFFRON}15`, color: SAFFRON }}>Pending</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Expertise */}
      {currentUser?.expertise && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-bold text-base mb-4" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Expertise Areas</h2>
          <div className="flex flex-wrap gap-2">
            {currentUser.expertise.map((e: string) => (
              <span key={e} className="px-3 py-1.5 rounded-xl text-sm font-medium border border-border"
                style={{ background: `${TEAL}12`, color: TEAL }}>{e}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
