import { Link, useLocation } from "wouter";
import { useAuthStore } from "../../store/authStore";
import { LayoutDashboard, Calendar, Users, FileText, Clock, User, LogOut, GraduationCap, Star } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/mentor" },
  { icon: Calendar, label: "My Sessions", href: "/mentor/sessions" },
  { icon: Users, label: "My Students", href: "/mentor/students" },
  { icon: FileText, label: "Review Queue", href: "/mentor/reviews" },
  { icon: Clock, label: "Availability", href: "/mentor/availability" },
  { icon: User, label: "Profile", href: "/mentor/profile" },
];

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";

export default function MentorSidebar() {
  const [location] = useLocation();
  const { currentUser, logout } = useAuthStore();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: NAVY }}>
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: SAFFRON }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">IGen LMS</p>
            <p className="text-white/50 text-xs">Mentor Portal</p>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: SAFFRON }}>{currentUser.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3" style={{ color: "#F5A623" }} fill="#F5A623" />
                <span className="text-xs" style={{ color: "#F5A623" }}>{currentUser.rating ?? "—"} rating</span>
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
                isActive ? "text-white font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              style={isActive ? { background: SAFFRON } : {}}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={logout} data-testid="button-mentor-logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all w-full">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
