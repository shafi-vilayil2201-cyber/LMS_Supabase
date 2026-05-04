import { useEffect, useState } from "react";
import { getUsers } from "../../services/db";
import { Flame, Search, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

type Risk = "Low" | "Medium" | "High";

function getRisk(student: any): Risk {
  if ((student.studyStreak ?? 0) < 3 || (student.totalScore ?? 0) < 50) return "High";
  if ((student.studyStreak ?? 0) < 7 || (student.totalScore ?? 0) < 70) return "Medium";
  return "Low";
}

const riskStyle: Record<Risk, { bg: string; text: string; icon: React.FC<any> }> = {
  Low: { bg: "#f0fdf4", text: "#16a34a", icon: TrendingUp },
  Medium: { bg: `${GOLD}20`, text: "#b45309", icon: Minus },
  High: { bg: "#fef2f2", text: "#dc2626", icon: TrendingDown },
};

export default function StudentAnalyticsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<Risk | "All">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then((users) => {
      setStudents(users.filter((u: any) => u.role === "student"));
      setLoading(false);
    });
  }, []);

  const filtered = students
    .filter((s) => riskFilter === "All" || getRisk(s) === riskFilter)
    .filter((s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = { Low: 0, Medium: 0, High: 0 };
  students.forEach((s) => counts[getRisk(s)]++);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Student Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor student progress, streak health, and dropout risk</p>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(["Low", "Medium", "High"] as Risk[]).map((risk) => {
          const s = riskStyle[risk];
          const Icon = s.icon;
          return (
            <button key={risk} onClick={() => setRiskFilter(riskFilter === risk ? "All" : risk)}
              data-testid={`button-risk-filter-${risk.toLowerCase()}`}
              className={`rounded-2xl p-4 border text-left transition-all ${riskFilter === risk ? "ring-2 ring-primary" : ""}`}
              style={{ background: s.bg, borderColor: s.text + "40" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: s.text }} />
                <span className="text-xs font-semibold" style={{ color: s.text }}>{risk} Risk</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>{counts[risk]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">students</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            data-testid="input-search"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} students</span>
      </div>

      {/* Table */}
      {loading ? <Skeleton className="h-64 rounded-2xl" /> : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-students">
              <thead className="border-b border-border" style={{ background: `${NAVY}05` }}>
                <tr>
                  {["Student", "Course", "Week", "Score", "Streak", "Habits", "Last Login", "Risk"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((student) => {
                  const risk = getRisk(student);
                  const rs = riskStyle[risk];
                  const RiskIcon = rs.icon;
                  const habitRate = Math.floor(Math.random() * 40) + 60;
                  return (
                    <tr key={student.id} data-testid={`row-student-${student.id}`} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: NAVY }}>{student.name?.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: NAVY }}>{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">Full Year UPSC</td>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color: NAVY }}>W{student.currentWeek}</td>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color: TEAL }}>{student.totalScore}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" style={{ color: SAFFRON }} />
                          <span className="text-sm font-semibold" style={{ color: NAVY }}>{student.studyStreak}d</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${habitRate}%`, background: habitRate >= 75 ? "#16a34a" : habitRate >= 50 ? GOLD : "#dc2626" }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{habitRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: rs.bg, color: rs.text }}>
                          <RiskIcon className="w-3 h-3" />{risk}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
