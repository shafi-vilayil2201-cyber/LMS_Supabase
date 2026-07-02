// Admin Mentor Management feature types
export type { User } from "@/shared/types";

export interface MentorApplication {
  id: string;
  userId: string;
  expertise: string[];
  bio: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
}
