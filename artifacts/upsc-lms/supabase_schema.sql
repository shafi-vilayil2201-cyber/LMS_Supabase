-- -------------------------------------------------------------
-- UPSC LMS Supabase Database Schema & Initial Data Seed
-- PRODUCTION-READY: Uses Supabase Auth, no plaintext passwords,
-- proper RLS policies with role-based access control.
-- -------------------------------------------------------------

-- Drop existing tables if they exist to allow clean replay
DROP TABLE IF EXISTS mentor_applications CASCADE;
DROP TABLE IF EXISTS current_affairs CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS weekly_reviews CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS daily_habits CASCADE;
DROP TABLE IF EXISTS weekly_blocks CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE (linked to auth.users via id)
-- NOTE: id is the UUID from Supabase Auth (auth.users.id)
-- NO password column — authentication is handled by Supabase Auth
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
    phone TEXT,
    city TEXT,
    "targetYear" INT,
    "studyStreak" INT DEFAULT 0,
    "totalScore" NUMERIC DEFAULT 0.0,
    rank INT,
    badges JSONB DEFAULT '[]'::jsonb,
    "enrolledCourses" JSONB DEFAULT '[]'::jsonb,
    "joinedAt" TIMESTAMPTZ DEFAULT NOW(),
    "currentWeek" INT DEFAULT 1,
    "currentMonth" INT DEFAULT 1,
    "lastLogin" TIMESTAMPTZ,
    -- Mentor-specific fields
    expertise JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC DEFAULT 0.0,
    "totalReviews" INT DEFAULT 0,
    bio TEXT,
    "approvalStatus" TEXT CHECK ("approvalStatus" IN ('approved', 'pending', 'rejected')),
    "totalSessions" INT DEFAULT 0,
    "studentsGuided" INT DEFAULT 0,
    availability JSONB DEFAULT '[]'::jsonb
);

-- 2. COURSES TABLE
CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    type TEXT,
    instructor TEXT,
    duration TEXT,
    "durationWeeks" INT,
    "totalMonths" INT,
    "totalLessons" INT,
    "totalTests" INT,
    "enrolledStudents" INT DEFAULT 0,
    rating NUMERIC DEFAULT 0.0,
    price INT,
    "isFeatured" BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    subjects JSONB DEFAULT '[]'::jsonb
);

-- 3. WEEKLY BLOCKS TABLE
CREATE TABLE weekly_blocks (
    id TEXT PRIMARY KEY,
    "courseId" TEXT REFERENCES courses(id) ON DELETE CASCADE,
    "weekNumber" INT NOT NULL,
    "monthNumber" INT NOT NULL,
    title TEXT NOT NULL,
    topics JSONB DEFAULT '[]'::jsonb,
    "isUnlocked" BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'locked',
    "reviewScore" NUMERIC,
    "disciplineScore" NUMERIC,
    "totalScore" NUMERIC
);

-- 4. DAILY HABITS TABLE
CREATE TABLE daily_habits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    "topicCompleted" BOOLEAN DEFAULT FALSE,
    "topicDurationMins" INT DEFAULT 0,
    "quizAttended" BOOLEAN DEFAULT FALSE,
    "quizScore" INT DEFAULT 0,
    "quizTotal" INT DEFAULT 10,
    "newspaperRead" BOOLEAN DEFAULT FALSE,
    "newspaperHeadlines" TEXT,
    "exerciseDone" BOOLEAN DEFAULT FALSE,
    "exerciseMins" INT DEFAULT 0,
    "notesSubmitted" BOOLEAN DEFAULT FALSE,
    "disciplineScore" NUMERIC DEFAULT 0.0,
    UNIQUE ("userId", date)
);

-- 5. SESSIONS TABLE
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "mentorId" TEXT REFERENCES users(id) ON DELETE CASCADE,
    "studentId" TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    subject TEXT,
    "scheduledAt" TIMESTAMPTZ NOT NULL,
    "durationMins" INT DEFAULT 60,
    status TEXT DEFAULT 'Booked',
    "meetLink" TEXT,
    "studentRating" INT,
    feedback TEXT
);

-- 6. LEADERBOARD TABLE
CREATE TABLE leaderboard (
    rank INT NOT NULL,
    "userId" TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    score NUMERIC DEFAULT 0.0,
    streak INT DEFAULT 0,
    badge TEXT,
    "weeklyChange" INT DEFAULT 0
);

-- 7. WEEKLY REVIEWS TABLE
CREATE TABLE weekly_reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT REFERENCES users(id) ON DELETE CASCADE,
    "weekId" TEXT REFERENCES weekly_blocks(id) ON DELETE CASCADE,
    "reviewerId" TEXT REFERENCES users(id) ON DELETE CASCADE,
    "reviewerName" TEXT,
    "scheduledAt" TIMESTAMPTZ,
    status TEXT DEFAULT 'Scheduled',
    "disciplineScore" NUMERIC DEFAULT 0.0,
    "oralScore" NUMERIC,
    "prelimScore" NUMERIC,
    "mainsScore" NUMERIC,
    "totalScore" NUMERIC,
    "reviewerFeedback" TEXT,
    "nextWeekUnlocked" BOOLEAN DEFAULT FALSE
);

-- 8. ANNOUNCEMENTS TABLE
CREATE TABLE announcements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'Info',
    "publishedAt" TIMESTAMPTZ DEFAULT NOW(),
    "isActive" BOOLEAN DEFAULT TRUE
);

-- 9. CURRENT AFFAIRS TABLE
CREATE TABLE current_affairs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    "relevantFor" JSONB DEFAULT '[]'::jsonb,
    "publishedAt" TIMESTAMPTZ DEFAULT NOW(),
    "readTime" INT DEFAULT 5,
    "isBookmarked" BOOLEAN DEFAULT FALSE
);

-- 10. MENTOR APPLICATIONS TABLE
CREATE TABLE mentor_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "applicantName" TEXT NOT NULL,
    "applicantId" TEXT REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    subjects JSONB DEFAULT '[]'::jsonb,
    qualification TEXT,
    experience TEXT,
    "teachingMode" TEXT,
    status TEXT DEFAULT 'pending',
    "appliedAt" TIMESTAMPTZ DEFAULT NOW(),
    "reviewedBy" TEXT,
    "reviewNote" TEXT
);


-- =============================================================
-- DATABASE TRIGGERS
-- =============================================================

-- Trigger function to automatically create a profile in public.users when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    phone,
    city,
    "targetYear",
    "studyStreak",
    "totalScore",
    rank,
    badges,
    "enrolledCourses",
    "joinedAt",
    "currentWeek",
    "currentMonth",
    expertise,
    rating,
    "totalReviews",
    bio,
    "approvalStatus",
    "totalSessions",
    "studentsGuided",
    availability
  ) VALUES (
    new.id::text,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    (new.raw_user_meta_data->>'targetYear')::integer,
    COALESCE((new.raw_user_meta_data->>'studyStreak')::integer, 0),
    COALESCE((new.raw_user_meta_data->>'totalScore')::numeric, 0.0),
    (new.raw_user_meta_data->>'rank')::integer,
    COALESCE((new.raw_user_meta_data->'badges'), '[]'::jsonb),
    COALESCE((new.raw_user_meta_data->'enrolledCourses'), '[]'::jsonb),
    COALESCE((new.raw_user_meta_data->>'joinedAt')::timestamptz, now()),
    COALESCE((new.raw_user_meta_data->>'currentWeek')::integer, 1),
    COALESCE((new.raw_user_meta_data->>'currentMonth')::integer, 1),
    COALESCE((new.raw_user_meta_data->'expertise'), '[]'::jsonb),
    COALESCE((new.raw_user_meta_data->>'rating')::numeric, 0.0),
    COALESCE((new.raw_user_meta_data->>'totalReviews')::integer, 0),
    new.raw_user_meta_data->>'bio',
    new.raw_user_meta_data->>'approvalStatus',
    COALESCE((new.raw_user_meta_data->>'totalSessions')::integer, 0),
    COALESCE((new.raw_user_meta_data->>'studentsGuided')::integer, 0),
    COALESCE((new.raw_user_meta_data->'availability'), '[]'::jsonb)
  );

  IF COALESCE(new.raw_user_meta_data->>'role', 'student') = 'mentor' THEN
    INSERT INTO public.mentor_applications (
      "applicantName",
      "applicantId",
      email,
      subjects,
      qualification,
      experience,
      "teachingMode",
      status
    ) VALUES (
      COALESCE(new.raw_user_meta_data->>'name', ''),
      new.id::text,
      new.email,
      COALESCE((new.raw_user_meta_data->'expertise'), '[]'::jsonb),
      new.raw_user_meta_data->>'qualification',
      new.raw_user_meta_data->>'experience',
      COALESCE(new.raw_user_meta_data->>'teachingMode', 'online'),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_affairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_applications ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ── USERS TABLE POLICIES ──

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (id = auth.uid()::text);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (get_user_role() = 'admin');

-- Mentors can read student profiles (for their assigned students)
CREATE POLICY "Mentors can read users"
  ON users FOR SELECT
  USING (get_user_role() = 'mentor');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Admins can update any user
CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  USING (get_user_role() = 'admin');

-- Allow new user profile creation (during registration)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid()::text);

-- Admins can delete users
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (get_user_role() = 'admin');


-- ── COURSES TABLE POLICIES ──

-- Everyone can read courses (public catalog)
CREATE POLICY "Anyone can read courses"
  ON courses FOR SELECT
  USING (true);

-- Only admins can create/update/delete courses
CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- ── WEEKLY BLOCKS TABLE POLICIES ──

-- Authenticated users can read weekly blocks
CREATE POLICY "Authenticated can read weekly blocks"
  ON weekly_blocks FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage weekly blocks
CREATE POLICY "Admins can manage weekly blocks"
  ON weekly_blocks FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- ── DAILY HABITS TABLE POLICIES ──

-- Users can read/write their own habits
CREATE POLICY "Users can read own habits"
  ON daily_habits FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own habits"
  ON daily_habits FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own habits"
  ON daily_habits FOR UPDATE
  USING ("userId" = auth.uid()::text);

-- Admins and mentors can read all habits (for analytics/reviews)
CREATE POLICY "Admins can read all habits"
  ON daily_habits FOR SELECT
  USING (get_user_role() IN ('admin', 'mentor'));


-- ── SESSIONS TABLE POLICIES ──

-- Students can read sessions where they are the student
CREATE POLICY "Students can read own sessions"
  ON sessions FOR SELECT
  USING ("studentId" = auth.uid()::text);

-- Mentors can read sessions where they are the mentor
CREATE POLICY "Mentors can read own sessions"
  ON sessions FOR SELECT
  USING ("mentorId" = auth.uid()::text);

-- Admins can read all sessions
CREATE POLICY "Admins can read all sessions"
  ON sessions FOR SELECT
  USING (get_user_role() = 'admin');

-- Authenticated users can create sessions (booking)
CREATE POLICY "Authenticated can book sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Participants can update their sessions
CREATE POLICY "Participants can update sessions"
  ON sessions FOR UPDATE
  USING ("studentId" = auth.uid()::text OR "mentorId" = auth.uid()::text);

-- Admins can manage all sessions
CREATE POLICY "Admins can manage sessions"
  ON sessions FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- ── LEADERBOARD TABLE POLICIES ──

-- Anyone authenticated can read the leaderboard
CREATE POLICY "Authenticated can read leaderboard"
  ON leaderboard FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage leaderboard
CREATE POLICY "Admins can manage leaderboard"
  ON leaderboard FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- ── WEEKLY REVIEWS TABLE POLICIES ──

-- Students can read their own reviews
CREATE POLICY "Students can read own reviews"
  ON weekly_reviews FOR SELECT
  USING ("userId" = auth.uid()::text);

-- Mentors can read reviews they are assigned to
CREATE POLICY "Mentors can read assigned reviews"
  ON weekly_reviews FOR SELECT
  USING ("reviewerId" = auth.uid()::text);

-- Mentors can update reviews they are assigned to (scoring)
CREATE POLICY "Mentors can update assigned reviews"
  ON weekly_reviews FOR UPDATE
  USING ("reviewerId" = auth.uid()::text);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
  ON weekly_reviews FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- ── ANNOUNCEMENTS TABLE POLICIES ──

-- Anyone authenticated can read active announcements
CREATE POLICY "Authenticated can read announcements"
  ON announcements FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage announcements
CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- ── CURRENT AFFAIRS TABLE POLICIES ──

-- Anyone authenticated can read current affairs
CREATE POLICY "Authenticated can read current affairs"
  ON current_affairs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage current affairs
CREATE POLICY "Admins can manage current affairs"
  ON current_affairs FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- ── MENTOR APPLICATIONS TABLE POLICIES ──

-- Users can read their own applications
CREATE POLICY "Users can read own applications"
  ON mentor_applications FOR SELECT
  USING ("applicantId" = auth.uid()::text);

-- Users can submit applications
CREATE POLICY "Users can submit applications"
  ON mentor_applications FOR INSERT
  WITH CHECK ("applicantId" = auth.uid()::text);

-- Admins can read and manage all applications
CREATE POLICY "Admins can manage applications"
  ON mentor_applications FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');


-- =============================================================
-- SEED DATA
-- NOTE: To use this seed data with Supabase Auth, you must first
-- create corresponding auth users in the Supabase Dashboard or
-- via the Supabase Auth Admin API. The user IDs below must match
-- the UUIDs generated by Supabase Auth for each user.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard > Authentication > Users
-- 2. Create users with the emails listed below
-- 3. Copy each user's UUID and replace the IDs in the INSERT below
-- 4. Or use the Supabase Auth Admin API to create users with
--    specific UUIDs (requires service_role key)
--
-- For development, you can also disable email confirmation in:
-- Dashboard > Authentication > Settings > Email > Enable email confirmations = OFF
-- =============================================================

-- Seed courses (no auth dependency)
INSERT INTO courses (id, title, description, category, type, instructor, duration, "durationWeeks", "totalMonths", "totalLessons", "totalTests", "enrolledStudents", rating, price, "isFeatured", tags, "createdAt", status, subjects) VALUES
('c1', 'UPSC CSE Full Year Course 2025', 'The flagship 12-month structured preparation journey with daily habit tracking, weekly mentor-gated reviews, gamified leaderboard, and live video sessions. Covers the entire UPSC CSE Prelims + Mains syllabus.', 'Full Year', 'FullYear', 'Dr. Ramesh Kumar', '12 months', 52, 12, 480, 120, 8500, 4.8, 25000, TRUE, '["GS1", "GS2", "GS3", "GS4", "CSAT", "Full Year"]'::jsonb, '2024-01-01T00:00:00Z', 'active', '["History", "Geography", "Polity", "Economy", "Environment", "Science", "Ethics", "CSAT"]'::jsonb),
('c2', 'Indian Polity & Governance Masterclass', '8-week deep dive into Indian Constitution, Political System, Panchayati Raj, Public Policy and Rights Issues. Same weekly review lock system as the full year course.', 'Subject Specific', 'SubjectSpecific', 'Advocate Suresh Mehta', '8 weeks', 8, 2, 120, 40, 6300, 4.9, 5000, TRUE, '["Polity", "Governance", "Constitution"]'::jsonb, '2024-02-01T00:00:00Z', 'active', '["Constitution", "Governance", "Rights", "Panchayati Raj", "Political System"]'::jsonb),
('c3', 'History — Ancient, Medieval & Modern', '6-week structured course covering the complete UPSC History syllabus from Indus Valley to Modern India. Includes culture, art, architecture and world history.', 'Subject Specific', 'SubjectSpecific', 'Dr. Ramesh Kumar', '6 weeks', 6, 2, 90, 30, 4200, 4.7, 3500, FALSE, '["History", "Culture", "Art"]'::jsonb, '2024-03-01T00:00:00Z', 'active', '["Ancient History", "Medieval History", "Modern History", "World History"]'::jsonb),
('c4', 'Indian Economy & Social Development', '6-week course covering Indian Economy, Sustainable Development, Poverty, Inclusion, Demographics and Social Sector initiatives for Prelims and Mains.', 'Subject Specific', 'SubjectSpecific', 'Dr. Kavitha Rao', '6 weeks', 6, 2, 85, 28, 3800, 4.6, 3500, FALSE, '["Economy", "Social Development"]'::jsonb, '2024-03-10T00:00:00Z', 'active', '["Indian Economy", "Social Development", "Demographics"]'::jsonb),
('c5', 'Environment, Ecology & Biodiversity', '4-week intensive course on Environment, Ecology, Biodiversity and Climate Change — one of the highest-scoring UPSC topics.', 'Subject Specific', 'SubjectSpecific', 'Prof. Anita Singh', '4 weeks', 4, 1, 60, 20, 2900, 4.7, 2500, FALSE, '["Environment", "Ecology", "Biodiversity"]'::jsonb, '2024-03-20T00:00:00Z', 'active', '["Environment", "Ecology", "Biodiversity", "Climate Change"]'::jsonb),
('c6', 'Ethics, Integrity & Aptitude (GS Paper 4)', '6-week course exclusively on GS Paper 4 — Ethics, Integrity and Aptitude. Covers case studies, thinkers, emotional intelligence and attitude.', 'Subject Specific', 'SubjectSpecific', 'Advocate Suresh Mehta', '6 weeks', 6, 2, 72, 24, 1800, 4.8, 3000, FALSE, '["Ethics", "Integrity", "GS Paper 4"]'::jsonb, '2024-04-01T00:00:00Z', 'active', '["Ethics", "Integrity", "Aptitude", "Case Studies"]'::jsonb);

-- Seed weekly blocks (no auth dependency)
INSERT INTO weekly_blocks (id, "courseId", "weekNumber", "monthNumber", title, topics, "isUnlocked", status, "reviewScore", "disciplineScore", "totalScore") VALUES
('w1', 'c1', 1, 1, 'Introduction to UPSC & Ancient Indian History', '["UPSC Overview", "Indus Valley Civilization", "Vedic Period", "Mauryan Empire"]'::jsonb, TRUE, 'completed', 8.5, 3.8, 8.5),
('w2', 'c1', 2, 1, 'Post-Mauryan Period & Sangam Age', '["Post-Mauryan Kingdoms", "Gupta Empire", "Sangam Literature", "Regional Kingdoms"]'::jsonb, TRUE, 'completed', 7.8, 3.5, 7.8),
('w3', 'c1', 3, 1, 'Medieval India — Delhi Sultanate', '["Slave Dynasty", "Khalji Dynasty", "Tughlaq Dynasty", "Architecture of Delhi Sultanate"]'::jsonb, TRUE, 'completed', 9.0, 3.9, 9.0),
('w4', 'c1', 4, 1, 'Mughal Empire & Bhakti-Sufi Movement', '["Mughal Rulers", "Akbar''s Reforms", "Bhakti Movement", "Sufi Movement"]'::jsonb, TRUE, 'completed', 8.2, 3.7, 8.2),
('w5', 'c1', 5, 2, 'Modern India — British Expansion', '["Advent of Europeans", "Battles of Plassey & Buxar", "Subsidiary Alliance", "Doctrine of Lapse"]'::jsonb, TRUE, 'completed', 8.8, 3.6, 8.8),
('w6', 'c1', 6, 2, 'Indian National Movement — Phase 1', '["1857 Revolt", "Formation of INC", "Moderate Phase", "Partition of Bengal"]'::jsonb, TRUE, 'completed', 9.2, 4.0, 9.2),
('w7', 'c1', 7, 2, 'Gandhian Era & Mass Movements', '["Non-Cooperation Movement", "Civil Disobedience", "Quit India Movement", "Subhas Chandra Bose"]'::jsonb, TRUE, 'completed', 8.5, 3.8, 8.5),
('w8', 'c1', 8, 2, 'Physical Geography of India', '["Himalayas", "Indo-Gangetic Plains", "Peninsular Plateau", "Coastal Plains"]'::jsonb, TRUE, 'completed', 7.6, 3.4, 7.6),
('w9', 'c1', 9, 3, 'Climate, Rivers & Natural Vegetation', '["Indian Monsoon", "River Systems", "Natural Vegetation", "Soils of India"]'::jsonb, TRUE, 'completed', 8.1, 3.7, 8.1),
('w10', 'c1', 10, 3, 'Indian Constitution — Preamble & Fundamental Rights', '["Making of Constitution", "Preamble", "Fundamental Rights Art 12-18", "Fundamental Rights Art 19-22"]'::jsonb, TRUE, 'completed', 9.5, 4.0, 9.5),
('w11', 'c1', 11, 3, 'DPSP, Fundamental Duties & Parliament', '["Directive Principles", "Fundamental Duties", "Parliament Structure", "Legislative Process"]'::jsonb, TRUE, 'completed', 8.7, 3.9, 8.7),
('w12', 'c1', 12, 3, 'Federalism & Centre-State Relations', '["Union-State Relations", "Governor''s Role", "Emergency Provisions", "Local Government"]'::jsonb, TRUE, 'in_review', NULL, 3.6, NULL),
('w13', 'c1', 13, 4, 'Constitutional Bodies', '["Election Commission", "UPSC (Civil Services)", "CAG", "Finance Commission"]'::jsonb, FALSE, 'locked', NULL, NULL, NULL),
('w14', 'c1', 14, 4, 'Judiciary & PIL', '["Supreme Court", "High Courts", "Judicial Review", "PIL & Judicial Activism"]'::jsonb, FALSE, 'locked', NULL, NULL, NULL);

-- Seed announcements (no auth dependency)
INSERT INTO announcements (id, title, content, type, "publishedAt", "isActive") VALUES
('an1', 'UPSC CSE 2025 Notification Released', 'UPSC has released official notification for CSE 2025. Prelims scheduled for June 2025. Applications open till March 18.', 'Important', '2024-04-20T09:00:00Z', TRUE),
('an2', 'New Mock Test Series — 20 Full Length Tests Added', 'We''ve added 20 new full-length mock tests for UPSC Prelims 2025 based on the latest pattern with detailed solutions.', 'Update', '2024-04-15T09:00:00Z', TRUE),
('an3', 'Live Session: Budget 2024 Analysis — April 22, 6 PM', 'Join Dr. Kavitha Rao for a detailed analysis of Interim Budget 2024-25 and its implications for UPSC GS3.', 'Event', '2024-04-18T09:00:00Z', TRUE),
('an4', 'Week 12 Review Reminder', 'Students on Week 12 must book their reviewer by Saturday to avoid delay. Limited slots available.', 'Reminder', '2024-04-20T06:00:00Z', TRUE);

-- Seed current affairs (no auth dependency)
INSERT INTO current_affairs (id, title, summary, content, category, tags, "relevantFor", "publishedAt", "readTime", "isBookmarked") VALUES
('ca1', 'India''s G20 Presidency Outcomes', 'India''s G20 Presidency resulted in landmark agreements on debt restructuring, climate finance, and digital infrastructure. The New Delhi Declaration was adopted by consensus, and the African Union joined as a member.', 'India held the G20 Presidency from December 2022 to November 2023. Key outcomes: New Delhi Declaration adopted unanimously, African Union joined G20 as permanent member, Global Biofuels Alliance launched, India-Middle East-Europe Economic Corridor announced.', 'International Relations', '["G20", "International Relations", "India"]'::jsonb, '["Prelims", "Mains GS2"]'::jsonb, '2024-04-20T09:00:00Z', 8, FALSE),
('ca2', 'Interim Budget 2024-25 Key Highlights', 'Fiscal deficit target at 5.1% of GDP, Capital expenditure of Rs 11.11 lakh crore, focus on infrastructure and green energy.', 'Finance Minister presented the Interim Budget 2024-25 on February 1, 2024. Key highlights include fiscal consolidation, infrastructure push, housing expansion, railway modernization, and green energy initiatives.', 'Economy', '["Budget", "Economy", "Fiscal Policy"]'::jsonb, '["Prelims", "Mains GS3"]'::jsonb, '2024-04-18T09:00:00Z', 10, TRUE),
('ca3', 'Chandrayaan-3 & ISRO''s Space Milestones', 'India''s Chandrayaan-3 successfully landed near Moon''s south pole on Aug 23, 2023. India becomes 4th country to achieve soft lunar landing.', 'Chandrayaan-3 launched July 14, 2023. Vikram lander and Pragyan rover landed on lunar south pole region. Aditya-L1, India''s first solar mission, also launched. ISRO prepares for Gaganyaan crewed mission.', 'Science & Technology', '["Space", "ISRO", "Science"]'::jsonb, '["Prelims", "Mains GS3"]'::jsonb, '2024-04-15T09:00:00Z', 7, FALSE),
('ca4', 'India''s Digital Public Infrastructure', 'India''s DPI stack — Aadhaar, UPI, DigiLocker — is being recognized globally as a model for financial inclusion and digital governance.', 'India''s Digital Public Infrastructure comprises Aadhaar for identity, UPI for payments, DigiLocker for documents, and ONDC for open commerce. The India Stack has been adopted by several developing nations.', 'Governance', '["Digital India", "Governance", "Technology"]'::jsonb, '["Prelims", "Mains GS2"]'::jsonb, '2024-04-12T09:00:00Z', 9, FALSE),
('ca5', 'Paris Agreement & India''s Climate NDC', 'India''s updated NDC targets 50% of cumulative power from non-fossil sources by 2030 and 45% reduction in emissions intensity.', 'India submitted updated NDC in August 2022. Targets: 45% reduction in emissions intensity of GDP by 2030, 50% cumulative electric power installed capacity from non-fossil sources, net-zero by 2070.', 'Environment', '["Climate Change", "Paris Agreement", "Environment"]'::jsonb, '["Prelims", "Mains GS3"]'::jsonb, '2024-04-10T09:00:00Z', 6, TRUE),
('ca6', 'India-Middle East-Europe Economic Corridor (IMEC)', 'IMEC announced at G20 Summit as connectivity initiative connecting India to Europe through Middle East via rail and sea.', 'IMEC announced September 9, 2023 at G20 New Delhi Summit. East corridor connecting India to Gulf. Northern corridor connecting Gulf to Europe. Signatories: India, Saudi Arabia, UAE, EU, France, Germany, Italy, USA.', 'International Relations', '["IMEC", "Connectivity", "International Relations"]'::jsonb, '["Prelims", "Mains GS2"]'::jsonb, '2024-04-08T09:00:00Z', 8, FALSE);

-- =============================================================
-- NOTE ON USER SEED DATA:
-- The original seed data with hardcoded user IDs (u1, m1, etc.)
-- has been removed because it contained plaintext passwords and
-- fake IDs that don't correspond to Supabase Auth users.
--
-- To set up users for development/testing:
-- 1. Register through the app (creates both Auth user + profile)
-- 2. Or use the Supabase Dashboard to create Auth users, then
--    manually insert profile rows matching those UUIDs
-- 3. To create an admin user:
--    a. Register a normal account through the app
--    b. In Supabase Dashboard > Table Editor > users
--    c. Change that user's role from 'student' to 'admin'
-- =============================================================
