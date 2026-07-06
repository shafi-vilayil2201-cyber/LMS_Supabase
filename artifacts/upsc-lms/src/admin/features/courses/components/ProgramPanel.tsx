import type { FormEvent } from "react";
import { CheckCircle, Layers } from "lucide-react";
import { Panel, Field, SubmitButton } from "./FormPrimitives";
import { getString } from "../constants";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";

interface ProgramPanelProps {
  programs: CourseBuilderState["programs"];
  selectedProgramId: number | null;
  setSelectedProgramId: (id: number) => void;
  isLoading: boolean;
  createMutation: CourseBuilderState["createProgramMutation"];
}

export default function ProgramPanel({
  programs,
  selectedProgramId,
  setSelectedProgramId,
  isLoading,
  createMutation,
}: ProgramPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createMutation.mutate({
      name: getString(data, "name"),
      code: getString(data, "code"),
    });
    event.currentTarget.reset();
  }

  return (
    <Panel title="Programs" icon={Layers}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Field label="Name" name="name" placeholder="UPSC" />
        <Field label="Code" name="code" placeholder="upsc" />
        <SubmitButton disabled={createMutation.isPending}>
          Create Program
        </SubmitButton>
      </form>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading programs…</p>
        ) : programs.length === 0 ? (
          <p className="text-sm text-slate-500">No programs created yet.</p>
        ) : (
          programs.map((program) => (
            <button
              key={program.id}
              type="button"
              onClick={() => setSelectedProgramId(program.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                selectedProgramId === program.id
                  ? "border-[#009E2C] bg-[#009E2C]/10 text-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <span>
                <span className="block font-semibold text-foreground">
                  {program.name}
                </span>
                <span className="text-xs text-muted-foreground">{program.code}</span>
              </span>
              {selectedProgramId === program.id && (
                <CheckCircle className="h-4 w-4 text-[#009E2C]" />
              )}
            </button>
          ))
        )}
      </div>
    </Panel>
  );
}
