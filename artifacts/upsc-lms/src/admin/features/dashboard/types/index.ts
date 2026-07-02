// Admin Dashboard feature types
export type { User, Course } from "@/shared/types";

export interface AdminStats {
  totalStudents: number;
  totalMentors: number;
  activeEnrollments: number;
  monthlyRevenue: number;
  avgWeeklyScore: number;
  dropoutRiskPercent: number;
}
