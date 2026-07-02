import { useEffect, useState } from "react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { getWeeklyReviews, getUsers, submitReviewScores } from "@/shared/services/db";
import { FileText, CheckCircle, Clock, Star } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

export default function MentorReviewsPage() {
  const { currentUser } = useAuthStore();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, any>>({});
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const [scores, setScores] = useState<Record<string, { oral: string; prelims: string; mains: string }>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [rev, users] = await Promise.all([getWeeklyReviews(), getUsers()]);
      setReviews(rev.filter((r: any) => r.mentorId === currentUser?.id));
      const m: Record<string, any> = {};
      users.forEach((u: any) => { m[u.id] = u; });
      setStudentsMap(m);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const filtered = reviews.filter((r) =>
    tab === "pending" ? r.status === "Scheduled" : r.status === "Completed"
  );

  function handleScoreChange(id: string, field: string, val: string) {
    setScores((prev) => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  }

  async function handleSubmitReview(review: any) {
    const s = scores[review.id];
    const fb = feedbacks[review.id] || "Great progress on your weekly syllabus topics. Keep up the good work!";
    if (!s?.oral || !s?.prelims || !s?.mains) {
      toast({ title: "Please enter all scores", variant: "destructive" });
      return;
    }

    try {
      const scoresPayload = {
        oralScore: s.oral,
        prelimScore: s.prelims,
        mainsScore: s.mains,
        disciplineScore: review.disciplineScore,
        reviewerFeedback: fb
      };

      const updated = await submitReviewScores(review.id, scoresPayload);
      toast({ title: "Review submitted!", description: `Total score: ${updated.totalScore}/10` });
      
      // Reload reviews
      const rev = await getWeeklyReviews();
      setReviews(rev.filter((r: any) => r.mentorId === currentUser?.id));
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message || "Database write error", variant: "destructive" });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Review Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">Weekly 60-minute review sessions — score students to unlock their next week</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["pending", "completed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`tab-${t}`}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "pending" ? "Pending Reviews" : "Completed"}
          </button>
        ))}
      </div>

      {loading ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div> :
        filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-500 opacity-60" />
            <p className="text-sm text-muted-foreground">{tab === "pending" ? "All reviews completed!" : "No completed reviews yet."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => {
              const student = studentsMap[review.studentId];
              const sc = scores[review.id] ?? { oral: "", prelims: "", mains: "" };
              const scoreFields = [
                { key: "oral", label: "Oral Interview", max: 3 },
                { key: "prelims", label: "Prelims MCQ", max: 3 },
                { key: "mains", label: "Mains Writing", max: 3 },
              ];
              return (
                <div key={review.id} data-testid={`card-review-${review.id}`}
                  className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ background: NAVY }}>{student?.name?.charAt(0) ?? "S"}</div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: NAVY }}>{student?.name ?? "Student"}</p>
                        <p className="text-xs text-muted-foreground">Week {review.weekNumber} · {review.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {review.status === "Completed" ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600">Completed</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${SAFFRON}15`, color: SAFFRON }}>
                          {new Date(review.scheduledDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Discipline score row */}
                  <div className="p-3 rounded-xl mb-3 flex items-center justify-between"
                    style={{ background: `${TEAL}10`, border: `1px solid ${TEAL}30` }}>
                    <p className="text-xs font-semibold" style={{ color: TEAL }}>Discipline Score (auto)</p>
                    <p className="text-sm font-bold" style={{ color: TEAL }}>{review.disciplineScore} / 4</p>
                  </div>

                  {review.status === "Scheduled" ? (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {scoreFields.map((f) => (
                          <div key={f.key}>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                              {f.label} (/{f.max})
                            </label>
                            <input type="number" min="0" max={f.max} step="0.5"
                              value={(sc as any)[f.key]}
                              onChange={(e) => handleScoreChange(review.id, f.key, e.target.value)}
                              data-testid={`input-score-${f.key}-${review.id}`}
                              placeholder={`0–${f.max}`}
                              className="w-full px-3 py-2 rounded-lg border border-border text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                        ))}
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Reviewer Feedback & Guidance
                        </label>
                        <textarea
                          value={feedbacks[review.id] || ""}
                          onChange={(e) => setFeedbacks((prev) => ({ ...prev, [review.id]: e.target.value }))}
                          placeholder="Provide conceptual notes, strengths, and improvement actions..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                        />
                      </div>
                      <button onClick={() => handleSubmitReview(review)}
                        data-testid={`button-submit-review-${review.id}`}
                        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                        style={{ background: SAFFRON }}>
                        Submit Review Scores
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Oral", val: review.oralScore, max: 3 },
                        { label: "Prelims", val: review.prelimsScore, max: 3 },
                        { label: "Mains", val: review.mainsScore, max: 3 },
                      ].map((f) => (
                        <div key={f.label} className="text-center p-3 rounded-xl bg-muted/40">
                          <p className="text-lg font-bold" style={{ color: NAVY }}>{f.val ?? "—"}/{f.max}</p>
                          <p className="text-xs text-muted-foreground">{f.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {review.status === "Completed" && review.totalScore != null && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <p className="text-sm font-semibold" style={{ color: NAVY }}>Total Score</p>
                      <p className="text-xl font-bold" style={{ color: review.totalScore >= 7.5 ? "#16a34a" : "#dc2626", fontFamily: "Inter, sans-serif" }}>
                        {review.totalScore} / 10
                        {review.totalScore >= 7.5
                          ? <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Passed</span>
                          : <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">Re-review needed</span>}
                      </p>
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
