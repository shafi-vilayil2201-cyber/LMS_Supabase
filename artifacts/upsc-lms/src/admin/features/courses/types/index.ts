// Admin Course Builder feature types
export type { Course, WeeklyBlock } from "@/shared/types";

export interface CourseFormPayload {
  title: string;
  description: string;
  category: string;
  type: string;
  instructor: string;
  durationWeeks: number;
  price: number;
}
