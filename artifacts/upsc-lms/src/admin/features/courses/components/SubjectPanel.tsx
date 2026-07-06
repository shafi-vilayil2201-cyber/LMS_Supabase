import { useState, type FormEvent } from "react";
import { BookOpen, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { Panel, Field, TextArea, SubmitButton } from "./FormPrimitives";
import { getString, getNumber } from "../constants";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

interface SubjectPanelProps {
  subjects: CourseBuilderState["subjects"];
  selectedProgramId: number | null;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (id: number | null) => void;
  isLoading: boolean;
  createMutation: CourseBuilderState["createSubjectMutation"];
  updateMutation: CourseBuilderState["updateSubjectMutation"];
  deleteMutation: CourseBuilderState["deleteSubjectMutation"];
}

export default function SubjectPanel({
  subjects,
  selectedProgramId,
  selectedSubjectId,
  setSelectedSubjectId,
  isLoading,
  createMutation,
  updateMutation,
  deleteMutation,
}: SubjectPanelProps) {
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<any | null>(null);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedProgramId === null) return;
    const data = new FormData(event.currentTarget);
    createMutation.mutate({
      programId: selectedProgramId,
      name: getString(data, "name"),
      description: getString(data, "description"),
      durationMonths: getNumber(data, "durationMonths"),
    });
    event.currentTarget.reset();
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSubject) return;
    const data = new FormData(event.currentTarget);
    updateMutation.mutate({
      id: editingSubject.id,
      payload: {
        name: getString(data, "name"),
        description: getString(data, "description"),
        durationMonths: getNumber(data, "durationMonths"),
      },
    }, {
      onSuccess: () => setEditingSubject(null),
    });
  }

  function handleDelete() {
    if (!deletingSubject) return;
    deleteMutation.mutate(deletingSubject.id, {
      onSuccess: () => setDeletingSubject(null),
    });
  }

  return (
    <>
      <Panel title="Subjects" icon={BookOpen}>
        <form className="space-y-3" onSubmit={handleCreate}>
          <Field label="Name" name="name" placeholder="Polity" />
          <TextArea
            label="Description"
            name="description"
            placeholder="Indian Constitution and governance."
          />
          <Field
            label="Duration Months"
            name="durationMonths"
            type="number"
            min={1}
            max={24}
            placeholder="3"
          />
          <SubmitButton
            disabled={selectedProgramId === null || createMutation.isPending}
          >
            Create Subject
          </SubmitButton>
        </form>

        <div className="mt-5 space-y-2">
          {selectedProgramId === null ? (
            <p className="text-sm text-muted-foreground">
              Select a program to manage subjects.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Loading subjects…</p>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No subjects in this program yet.
            </p>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedSubjectId === subject.id
                    ? "border-[#009E2C] bg-[#009E2C]/10 text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className="flex-1 text-left outline-none min-w-0 pr-2"
                >
                  <span className="block font-semibold text-foreground truncate">
                    {subject.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {subject.duration_months} months
                    {subject.is_published ? " • Published" : " • Draft"}
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSubject(subject);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-muted-foreground/10"
                    title="Edit Subject"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingSubject(subject);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition rounded-md hover:bg-destructive/10"
                    title="Delete Subject"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Edit Subject Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit Subject</DialogTitle>
          </DialogHeader>
          {editingSubject && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Name</span>
                <input
                  name="name"
                  required
                  defaultValue={editingSubject.name}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Description</span>
                <textarea
                  name="description"
                  required
                  defaultValue={editingSubject.description}
                  className="min-h-24 w-full rounded-xl border border-input bg-background text-foreground px-3 py-2 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Duration Months</span>
                <input
                  name="durationMonths"
                  type="number"
                  required
                  min={1}
                  max={24}
                  defaultValue={editingSubject.duration_months}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
                />
              </label>

              <DialogFooter className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
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
      <Dialog open={!!deletingSubject} onOpenChange={(open) => !open && setDeletingSubject(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Delete Subject</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground text-center my-3">
            Are you sure you want to delete <strong className="text-foreground">"{deletingSubject?.name}"</strong>?
            This will permanently remove the subject and all its curriculum data (months, weeks, topics).
            This action <strong className="text-destructive">cannot be undone</strong>.
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDeletingSubject(null)}
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
              {deleteMutation.isPending ? "Deleting..." : "Delete Subject"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const GREEN = "#009E2C";
