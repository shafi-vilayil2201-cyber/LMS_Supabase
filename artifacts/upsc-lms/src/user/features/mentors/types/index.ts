// Mentors / Sessions feature types
import { User, Session } from "@/shared/types";
export type { User, Session };
export type Mentor = User;

export interface MentorFilter {
  expertise?: string;
  search?: string;
  minRating?: number;
}
