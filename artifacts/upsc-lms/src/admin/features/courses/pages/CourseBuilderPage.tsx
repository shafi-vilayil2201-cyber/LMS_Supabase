import { RefreshCw } from "lucide-react";
import { useCourseBuilder } from "../hooks/useCourseBuilder";
import { NAVY, TEAL, getErrorMessage } from "../constants";
import ProgramPanel from "../components/ProgramPanel";
import SubjectPanel from "../components/SubjectPanel";
import CurriculumPanel from "../components/CurriculumPanel";
import { CourseCreationPanel, AttachSubjectsPanel } from "../components/CoursePanel";

export default function CourseBuilderPage() {
  const cb = useCourseBuilder();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Course Builder
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create programs, subjects, curriculum trees, and courses from one workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={cb.refreshAll}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* ── Banners ─────────────────────────────────────────────── */}
        {cb.statusMessage && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            {cb.statusMessage}
          </div>
        )}

        {cb.activeError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {getErrorMessage(cb.activeError)}
          </div>
        )}

        {/* ── Main Grid ───────────────────────────────────────────── */}
        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          {/* Left Column */}
          <div className="space-y-5">
            <ProgramPanel
              programs={cb.programs}
              selectedProgramId={cb.selectedProgramId}
              setSelectedProgramId={cb.setSelectedProgramId}
              isLoading={cb.programsQuery.isLoading}
              createMutation={cb.createProgramMutation}
            />

            <SubjectPanel
              subjects={cb.subjects}
              selectedProgramId={cb.selectedProgramId}
              selectedSubjectId={cb.selectedSubjectId}
              setSelectedSubjectId={cb.setSelectedSubjectId}
              isLoading={cb.subjectsQuery.isLoading}
              createMutation={cb.createSubjectMutation}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <CurriculumPanel
              selectedSubjectId={cb.selectedSubjectId}
              selectedSubjectName={cb.selectedSubject?.name ?? null}
              selectedMonthId={cb.selectedMonthId}
              setSelectedMonthId={cb.setSelectedMonthId}
              selectedWeekId={cb.selectedWeekId}
              setSelectedWeekId={cb.setSelectedWeekId}
              curriculum={cb.curriculum}
              isLoading={cb.curriculumQuery.isLoading}
              monthOptions={cb.monthOptions}
              weekOptions={cb.weekOptions}
              createMonthMutation={cb.createMonthMutation}
              createWeekMutation={cb.createWeekMutation}
              createDayTopicMutation={cb.createDayTopicMutation}
            />

            <div className="grid gap-5 xl:grid-cols-2">
              <CourseCreationPanel
                selectedProgramId={cb.selectedProgramId}
                courses={cb.courses}
                selectedCourseId={cb.selectedCourseId}
                setSelectedCourseId={cb.setSelectedCourseId}
                isLoading={cb.coursesQuery.isLoading}
                createMutation={cb.createCourseMutation}
              />

              <AttachSubjectsPanel
                selectedCourseId={cb.selectedCourseId}
                selectedCourseName={cb.selectedCourse?.title ?? null}
                subjects={cb.subjects}
                attachedSubjects={cb.attachedSubjects}
                isLoading={cb.attachedSubjectsQuery.isLoading}
                attachMutation={cb.attachSubjectMutation}
              />
            </div>

            {/* Info Footer */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 h-2 w-2 rounded-full"
                  style={{ background: TEAL }}
                />
                <p className="text-sm text-muted-foreground">
                  All data is persisted to Supabase. Subjects can be reused across
                  multiple courses within the same program.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
