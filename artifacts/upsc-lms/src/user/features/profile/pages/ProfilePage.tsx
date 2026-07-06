import { useAuthStore } from "@/user/features/auth/store/authStore";
import { useLocation } from "wouter";
import { User, MapPin, Phone, Mail, Calendar, Flame, Trophy, BookOpen, Award, LogOut } from "lucide-react";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

const badgeColors: Record<string, string> = {
  "7-Day Streak": SAFFRON, "Rising Star": "#16a34a", "News Ninja": TEAL, "Prelims Ace": "#7c3aed",
  "Mains Maven": "#0891b2", "Week Champion": GOLD, "Course Completer": GOLD,
};

export default function ProfilePage() {
  const { currentUser, logout } = useAuthStore();
  const [, setLocation] = useLocation();

  if (!currentUser) return null;

  async function handleLogout() { await logout(); setLocation("/login"); }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Profile</h1>

      {/* Avatar + Name */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: NAVY }}>{currentUser.name?.charAt(0)}</div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">{currentUser.role} · UPSC 2025</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${SAFFRON}15`, color: SAFFRON }}>
                <Flame className="w-3 h-3" />{currentUser.studyStreak} day streak
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${GOLD}20`, color: "#b45309" }}>
                <Trophy className="w-3 h-3" />Rank #{currentUser.rank}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-bold text-sm mb-4" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Contact Information</h3>
        <div className="space-y-3">
          {[
            { icon: Mail, label: "Email", val: currentUser.email },
            { icon: Phone, label: "Phone", val: currentUser.phone ?? "Not set" },
            { icon: MapPin, label: "City", val: currentUser.city ?? "Not set" },
            { icon: Calendar, label: "Target Year", val: `UPSC ${currentUser.targetYear ?? 2025}` },
            { icon: Calendar, label: "Member Since", val: currentUser.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: NAVY }}>{item.val}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-bold text-sm mb-4" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Performance Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Trophy, label: "Total Score", val: currentUser.totalScore ?? "—", color: GOLD },
            { icon: BookOpen, label: "Current Week", val: `W${currentUser.currentWeek ?? 1}`, color: NAVY },
            { icon: Flame, label: "Study Streak", val: `${currentUser.studyStreak ?? 0}d`, color: SAFFRON },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}
                className="text-center p-4 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2"
                  style={{ background: `${s.color}18` }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="font-bold text-lg" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>{s.val}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {currentUser.badges && currentUser.badges.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Earned Badges</h3>
          <div className="flex flex-wrap gap-3">
            {currentUser.badges.map((badge: string) => (
              <div key={badge} data-testid={`badge-${badge.toLowerCase().replace(/\s/g, "-")}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: `${badgeColors[badge] ?? SAFFRON}20` }}>
                  <Award className="w-3.5 h-3.5" style={{ color: badgeColors[badge] ?? SAFFRON }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: NAVY }}>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout} data-testid="button-logout-profile"
        className="w-full py-3 rounded-xl border border-border flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}
