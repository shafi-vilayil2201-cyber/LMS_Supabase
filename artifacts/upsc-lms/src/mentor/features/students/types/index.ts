// Mentor Students feature types
export type { User, Session } from "@/shared/types";

export interface StudentProgress {
  userId: string;
  name: string;
  totalSessions: number;
  avgScore: number;
  studyStreak: number;
}
