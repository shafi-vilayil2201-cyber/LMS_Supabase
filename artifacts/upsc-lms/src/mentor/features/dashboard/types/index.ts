// Mentor Dashboard feature types
export type { User, Session } from "@/shared/types";

export interface MentorStats {
  upcomingSessions: number;
  pendingReviews: number;
  activeStudents: number;
  avgRating: number;
}
