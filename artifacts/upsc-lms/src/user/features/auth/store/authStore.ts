import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabaseClient';
import type { User as AuthUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  phone?: string;
  city?: string;
  targetYear?: number;
  studyStreak?: number;
  totalScore?: number;
  rank?: number;
  badges?: string[];
  enrolledCourses?: string[];
  joinedAt?: string;
  currentWeek?: number;
  currentMonth?: number;
  lastLogin?: string;
  expertise?: string[];
  rating?: number;
  totalReviews?: number;
  bio?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  totalSessions?: number;
  studentsGuided?: number;
  availability?: string[];
  qualification?: string;
  experience?: string;
  teachingMode?: string;
}

interface AuthState {
  currentUser: UserProfile | null;
  authUser: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'id' | 'email'>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
  _fetchProfile: (userId: string) => Promise<UserProfile | null>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: null,
  authUser: null,
  isLoading: false,
  isInitialized: false,

  _fetchProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data as UserProfile;
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await get()._fetchProfile(session.user.id);
        set({
          authUser: session.user,
          currentUser: profile,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({ authUser: null, currentUser: null, isInitialized: true, isLoading: false });
      }

      // Listen for auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await get()._fetchProfile(session.user.id);
          set({ authUser: session.user, currentUser: profile });
        } else if (event === 'SIGNED_OUT') {
          set({ authUser: null, currentUser: null });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Session refreshed, update auth user but keep profile
          set({ authUser: session.user });
        }
      });
    } catch (e) {
      console.error('Failed to initialize auth:', e);
      set({ isInitialized: true, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await get()._fetchProfile(data.user.id);
        if (!profile) {
          set({ isLoading: false });
          return { success: false, error: 'User profile not found. Please contact support.' };
        }

        // Update last login
        await supabase
          .from('users')
          .update({ lastLogin: new Date().toISOString() })
          .eq('id', data.user.id);

        set({ authUser: data.user, currentUser: profile, isLoading: false });
        return { success: true };
      }

      set({ isLoading: false });
      return { success: false, error: 'Login failed' };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false, error: e.message || 'Failed to login' };
    }
  },

  signUp: async (email, password, profile) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...profile
          }
        }
      });

      if (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      set({ isLoading: false });
      return { success: true };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false, error: e.message || 'Failed to register' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null, authUser: null });
  },

  refreshUser: async () => {
    const user = get().authUser;
    if (!user) return;
    try {
      const profile = await get()._fetchProfile(user.id);
      if (profile) {
        set({ currentUser: profile });
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  },
}));
