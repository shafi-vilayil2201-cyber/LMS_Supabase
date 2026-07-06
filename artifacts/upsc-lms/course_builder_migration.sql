-- =============================================================
-- COURSE BUILDER MIGRATION
-- Adds: programs, subjects, subject_months, subject_weeks,
--        subject_day_topics, course_subjects tables
-- Modifies: courses table (adds program_id, duration_months, status)
-- =============================================================

-- ─── 1. PROGRAMS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT programs_name_unique UNIQUE (name),
    CONSTRAINT programs_code_unique UNIQUE (code),
    CONSTRAINT programs_name_not_empty CHECK (char_length(TRIM(name)) > 0),
    CONSTRAINT programs_code_not_empty CHECK (char_length(TRIM(code)) > 0)
);

-- ─── 2. SUBJECTS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    duration_months INT NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subjects_name_per_program UNIQUE (program_id, name),
    CONSTRAINT subjects_name_max_length CHECK (char_length(name) <= 150),
    CONSTRAINT subjects_desc_max_length CHECK (char_length(description) <= 1000),
    CONSTRAINT subjects_duration_range CHECK (duration_months BETWEEN 1 AND 24)
);

-- ─── 3. SUBJECT MONTHS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS subject_months (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    month_number INT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subject_months_unique UNIQUE (subject_id, month_number),
    CONSTRAINT subject_months_title_max CHECK (char_length(title) <= 150),
    CONSTRAINT subject_months_number_range CHECK (month_number BETWEEN 1 AND 24)
);

-- ─── 4. SUBJECT WEEKS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS subject_weeks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject_month_id BIGINT NOT NULL REFERENCES subject_months(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subject_weeks_unique UNIQUE (subject_month_id, week_number),
    CONSTRAINT subject_weeks_title_max CHECK (char_length(title) <= 150),
    CONSTRAINT subject_weeks_number_range CHECK (week_number BETWEEN 1 AND 6)
);

-- ─── 5. SUBJECT DAY TOPICS TABLE ───────────────────────────────
CREATE TABLE IF NOT EXISTS subject_day_topics (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject_week_id BIGINT NOT NULL REFERENCES subject_weeks(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    estimated_minutes INT NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subject_day_topics_unique UNIQUE (subject_week_id, day_number),
    CONSTRAINT subject_day_topics_title_max CHECK (char_length(title) <= 200),
    CONSTRAINT subject_day_topics_desc_max CHECK (char_length(description) <= 2000),
    CONSTRAINT subject_day_topics_day_range CHECK (day_number BETWEEN 1 AND 7),
    CONSTRAINT subject_day_topics_minutes_range CHECK (estimated_minutes BETWEEN 1 AND 600)
);

-- ─── 6. ADD COLUMNS TO EXISTING COURSES TABLE ──────────────────
-- These columns are nullable so existing rows are unaffected.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'program_id') THEN
        ALTER TABLE courses ADD COLUMN program_id BIGINT REFERENCES programs(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration_months') THEN
        ALTER TABLE courses ADD COLUMN duration_months INT;
    END IF;
    -- The 'status' column already exists on courses, no action needed.
END $$;

-- ─── 7. COURSE SUBJECTS JUNCTION TABLE ─────────────────────────
CREATE TABLE IF NOT EXISTS course_subjects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 1,
    start_month INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT course_subjects_unique UNIQUE (course_id, subject_id),
    CONSTRAINT course_subjects_order_positive CHECK (display_order >= 1),
    CONSTRAINT course_subjects_start_positive CHECK (start_month >= 1)
);

-- ─── 8. INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subjects_program ON subjects(program_id);
CREATE INDEX IF NOT EXISTS idx_subject_months_subject ON subject_months(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_weeks_month ON subject_weeks(subject_month_id);
CREATE INDEX IF NOT EXISTS idx_subject_day_topics_week ON subject_day_topics(subject_week_id);
CREATE INDEX IF NOT EXISTS idx_course_subjects_course ON course_subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_course_subjects_subject ON course_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_program ON courses(program_id);

-- ─── 9. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_day_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_subjects ENABLE ROW LEVEL SECURITY;

-- Admin: full CRUD on all course-builder tables
CREATE POLICY "Admin full access on programs"
    ON programs FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin full access on subjects"
    ON subjects FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin full access on subject_months"
    ON subject_months FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin full access on subject_weeks"
    ON subject_weeks FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin full access on subject_day_topics"
    ON subject_day_topics FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin full access on course_subjects"
    ON course_subjects FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- Authenticated users: read-only on programs, subjects, course_subjects
CREATE POLICY "Authenticated read programs"
    ON programs FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read subjects"
    ON subjects FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read subject_months"
    ON subject_months FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read subject_weeks"
    ON subject_weeks FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read subject_day_topics"
    ON subject_day_topics FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read course_subjects"
    ON course_subjects FOR SELECT
    USING (auth.role() = 'authenticated');
