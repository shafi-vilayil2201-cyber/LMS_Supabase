// Mentor Reviews feature types
export interface WeeklyReview {
  id: string;
  studentId: string;
  mentorId: string;
  weekNumber: number;
  courseId: string;
  oralScore: number | null;
  writtenScore: number | null;
  disciplineScore: number | null;
  status: "pending" | "completed";
  submittedAt: string | null;
  feedback: string | null;
}
