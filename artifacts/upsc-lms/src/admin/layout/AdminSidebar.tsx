import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { LayoutDashboard, Users, BookOpen, Trophy, DollarSign, Bell, LogOut, GraduationCap, UserCheck } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: UserCheck, label: "Mentor Management", href: "/admin/mentors" },
  { icon: Users, label: "Student Analytics", href: "/admin/students" },
  { icon: BookOpen, label: "Course Builder", href: "/admin/courses" },
  { icon: Trophy, label: "Leaderboard Control", href: "/admin/leaderboard" },
  { icon: DollarSign, label: "Revenue", href: "/admin/revenue" },
  { icon: Bell, label: "Announcements", href: "/admin/announcements" },
];

export default function AdminSidebar() {
  const [location] = useLocation();
  const { currentUser, logout } = useAuthStore();

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar-primary">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-bold text-sm leading-tight">IGen LMS</p>
            <p className="text-sidebar-foreground/50 text-xs">Admin Portal</p>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-red-600">
              {currentUser.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-red-400">Super Admin</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <button onClick={logout} data-testid="button-admin-logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
