# IGen LMS — Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
The primary product is **IGen LMS** — a UPSC preparation platform with three fully separate portals.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9

## Artifacts

### `artifacts/upsc-lms` — IGen LMS (UPSC Prep Platform)
- **Framework**: React 18 + Vite + TailwindCSS v4
- **Routing**: wouter
- **State**: Zustand (persist to localStorage)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI**: shadcn/ui components
- **Mock backend**: `public/db.json` (fetched via `src/services/db.ts`)
- **Preview path**: `/`

### `artifacts/api-server` — API Server
- **Framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM

## IGen LMS Architecture

### Brand
- Navy `#0A1628` · Saffron `#FF6B00` · Gold `#F5A623` · Teal `#1A7F8E`
- Fonts: Inter (headings) · Nunito (body)

### Three Portals (fully separate file trees)

#### Student Portal — `src/user/`
- `layout/`: UserLayout, UserSidebar, UserTopbar
- `pages/`: LandingPage, LoginPage, RegisterPage, StudentDashboard, CoursesPage, CourseDetailPage, WeeklyCoursePage, DailyHabitsPage, LeaderboardPage, MentorsPage, SessionsPage, CurrentAffairsPage, ProfilePage

#### Mentor Portal — `src/mentor/`
- `layout/`: MentorLayout, MentorSidebar
- `pages/`: MentorDashboard, MentorSessionsPage, MentorStudentsPage, MentorReviewsPage, MentorAvailabilityPage

#### Admin Portal — `src/admin/`
- `layout/`: AdminLayout, AdminSidebar
- `pages/`: AdminDashboard, MentorManagementPage, StudentAnalyticsPage, CourseBuilderPage, LeaderboardControlPage, RevenuePage, AnnouncementsPage

### Routes (App.tsx — wouter)
| Path | Component | Auth |
|------|-----------|------|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/dashboard` | StudentDashboard | Student only |
| `/courses` | CoursesPage | Student only |
| `/courses/:id` | CourseDetailPage | Student only |
| `/courses/:id/week/:weekId` | WeeklyCoursePage | Student only |
| `/habits` | DailyHabitsPage | Student only |
| `/leaderboard` | LeaderboardPage | Student only |
| `/mentors` | MentorsPage | Student only |
| `/sessions` | SessionsPage | Student only |
| `/current-affairs` | CurrentAffairsPage | Student only |
| `/profile` | ProfilePage | Student only |
| `/mentor` | MentorDashboard | Mentor only |
| `/mentor/sessions` | MentorSessionsPage | Mentor only |
| `/mentor/students` | MentorStudentsPage | Mentor only |
| `/mentor/reviews` | MentorReviewsPage | Mentor only |
| `/mentor/availability` | MentorAvailabilityPage | Mentor only |
| `/admin` | AdminDashboard | Admin only |
| `/admin/mentors` | MentorManagementPage | Admin only |
| `/admin/students` | StudentAnalyticsPage | Admin only |
| `/admin/courses` | CourseBuilderPage | Admin only |
| `/admin/leaderboard` | LeaderboardControlPage | Admin only |
| `/admin/revenue` | RevenuePage | Admin only |
| `/admin/announcements` | AnnouncementsPage | Admin only |

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | student@upsc.com | password123 |
| Mentor | mentor@upsc.com | password123 |
| Admin | admin@igen.com | admin123 |

### Key Business Rules
- Weekly review system: score 7.5/10 to unlock next week
- Review = Discipline (4pts) + Oral (3pts) + Prelims (3pts) + Mains (3pts)
- Mentor portal requires admin approval (`approvalStatus: "approved"`)
- Leaderboard: weekly, monthly, all-time views

### Future
- Replace `public/db.json` with .NET REST API
- Add payment gateway for course enrollment
- WhatsApp integration for daily nudges
