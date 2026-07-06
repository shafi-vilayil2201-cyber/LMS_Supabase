import type { FormEvent } from "react";
import { CalendarDays, Link2 } from "lucide-react";
import { Panel, Field, TextArea, SubmitButton } from "./FormPrimitives";
import { getString, getNumber } from "../constants";
import type { Subject, AttachedSubject, CourseWithProgramId } from "@/admin/services/courseBuilderService";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";

// ─── Course Creation Panel ───────────────────────────────────────────────────

interface CoursePanelProps {
  selectedProgramId: number | null;
  courses: CourseWithProgramId[];
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string) => void;
  isLoading: boolean;
  createMutation: CourseBuilderState["createCourseMutation"];
}

export function CourseCreationPanel({
  selectedProgramId,
  courses,
  selectedCourseId,
  setSelectedCourseId,
  isLoading,
  createMutation,
}: CoursePanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedProgramId === null) return;
    const data = new FormData(event.currentTarget);
    createMutation.mutate({
      programId: selectedProgramId,
      title: getString(data, "title"),
      description: getString(data, "description"),
      durationMonths: getNumber(data, "durationMonths"),
      price: getNumber(data, "price"),
    });
    event.currentTarget.reset();
  }

  return (
    <Panel title="Courses" icon={CalendarDays}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Field label="Title" name="title" placeholder="UPSC One Year Foundation" />
        <TextArea label="Description" name="description" placeholder="Complete structured UPSC course." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Duration Months" name="durationMonths" type="number" min={1} max={36} placeholder="12" />
          <Field label="Price" name="price" type="number" min={0} placeholder="25000" />
        </div>
        <SubmitButton disabled={selectedProgramId === null || createMutation.isPending}>
          Create Course
        </SubmitButton>
      </form>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading courses…</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses in this program yet.</p>
        ) : (
          courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                selectedCourseId === course.id
                  ? "border-[#009E2C] bg-[#009E2C]/10 text-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <span className="block font-semibold text-foreground">
                {course.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {course.duration_months} months · ₹
                {(course.price ?? 0).toLocaleString("en-IN")} · {course.status}
              </span>
            </button>
          ))
        )}
      </div>
    </Panel>
  );
}

// ─── Attach Subjects Panel ───────────────────────────────────────────────────

interface AttachSubjectsPanelProps {
  selectedCourseId: string | null;
  selectedCourseName: string | null;
  subjects: Subject[];
  attachedSubjects: AttachedSubject[];
  isLoading: boolean;
  attachMutation: CourseBuilderState["attachSubjectMutation"];
}

export function AttachSubjectsPanel({
  selectedCourseId,
  selectedCourseName,
  subjects,
  attachedSubjects,
  isLoading,
  attachMutation,
}: AttachSubjectsPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedCourseId === null) return;
    const data = new FormData(event.currentTarget);
    attachMutation.mutate({
      courseId: selectedCourseId,
      subjectId: getNumber(data, "subjectId"),
      displayOrder: getNumber(data, "displayOrder"),
      startMonth: getNumber(data, "startMonth"),
    });
    event.currentTarget.reset();
  }

  return (
    <Panel title="Attach Subjects" icon={Link2}>
      <div className="mb-4 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm">
        <span className="font-semibold text-foreground">Selected course:</span>{" "}
        <span className="text-muted-foreground">{selectedCourseName ?? "None"}</span>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="space-y-1.5 block">
          <span className="text-xs font-semibold text-muted-foreground">Subject</span>
          <select
            name="subjectId"
            required
            className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
          >
            <option value="" className="bg-background text-foreground">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id} className="bg-background text-foreground">
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Display Order" name="displayOrder" type="number" min={1} placeholder="1" />
          <Field label="Start Month" name="startMonth" type="number" min={1} placeholder="1" />
        </div>

        <SubmitButton
          disabled={selectedCourseId === null || subjects.length === 0 || attachMutation.isPending}
        >
          Attach Subject
        </SubmitButton>
      </form>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        ) : attachedSubjects.length > 0 ? (
          attachedSubjects.map((subject) => (
            <div
              key={`${subject.subject_id}-${subject.display_order}`}
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <p className="text-sm font-semibold text-foreground">
                {subject.subject_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Order {subject.display_order} · starts month {subject.start_month}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No subjects attached to this course yet.
          </p>
        )}
      </div>
    </Panel>
  );
}
