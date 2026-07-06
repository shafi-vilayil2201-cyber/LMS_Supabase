import { useState, type FormEvent } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  ListTree,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Panel, Field, TextArea, SelectField, SubmitButton } from "./FormPrimitives";
import { getString, getNumber, GREEN } from "../constants";
import type { CurriculumTree } from "@/admin/services/courseBuilderService";
import type { CourseBuilderState } from "../hooks/useCourseBuilder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// ─── Curriculum Tree View ────────────────────────────────────────────────────

interface CurriculumTreeViewProps {
  tree: CurriculumTree;
  onEditMonth: (month: any) => void;
  onDeleteMonth: (month: any) => void;
  onEditWeek: (week: any) => void;
  onDeleteWeek: (week: any) => void;
  onEditTopic: (topic: any) => void;
  onDeleteTopic: (topic: any) => void;
}

function CurriculumTreeView({
  tree,
  onEditMonth,
  onDeleteMonth,
  onEditWeek,
  onDeleteWeek,
  onEditTopic,
  onDeleteTopic,
}: CurriculumTreeViewProps) {
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
            className="rounded-xl border border-border bg-muted/40 p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Collapsible Tree */}
      <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
        {tree.months.map((month) => (
          <div key={month.id}>
            <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted transition group">
              <button
                type="button"
                onClick={() => toggleMonth(month.id)}
                className="flex items-center gap-2 text-left text-sm font-semibold text-foreground flex-1 min-w-0"
              >
                {expandedMonths.has(month.id) ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white flex-shrink-0"
                  style={{ background: GREEN }}
                >
                  {month.month_number}
                </span>
                <span className="truncate">{month.title}</span>
                <span className="text-xs text-muted-foreground font-normal ml-2 flex-shrink-0">
                  ({month.weeks.length} week{month.weeks.length !== 1 ? "s" : ""})
                </span>
              </button>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  type="button"
                  onClick={() => onEditMonth(month)}
                  className="p-0.5 text-muted-foreground hover:text-foreground transition rounded hover:bg-muted-foreground/10"
                  title="Edit Month"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteMonth(month)}
                  className="p-0.5 text-muted-foreground hover:text-destructive transition rounded hover:bg-destructive/10"
                  title="Delete Month"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {expandedMonths.has(month.id) && (
              <div className="ml-7 border-l border-border pl-3 space-y-0.5">
                {month.weeks.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-muted-foreground">
                    No weeks yet.
                  </p>
                ) : (
                  month.weeks.map((week) => (
                    <div key={week.id}>
                      <div className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-muted transition group">
                        <button
                          type="button"
                          onClick={() => toggleWeek(week.id)}
                          className="flex items-center gap-2 text-left text-sm text-foreground flex-1 min-w-0"
                        >
                          {expandedWeeks.has(week.id) ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="font-medium flex-shrink-0">
                            Week {week.week_number}:
                          </span>{" "}
                          <span className="truncate">{week.title}</span>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            ({week.dayTopics.length} day{week.dayTopics.length !== 1 ? "s" : ""})
                          </span>
                        </button>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            type="button"
                            onClick={() => onEditWeek(week)}
                            className="p-0.5 text-muted-foreground hover:text-foreground transition rounded hover:bg-muted-foreground/10"
                            title="Edit Week"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteWeek(week)}
                            className="p-0.5 text-muted-foreground hover:text-destructive transition rounded hover:bg-destructive/10"
                            title="Delete Week"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {expandedWeeks.has(week.id) && (
                        <div className="ml-6 border-l border-border pl-3 space-y-0.5 py-1">
                          {week.dayTopics.length === 0 ? (
                            <p className="px-2 py-1 text-xs text-muted-foreground">
                              No day topics yet.
                            </p>
                          ) : (
                            week.dayTopics.map((dt) => (
                              <div
                                key={dt.id}
                                className="flex items-center justify-between rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition group"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground flex-shrink-0">
                                    {dt.day_number}
                                  </span>
                                  <span className="flex-1 truncate">{dt.title}</span>
                                  <span className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                                    <Clock className="h-3 w-3" />
                                    {dt.estimated_minutes}m
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => onEditTopic(dt)}
                                    className="p-0.5 text-muted-foreground hover:text-foreground transition rounded hover:bg-muted-foreground/10"
                                    title="Edit Topic"
                                  >
                                    <Edit2 className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteTopic(dt)}
                                    className="p-0.5 text-muted-foreground hover:text-destructive transition rounded hover:bg-destructive/10"
                                    title="Delete Topic"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>
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
  updateMonthMutation: CourseBuilderState["updateMonthMutation"];
  deleteMonthMutation: CourseBuilderState["deleteMonthMutation"];
  createWeekMutation: CourseBuilderState["createWeekMutation"];
  updateWeekMutation: CourseBuilderState["updateWeekMutation"];
  deleteWeekMutation: CourseBuilderState["deleteWeekMutation"];
  createDayTopicMutation: CourseBuilderState["createDayTopicMutation"];
  updateDayTopicMutation: CourseBuilderState["updateDayTopicMutation"];
  deleteDayTopicMutation: CourseBuilderState["deleteDayTopicMutation"];
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
  updateMonthMutation,
  deleteMonthMutation,
  createWeekMutation,
  updateWeekMutation,
  deleteWeekMutation,
  createDayTopicMutation,
  updateDayTopicMutation,
  deleteDayTopicMutation,
}: CurriculumPanelProps) {
  // Dialog states
  const [editingMonth, setEditingMonth] = useState<any | null>(null);
  const [deletingMonth, setDeletingMonth] = useState<any | null>(null);

  const [editingWeek, setEditingWeek] = useState<any | null>(null);
  const [deletingWeek, setDeletingWeek] = useState<any | null>(null);

  const [editingTopic, setEditingTopic] = useState<any | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<any | null>(null);

  // Form submits
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

  // Updates
  function handleUpdateMonth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingMonth) return;
    const data = new FormData(event.currentTarget);
    updateMonthMutation.mutate({
      id: editingMonth.id,
      payload: {
        monthNumber: getNumber(data, "monthNumber"),
        title: getString(data, "title"),
      },
    }, {
      onSuccess: () => setEditingMonth(null),
    });
  }

  function handleUpdateWeek(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingWeek) return;
    const data = new FormData(event.currentTarget);
    updateWeekMutation.mutate({
      id: editingWeek.id,
      payload: {
        weekNumber: getNumber(data, "weekNumber"),
        title: getString(data, "title"),
      },
    }, {
      onSuccess: () => setEditingWeek(null),
    });
  }

  function handleUpdateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTopic) return;
    const data = new FormData(event.currentTarget);
    updateDayTopicMutation.mutate({
      id: editingTopic.id,
      payload: {
        dayNumber: getNumber(data, "dayNumber"),
        title: getString(data, "title"),
        description: getString(data, "description"),
        estimatedMinutes: getNumber(data, "estimatedMinutes"),
      },
    }, {
      onSuccess: () => setEditingTopic(null),
    });
  }

  return (
    <>
      <Panel title="Curriculum" icon={ListTree}>
        {/* Selected Subject Badge */}
        <div className="mb-4 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm">
          <span className="font-semibold text-foreground">Selected subject:</span>{" "}
          <span className="text-muted-foreground">{selectedSubjectName ?? "None"}</span>
        </div>

        {/* Create Forms — Month / Week / Day Topic */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Month */}
          <form className="space-y-3" onSubmit={handleCreateMonth}>
            <h3 className="text-sm font-bold text-foreground">Month</h3>
            <Field label="Month Number" name="monthNumber" type="number" min={1} max={24} placeholder="1" />
            <Field label="Title" name="title" placeholder="Constitutional Foundations" />
            <SubmitButton disabled={selectedSubjectId === null || createMonthMutation.isPending}>
              Add Month
            </SubmitButton>
          </form>

          {/* Week */}
          <form className="space-y-3" onSubmit={handleCreateWeek}>
            <h3 className="text-sm font-bold text-foreground">Week</h3>
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
            <h3 className="text-sm font-bold text-foreground">Day Topic</h3>
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
            <p className="text-sm text-muted-foreground animate-pulse">Loading curriculum…</p>
          ) : curriculum ? (
            <CurriculumTreeView
              tree={curriculum}
              onEditMonth={setEditingMonth}
              onDeleteMonth={setDeletingMonth}
              onEditWeek={setEditingWeek}
              onDeleteWeek={setDeletingWeek}
              onEditTopic={setEditingTopic}
              onDeleteTopic={setDeletingTopic}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a subject to view its curriculum.
            </p>
          )}
        </div>
      </Panel>

      {/* ─── MONTH DIALOGS ─────────────────────────────────────────────────── */}
      <Dialog open={!!editingMonth} onOpenChange={(open) => !open && setEditingMonth(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit Month</DialogTitle>
          </DialogHeader>
          {editingMonth && (
            <form onSubmit={handleUpdateMonth} className="space-y-4 mt-2">
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Month Number</span>
                <input
                  name="monthNumber"
                  type="number"
                  required
                  min={1}
                  max={24}
                  defaultValue={editingMonth.month_number}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Title</span>
                <input
                  name="title"
                  required
                  defaultValue={editingMonth.title}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                />
              </label>
              <DialogFooter className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMonth(null)}
                  className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMonthMutation.isPending}
                  className="h-10 px-4 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                  style={{ background: GREEN }}
                >
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingMonth} onOpenChange={(open) => !open && setDeletingMonth(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Delete Month</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground text-center my-3">
            Are you sure you want to delete <strong className="text-foreground">"{deletingMonth?.title}"</strong>?
            This will permanently remove the month and all its weeks and topics.
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDeletingMonth(null)}
              className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteMonthMutation.mutate(deletingMonth.id, {
                  onSuccess: () => setDeletingMonth(null),
                });
              }}
              disabled={deleteMonthMutation.isPending}
              className="h-10 px-4 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-xl transition"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── WEEK DIALOGS ──────────────────────────────────────────────────── */}
      <Dialog open={!!editingWeek} onOpenChange={(open) => !open && setEditingWeek(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit Week</DialogTitle>
          </DialogHeader>
          {editingWeek && (
            <form onSubmit={handleUpdateWeek} className="space-y-4 mt-2">
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Week Number</span>
                <input
                  name="weekNumber"
                  type="number"
                  required
                  min={1}
                  max={6}
                  defaultValue={editingWeek.week_number}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Title</span>
                <input
                  name="title"
                  required
                  defaultValue={editingWeek.title}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                />
              </label>
              <DialogFooter className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWeek(null)}
                  className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateWeekMutation.isPending}
                  className="h-10 px-4 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                  style={{ background: GREEN }}
                >
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingWeek} onOpenChange={(open) => !open && setDeletingWeek(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Delete Week</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground text-center my-3">
            Are you sure you want to delete <strong className="text-foreground">"{deletingWeek?.title}"</strong>?
            This will permanently remove the week and all its topics.
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDeletingWeek(null)}
              className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteWeekMutation.mutate(deletingWeek.id, {
                  onSuccess: () => setDeletingWeek(null),
                });
              }}
              disabled={deleteWeekMutation.isPending}
              className="h-10 px-4 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-xl transition"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DAY TOPIC DIALOGS ─────────────────────────────────────────────── */}
      <Dialog open={!!editingTopic} onOpenChange={(open) => !open && setEditingTopic(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit Day Topic</DialogTitle>
          </DialogHeader>
          {editingTopic && (
            <form onSubmit={handleUpdateTopic} className="space-y-4 mt-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 block">
                  <span className="text-xs font-semibold text-muted-foreground">Day Number</span>
                  <input
                    name="dayNumber"
                    type="number"
                    required
                    min={1}
                    max={7}
                    defaultValue={editingTopic.day_number}
                    className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                  />
                </label>
                <label className="space-y-1.5 block">
                  <span className="text-xs font-semibold text-muted-foreground">Estimated Minutes</span>
                  <input
                    name="estimatedMinutes"
                    type="number"
                    required
                    min={1}
                    max={600}
                    defaultValue={editingTopic.estimated_minutes}
                    className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                  />
                </label>
              </div>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Title</span>
                <input
                  name="title"
                  required
                  defaultValue={editingTopic.title}
                  className="h-10 w-full rounded-xl border border-input bg-background text-foreground px-3 text-sm outline-none"
                />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-muted-foreground">Description</span>
                <textarea
                  name="description"
                  required
                  defaultValue={editingTopic.description}
                  className="min-h-24 w-full rounded-xl border border-input bg-background text-foreground px-3 py-2 text-sm outline-none"
                />
              </label>
              <DialogFooter className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateDayTopicMutation.isPending}
                  className="h-10 px-4 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
                  style={{ background: GREEN }}
                >
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTopic} onOpenChange={(open) => !open && setDeletingTopic(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Delete Day Topic</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground text-center my-3">
            Are you sure you want to delete topic <strong className="text-foreground">"{deletingTopic?.title}"</strong>?
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDeletingTopic(null)}
              className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteDayTopicMutation.mutate(deletingTopic.id, {
                  onSuccess: () => setDeletingTopic(null),
                });
              }}
              disabled={deleteDayTopicMutation.isPending}
              className="h-10 px-4 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-xl transition"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
