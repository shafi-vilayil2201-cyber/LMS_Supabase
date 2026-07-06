import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { LayoutDashboard, Calendar, Users, FileText, Clock, User, LogOut, GraduationCap, Star } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/mentor" },
  { icon: Calendar, label: "My Sessions", href: "/mentor/sessions" },
  { icon: Users, label: "My Students", href: "/mentor/students" },
  { icon: FileText, label: "Review Queue", href: "/mentor/reviews" },
  { icon: Clock, label: "Availability", href: "/mentor/availability" },
  { icon: User, label: "Profile", href: "/mentor/profile" },
];

export default function MentorSidebar() {
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
            <p className="text-sidebar-foreground font-bold text-sm leading-tight">IGen LMS</p>
            <p className="text-sidebar-foreground/50 text-xs">Mentor Portal</p>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-sidebar-primary-foreground bg-sidebar-primary">
              {currentUser.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm font-semibold truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-sidebar-primary" fill="currentColor" />
                <span className="text-xs text-sidebar-primary">{currentUser.rating ?? "—"} rating</span>
              </div>
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
        <button onClick={handleLogout} data-testid="button-mentor-logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
