import { useState, type FormEvent } from "react";
import { CheckCircle, Layers, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { Panel, Field, SubmitButton } from "./FormPrimitives";
import { getString } from "../constants";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

interface ProgramPanelProps {
  programs: CourseBuilderState["programs"];
  selectedProgramId: number | null;
  setSelectedProgramId: (id: number | null) => void;
  isLoading: boolean;
  createMutation: CourseBuilderState["createProgramMutation"];
  updateMutation: CourseBuilderState["updateProgramMutation"];
  deleteMutation: CourseBuilderState["deleteProgramMutation"];
}

export default function ProgramPanel({
  programs,
  selectedProgramId,
  setSelectedProgramId,
  isLoading,
  createMutation,
  updateMutation,
  deleteMutation,
}: ProgramPanelProps) {
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<any | null>(null);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createMutation.mutate({
      name: getString(data, "name"),
      code: getString(data, "code"),
    });
    event.currentTarget.reset();
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProgram) return;
    const data = new FormData(event.currentTarget);
    updateMutation.mutate({
      id: editingProgram.id,
      payload: {
        name: getString(data, "name"),
        code: getString(data, "code"),
      },
    }, {
      onSuccess: () => setEditingProgram(null),
    });
  }

  function handleDelete() {
    if (!deletingProgram) return;
    deleteMutation.mutate(deletingProgram.id, {
      onSuccess: () => setDeletingProgram(null),
    });
  }

  return (
    <>
      <Panel title="Programs" icon={Layers}>
        <form className="space-y-3" onSubmit={handleCreate}>
          <Field label="Name" name="name" placeholder="UPSC" />
          <Field label="Code" name="code" placeholder="upsc" />
          <SubmitButton disabled={createMutation.isPending}>
            Create Program
          </SubmitButton>
        </form>

        <div className="mt-5 space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading programs…</p>
          ) : programs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No programs created yet.</p>
          ) : (
            programs.map((program) => (
              <div
                key={program.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedProgramId === program.id
                    ? "border-[#009E2C] bg-[#009E2C]/10 text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedProgramId(program.id)}
                  className="flex-1 text-left outline-none min-w-0 pr-2"
                >
                  <span className="block font-semibold text-foreground truncate">
                    {program.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{program.code}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProgram(program);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-muted-foreground/10"
                    title="Edit Program"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingProgram(program);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition rounded-md hover:bg-destructive/10"
                    title="Delete Program"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {selectedProgramId === program.id && (
                    <CheckCircle className="h-4 w-4 text-[#009E2C] ml-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Edit Program Dialog */}
      <Dialog open={!!editingProgram} onOpenChange={(open) => !open && setEditingProgram(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit Program</DialogTitle>
          </DialogHeader>
          {editingProgram && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Name</span>
                <input
                  name="name"
                  required
                  defaultValue={editingProgram.name}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Code</span>
                <input
                  name="code"
                  required
                  defaultValue={editingProgram.code}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
                />
              </label>

              <DialogFooter className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
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
      <Dialog open={!!deletingProgram} onOpenChange={(open) => !open && setDeletingProgram(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Delete Program</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground text-center my-3">
            Are you sure you want to delete <strong className="text-foreground">"{deletingProgram?.name}"</strong>?
            This will permanently remove the program, all its subjects, curriculum content, and courses.
            This action <strong className="text-destructive">cannot be undone</strong>.
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDeletingProgram(null)}
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
              {deleteMutation.isPending ? "Deleting..." : "Delete Program"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const GREEN = "#009E2C";
