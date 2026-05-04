import { useEffect, useState } from "react";
import { getUsers } from "../../services/db";
import { Star, Users, Video, MessageSquare, ChevronRight, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

const subjectFilters = ["All", "History", "Polity", "Geography", "Economy", "Ethics", "Environment", "Security"];

export default function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getUsers().then((users) => {
      const approved = users.filter((u: any) => u.role === "mentor" && u.approvalStatus === "approved");
      setMentors(approved);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "All" ? mentors : mentors.filter((m) => m.expertise?.some((e: string) => e.includes(filter)));

  function handleBook(mentor: any) {
    toast({ title: "Booking request sent!", description: `${mentor.name} will confirm your session shortly.` });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Expert Mentors</h1>
        <p className="text-sm text-muted-foreground mt-1">Hand-picked IAS officers, professors, and subject experts. All super-admin approved.</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {subjectFilters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} data-testid={`button-filter-${f.toLowerCase()}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={filter === f ? { background: NAVY, color: "white", borderColor: NAVY } : { background: "white", color: "#374151", borderColor: "#e5e7eb" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((mentor) => (
            <div key={mentor.id} data-testid={`card-mentor-${mentor.id}`}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{ background: NAVY }}>{mentor.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: NAVY }}>{mentor.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{mentor.city}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3" fill={i < Math.floor(mentor.rating ?? 0) ? GOLD : "none"} stroke={GOLD} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{mentor.rating} ({mentor.totalReviews})</span>
                  </div>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{mentor.bio}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(mentor.expertise ?? []).slice(0, 4).map((e: string) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{ background: `${TEAL}15`, color: TEAL }}>{e}</span>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" />{mentor.totalSessions} sessions</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{mentor.studentsGuided} students</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleBook(mentor)} data-testid={`button-book-${mentor.id}`}
                  className="flex-1 py-2 rounded-xl text-white text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ background: SAFFRON }}>
                  Book Session
                </button>
                <button data-testid={`button-profile-${mentor.id}`}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted transition-colors flex items-center gap-1"
                  style={{ color: NAVY }}>
                  Profile <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No mentors found for this subject.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
