// Mentor Sessions feature types
import type { Session } from "@/shared/types";
export type { Session };

export interface SessionWithStudent {
  session: Session;
  studentName: string;
  studentEmail: string;
}
