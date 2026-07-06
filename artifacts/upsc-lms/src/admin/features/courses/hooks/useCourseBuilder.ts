import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  createSubjectMonth,
  updateSubjectMonth,
  deleteSubjectMonth,
  createSubjectWeek,
  updateSubjectWeek,
  deleteSubjectWeek,
  createDayTopic,
  updateDayTopic,
  deleteDayTopic,
  getCoursesByProgram,
  createCourseForProgram,
  updateCourse,
  deleteCourse,
  getAttachedSubjects,
  attachSubjectToCourse,
  detachSubjectFromCourse,
  getSubjectCurriculum,
  type Program,
  type Subject,
  type CourseWithProgramId,
} from "@/admin/services/courseBuilderService";

export function useCourseBuilder() {
  const queryClient = useQueryClient();

  // ── Selection State ────────────────────────────────────────────
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedMonthId, setSelectedMonthId] = useState<number | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function showStatus(msg: string) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  }

  // ── Queries ────────────────────────────────────────────────────

  const programsQuery = useQuery({
    queryKey: ["admin-programs"],
    queryFn: getPrograms,
  });

  const subjectsQuery = useQuery({
    queryKey: ["admin-subjects", selectedProgramId],
    queryFn: () => getSubjects(selectedProgramId!),
    enabled: selectedProgramId !== null,
  });

  const curriculumQuery = useQuery({
    queryKey: ["admin-curriculum", selectedSubjectId],
    queryFn: () => getSubjectCurriculum(selectedSubjectId!),
    enabled: selectedSubjectId !== null,
  });

  const coursesQuery = useQuery({
    queryKey: ["admin-courses", selectedProgramId],
    queryFn: () => getCoursesByProgram(selectedProgramId!),
    enabled: selectedProgramId !== null,
  });

  const attachedSubjectsQuery = useQuery({
    queryKey: ["admin-attached-subjects", selectedCourseId],
    queryFn: () => getAttachedSubjects(selectedCourseId!),
    enabled: selectedCourseId !== null,
  });

  // ── Auto-select first program ─────────────────────────────────

  useEffect(() => {
    if (selectedProgramId === null && programsQuery.data?.length) {
      setSelectedProgramId(programsQuery.data[0].id);
    }
  }, [programsQuery.data, selectedProgramId]);

  // Reset child selections when program changes
  useEffect(() => {
    setSelectedSubjectId(null);
    setSelectedCourseId(null);
    setSelectedMonthId(null);
    setSelectedWeekId(null);
  }, [selectedProgramId]);

  // Reset month/week when subject changes
  useEffect(() => {
    setSelectedMonthId(null);
    setSelectedWeekId(null);
  }, [selectedSubjectId]);

  // ── Mutations ──────────────────────────────────────────────────

  const createProgramMutation = useMutation({
    mutationFn: createProgram,
    onSuccess: (program: Program) => {
      showStatus(`Program created: ${program.name}`);
      setSelectedProgramId(program.id);
      void queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: (subject: Subject) => {
      showStatus(`Subject created: ${subject.name}`);
      setSelectedSubjectId(subject.id);
      void queryClient.invalidateQueries({ queryKey: ["admin-subjects", selectedProgramId] });
    },
  });

  const createMonthMutation = useMutation({
    mutationFn: createSubjectMonth,
    onSuccess: (month) => {
      showStatus(`Month created: ${month.title}`);
      setSelectedMonthId(month.id);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const createWeekMutation = useMutation({
    mutationFn: createSubjectWeek,
    onSuccess: (week) => {
      showStatus(`Week created: ${week.title}`);
      setSelectedWeekId(week.id);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const createDayTopicMutation = useMutation({
    mutationFn: createDayTopic,
    onSuccess: (topic) => {
      showStatus(`Day topic created: ${topic.title}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: createCourseForProgram,
    onSuccess: (course: CourseWithProgramId) => {
      showStatus(`Course created: ${course.title}`);
      setSelectedCourseId(course.id);
      void queryClient.invalidateQueries({ queryKey: ["admin-courses", selectedProgramId] });
    },
  });

  const attachSubjectMutation = useMutation({
    mutationFn: attachSubjectToCourse,
    onSuccess: () => {
      showStatus("Subject attached to course.");
      void queryClient.invalidateQueries({ queryKey: ["admin-attached-subjects", selectedCourseId] });
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; code: string } }) =>
      updateProgram(id, payload),
    onSuccess: (program) => {
      showStatus(`Program updated: ${program.name}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      showStatus("Program deleted.");
      setSelectedProgramId(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; description: string; durationMonths: number } }) =>
      updateSubject(id, payload),
    onSuccess: (subject) => {
      showStatus(`Subject updated: ${subject.name}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-subjects", selectedProgramId] });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      showStatus("Subject deleted.");
      setSelectedSubjectId(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-subjects", selectedProgramId] });
    },
  });

  const updateMonthMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { monthNumber: number; title: string } }) =>
      updateSubjectMonth(id, payload),
    onSuccess: (month) => {
      showStatus(`Month updated: ${month.title}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const deleteMonthMutation = useMutation({
    mutationFn: deleteSubjectMonth,
    onSuccess: () => {
      showStatus("Month deleted.");
      setSelectedMonthId(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const updateWeekMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { weekNumber: number; title: string } }) =>
      updateSubjectWeek(id, payload),
    onSuccess: (week) => {
      showStatus(`Week updated: ${week.title}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const deleteWeekMutation = useMutation({
    mutationFn: deleteSubjectWeek,
    onSuccess: () => {
      showStatus("Week deleted.");
      setSelectedWeekId(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const updateDayTopicMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { dayNumber: number; title: string; description: string; estimatedMinutes: number } }) =>
      updateDayTopic(id, payload),
    onSuccess: (topic) => {
      showStatus(`Day topic updated: ${topic.title}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const deleteDayTopicMutation = useMutation({
    mutationFn: deleteDayTopic,
    onSuccess: () => {
      showStatus("Day topic deleted.");
      void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title: string; description: string; durationMonths: number; price: number } }) =>
      updateCourse(id, payload),
    onSuccess: (course) => {
      showStatus(`Course updated: ${course.title}`);
      void queryClient.invalidateQueries({ queryKey: ["admin-courses", selectedProgramId] });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      showStatus("Course deleted.");
      setSelectedCourseId(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-courses", selectedProgramId] });
    },
  });

  const detachSubjectMutation = useMutation({
    mutationFn: ({ courseId, subjectId }: { courseId: string; subjectId: number }) =>
      detachSubjectFromCourse(courseId, subjectId),
    onSuccess: () => {
      showStatus("Subject detached from course.");
      void queryClient.invalidateQueries({ queryKey: ["admin-attached-subjects", selectedCourseId] });
    },
  });

  // ── Refresh All ────────────────────────────────────────────────

  function refreshAll() {
    void queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-subjects", selectedProgramId] });
    void queryClient.invalidateQueries({ queryKey: ["admin-courses", selectedProgramId] });
    void queryClient.invalidateQueries({ queryKey: ["admin-curriculum", selectedSubjectId] });
    void queryClient.invalidateQueries({ queryKey: ["admin-attached-subjects", selectedCourseId] });
  }

  // ── Aggregate Error ────────────────────────────────────────────

  const activeError =
    createProgramMutation.error ??
    createSubjectMutation.error ??
    createMonthMutation.error ??
    createWeekMutation.error ??
    createDayTopicMutation.error ??
    createCourseMutation.error ??
    attachSubjectMutation.error ??
    programsQuery.error ??
    subjectsQuery.error ??
    coursesQuery.error ??
    curriculumQuery.error ??
    attachedSubjectsQuery.error;

  // ── Derived Data ───────────────────────────────────────────────

  const programs = programsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const courses = coursesQuery.data ?? [];
  const curriculum = curriculumQuery.data ?? null;
  const attachedSubjects = attachedSubjectsQuery.data ?? [];

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? null;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;

  const monthOptions =
    curriculum?.months?.map((m) => ({
      id: m.id,
      label: `Month ${m.month_number}: ${m.title}`,
    })) ?? [];

  const weekOptions =
    curriculum?.months
      ?.find((m) => m.id === selectedMonthId)
      ?.weeks?.map((w) => ({
        id: w.id,
        label: `Week ${w.week_number}: ${w.title}`,
      })) ?? [];

  return {
    // Selection state
    selectedProgramId,
    setSelectedProgramId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedCourseId,
    setSelectedCourseId,
    selectedMonthId,
    setSelectedMonthId,
    selectedWeekId,
    setSelectedWeekId,

    // Status
    statusMessage,
    activeError,

    // Queries
    programsQuery,
    subjectsQuery,
    curriculumQuery,
    coursesQuery,
    attachedSubjectsQuery,

    // Mutations
    createProgramMutation,
    updateProgramMutation,
    deleteProgramMutation,
    createSubjectMutation,
    updateSubjectMutation,
    deleteSubjectMutation,
    createMonthMutation,
    updateMonthMutation,
    deleteMonthMutation,
    createWeekMutation,
    updateWeekMutation,
    deleteWeekMutation,
    createDayTopicMutation,
    updateDayTopicMutation,
    deleteDayTopicMutation,
    createCourseMutation,
    updateCourseMutation,
    deleteCourseMutation,
    attachSubjectMutation,
    detachSubjectMutation,

    // Derived
    programs,
    subjects,
    courses,
    curriculum,
    attachedSubjects,
    selectedSubject,
    selectedCourse,
    monthOptions,
    weekOptions,

    // Actions
    refreshAll,
  };
}

export type CourseBuilderState = ReturnType<typeof useCourseBuilder>;
