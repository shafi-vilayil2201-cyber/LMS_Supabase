-- =============================================================
-- TELEGRAM & N8N ACCOUNTABILITY INTEGRATION MIGRATION
-- Adds: telegram fields to users table, student_profiles,
--        onboarding_answers, daily_tasks, progress_logs,
--        and leaderboard_snapshots
-- =============================================================

-- ─── 1. ALTER USERS TABLE ─────────────────────────────────────
-- Add Telegram fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "telegram_chat_id" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "telegram_username" TEXT,
ADD COLUMN IF NOT EXISTS "onboarding_status" TEXT DEFAULT 'pending' CHECK ("onboarding_status" IN ('pending', 'in_progress', 'completed')),
ADD COLUMN IF NOT EXISTS "study_streak" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMPTZ DEFAULT NOW();

-- ─── 2. STUDENT PROFILES TABLE ──────────────────────────────────
-- Stores detailed onboarding parameters used to personalize tasks
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    years_preparing INT DEFAULT 1,
    strong_subjects TEXT[] DEFAULT '{}',
    weak_subjects TEXT[] DEFAULT '{}',
    study_method TEXT,
    daily_routine TEXT,
    workout_habit TEXT,
    bedtime TEXT,
    goals TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. ONBOARDING ANSWERS TABLE ────────────────────────────────
-- Log table storing responses to individual bot/interview questions
CREATE TABLE IF NOT EXISTS onboarding_answers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    answer TEXT NOT NULL,
    source TEXT DEFAULT 'telegram' CHECK (source IN ('telegram', 'website')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. DAILY TASKS TABLE ───────────────────────────────────────
-- Stores daily accountability blocks assigned to students
CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    task_type TEXT NOT NULL, -- 'study_topic', 'quiz', 'newspaper', 'exercise', 'bedtime'
    title TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    due_time TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT daily_tasks_unique_day UNIQUE (user_id, date, task_type)
);

-- ─── 5. PROGRESS LOGS TABLE ─────────────────────────────────────
-- Audit logs of telegram and website scoring events
CREATE TABLE IF NOT EXISTS progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'telegram_reply', 'daily_checklist_save', 'review_submit'
    source TEXT NOT NULL, -- 'telegram', 'website', 'n8n'
    payload JSONB DEFAULT '{}'::jsonb,
    score_delta NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. LEADERBOARD SNAPSHOTS TABLE ─────────────────────────────
-- Captures streaks and scores for leaderboard persistence
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    score NUMERIC NOT NULL,
    study_minutes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT leaderboard_snapshots_date_user UNIQUE (date, user_id)
);

-- ─── 7. ROW LEVEL SECURITY (RLS) POLICIES ──────────────────────
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Select Policies
CREATE POLICY "Users can read own student_profile" ON student_profiles FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can read own onboarding_answers" ON onboarding_answers FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can read own daily_tasks" ON daily_tasks FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can read own progress_logs" ON progress_logs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Anyone can read leaderboard_snapshots" ON leaderboard_snapshots FOR SELECT USING (TRUE);

-- Write/Update Policies (Admins and Owner Updates)
CREATE POLICY "Users can update own student_profile" ON student_profiles FOR UPDATE USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own student_profile" ON student_profiles FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Admins retain full CRUD on all integration tables
CREATE POLICY "Admins full access on student_profiles" ON student_profiles FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Admins full access on onboarding_answers" ON onboarding_answers FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Admins full access on daily_tasks" ON daily_tasks FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Admins full access on progress_logs" ON progress_logs FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Admins full access on leaderboard_snapshots" ON leaderboard_snapshots FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

-- ─── 8. MIGRATION INDEXES ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_progress_logs_user ON progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_date ON leaderboard_snapshots(date);
