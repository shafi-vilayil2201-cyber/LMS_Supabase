import { useEffect, useState } from "react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { getSessions, getUsers } from "@/shared/services/db";
import { Flame, BookOpen, Trophy, Search } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

export default function MentorStudentsPage() {
  const { currentUser } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sess, users] = await Promise.all([getSessions(), getUsers()]);
      const myStudentIds = new Set(
        sess.filter((s: any) => s.mentorId === currentUser?.id).map((s: any) => s.studentId)
      );
      const myStudents = users.filter((u: any) => u.role === "student" && myStudentIds.has(u.id));
      setStudents(myStudents);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Students</h1>
        <p className="text-sm text-muted-foreground mt-1">Students who have had sessions with you</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or city..."
          data-testid="input-search"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
      </div>

      {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
        filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border text-muted-foreground text-sm">No students found.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-students">
                <thead className="border-b border-border" style={{ background: `${NAVY}05` }}>
                  <tr>
                    {["Student", "City", "Week", "Streak", "Score", "Rank"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((student) => (
                    <tr key={student.id} data-testid={`row-student-${student.id}`} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: NAVY }}>{student.name?.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: NAVY }}>{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{student.city}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold" style={{ color: NAVY }}>W{student.currentWeek}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" style={{ color: SAFFRON }} />
                          <span className="text-sm font-semibold" style={{ color: NAVY }}>{student.studyStreak}d</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color: TEAL }}>{student.totalScore}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" style={{ color: GOLD }} />
                          <span className="text-sm" style={{ color: NAVY }}>#{student.rank}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
