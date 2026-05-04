import { create } from 'zustand';
import { getCourses, getWeeklyBlocks } from '../services/db';

interface CourseState {
  courses: any[];
  weeklyBlocks: any[];
  isLoaded: boolean;
  loadCourses: () => Promise<void>;
}

export const useCourseStore = create<CourseState>()((set, get) => ({
  courses: [],
  weeklyBlocks: [],
  isLoaded: false,
  loadCourses: async () => {
    if (get().isLoaded) return;
    try {
      const [courses, weeklyBlocks] = await Promise.all([getCourses(), getWeeklyBlocks()]);
      set({ courses, weeklyBlocks, isLoaded: true });
    } catch (e) {
      console.error("Failed to load courses");
    }
  },
}));
