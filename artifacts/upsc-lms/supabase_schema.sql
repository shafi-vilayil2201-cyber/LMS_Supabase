-- -------------------------------------------------------------
-- UPSC LMS Supabase Database Schema & Initial Data Seed
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

-- 1. USERS TABLE
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
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

-- Create permissive RLS policies for easier integration
CREATE POLICY "Allow all public access users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access weekly_blocks" ON weekly_blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access daily_habits" ON daily_habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access leaderboard" ON leaderboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access weekly_reviews" ON weekly_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access current_affairs" ON current_affairs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access mentor_applications" ON mentor_applications FOR ALL USING (true) WITH CHECK (true);


-- -------------------------------------------------------------
-- SEED DATA
-- -------------------------------------------------------------

-- Seed users
INSERT INTO users (id, name, email, password, role, phone, city, "targetYear", "studyStreak", "totalScore", rank, badges, "enrolledCourses", "joinedAt", "currentWeek", "currentMonth", "lastLogin", expertise, rating, "totalReviews", bio, "approvalStatus", "totalSessions", "studentsGuided", availability) VALUES
('u1', 'Arjun Sharma', 'student@upsc.com', 'password123', 'student', '+91 9876543210', 'Delhi', 2025, 14, 82.5, 23, '["7-Day Streak", "Rising Star"]'::jsonb, '["c1", "c3"]'::jsonb, '2024-01-15T10:00:00Z', 12, 3, '2024-04-20T08:00:00Z', '[]'::jsonb, 0.0, 0, NULL, NULL, 0, 0, '[]'::jsonb),
('u2', 'Priya Nair', 'priya@upsc.com', 'password123', 'student', '+91 9876543211', 'Kochi', 2025, 7, 76.0, 31, '["7-Day Streak"]'::jsonb, '["c1"]'::jsonb, '2024-02-20T10:00:00Z', 10, 3, '2024-04-19T09:00:00Z', '[]'::jsonb, 0.0, 0, NULL, NULL, 0, 0, '[]'::jsonb),
('u3', 'Rahul Verma', 'rahul@upsc.com', 'password123', 'student', '+91 9876543212', 'Lucknow', 2025, 30, 91.0, 5, '["7-Day Streak", "News Ninja", "Rising Star", "Prelims Ace"]'::jsonb, '["c1", "c2", "c3"]'::jsonb, '2024-01-01T10:00:00Z', 16, 4, '2024-04-20T07:30:00Z', '[]'::jsonb, 0.0, 0, NULL, NULL, 0, 0, '[]'::jsonb),
('m1', 'Dr. Ramesh Kumar', 'mentor@upsc.com', 'password123', 'mentor', '+91 9876500001', 'Delhi', NULL, 0, 0.0, NULL, '[]'::jsonb, '[]'::jsonb, '2023-03-01T10:00:00Z', 1, 1, '2024-04-20T08:00:00Z', '["History", "Polity", "GS Paper 1", "GS Paper 2"]'::jsonb, 4.8, 142, 'Former IRS officer with 8 years of UPSC mentoring experience. Helped 200+ aspirants clear Prelims.', 'approved', 380, 85, '["Monday-10:00 AM", "Monday-4:00 PM", "Wednesday-10:00 AM", "Saturday-10:00 AM", "Saturday-11:00 AM"]'::jsonb),
('m2', 'Prof. Anita Singh', 'anita@upsc.com', 'password123', 'mentor', '+91 9876500002', 'Bhopal', NULL, 0, 0.0, NULL, '[]'::jsonb, '[]'::jsonb, '2023-04-15T10:00:00Z', 1, 1, '2024-04-19T09:00:00Z', '["Geography", "Environment", "GS Paper 1"]'::jsonb, 4.7, 98, 'Geography professor with PhD in Physical Geography. Specialized in UPSC Mains answer writing.', 'approved', 245, 62, '["Tuesday-11:00 AM", "Thursday-2:00 PM", "Friday-3:00 PM"]'::jsonb),
('m3', 'Advocate Suresh Mehta', 'suresh@upsc.com', 'password123', 'mentor', '+91 9876500003', 'Mumbai', NULL, 0, 0.0, NULL, '[]'::jsonb, '[]'::jsonb, '2023-02-01T10:00:00Z', 1, 1, '2024-04-20T07:30:00Z', '["Polity", "Governance", "Ethics", "GS Paper 2", "GS Paper 4"]'::jsonb, 4.9, 211, 'Advocate at Bombay High Court. Expert in Constitutional Law and Governance. 3-time UPSC Mains qualifier.', 'approved', 510, 120, '["Wednesday-2:00 PM", "Wednesday-4:00 PM", "Friday-11:00 AM"]'::jsonb),
('m4', 'Dr. Kavitha Rao', 'kavitha@upsc.com', 'password123', 'mentor', '+91 9876500004', 'Chennai', NULL, 0, 0.0, NULL, '[]'::jsonb, '[]'::jsonb, '2024-03-10T10:00:00Z', 1, 1, NULL, '["Economy", "Social Issues", "GS Paper 3"]'::jsonb, 4.6, 76, 'Economist and policy researcher. Former NITI Aayog consultant. Expertise in Indian economic policy.', 'pending', 0, 0, '[]'::jsonb),
('m5', 'Col. Vijay Nair (Retd.)', 'vijay@upsc.com', 'password123', 'mentor', '+91 9876500005', 'Pune', NULL, 0, 0.0, NULL, '[]'::jsonb, '[]'::jsonb, '2024-04-01T10:00:00Z', 1, 1, NULL, '["Internal Security", "International Relations", "GS Paper 3", "GS Paper 2"]'::jsonb, 4.8, 134, 'Retired Army Colonel with 25 years of service. Cleared UPSC CSE in 1997. Expert in defence, security, and IR.', 'pending', 0, 0, '[]'::jsonb),
('a1', 'Super Admin', 'admin@igen.com', 'admin123', 'admin', '+91 9000000001', 'Delhi', NULL, 0, 0.0, NULL, '[]'::jsonb, '[]'::jsonb, '2023-01-01T10:00:00Z', 1, 1, NULL, '[]'::jsonb, 0.0, 0, NULL, NULL, 0, 0, '[]'::jsonb);

-- Seed courses
INSERT INTO courses (id, title, description, category, type, instructor, duration, "durationWeeks", "totalMonths", "totalLessons", "totalTests", "enrolledStudents", rating, price, "isFeatured", tags, "createdAt", status, subjects) VALUES
('c1', 'UPSC CSE Full Year Course 2025', 'The flagship 12-month structured preparation journey with daily habit tracking, weekly mentor-gated reviews, gamified leaderboard, and live video sessions. Covers the entire UPSC CSE Prelims + Mains syllabus.', 'Full Year', 'FullYear', 'Dr. Ramesh Kumar', '12 months', 52, 12, 480, 120, 8500, 4.8, 25000, TRUE, '["GS1", "GS2", "GS3", "GS4", "CSAT", "Full Year"]'::jsonb, '2024-01-01T00:00:00Z', 'active', '["History", "Geography", "Polity", "Economy", "Environment", "Science", "Ethics", "CSAT"]'::jsonb),
('c2', 'Indian Polity & Governance Masterclass', '8-week deep dive into Indian Constitution, Political System, Panchayati Raj, Public Policy and Rights Issues. Same weekly review lock system as the full year course.', 'Subject Specific', 'SubjectSpecific', 'Advocate Suresh Mehta', '8 weeks', 8, 2, 120, 40, 6300, 4.9, 5000, TRUE, '["Polity", "Governance", "Constitution"]'::jsonb, '2024-02-01T00:00:00Z', 'active', '["Constitution", "Governance", "Rights", "Panchayati Raj", "Political System"]'::jsonb),
('c3', 'History — Ancient, Medieval & Modern', '6-week structured course covering the complete UPSC History syllabus from Indus Valley to Modern India. Includes culture, art, architecture and world history.', 'Subject Specific', 'SubjectSpecific', 'Dr. Ramesh Kumar', '6 weeks', 6, 2, 90, 30, 4200, 4.7, 3500, FALSE, '["History", "Culture", "Art"]'::jsonb, '2024-03-01T00:00:00Z', 'active', '["Ancient History", "Medieval History", "Modern History", "World History"]'::jsonb),
('c4', 'Indian Economy & Social Development', '6-week course covering Indian Economy, Sustainable Development, Poverty, Inclusion, Demographics and Social Sector initiatives for Prelims and Mains.', 'Subject Specific', 'SubjectSpecific', 'Dr. Kavitha Rao', '6 weeks', 6, 2, 85, 28, 3800, 4.6, 3500, FALSE, '["Economy", "Social Development"]'::jsonb, '2024-03-10T00:00:00Z', 'active', '["Indian Economy", "Social Development", "Demographics"]'::jsonb),
('c5', 'Environment, Ecology & Biodiversity', '4-week intensive course on Environment, Ecology, Biodiversity and Climate Change — one of the highest-scoring UPSC topics.', 'Subject Specific', 'SubjectSpecific', 'Prof. Anita Singh', '4 weeks', 4, 1, 60, 20, 2900, 4.7, 2500, FALSE, '["Environment", "Ecology", "Biodiversity"]'::jsonb, '2024-03-20T00:00:00Z', 'active', '["Environment", "Ecology", "Biodiversity", "Climate Change"]'::jsonb),
('c6', 'Ethics, Integrity & Aptitude (GS Paper 4)', '6-week course exclusively on GS Paper 4 — Ethics, Integrity and Aptitude. Covers case studies, thinkers, emotional intelligence and attitude.', 'Subject Specific', 'SubjectSpecific', 'Advocate Suresh Mehta', '6 weeks', 6, 2, 72, 24, 1800, 4.8, 3000, FALSE, '["Ethics", "Integrity", "GS Paper 4"]'::jsonb, '2024-04-01T00:00:00Z', 'active', '["Ethics", "Integrity", "Aptitude", "Case Studies"]'::jsonb);

-- Seed weekly blocks
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

-- Seed daily habits
INSERT INTO daily_habits (id, "userId", date, "topicCompleted", "topicDurationMins", "quizAttended", "quizScore", "quizTotal", "newspaperRead", "newspaperHeadlines", "exerciseDone", "exerciseMins", "notesSubmitted", "disciplineScore") VALUES
('dh1', 'u1', '2024-04-20', TRUE, 55, TRUE, 8, 10, TRUE, 'SC upholds ECI powers; Budget fiscal deficit at 5.1%; G20 legacy', TRUE, 35, TRUE, 4.0),
('dh2', 'u1', '2024-04-19', TRUE, 48, TRUE, 7, 10, TRUE, 'India GDP growth; ISRO next mission; India-EU trade talks', TRUE, 30, FALSE, 3.5),
('dh3', 'u1', '2024-04-18', TRUE, 60, TRUE, 9, 10, TRUE, 'Chandrayaan update; India-US 2+2; Climate targets review', FALSE, 0, FALSE, 2.9),
('dh4', 'u1', '2024-04-17', FALSE, 0, TRUE, 6, 10, TRUE, 'Budget session; New laws; Health ministry', TRUE, 45, FALSE, 2.5);

-- Seed sessions
INSERT INTO sessions (id, "mentorId", "studentId", type, subject, "scheduledAt", "durationMins", status, "meetLink", "studentRating", feedback) VALUES
('s1', 'm1', 'u1', 'Weekly Review', 'Federalism & Centre-State Relations', '2024-04-21T17:00:00Z', 60, 'Booked', 'https://meet.igen.com/review-u1-w12', NULL, NULL),
('s2', 'm3', 'u1', '1-on-1 Clarification', 'Emergency Provisions', '2024-04-22T15:00:00Z', 30, 'Booked', 'https://meet.igen.com/class-u1-s2', NULL, NULL),
('s3', 'm1', 'u1', 'Weekly Review', 'DPSP & Fundamental Duties', '2024-04-14T17:00:00Z', 60, 'Completed', 'https://meet.igen.com/review-u1-w11', 5, 'Excellent session! Dr. Kumar''s oral questions really tested my understanding of DPSP.'),
('s4', 'm2', 'u1', 'Group Discussion', 'India''s River Systems', '2024-04-16T18:00:00Z', 60, 'Completed', 'https://meet.igen.com/gd-s4', 4, 'Great discussion with other aspirants.');

-- Seed leaderboard
INSERT INTO leaderboard (rank, "userId", name, city, score, streak, badge, "weeklyChange") VALUES
(1, 'lb1', 'Sneha Iyer', 'Bengaluru', 96.5, 62, 'Course Completer', 0),
(2, 'lb2', 'Karthik Subramanian', 'Chennai', 94.2, 58, 'Prelims Ace', 1),
(3, 'lb3', 'Meera Pillai', 'Trivandrum', 92.8, 45, 'Mains Maven', -1),
(4, 'lb4', 'Amit Rawat', 'Dehradun', 91.5, 40, 'News Ninja', 2),
(5, 'u3', 'Rahul Verma', 'Lucknow', 91.0, 30, 'Prelims Ace', 0),
(6, 'lb6', 'Pooja Gupta', 'Jaipur', 89.3, 35, '7-Day Streak', -1),
(7, 'lb7', 'Ravi Shankar', 'Hyderabad', 88.7, 28, 'Rising Star', 3),
(8, 'lb8', 'Divya Menon', 'Kochi', 87.9, 22, '7-Day Streak', 0),
(9, 'lb9', 'Vikram Singh', 'Chandigarh', 86.4, 19, 'News Ninja', -2),
(10, 'lb10', 'Ananya Krishnan', 'Coimbatore', 85.1, 17, '7-Day Streak', 1),
(11, 'lb11', 'Nikhil Tiwari', 'Varanasi', 84.7, 15, 'Rising Star', 0),
(12, 'lb12', 'Shalini Reddy', 'Hyderabad', 83.8, 14, '7-Day Streak', 2),
(23, 'u1', 'Arjun Sharma', 'Delhi', 82.5, 14, 'Rising Star', 2),
(31, 'u2', 'Priya Nair', 'Kochi', 76.0, 7, '7-Day Streak', -1);

-- Seed weekly reviews
INSERT INTO weekly_reviews (id, "userId", "weekId", "reviewerId", "reviewerName", "scheduledAt", status, "disciplineScore", "oralScore", "prelimScore", "mainsScore", "totalScore", "reviewerFeedback", "nextWeekUnlocked") VALUES
('wr1', 'u1', 'w11', 'm1', 'Dr. Ramesh Kumar', '2024-04-14T17:00:00Z', 'Completed', 3.9, 1.8, 1.7, 1.5, 8.9, 'Excellent conceptual clarity on DPSP. Your oral answers were concise and well-structured. Work on Mains answer writing — use more examples. Keep the newspaper reading habit going!', TRUE),
('wr2', 'u1', 'w12', 'm1', 'Dr. Ramesh Kumar', '2024-04-21T17:00:00Z', 'Scheduled', 3.6, NULL, NULL, NULL, NULL, NULL, FALSE);

-- Seed announcements
INSERT INTO announcements (id, title, content, type, "publishedAt", "isActive") VALUES
('an1', 'UPSC CSE 2025 Notification Released', 'UPSC has released official notification for CSE 2025. Prelims scheduled for June 2025. Applications open till March 18.', 'Important', '2024-04-20T09:00:00Z', TRUE),
('an2', 'New Mock Test Series — 20 Full Length Tests Added', 'We''ve added 20 new full-length mock tests for UPSC Prelims 2025 based on the latest pattern with detailed solutions.', 'Update', '2024-04-15T09:00:00Z', TRUE),
('an3', 'Live Session: Budget 2024 Analysis — April 22, 6 PM', 'Join Dr. Kavitha Rao for a detailed analysis of Interim Budget 2024-25 and its implications for UPSC GS3.', 'Event', '2024-04-18T09:00:00Z', TRUE),
('an4', 'Week 12 Review Reminder', 'Students on Week 12 must book their reviewer by Saturday to avoid delay. Limited slots available.', 'Reminder', '2024-04-20T06:00:00Z', TRUE);

-- Seed current affairs
INSERT INTO current_affairs (id, title, summary, content, category, tags, "relevantFor", "publishedAt", "readTime", "isBookmarked") VALUES
('ca1', 'India''s G20 Presidency Outcomes', 'India''s G20 Presidency resulted in landmark agreements on debt restructuring, climate finance, and digital infrastructure. The New Delhi Declaration was adopted by consensus, and the African Union joined as a member.', 'India held the G20 Presidency from December 2022 to November 2023. Key outcomes: New Delhi Declaration adopted unanimously, African Union joined G20 as permanent member, Global Biofuels Alliance launched, India-Middle East-Europe Economic Corridor announced.', 'International Relations', '["G20", "International Relations", "India"]'::jsonb, '["Prelims", "Mains GS2"]'::jsonb, '2024-04-20T09:00:00Z', 8, FALSE),
('ca2', 'Interim Budget 2024-25 Key Highlights', 'Fiscal deficit target at 5.1% of GDP, Capital expenditure of Rs 11.11 lakh crore, focus on infrastructure and green energy.', 'Finance Minister presented the Interim Budget 2024-25 on February 1, 2024. Key highlights include fiscal consolidation, infrastructure push, housing expansion, railway modernization, and green energy initiatives.', 'Economy', '["Budget", "Economy", "Fiscal Policy"]'::jsonb, '["Prelims", "Mains GS3"]'::jsonb, '2024-04-18T09:00:00Z', 10, TRUE),
('ca3', 'Chandrayaan-3 & ISRO''s Space Milestones', 'India''s Chandrayaan-3 successfully landed near Moon''s south pole on Aug 23, 2023. India becomes 4th country to achieve soft lunar landing.', 'Chandrayaan-3 launched July 14, 2023. Vikram lander and Pragyan rover landed on lunar south pole region. Aditya-L1, India''s first solar mission, also launched. ISRO prepares for Gaganyaan crewed mission.', 'Science & Technology', '["Space", "ISRO", "Science"]'::jsonb, '["Prelims", "Mains GS3"]'::jsonb, '2024-04-15T09:00:00Z', 7, FALSE),
('ca4', 'India''s Digital Public Infrastructure', 'India''s DPI stack — Aadhaar, UPI, DigiLocker — is being recognized globally as a model for financial inclusion and digital governance.', 'India''s Digital Public Infrastructure comprises Aadhaar for identity, UPI for payments, DigiLocker for documents, and ONDC for open commerce. The India Stack has been adopted by several developing nations.', 'Governance', '["Digital India", "Governance", "Technology"]'::jsonb, '["Prelims", "Mains GS2"]'::jsonb, '2024-04-12T09:00:00Z', 9, FALSE),
('ca5', 'Paris Agreement & India''s Climate NDC', 'India''s updated NDC targets 50% of cumulative power from non-fossil sources by 2030 and 45% reduction in emissions intensity.', 'India submitted updated NDC in August 2022. Targets: 45% reduction in emissions intensity of GDP by 2030, 50% cumulative electric power installed capacity from non-fossil sources, net-zero by 2070.', 'Environment', '["Climate Change", "Paris Agreement", "Environment"]'::jsonb, '["Prelims", "Mains GS3"]'::jsonb, '2024-04-10T09:00:00Z', 6, TRUE),
('ca6', 'India-Middle East-Europe Economic Corridor (IMEC)', 'IMEC announced at G20 Summit as connectivity initiative connecting India to Europe through Middle East via rail and sea.', 'IMEC announced September 9, 2023 at G20 New Delhi Summit. East corridor connecting India to Gulf. Northern corridor connecting Gulf to Europe. Signatories: India, Saudi Arabia, UAE, EU, France, Germany, Italy, USA.', 'International Relations', '["IMEC", "Connectivity", "International Relations"]'::jsonb, '["Prelims", "Mains GS2"]'::jsonb, '2024-04-08T09:00:00Z', 8, FALSE);

-- Seed mentor applications
INSERT INTO mentor_applications (id, "applicantName", "applicantId", email, subjects, qualification, experience, "teachingMode", status, "appliedAt", "reviewedBy", "reviewNote") VALUES
('ma1', 'Dr. Kavitha Rao', 'm4', 'kavitha@upsc.com', '["Economy", "Social Issues", "GS Paper 3"]'::jsonb, 'PhD Economics, NITI Aayog Consultant', '8 years', 'both', 'pending', '2024-04-10T10:00:00Z', NULL, NULL),
('ma2', 'Col. Vijay Nair (Retd.)', 'm5', 'vijay@upsc.com', '["Internal Security", "International Relations", "GS Paper 3"]'::jsonb, 'M.Sc Defence Studies, 25 years Army service', '5 years mentoring', 'review', 'pending', '2024-04-15T10:00:00Z', NULL, NULL);
