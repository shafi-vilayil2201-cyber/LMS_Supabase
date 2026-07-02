// Admin Student Analytics feature types
export type { User } from "@/shared/types";

export interface StudentAnalyticsSummary {
  userId: string;
  name: string;
  totalScore: number;
  studyStreak: number;
  rank: number;
  trend: "up" | "down" | "stable";
}
