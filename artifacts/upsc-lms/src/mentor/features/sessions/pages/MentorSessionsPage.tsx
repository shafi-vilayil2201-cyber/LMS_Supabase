import { useEffect, useState } from "react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { getSessions, getUsers } from "@/shared/services/db";
import { Calendar, Clock, ExternalLink, CheckCircle, Video } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const TEAL = "#1A7F8E";
const GOLD = "#009E2C";

export default function MentorSessionsPage() {
  const { currentUser } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, any>>({});
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sess, users] = await Promise.all([getSessions(), getUsers()]);
      setSessions(sess.filter((s: any) => s.mentorId === currentUser?.id));
      const m: Record<string, any> = {};
      users.filter((u: any) => u.role === "student").forEach((u: any) => { m[u.id] = u; });
      setStudentsMap(m);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const filtered = sessions.filter((s) =>
    tab === "upcoming" ? ["Booked", "Scheduled"].includes(s.status) : s.status === "Completed"
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Sessions</h1>

      <div className="flex gap-1 border-b border-border">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`tab-${t}`}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "upcoming" ? "Upcoming" : "Completed"}
          </button>
        ))}
      </div>

      {loading ? <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div> :
        filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border text-muted-foreground">
            <Video className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No {tab} sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => {
              const student = studentsMap[s.studentId];
              return (
                <div key={s.id} data-testid={`card-session-${s.id}`}
                  className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: NAVY }}>{student?.name?.charAt(0) ?? "S"}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm" style={{ color: NAVY }}>{student?.name ?? "Student"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.type} · {s.subject}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={s.status === "Completed" ? { background: "#f0fdf4", color: "#16a34a" } : { background: `${SAFFRON}15`, color: SAFFRON }}>
                          {s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                          {new Date(s.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                          {new Date(s.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          {" · "}{s.durationMins} min
                        </span>
                      </div>
                    </div>
                  </div>
                  {s.status !== "Completed" && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <a href={s.meetLink} target="_blank" rel="noreferrer"
                        data-testid={`button-join-${s.id}`}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-xs font-semibold"
                        style={{ background: TEAL }}>
                        <ExternalLink className="w-3 h-3" /> Join Session
                      </a>
                    </div>
                  )}
                  {s.status === "Completed" && s.feedback && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">Student feedback: <em>"{s.feedback}"</em></p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
