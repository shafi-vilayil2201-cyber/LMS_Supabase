import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUsers } from '../services/db';

interface AuthState {
  currentUser: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: false,
      login: async (email, password) => {
        try {
          const users = await getUsers();
          const user = users.find((u: any) => u.email === email && u.password === password);
          if (user) {
            set({ currentUser: user });
            return { success: true };
          }
          return { success: false, error: 'Invalid email or password' };
        } catch (e) {
          return { success: false, error: 'Failed to login' };
        }
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: 'igen-auth' }
  )
);
