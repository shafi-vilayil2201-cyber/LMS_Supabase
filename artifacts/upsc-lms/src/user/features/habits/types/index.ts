// Habits feature types
export type { DailyHabit } from "@/shared/types";

export interface HabitSummary {
  date: string;
  completionPercent: number;
  disciplineScore: number;
}
