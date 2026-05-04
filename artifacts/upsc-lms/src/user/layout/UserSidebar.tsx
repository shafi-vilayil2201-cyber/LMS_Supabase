import { Link, useLocation } from "wouter";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard, BookOpen, CheckSquare, Trophy, Users,
  Video, Newspaper, User, LogOut, Flame, GraduationCap
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Courses", href: "/courses" },
  { icon: CheckSquare, label: "Daily Habits", href: "/habits" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: Users, label: "Mentors", href: "/mentors" },
  { icon: Video, label: "Sessions", href: "/sessions" },
  { icon: Newspaper, label: "Current Affairs", href: "/current-affairs" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function UserSidebar() {
  const [location] = useLocation();
  const { currentUser, logout } = useAuthStore();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: "#0A1628" }}>
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FF6B00" }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight font-sans">IGen LMS</p>
            <p className="text-white/50 text-xs">UPSC Prep</p>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "#FF6B00" }}>
              {currentUser.name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Flame className="w-3 h-3" style={{ color: "#F5A623" }} />
                <span className="text-xs" style={{ color: "#F5A623" }}>{currentUser.studyStreak ?? 0} day streak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? "text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              style={isActive ? { background: "#FF6B00" } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          data-testid="button-logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
