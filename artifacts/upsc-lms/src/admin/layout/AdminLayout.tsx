import { useAuthStore } from "@/user/features/auth/store/authStore";
import { Redirect } from "wouter";
import AdminSidebar from "./AdminSidebar";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

interface Props { children: React.ReactNode; }

export default function AdminLayout({ children }: Props) {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Redirect to="/login" />;
  if (currentUser.role !== "admin") return <Redirect to="/login" />;
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-background border-b border-border flex items-center px-6 justify-between flex-shrink-0">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-red-600">
              {currentUser.name?.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-foreground leading-tight">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
