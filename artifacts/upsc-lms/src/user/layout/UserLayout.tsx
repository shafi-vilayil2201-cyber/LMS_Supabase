import { useAuthStore } from "@/user/features/auth/store/authStore";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";

interface Props {
  children: React.ReactNode;
}

export default function UserLayout({ children }: Props) {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="flex h-screen overflow-hidden bg-background">
        <UserSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <UserTopbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
