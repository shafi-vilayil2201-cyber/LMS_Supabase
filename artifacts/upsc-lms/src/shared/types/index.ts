export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  phone?: string;
  city?: string;
  targetYear?: number;
  studyStreak?: number;
  totalScore?: number;
  rank?: number;
  badges?: string[];
  enrolledCourses?: string[];
  joinedAt?: string;
  currentWeek?: number;
  currentMonth?: number;
  lastLogin?: string;
  expertise?: string[];
  rating?: number;
  totalReviews?: number;
  bio?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  totalSessions?: number;
  studentsGuided?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  instructor: string;
  duration: string;
  durationWeeks: number;
  totalMonths: number;
  totalLessons: number;
  totalTests: number;
  enrolledStudents: number;
  rating: number;
  price: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  status: string;
  subjects: string[];
}

export interface WeeklyBlock {
  id: string;
  courseId: string;
  weekNumber: number;
  monthNumber: number;
  title: string;
  topics: string[];
  isUnlocked: boolean;
  status: 'completed' | 'in_review' | 'locked';
  reviewScore: number | null;
  disciplineScore: number | null;
  totalScore: number | null;
}

export interface DailyHabit {
  id: string;
  userId: string;
  date: string;
  topicCompleted: boolean;
  topicDurationMins: number;
  quizAttended: boolean;
  quizScore: number;
  quizTotal: number;
  newspaperRead: boolean;
  newspaperHeadlines: string;
  exerciseDone: boolean;
  exerciseMins: number;
  notesSubmitted: boolean;
  disciplineScore: number;
}

export interface Session {
  id: string;
  mentorId: string;
  studentId: string;
  type: string;
  subject: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  meetLink: string;
  studentRating: number | null;
  feedback: string | null;
}
