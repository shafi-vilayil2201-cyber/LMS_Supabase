import type { FormEvent } from "react";
import { BookOpen } from "lucide-react";
import { Panel, Field, TextArea, SubmitButton } from "./FormPrimitives";
import { getString, getNumber } from "../constants";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";

interface SubjectPanelProps {
  subjects: CourseBuilderState["subjects"];
  selectedProgramId: number | null;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (id: number) => void;
  isLoading: boolean;
  createMutation: CourseBuilderState["createSubjectMutation"];
}

export default function SubjectPanel({
  subjects,
  selectedProgramId,
  selectedSubjectId,
  setSelectedSubjectId,
  isLoading,
  createMutation,
}: SubjectPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

  return (
    <Panel title="Subjects" icon={BookOpen}>
      <form className="space-y-3" onSubmit={handleSubmit}>
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
            <button
              key={subject.id}
              type="button"
              onClick={() => setSelectedSubjectId(subject.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                selectedSubjectId === subject.id
                  ? "border-[#009E2C] bg-[#009E2C]/10 text-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <span className="block font-semibold text-foreground">
                {subject.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {subject.duration_months} months
                {subject.is_published ? " • Published" : " • Draft"}
              </span>
            </button>
          ))
        )}
      </div>
    </Panel>
  );
}
