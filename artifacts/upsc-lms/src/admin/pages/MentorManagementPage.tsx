import { useEffect, useState } from "react";
import { getMentorApplications, getUsers } from "../../services/db";
import { CheckCircle, XCircle, Star, Users, Video, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

export default function MentorManagementPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [apps, users] = await Promise.all([getMentorApplications(), getUsers()]);
      setApplications(apps);
      setMentors(users.filter((u: any) => u.role === "mentor" && u.approvalStatus === "approved"));
      setLoading(false);
    }
    load();
  }, []);

  const pending = applications.filter((a) => a.status === "pending");
  const filteredMentors = mentors.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.expertise?.some((e: string) => e.toLowerCase().includes(search.toLowerCase()))
  );

  function handleApprove(id: string, name: string) {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
    toast({ title: "Mentor approved!", description: `${name} can now accept students.` });
  }

  function handleReject(id: string, name: string) {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));
    toast({ title: "Application rejected.", description: `${name}'s application has been declined.`, variant: "destructive" });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Mentor Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Review applications, manage approved mentors</p>
      </div>

      {/* Pending Applications */}
      {loading ? (
        <div className="space-y-3">{Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
      ) : pending.length > 0 && (
        <div>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: "#dc2626" }}>
              {pending.length}
            </span>
            Pending Applications
          </h2>
          <div className="space-y-3">
            {pending.map((app) => (
              <div key={app.id} data-testid={`card-application-${app.id}`}
                className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: NAVY }}>{app.name?.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: NAVY }}>{app.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.email}</p>
                      <p className="text-xs text-muted-foreground">{app.qualification} · {app.experience} experience</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {app.subjects?.map((s: string) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-md font-medium"
                            style={{ background: `${TEAL}15`, color: TEAL }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleReject(app.id, app.name)}
                      data-testid={`button-reject-${app.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                      <XCircle className="w-4 h-4 text-red-400" /> Reject
                    </button>
                    <button onClick={() => handleApprove(app.id, app.name)}
                      data-testid={`button-approve-${app.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ background: "#16a34a" }}>
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
                {app.bio && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">{app.bio}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Mentors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>
            Approved Mentors ({filteredMentors.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mentors..."
              data-testid="input-search-mentors"
              className="pl-8 pr-4 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white w-48" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full" data-testid="table-mentors">
              <thead className="border-b border-border" style={{ background: `${NAVY}05` }}>
                <tr>
                  {["Mentor", "Subjects", "Rating", "Sessions", "Students", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMentors.map((mentor) => (
                  <tr key={mentor.id} data-testid={`row-mentor-${mentor.id}`} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: NAVY }}>{mentor.name?.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: NAVY }}>{mentor.name}</p>
                          <p className="text-xs text-muted-foreground">{mentor.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise?.slice(0, 2).map((e: string) => (
                          <span key={e} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{e}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" fill={GOLD} stroke={GOLD} />
                        <span className="text-sm font-semibold" style={{ color: NAVY }}>{mentor.rating}</span>
                        <span className="text-xs text-muted-foreground">({mentor.totalReviews})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: NAVY }}>{mentor.totalSessions}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: NAVY }}>{mentor.studentsGuided}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600">Active</span>
                    </td>
                  </tr>
                ))}
                {filteredMentors.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No mentors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
