import { useState, type FormEvent } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  ListTree,
} from "lucide-react";
import { Panel, Field, TextArea, SelectField, SubmitButton } from "./FormPrimitives";
import { getString, getNumber, NAVY, GREEN } from "../constants";
import type { CurriculumTree } from "@/admin/services/courseBuilderService";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";

// ─── Curriculum Tree View ────────────────────────────────────────────────────

function CurriculumTreeView({ tree }: { tree: CurriculumTree }) {
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  function toggleMonth(id: number) {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleWeek(id: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (tree.months.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No curriculum content yet. Start by adding months.
      </p>
    );
  }

  const totalWeeks = tree.months.reduce((acc, m) => acc + m.weeks.length, 0);
  const totalTopics = tree.months.reduce(
    (acc, m) => acc + m.weeks.reduce((wa, w) => wa + w.dayTopics.length, 0),
    0
  );

  return (
    <div className="space-y-3">
      {/* Summary Counts */}
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Months", count: tree.months.length },
          { label: "Weeks", count: totalWeeks },
          { label: "Day Topics", count: totalTopics },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold" style={{ color: NAVY }}>
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Collapsible Tree */}
      <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {tree.months.map((month) => (
          <div key={month.id}>
            <button
              type="button"
              onClick={() => toggleMonth(month.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
            >
              {expandedMonths.has(month.id) ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white"
                style={{ background: GREEN }}
              >
                {month.month_number}
              </span>
              {month.title}
              <span className="ml-auto text-xs text-slate-400">
                {month.weeks.length} week{month.weeks.length !== 1 ? "s" : ""}
              </span>
            </button>

            {expandedMonths.has(month.id) && (
              <div className="ml-7 border-l border-slate-200 pl-3 space-y-0.5">
                {month.weeks.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-slate-400">
                    No weeks yet.
                  </p>
                ) : (
                  month.weeks.map((week) => (
                    <div key={week.id}>
                      <button
                        type="button"
                        onClick={() => toggleWeek(week.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm text-slate-700 hover:bg-slate-100 transition"
                      >
                        {expandedWeeks.has(week.id) ? (
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                        )}
                        <span className="font-medium">
                          Week {week.week_number}:
                        </span>{" "}
                        {week.title}
                        <span className="ml-auto text-xs text-slate-400">
                          {week.dayTopics.length} day
                          {week.dayTopics.length !== 1 ? "s" : ""}
                        </span>
                      </button>

                      {expandedWeeks.has(week.id) && (
                        <div className="ml-6 border-l border-slate-200 pl-3 space-y-0.5 py-1">
                          {week.dayTopics.length === 0 ? (
                            <p className="px-2 py-1 text-xs text-slate-400">
                              No day topics yet.
                            </p>
                          ) : (
                            week.dayTopics.map((dt) => (
                              <div
                                key={dt.id}
                                className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-slate-600"
                              >
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-600">
                                  {dt.day_number}
                                </span>
                                <span className="flex-1">{dt.title}</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Clock className="h-3 w-3" />
                                  {dt.estimated_minutes}m
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CurriculumPanel ─────────────────────────────────────────────────────────

interface CurriculumPanelProps {
  selectedSubjectId: number | null;
  selectedSubjectName: string | null;
  selectedMonthId: number | null;
  setSelectedMonthId: (id: number | null) => void;
  selectedWeekId: number | null;
  setSelectedWeekId: (id: number | null) => void;
  curriculum: CurriculumTree | null;
  isLoading: boolean;
  monthOptions: { id: number; label: string }[];
  weekOptions: { id: number; label: string }[];
  createMonthMutation: CourseBuilderState["createMonthMutation"];
  createWeekMutation: CourseBuilderState["createWeekMutation"];
  createDayTopicMutation: CourseBuilderState["createDayTopicMutation"];
}

export default function CurriculumPanel({
  selectedSubjectId,
  selectedSubjectName,
  selectedMonthId,
  setSelectedMonthId,
  selectedWeekId,
  setSelectedWeekId,
  curriculum,
  isLoading,
  monthOptions,
  weekOptions,
  createMonthMutation,
  createWeekMutation,
  createDayTopicMutation,
}: CurriculumPanelProps) {
  function handleCreateMonth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedSubjectId === null) return;
    const data = new FormData(event.currentTarget);
    createMonthMutation.mutate({
      subjectId: selectedSubjectId,
      monthNumber: getNumber(data, "monthNumber"),
      title: getString(data, "title"),
    });
    event.currentTarget.reset();
  }

  function handleCreateWeek(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedMonthId === null) return;
    const data = new FormData(event.currentTarget);
    createWeekMutation.mutate({
      monthId: selectedMonthId,
      weekNumber: getNumber(data, "weekNumber"),
      title: getString(data, "title"),
    });
    event.currentTarget.reset();
  }

  function handleCreateDayTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedWeekId === null) return;
    const data = new FormData(event.currentTarget);
    createDayTopicMutation.mutate({
      weekId: selectedWeekId,
      dayNumber: getNumber(data, "dayNumber"),
      title: getString(data, "title"),
      description: getString(data, "description"),
      estimatedMinutes: getNumber(data, "estimatedMinutes"),
    });
    event.currentTarget.reset();
  }

  return (
    <Panel title="Curriculum" icon={ListTree}>
      {/* Selected Subject Badge */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <span className="font-semibold text-slate-900">Selected subject:</span>{" "}
        <span className="text-slate-500">{selectedSubjectName ?? "None"}</span>
      </div>

      {/* Create Forms — Month / Week / Day Topic */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Month */}
        <form className="space-y-3" onSubmit={handleCreateMonth}>
          <h3 className="text-sm font-bold text-slate-900">Month</h3>
          <Field label="Month Number" name="monthNumber" type="number" min={1} max={24} placeholder="1" />
          <Field label="Title" name="title" placeholder="Constitutional Foundations" />
          <SubmitButton disabled={selectedSubjectId === null || createMonthMutation.isPending}>
            Add Month
          </SubmitButton>
        </form>

        {/* Week */}
        <form className="space-y-3" onSubmit={handleCreateWeek}>
          <h3 className="text-sm font-bold text-slate-900">Week</h3>
          <SelectField
            label="Month"
            value={selectedMonthId}
            onChange={setSelectedMonthId}
            options={monthOptions}
            placeholder="Select month"
          />
          <Field label="Week Number" name="weekNumber" type="number" min={1} max={6} placeholder="1" />
          <Field label="Title" name="title" placeholder="Preamble and Basics" />
          <SubmitButton disabled={selectedMonthId === null || createWeekMutation.isPending}>
            Add Week
          </SubmitButton>
        </form>

        {/* Day Topic */}
        <form className="space-y-3" onSubmit={handleCreateDayTopic}>
          <h3 className="text-sm font-bold text-slate-900">Day Topic</h3>
          <SelectField
            label="Week"
            value={selectedWeekId}
            onChange={setSelectedWeekId}
            options={weekOptions}
            placeholder="Select week"
          />
          <Field label="Day Number" name="dayNumber" type="number" min={1} max={7} placeholder="1" />
          <Field label="Title" name="title" placeholder="Preamble and Constitutional Philosophy" />
          <TextArea label="Description" name="description" placeholder="Reading, notes, and practice task." />
          <Field label="Estimated Minutes" name="estimatedMinutes" type="number" min={1} max={600} placeholder="90" />
          <SubmitButton disabled={selectedWeekId === null || createDayTopicMutation.isPending}>
            Add Topic
          </SubmitButton>
        </form>
      </div>

      {/* Curriculum Tree */}
      <div className="mt-5">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading curriculum…</p>
        ) : curriculum ? (
          <CurriculumTreeView tree={curriculum} />
        ) : (
          <p className="text-sm text-slate-500">
            Select a subject to view its curriculum.
          </p>
        )}
      </div>
    </Panel>
  );
}
