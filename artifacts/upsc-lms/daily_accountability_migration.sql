-- =============================================================
-- DAILY ACCOUNTABILITY & HABIT TRACKER SCHEMA EXTENSIONS
-- Adds JSONB columns to daily_habits to store custom habits,
-- focus sessions, morning strategy, and night reviews in Supabase.
-- =============================================================

ALTER TABLE daily_habits 
ADD COLUMN IF NOT EXISTS "morningPlan" JSONB DEFAULT '{"plannedHours": 8, "actualHours": 0, "tasksPlanned": 5, "tasksCompleted": 0, "primaryFocusSubject": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS "focusSessions" JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS "nightReview" JSONB DEFAULT '{"submitted": false}'::jsonb,
ADD COLUMN IF NOT EXISTS "customHabits" JSONB DEFAULT '[]'::jsonb;
