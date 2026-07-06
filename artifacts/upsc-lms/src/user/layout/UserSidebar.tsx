import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/user/features/auth/store/authStore";
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
  const [location, setLocation] = useLocation();
  const { currentUser, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    setLocation("/login");
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar-primary">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-bold text-sm leading-tight font-sans">IGen LMS</p>
            <p className="text-sidebar-foreground/50 text-xs">UPSC Prep</p>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-sidebar-primary-foreground bg-sidebar-primary">
              {currentUser.name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm font-semibold truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Flame className="w-3 h-3 text-sidebar-primary" />
                <span className="text-xs text-sidebar-primary">{currentUser.studyStreak ?? 0} day streak</span>
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

