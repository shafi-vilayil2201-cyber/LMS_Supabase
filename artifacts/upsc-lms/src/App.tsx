import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "@/user/pages/LandingPage";
import LoginPage from "@/user/pages/LoginPage";
import RegisterPage from "@/user/pages/RegisterPage";

import UserLayout from "@/user/layout/UserLayout";
import StudentDashboard from "@/user/pages/StudentDashboard";
import CoursesPage from "@/user/pages/CoursesPage";
import CourseDetailPage from "@/user/pages/CourseDetailPage";
import WeeklyCoursePage from "@/user/pages/WeeklyCoursePage";
import DailyHabitsPage from "@/user/pages/DailyHabitsPage";
import LeaderboardPage from "@/user/pages/LeaderboardPage";
import MentorsPage from "@/user/pages/MentorsPage";
import SessionsPage from "@/user/pages/SessionsPage";
import CurrentAffairsPage from "@/user/pages/CurrentAffairsPage";
import ProfilePage from "@/user/pages/ProfilePage";

import MentorLayout from "@/mentor/layout/MentorLayout";
import MentorDashboard from "@/mentor/pages/MentorDashboard";
import MentorSessionsPage from "@/mentor/pages/MentorSessionsPage";
import MentorStudentsPage from "@/mentor/pages/MentorStudentsPage";
import MentorReviewsPage from "@/mentor/pages/MentorReviewsPage";
import MentorAvailabilityPage from "@/mentor/pages/MentorAvailabilityPage";

import AdminLayout from "@/admin/layout/AdminLayout";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import MentorManagementPage from "@/admin/pages/MentorManagementPage";
import StudentAnalyticsPage from "@/admin/pages/StudentAnalyticsPage";
import CourseBuilderPage from "@/admin/pages/CourseBuilderPage";
import LeaderboardControlPage from "@/admin/pages/LeaderboardControlPage";
import RevenuePage from "@/admin/pages/RevenuePage";
import AnnouncementsPage from "@/admin/pages/AnnouncementsPage";

import NotFound from "@/pages/not-found";

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
        {(params) => <UserLayout><WeeklyCoursePage /></UserLayout>}
      </Route>
      <Route path="/courses/:id">
        {(params) => <UserLayout><CourseDetailPage /></UserLayout>}
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
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
