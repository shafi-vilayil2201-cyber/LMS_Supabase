import { type ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuthStore } from '@/user/features/auth/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Array<'student' | 'mentor' | 'admin'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser } = useAuthStore();

  // Not authenticated → redirect to login
  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  // Authenticated but wrong role → redirect to their correct dashboard
  if (!allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'admin') return <Redirect to="/admin" />;
    if (currentUser.role === 'mentor') return <Redirect to="/mentor" />;
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
