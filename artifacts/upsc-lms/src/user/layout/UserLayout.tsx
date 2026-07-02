import { useAuthStore } from "@/user/features/auth/store/authStore";
import { Redirect } from "wouter";
import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";

interface Props {
  children: React.ReactNode;
}

export default function UserLayout({ children }: Props) {
  const { currentUser } = useAuthStore();

  if (!currentUser) return <Redirect to="/login" />;
  if (currentUser.role !== "student") {
    if (currentUser.role === "mentor") return <Redirect to="/mentor" />;
    if (currentUser.role === "admin") return <Redirect to="/admin" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
