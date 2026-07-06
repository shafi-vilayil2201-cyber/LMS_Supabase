import { useState, type FormEvent } from "react";
import { CalendarDays, Link2, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { Panel, Field, TextArea, SubmitButton } from "./FormPrimitives";
import { getString, getNumber } from "../constants";
import type { Subject, AttachedSubject, CourseWithProgramId } from "@/admin/services/courseBuilderService";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// ─── Course Creation Panel ───────────────────────────────────────────────────

interface CoursePanelProps {
  selectedProgramId: number | null;
  courses: CourseWithProgramId[];
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  isLoading: boolean;
  createMutation: CourseBuilderState["createCourseMutation"];
  updateMutation: CourseBuilderState["updateCourseMutation"];
  deleteMutation: CourseBuilderState["deleteCourseMutation"];
}

export function CourseCreationPanel({
  selectedProgramId,
  courses,
  selectedCourseId,
  setSelectedCourseId,
  isLoading,
  createMutation,
  updateMutation,
  deleteMutation,
}: CoursePanelProps) {
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<any | null>(null);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
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

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCourse) return;
    const data = new FormData(event.currentTarget);
    updateMutation.mutate({
      id: editingCourse.id,
      payload: {
        title: getString(data, "title"),
        description: getString(data, "description"),
        durationMonths: getNumber(data, "durationMonths"),
        price: getNumber(data, "price"),
      },
    }, {
      onSuccess: () => setEditingCourse(null),
    });
  }

  function handleDelete() {
    if (!deletingCourse) return;
    deleteMutation.mutate(deletingCourse.id, {
      onSuccess: () => setDeletingCourse(null),
    });
  }

  return (
    <>
      <Panel title="Courses" icon={CalendarDays}>
        <form className="space-y-3" onSubmit={handleCreate}>
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
              <div
                key={course.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedCourseId === course.id
                    ? "border-[#009E2C] bg-[#009E2C]/10 text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCourseId(course.id)}
                  className="flex-1 text-left outline-none min-w-0 pr-2"
                >
                  <span className="block font-semibold text-foreground truncate">
                    {course.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {course.duration_months} months · ₹
                    {(course.price ?? 0).toLocaleString("en-IN")} · {course.status}
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCourse(course);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-muted-foreground/10"
                    title="Edit Course"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingCourse(course);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition rounded-md hover:bg-destructive/10"
                    title="Delete Course"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit Course</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Title</span>
                <input
                  name="title"
                  required
                  defaultValue={editingCourse.title}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Description</span>
                <textarea
                  name="description"
                  required
                  defaultValue={editingCourse.description}
                  className="min-h-24 w-full rounded-xl border border-input bg-background text-foreground px-3 py-2 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 block">
                  <span className="text-xs font-semibold text-muted-foreground">Duration Months</span>
                  <input
                    name="durationMonths"
                    type="number"
                    required
                    min={1}
                    max={36}
                    defaultValue={editingCourse.duration_months}
                    className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                  />
                </label>
                <label className="space-y-1.5 block">
                  <span className="text-xs font-semibold text-muted-foreground">Price</span>
                  <input
                    name="price"
                    type="number"
                    required
                    min={0}
                    defaultValue={editingCourse.price}
                    className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                  />
                </label>
              </div>

              <DialogFooter className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="h-10 px-4 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                  style={{ background: GREEN }}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Warning Dialog */}
      <Dialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Delete Course</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground text-center my-3">
            Are you sure you want to delete <strong className="text-foreground">"{deletingCourse?.title}"</strong>?
            This will permanently remove the course. This action <strong className="text-destructive">cannot be undone</strong>.
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDeletingCourse(null)}
              className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-10 px-4 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-xl transition"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
  detachMutation: CourseBuilderState["detachSubjectMutation"];
}

export function AttachSubjectsPanel({
  selectedCourseId,
  selectedCourseName,
  subjects,
  attachedSubjects,
  isLoading,
  attachMutation,
  detachMutation,
}: AttachSubjectsPanelProps) {
  const [detachingSubject, setDetachingSubject] = useState<any | null>(null);

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

  function handleDetach() {
    if (!selectedCourseId || !detachingSubject) return;
    detachMutation.mutate({
      courseId: selectedCourseId,
      subjectId: detachingSubject.subject_id,
    }, {
      onSuccess: () => setDetachingSubject(null),
    });
  }

  return (
    <>
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
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-sm"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-foreground truncate">
                    {subject.subject_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order {subject.display_order} · starts month {subject.start_month}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetachingSubject(subject)}
                  className="p-1 text-muted-foreground hover:text-destructive transition rounded-md hover:bg-destructive/10 flex-shrink-0"
                  title="Detach Subject"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No subjects attached to this course yet.
            </p>
          )}
        </div>
      </Panel>

      {/* Detach Confirmation Warning Dialog */}
      <Dialog open={!!detachingSubject} onOpenChange={(open) => !open && setDetachingSubject(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Detach Subject</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground text-center my-3">
            Are you sure you want to detach <strong className="text-foreground">"{detachingSubject?.subject_name}"</strong> from this course?
            This does not delete the subject itself, only its attachment to this course.
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDetachingSubject(null)}
              className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDetach}
              disabled={detachMutation.isPending}
              className="h-10 px-4 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-xl transition"
            >
              {detachMutation.isPending ? "Detaching..." : "Detach Subject"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const GREEN = "#009E2C";
