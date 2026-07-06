import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import AutomationStatus from "@/shared/components/AutomationStatus";

export default function UserTopbar() {
  const { currentUser } = useAuthStore();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search topics, tests, mentors..."
            data-testid="input-search"
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground hidden lg:block">{today}</span>
        <AutomationStatus />
        <ThemeToggle />
        <button
          data-testid="button-notifications"
          className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <Bell className="w-4 h-4 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#009E2C" }} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "#0A1628" }}>
            {currentUser?.name?.charAt(0) ?? "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-foreground leading-tight">{currentUser?.name}</p>
            <p className="text-xs text-muted-foreground">Rank #{currentUser?.rank ?? "—"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
