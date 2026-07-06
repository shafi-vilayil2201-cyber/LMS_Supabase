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
    <div className="min-h-screen bg-[#F4F7FB]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: NAVY }}>
              Course Builder
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create programs, subjects, curriculum trees, and courses from one workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={cb.refreshAll}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* ── Banners ─────────────────────────────────────────────── */}
        {cb.statusMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {cb.statusMessage}
          </div>
        )}

        {cb.activeError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 h-2 w-2 rounded-full"
                  style={{ background: TEAL }}
                />
                <p className="text-sm text-slate-500">
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
