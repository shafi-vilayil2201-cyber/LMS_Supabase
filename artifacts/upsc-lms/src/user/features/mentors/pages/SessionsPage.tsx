import { useEffect, useState } from "react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { getSessions, getUsers, cancelSession, rateSession } from "@/shared/services/db";
import { Calendar, Video, Star, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

const typeColors: Record<string, { bg: string; text: string }> = {
  "Weekly Review": { bg: `${SAFFRON}15`, text: SAFFRON },
  "1-on-1 Clarification": { bg: `${TEAL}15`, text: TEAL },
  "Group Discussion": { bg: "#7c3aed20", text: "#7c3aed" },
  "Mock Interview": { bg: `${GOLD}20`, text: "#b45309" },
};

export default function SessionsPage() {
  const { currentUser } = useAuthStore();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [mentorsMap, setMentorsMap] = useState<Record<string, any>>({});
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);

  // Interactivity states
  const [ratingSession, setRatingSession] = useState<any | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [sess, users] = await Promise.all([getSessions(), getUsers()]);
      const userSessions = sess.filter((s: any) => s.studentId === currentUser?.id);
      setSessions(userSessions);
      const map: Record<string, any> = {};
      users.filter((u: any) => u.role === "mentor").forEach((m: any) => { map[m.id] = m; });
      setMentorsMap(map);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  async function refreshSessions() {
    setLoading(true);
    try {
      const sess = await getSessions();
      setSessions(sess.filter((s: any) => s.studentId === currentUser?.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(sessionId: string) {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;
    try {
      await cancelSession(sessionId);
      toast({ title: "Session Cancelled", description: "Your session slot has been cancelled." });
      refreshSessions();
    } catch (err: any) {
      toast({ title: "Cancellation failed", description: err.message || "Database write error", variant: "destructive" });
    }
  }

  async function submitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingSession) return;
    setRatingLoading(true);
    try {
      await rateSession(ratingSession.id, ratingStars, ratingFeedback);
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      setRatingSession(null);
      setRatingFeedback("");
      refreshSessions();
    } catch (err: any) {
      toast({ title: "Rating submission failed", description: err.message || "Database write error", variant: "destructive" });
    } finally {
      setRatingLoading(false);
    }
  }

  const filtered = sessions.filter((s) =>
    tab === "upcoming" ? ["Booked", "Scheduled"].includes(s.status) : s.status === "Completed"
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Sessions</h1>
        <p className="text-sm text-muted-foreground mt-1">Live 1-on-1 and group sessions with your mentors and reviewers</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`tab-${t}`}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "upcoming" ? "Upcoming" : "Past Sessions"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <Calendar className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No {tab} sessions found.</p>
          {tab === "upcoming" && (
            <p className="text-xs text-muted-foreground mt-1">Go to Mentors page to book a session.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
            const mentor = mentorsMap[session.mentorId];
            const tc = typeColors[session.type] ?? { bg: "#f3f4f6", text: "#374151" };
            const date = new Date(session.scheduledAt);
            return (
              <div key={session.id} data-testid={`card-session-${session.id}`}
                className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${TEAL}18` }}>
                    <Video className="w-5 h-5" style={{ color: TEAL }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-sm" style={{ color: NAVY }}>{session.type}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ background: tc.bg, color: tc.text }}>{session.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{session.subject}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {mentor && <span className="font-medium" style={{ color: NAVY }}>{mentor.name}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {date.toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "short" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        {" · "}{session.durationMins} min
                      </span>
                    </div>
                     {session.status === "Completed" && session.studentRating != null && session.feedback && (
                      <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3" fill={i < (session.studentRating ?? 0) ? GOLD : "none"} stroke={GOLD} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{session.feedback}"</p>
                      </div>
                    )}
                    {session.status === "Completed" && session.studentRating == null && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setRatingSession(session);
                            setRatingStars(5);
                            setRatingFeedback("");
                          }}
                          data-testid={`button-rate-${session.id}`}
                          className="px-4 py-1.5 rounded-lg border text-xs font-semibold hover:bg-muted transition-all"
                          style={{ color: TEAL, borderColor: TEAL }}
                        >
                          Rate Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {["Booked", "Scheduled"].includes(session.status) && (
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <a href={session.meetLink} target="_blank" rel="noreferrer"
                      data-testid={`button-join-${session.id}`}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90"
                      style={{ background: TEAL }}>
                      <ExternalLink className="w-3.5 h-3.5" /> Join Session
                    </a>
                    <button data-testid={`button-cancel-${session.id}`}
                      onClick={() => handleCancel(session.id)}
                      className="px-5 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-colors text-muted-foreground">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Session Rating Dialog */}
      <Dialog open={!!ratingSession} onOpenChange={(open) => !open && setRatingSession(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ color: NAVY }}>
              Rate Session
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Provide feedback for your session on "{ratingSession?.subject}"
            </p>
          </DialogHeader>

          <form onSubmit={submitRating} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: NAVY }}>Rating</label>
              <div className="flex items-center gap-1.5" data-testid="star-rating-container">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1;
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRatingStars(starVal)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className="w-8 h-8 cursor-pointer transition-colors"
                        fill={starVal <= ratingStars ? GOLD : "none"}
                        stroke={GOLD}
                        strokeWidth={2}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Feedback & Comments</label>
              <textarea
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                placeholder="What went well? How can the mentor improve?"
                rows={4}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRatingSession(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={ratingLoading}
                className="px-5 py-2 text-white text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: SAFFRON }}
              >
                {ratingLoading ? "Submitting..." : "Submit Review"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
