import { useEffect, useState } from "react";
import { getLeaderboard } from "@/shared/services/db";
import { Trophy, Flame, Star, AlertTriangle } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";

export default function LeaderboardControlPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { getLeaderboard().then((lb) => { setLeaderboard(lb); setLoading(false); }); }, []);

  function handleDisqualify(userId: string, name: string) {
    setLeaderboard((prev) => prev.filter((e) => e.userId !== userId));
    toast({ title: "Student removed from leaderboard", description: `${name} has been disqualified for this period.`, variant: "destructive" });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Leaderboard Control</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor rankings, manage disputes, and ensure fair scoring</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-900">
          Leaderboard resets every Monday at 12:00 AM IST. Current period ends in <strong>3 days</strong>.
        </p>
      </div>

      {loading ? <Skeleton className="h-64 rounded-2xl" /> : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border" style={{ background: `${NAVY}05` }}>
            <p className="font-semibold text-sm" style={{ color: NAVY }}>Current Rankings ({leaderboard.length} students)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-leaderboard-control">
              <thead className="border-b border-border">
                <tr>
                  {["Rank", "Student", "City", "Score", "Streak", "Badge", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((entry, i) => {
                  const rankColors = [GOLD, "#C0C0C0", "#CD7F32"];
                  return (
                    <tr key={entry.userId} data-testid={`row-lb-${entry.userId}`} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={i < 3 ? { background: rankColors[i], color: "white" } : { background: "#f3f4f6", color: "#374151" }}>
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: NAVY }}>{entry.name?.charAt(0)}</div>
                          <span className="text-sm font-semibold" style={{ color: NAVY }}>{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{entry.city}</td>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color: NAVY }}>{entry.score}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" style={{ color: SAFFRON }} />
                          <span className="text-sm">{entry.streak}d</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {entry.badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${SAFFRON}15`, color: SAFFRON }}>{entry.badge}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDisqualify(entry.userId, entry.name)}
                          data-testid={`button-disqualify-${entry.userId}`}
                          className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium">
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
