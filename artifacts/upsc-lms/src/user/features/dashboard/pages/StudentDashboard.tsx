import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { getAnnouncements, getDailyHabits, getSessions, getWeeklyBlocks, getCourses, getLeaderboard } from "@/shared/services/db";
import { Flame, Trophy, BookOpen, Clock, CheckCircle, Lock, Calendar, Users, ChevronRight, TrendingUp, Star, AlertCircle } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

export default function StudentDashboard() {
  const { currentUser } = useAuthStore();
  const [, setLocation] = useLocation();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [todayHabits, setTodayHabits] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentWeekBlock, setCurrentWeekBlock] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ann, habits, sess, blocks, courses, lb] = await Promise.all([
        getAnnouncements(), getDailyHabits(), getSessions(), getWeeklyBlocks(), getCourses(), getLeaderboard()
      ]);
      setAnnouncements(ann.filter((a: any) => a.isActive).slice(0, 3));
      const today = habits.find((h: any) => h.userId === currentUser?.id);
      setTodayHabits(today);
      setSessions(sess.filter((s: any) => s.studentId === currentUser?.id && s.status === "Booked").slice(0, 3));
      const localEnrolled = JSON.parse(localStorage.getItem("igen-local-enrolled") || "[]");
      const dbEnrolled = Array.isArray(currentUser?.enrolledCourses) ? currentUser.enrolledCourses : [];
      const enrolledIds = [...new Set([...dbEnrolled, ...localEnrolled])];
      
      const currentWeek = blocks.find((b: any) => enrolledIds.includes(b.courseId) && b.weekNumber === (currentUser?.currentWeek || 12)) || blocks.find((b: any) => b.courseId === "c1" && b.weekNumber === 12);
      setCurrentWeekBlock(currentWeek);
      const enrolled = courses.filter((c: any) => enrolledIds.includes(c.id));
      setEnrolledCourses(enrolled);
      setLeaderboard(lb.slice(0, 5));
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const habitItems = [
    { key: "topicCompleted", label: "Topic Study", points: 10, icon: BookOpen },
    { key: "quizAttended", label: "Daily Quiz", points: 10, icon: CheckCircle },
    { key: "newspaperRead", label: "Newspaper Reading", points: 10, icon: AlertCircle },
    { key: "exerciseDone", label: "Exercise", points: 10, icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-6">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2545 100%)` }}>
        <div className="absolute right-6 top-4 opacity-10">
          <Trophy className="w-24 h-24" />
        </div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-white/60 text-sm">{greeting()},</p>
            <h1 className="text-2xl font-bold mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{currentUser?.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: `${SAFFRON}30`, color: SAFFRON }}>
                <Flame className="w-3.5 h-3.5" />
                {currentUser?.studyStreak} day streak
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: `${GOLD}25`, color: GOLD }}>
                <Trophy className="w-3.5 h-3.5" />
                Rank #{currentUser?.rank}
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-white/40 text-xs">Current Week</p>
            <p className="text-3xl font-bold mt-0.5" style={{ color: SAFFRON, fontFamily: "Inter, sans-serif" }}>W{currentUser?.currentWeek}</p>
            <p className="text-white/50 text-xs mt-0.5">Month {currentUser?.currentMonth} of 12</p>
          </div>
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div key={a.id} data-testid={`card-announcement-${a.id}`}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border bg-white">
              <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold mt-0.5"
                style={a.type === "Important" ? { background: "#fef2f2", color: "#dc2626" } :
                  a.type === "Event" ? { background: `${TEAL}15`, color: TEAL } : { background: `${SAFFRON}15`, color: SAFFRON }}>
                {a.type}
              </span>
              <p className="text-sm text-foreground flex-1">{a.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Today's Habits */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Today's Discipline Habits</h2>
          <button onClick={() => setLocation("/habits")} data-testid="link-view-habits"
            className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {habitItems.map((h) => {
            const Icon = h.icon;
            const done = todayHabits ? (todayHabits as any)[h.key] : false;
            return (
              <div key={h.key} data-testid={`card-habit-${h.key}`}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? "border-green-200 bg-green-50" : "border-border bg-muted/30"}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500" : "bg-muted"}`}>
                  <Icon className={`w-4 h-4 ${done ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: NAVY }}>{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.points} pts</p>
                </div>
                {done && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
        {todayHabits && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Today's discipline score</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(todayHabits.disciplineScore / 4) * 100}%`, background: SAFFRON }} />
              </div>
              <span className="text-sm font-bold" style={{ color: NAVY }}>{todayHabits.disciplineScore} / 4</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Week */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Current Week</h2>
            <button onClick={() => setLocation("/courses")} data-testid="link-view-course"
              className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
              Open Course <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {currentWeekBlock ? (
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ background: NAVY }}>W{currentWeekBlock.weekNumber}</div>
                <div>
                  <p className="font-semibold" style={{ color: NAVY }}>{currentWeekBlock.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Month {currentWeekBlock.monthNumber} · {currentWeekBlock.topics.length} topics</p>
                </div>
                <span className="ml-auto text-xs px-2 py-1 rounded-full font-semibold"
                  style={currentWeekBlock.status === "in_review"
                    ? { background: `${GOLD}20`, color: GOLD }
                    : { background: `${TEAL}20`, color: TEAL }}>
                  {currentWeekBlock.status === "in_review" ? "In Review" : "Active"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {currentWeekBlock.topics.map((t: string) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
              {currentWeekBlock.status === "in_review" && (
                <div className="rounded-xl p-4 border flex items-center justify-between"
                  style={{ background: `${SAFFRON}08`, borderColor: `${SAFFRON}40` }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: NAVY }}>Weekly Review Scheduled</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Dr. Ramesh Kumar · April 21, 5:00 PM</p>
                  </div>
                  <button data-testid="button-join-review"
                    className="text-xs px-4 py-2 rounded-lg text-white font-semibold"
                    style={{ background: SAFFRON }}>Join</button>
                </div>
              )}
              <div className="mt-4 p-3 rounded-xl flex items-center gap-3 bg-muted/40 border border-border">
                <Lock className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Score needed to unlock Week {currentWeekBlock.weekNumber + 1}</span>
                    <span className="font-semibold" style={{ color: NAVY }}>
                      {currentWeekBlock.disciplineScore ?? 0} / 7.5
                    </span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(((currentWeekBlock.disciplineScore ?? 0) / 7.5) * 100, 100)}%`,
                      background: SAFFRON
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active week found.</p>
          )}
        </div>

        {/* Leaderboard snapshot */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Leaderboard</h2>
            <button onClick={() => setLocation("/leaderboard")} data-testid="link-leaderboard"
              className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
              Full <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, i) => {
              const isMe = entry.userId === currentUser?.id;
              const rankColors = [GOLD, "#C0C0C0", "#CD7F32"];
              return (
                <div key={entry.userId}
                  data-testid={`row-leaderboard-${entry.userId}`}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isMe ? "border-2" : "border border-border"}`}
                  style={isMe ? { borderColor: SAFFRON, background: `${SAFFRON}08` } : {}}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={i < 3 ? { background: rankColors[i], color: "white" } : { background: "#e5e7eb", color: "#374151" }}>
                    {entry.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: NAVY }}>{isMe ? "You" : entry.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.city}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: isMe ? SAFFRON : NAVY }}>{entry.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Courses</h2>
          <button onClick={() => setLocation("/courses")} data-testid="link-all-courses"
            className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
            All Courses <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl space-y-3 bg-muted/10">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground opacity-60" />
            <p className="text-sm font-semibold text-foreground">You are not enrolled in any UPSC courses yet.</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Unlock your structured daily roadmap, live mentor reviews, and Duolingo-style study paths today.
            </p>
            <button
              onClick={() => setLocation("/courses")}
              className="inline-flex h-9 items-center justify-center rounded-xl text-white px-5 text-xs font-bold hover:opacity-95 transition"
              style={{ background: SAFFRON }}
            >
              Browse & Enroll Now
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {enrolledCourses.map((course, i) => {
              const gradients = [
                `linear-gradient(135deg, ${NAVY} 0%, #1a3a6e 100%)`,
                `linear-gradient(135deg, ${TEAL} 0%, #0f5a67 100%)`,
              ];
              const progress = course.durationWeeks
                ? Math.min(Math.round(((currentUser?.currentWeek || 1) / course.durationWeeks) * 100), 100)
                : (i === 0 ? 35 : 60);
              return (
                <div key={course.id} data-testid={`card-course-${course.id}`}
                  className="rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/courses/${course.id}`)}>
                  <div className="h-24 flex items-end p-4" style={{ background: gradients[i % 2] }}>
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded-full text-white/80 bg-white/10 font-medium">{course.category}</span>
                      <p className="text-white font-semibold text-sm mt-1 leading-tight line-clamp-1">{course.title}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{course.instructor}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: GOLD }} fill={GOLD} />{course.rating}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold" style={{ color: NAVY }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${progress}%`, background: SAFFRON }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Upcoming Sessions</h2>
            <button onClick={() => setLocation("/sessions")} data-testid="link-all-sessions"
              className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
              All Sessions <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} data-testid={`card-session-${s.id}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${TEAL}18` }}>
                  <Calendar className="w-5 h-5" style={{ color: TEAL }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{s.type}</p>
                  <p className="text-xs text-muted-foreground">{s.subject} · {new Date(s.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${SAFFRON}15`, color: SAFFRON }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
