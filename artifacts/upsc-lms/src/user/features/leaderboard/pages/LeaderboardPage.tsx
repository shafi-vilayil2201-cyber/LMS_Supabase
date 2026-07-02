import { useEffect, useState } from "react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { getLeaderboard } from "@/shared/services/db";
import { Trophy, Flame, TrendingUp, TrendingDown, Minus, Award } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

const badges = [
  { name: "7-Day Streak", color: SAFFRON, desc: "7 consecutive days of 100% daily habits" },
  { name: "News Ninja", color: "#1A7F8E", desc: "30 days of newspaper reading" },
  { name: "Prelims Ace", color: "#7c3aed", desc: "Score >90% in 5 consecutive objective sessions" },
  { name: "Mains Maven", color: "#0891b2", desc: "Excellent feedback in 4 consecutive writing sessions" },
  { name: "Rising Star", color: "#16a34a", desc: "Enter top 50 leaderboard for the first time" },
  { name: "Course Completer", color: GOLD, desc: "Complete all 52 weeks of the full-year course" },
];

export default function LeaderboardPage() {
  const { currentUser } = useAuthStore();
  const [board, setBoard] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "month" | "week">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then((lb) => { setBoard(lb); setLoading(false); });
  }, []);

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);
  const podiumColors = [GOLD, "#C0C0C0", "#CD7F32"];
  const podiumSizes = ["h-28", "h-20", "h-16"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Top aspirants ranked by cumulative score across reviews, habits, and quizzes</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "month", "week"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} data-testid={`button-filter-${f}`}
            className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize border transition-all"
            style={filter === f ? { background: NAVY, color: "white", borderColor: NAVY } : { background: "white", color: "#374151", borderColor: "#e5e7eb" }}>
            {f === "all" ? "All Time" : f === "month" ? "This Month" : "This Week"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          {/* Podium */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <h2 className="font-bold text-sm text-center mb-8 text-muted-foreground uppercase tracking-wide">Top 3 Aspirants</h2>
            <div className="flex items-end justify-center gap-4">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, pi) => {
                const rankOrder = pi === 0 ? 2 : pi === 1 ? 1 : 3;
                const color = podiumColors[rankOrder - 1];
                const isMe = entry.userId === currentUser?.id;
                return (
                  <div key={entry.userId} data-testid={`podium-rank-${rankOrder}`}
                    className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg border-4"
                      style={{ background: NAVY, borderColor: color }}>
                      {entry.name.charAt(0)}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold" style={{ color: NAVY }}>{isMe ? "You" : entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.city}</p>
                      <p className="text-xs font-bold mt-0.5" style={{ color }}>{entry.score}</p>
                    </div>
                    <div className={`w-full ${podiumSizes[rankOrder - 1]} rounded-t-xl flex items-center justify-center`}
                      style={{ background: color }}>
                      <span className="text-white font-bold text-lg">#{rankOrder}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Table */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-bold text-sm" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Full Rankings</h2>
            </div>
            <div className="divide-y divide-border">
              {board.map((entry) => {
                const isMe = entry.userId === currentUser?.id;
                const rankColors = [GOLD, "#C0C0C0", "#CD7F32"];
                const isTop3 = entry.rank <= 3;
                return (
                  <div key={entry.userId} data-testid={`row-lb-${entry.userId}`}
                    className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${isMe ? "" : "hover:bg-muted/30"}`}
                    style={isMe ? { background: `${SAFFRON}08`, borderLeft: `3px solid ${SAFFRON}` } : {}}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={isTop3 ? { background: rankColors[entry.rank - 1], color: "white" } : { background: "#f3f4f6", color: "#374151" }}>
                      {entry.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: NAVY }}>{entry.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: NAVY }}>{isMe ? `${entry.name} (You)` : entry.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{entry.city}</span>
                        <span className="flex items-center gap-0.5 text-xs" style={{ color: SAFFRON }}>
                          <Flame className="w-3 h-3" />{entry.streak}d
                        </span>
                      </div>
                    </div>
                    {entry.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block"
                        style={{ background: `${SAFFRON}15`, color: SAFFRON }}>{entry.badge}</span>
                    )}
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: isMe ? SAFFRON : NAVY }}>{entry.score}</p>
                      {entry.weeklyChange !== undefined && (
                        <div className="flex items-center justify-end gap-0.5 mt-0.5">
                          {entry.weeklyChange > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> :
                            entry.weeklyChange < 0 ? <TrendingDown className="w-3 h-3 text-red-400" /> :
                              <Minus className="w-3 h-3 text-muted-foreground" />}
                          <span className={`text-xs font-medium ${entry.weeklyChange > 0 ? "text-green-500" : entry.weeklyChange < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                            {Math.abs(entry.weeklyChange)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Legend */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-bold text-base mb-4" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Badges & Achievements</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {badges.map((b) => (
                <div key={b.name} className="flex items-start gap-3 p-3 rounded-xl border border-border">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${b.color}20` }}>
                    <Award className="w-4 h-4" style={{ color: b.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: NAVY }}>{b.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
