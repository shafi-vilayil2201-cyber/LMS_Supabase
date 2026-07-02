// Announcements feature types
export interface Announcement {
  id: string;
  title: string;
  body: string;
  targetRole: "all" | "student" | "mentor";
  isActive: boolean;
  createdAt: string;
}
