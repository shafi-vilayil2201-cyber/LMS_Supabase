// Courses feature types
export type { Course, WeeklyBlock } from "@/shared/types";

export interface CourseFilter {
  category?: string;
  type?: string;
  search?: string;
}

export interface EnrollmentState {
  isEnrolled: boolean;
  currentWeek: number;
}
