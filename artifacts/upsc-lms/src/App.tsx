import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import AuthProvider from "@/shared/components/AuthProvider";

// ── Public / Auth ──────────────────────────────────────────────────────────
import LandingPage from "@/user/features/auth/pages/LandingPage";
import LoginPage from "@/user/features/auth/pages/LoginPage";
import RegisterPage from "@/user/features/auth/pages/RegisterPage";

// ── User (Student) ─────────────────────────────────────────────────────────
import UserLayout from "@/user/layout/UserLayout";
import StudentDashboard from "@/user/features/dashboard/pages/StudentDashboard";
import CoursesPage from "@/user/features/courses/pages/CoursesPage";
import CourseDetailPage from "@/user/features/courses/pages/CourseDetailPage";
import WeeklyCoursePage from "@/user/features/courses/pages/WeeklyCoursePage";
import DailyHabitsPage from "@/user/features/habits/pages/DailyHabitsPage";
import LeaderboardPage from "@/user/features/leaderboard/pages/LeaderboardPage";
import MentorsPage from "@/user/features/mentors/pages/MentorsPage";
import SessionsPage from "@/user/features/mentors/pages/SessionsPage";
import CurrentAffairsPage from "@/user/features/current-affairs/pages/CurrentAffairsPage";
import ProfilePage from "@/user/features/profile/pages/ProfilePage";

// ── Mentor ─────────────────────────────────────────────────────────────────
import MentorLayout from "@/mentor/layout/MentorLayout";
import MentorDashboard from "@/mentor/features/dashboard/pages/MentorDashboard";
import MentorSessionsPage from "@/mentor/features/sessions/pages/MentorSessionsPage";
import MentorStudentsPage from "@/mentor/features/students/pages/MentorStudentsPage";
import MentorReviewsPage from "@/mentor/features/reviews/pages/MentorReviewsPage";
import MentorAvailabilityPage from "@/mentor/features/availability/pages/MentorAvailabilityPage";

// ── Admin ──────────────────────────────────────────────────────────────────
import AdminLayout from "@/admin/layout/AdminLayout";
import AdminDashboard from "@/admin/features/dashboard/pages/AdminDashboard";
import MentorManagementPage from "@/admin/features/mentors/pages/MentorManagementPage";
import StudentAnalyticsPage from "@/admin/features/students/pages/StudentAnalyticsPage";
import CourseBuilderPage from "@/admin/features/courses/pages/CourseBuilderPage";
import LeaderboardControlPage from "@/admin/features/leaderboard/pages/LeaderboardControlPage";
import RevenuePage from "@/admin/features/revenue/pages/RevenuePage";
import AnnouncementsPage from "@/admin/features/announcements/pages/AnnouncementsPage";

import NotFound from "@/shared/pages/NotFound";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Student routes */}
      <Route path="/dashboard">
        <UserLayout><StudentDashboard /></UserLayout>
      </Route>
      <Route path="/courses">
        <UserLayout><CoursesPage /></UserLayout>
      </Route>
      <Route path="/courses/:id/week/:weekId">
        {() => <UserLayout><WeeklyCoursePage /></UserLayout>}
      </Route>
      <Route path="/courses/:id">
        {() => <UserLayout><CourseDetailPage /></UserLayout>}
      </Route>
      <Route path="/habits">
        <UserLayout><DailyHabitsPage /></UserLayout>
      </Route>
      <Route path="/leaderboard">
        <UserLayout><LeaderboardPage /></UserLayout>
      </Route>
      <Route path="/mentors">
        <UserLayout><MentorsPage /></UserLayout>
      </Route>
      <Route path="/sessions">
        <UserLayout><SessionsPage /></UserLayout>
      </Route>
      <Route path="/current-affairs">
        <UserLayout><CurrentAffairsPage /></UserLayout>
      </Route>
      <Route path="/profile">
        <UserLayout><ProfilePage /></UserLayout>
      </Route>

      {/* Mentor routes */}
      <Route path="/mentor">
        <MentorLayout><MentorDashboard /></MentorLayout>
      </Route>
      <Route path="/mentor/sessions">
        <MentorLayout><MentorSessionsPage /></MentorLayout>
      </Route>
      <Route path="/mentor/students">
        <MentorLayout><MentorStudentsPage /></MentorLayout>
      </Route>
      <Route path="/mentor/reviews">
        <MentorLayout><MentorReviewsPage /></MentorLayout>
      </Route>
      <Route path="/mentor/availability">
        <MentorLayout><MentorAvailabilityPage /></MentorLayout>
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/mentors">
        <AdminLayout><MentorManagementPage /></AdminLayout>
      </Route>
      <Route path="/admin/students">
        <AdminLayout><StudentAnalyticsPage /></AdminLayout>
      </Route>
      <Route path="/admin/courses">
        <AdminLayout><CourseBuilderPage /></AdminLayout>
      </Route>
      <Route path="/admin/leaderboard">
        <AdminLayout><LeaderboardControlPage /></AdminLayout>
      </Route>
      <Route path="/admin/revenue">
        <AdminLayout><RevenuePage /></AdminLayout>
      </Route>
      <Route path="/admin/announcements">
        <AdminLayout><AnnouncementsPage /></AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
