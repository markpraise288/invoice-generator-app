// components/tasks/TasksTable.tsx

import { useState, useMemo } from "react";
import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { useCompleteTask, useDeleteTask } from "@/hooks/useTasks";
import type { Task, TaskPriority, RelatedToType } from "@/hooks/useTasks";
import type { TasksFilters } from "./TasksFilterBar";
import { priorityConfig } from "./TaskItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ExternalLink,
  Target,
  Handshake,
  Users,
  FolderKanban,
  Contact,
  Building2,
  Link2,
} from "lucide-react";

// ─── Related entity display config (icon + label per type) ────────────────────
// Mirrors the config used in CreateTaskDialog — kept in sync manually since
// there's no shared constants file yet; see note at the bottom of this file.

const relatedToIcons: Record<RelatedToType, { icon: React.ElementType; label: string }> = {
  Lead: { icon: Target, label: "Lead" },
  Deal: { icon: Handshake, label: "Deal" },
  Customer: { icon: Users, label: "Customer" },
  Project: { icon: FolderKanban, label: "Project" },
  Contact: { icon: Contact, label: "Contact" },
  Company: { icon: Building2, label: "Company" },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type SortField = "title" | "dueDate" | "priority" | "status" | "related";
type SortDir = "asc" | "desc";

interface SortState {
  field: SortField;
  dir: SortDir;
}

interface TasksTableProps {
  tasks: Task[];
  isLoading?: boolean;
  filters: TasksFilters;
  onFilteredCountChange?: (count: number) => void;
  currentUserId?: string;
  onRelatedClick?: (relatedTo: RelatedToType, relatedId: string) => void;
}

// ─── Priority sort order ───────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ─── Helpers for the polymorphic relatedId field ───────────────────────────────
// task.relatedId may arrive as a bare ObjectId string (unpopulated) or a
// populated object like { _id, name } / { _id, title } depending on relatedTo.
// These two helpers are the single place that unwraps it, so every other piece
// of this component just asks "give me the id" / "give me the label".

function getRelatedId(task: Task): string {
  return typeof task.relatedId === "string" ? task.relatedId : task.relatedId;
}

function getRelatedLabel(task: Task): string {
  if (typeof task.relatedId === "string") return "—";
  // Deal uses "title", everything else uses "name" — same field-name split as
  // relatedToConfig in CreateTaskDialog.
  return (task.relatedId as any).name ?? (task.relatedId as any).title ?? "—";
}

// ─── Due date display ──────────────────────────────────────────────────────────

function DueDateCell({
  dueDate,
  isOverdue,
  completed,
}: {
  dueDate: string;
  isOverdue: boolean;
  completed: boolean;
}) {
  const date = new Date(dueDate);
  const label = isToday(date)
    ? "Today"
    : isTomorrow(date)
    ? "Tomorrow"
    : format(date, "MMM d, yyyy");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        completed
          ? "text-muted-foreground line-through"
          : isOverdue
          ? "text-rose-500"
          : isToday(date)
          ? "text-amber-500"
          : "text-muted-foreground"
      )}
      title={format(date, "PPpp")}
    >
      {isOverdue && !completed && <AlertTriangle size={11} />}
      {label}
    </span>
  );
}

// ─── Sort Header Button ────────────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  sort,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  sort: SortState;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = sort.field === field;
  const Icon = isActive
    ? sort.dir === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        "text-muted-foreground hover:text-foreground transition-colors",
        isActive && "text-foreground",
        className
      )}
    >
      {label}
      <Icon size={12} className={cn("shrink-0", isActive && "text-primary")} />
    </button>
  );
}

// ─── Table Skeleton ────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/40 border-b border-border px-4 py-2.5 grid grid-cols-[auto_1fr_160px_100px_100px_80px_40px] gap-4">
        {["", "Task", "Linked to", "Due date", "Priority", "Status", ""].map(
          (h, i) => (
            <Skeleton key={i} className="h-3 w-full max-w-[80px]" />
          )
        )}
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="px-4 py-3 grid grid-cols-[auto_1fr_160px_100px_100px_80px_40px] gap-4 items-center"
          >
            <Skeleton className="size-4 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="size-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <CheckCircle2 size={20} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {filtered ? "No tasks match your filters" : "No tasks yet"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
          {filtered
            ? "Try adjusting or clearing your filters"
            : "Tasks you create will appear here"}
        </p>
      </div>
    </div>
  );
}

// ─── Bulk Action Bar ───────────────────────────────────────────────────────────

function BulkActionBar({
  selectedCount,
  onCompleteAll,
  onDeleteAll,
  onClear,
  isLoading,
}: {
  selectedCount: number;
  onCompleteAll: () => void;
  onDeleteAll: () => void;
  onClear: () => void;
  isLoading: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5">
      <span className="text-xs font-medium text-foreground">
        {selectedCount} task{selectedCount > 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          onClick={onCompleteAll}
          disabled={isLoading}
        >
          <CheckCircle2 size={12} className="mr-1.5 text-emerald-500" />
          Mark complete
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
          onClick={onDeleteAll}
          disabled={isLoading}
        >
          <Trash2 size={12} className="mr-1.5" />
          Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={onClear}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Row Actions ───────────────────────────────────────────────────────────────

function RowActions({
  task,
  currentUserId,
  onDelete,
  onRelatedClick,
}: {
  task: Task;
  currentUserId?: string;
  onDelete: () => void;
  onRelatedClick?: (relatedTo: RelatedToType, relatedId: string) => void;
}) {
  const relatedId = getRelatedId(task);
  const relatedConfig = relatedToIcons[task.relatedTo];
  const { mutate: completeTask } = useCompleteTask();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="text-xs"
          onClick={() =>
            completeTask({ taskId: task._id, completed: !task.completed })
          }
        >
          {task.completed ? (
            <>
              <Circle size={13} className="mr-2" />
              Mark incomplete
            </>
          ) : (
            <>
              <CheckCircle2 size={13} className="mr-2 text-emerald-500" />
              Mark complete
            </>
          )}
        </DropdownMenuItem>
        {onRelatedClick && (
          <DropdownMenuItem
            className="text-xs"
            onClick={() => onRelatedClick(task.relatedTo, relatedId)}
          >
            <ExternalLink size={13} className="mr-2" />
            Open {relatedConfig.label.toLowerCase()}
          </DropdownMenuItem>
        )}
        {currentUserId === task.createdBy._id && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 size={13} className="mr-2" />
              Delete task
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TasksTable({
  tasks,
  isLoading,
  filters,
  onFilteredCountChange,
  currentUserId,
  onRelatedClick,
}: TasksTableProps) {
  const [sort, setSort] = useState<SortState>({
    field: "dueDate",
    dir: "asc",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const { mutateAsync: completeTaskAsync } = useCompleteTask();
  const { mutateAsync: deleteTaskAsync } = useDeleteTask();

  // ── Client-side filter + sort ──────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...tasks];

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          getRelatedLabel(t).toLowerCase().includes(q)
      );
    }

    // Completion
    if (filters.completed === "pending") {
      result = result.filter((t) => !t.completed);
    } else if (filters.completed === "completed") {
      result = result.filter((t) => t.completed);
    }

    // Priority
    if (filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Due range
    if (filters.dueRange !== "all") {
      result = result.filter((t) => {
        const date = new Date(t.dueDate);
        if (filters.dueRange === "today") return isToday(date);
        if (filters.dueRange === "week") return isThisWeek(date);
        if (filters.dueRange === "overdue")
          return isPast(date) && !t.completed;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sort.field === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sort.field === "dueDate") {
        comparison =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sort.field === "priority") {
        comparison =
          PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      } else if (sort.field === "status") {
        comparison = Number(a.completed) - Number(b.completed);
      } else if (sort.field === "related") {
        comparison = getRelatedLabel(a).localeCompare(getRelatedLabel(b));
      }
      return sort.dir === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, filters, sort]);

  // Notify parent of filtered count
  useMemo(() => {
    onFilteredCountChange?.(filtered.length);
  }, [filtered.length, onFilteredCountChange]);

  // ── Sort handler ───────────────────────────────────────────────────────────

  const handleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    );
  };

  // ── Selection handlers ─────────────────────────────────────────────────────

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length
        ? new Set()
        : new Set(filtered.map((t) => t._id))
    );
  };

  const clearSelection = () => setSelected(new Set());

  // ── Bulk actions ───────────────────────────────────────────────────────────
  // Now goes through the same useCompleteTask/useDeleteTask hooks used for
  // single-row actions, rather than raw fetch() calls to a lead-nested path —
  // tasks are no longer scoped under /api/leads/:leadId/tasks, so those URLs
  // would 404 against the polymorphic backend anyway.

  const handleBulkComplete = async () => {
    setIsBulkLoading(true);
    const selectedTasks = filtered.filter((t) => selected.has(t._id));
    await Promise.allSettled(
      selectedTasks.map((t) =>
        completeTaskAsync({ taskId: t._id, completed: true })
      )
    );
    setIsBulkLoading(false);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    setIsBulkLoading(true);
    const selectedTasks = filtered.filter((t) => selected.has(t._id));
    await Promise.allSettled(
      selectedTasks.map((t) => deleteTaskAsync(t._id))
    );
    setIsBulkLoading(false);
    setBulkDeleteOpen(false);
    clearSelection();
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const allSelected =
    filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0 && !allSelected;
  const isActivelyFiltered =
    filters.search.trim() !== "" ||
    filters.priority !== "all" ||
    filters.completed !== "all" ||
    filters.dueRange !== "all";

  if (isLoading) return <TableSkeleton />;
  if (filtered.length === 0)
    return <EmptyState filtered={isActivelyFiltered} />;

  return (
    <>
      {/* ── Bulk action bar ── */}
      <BulkActionBar
        selectedCount={selected.size}
        onCompleteAll={handleBulkComplete}
        onDeleteAll={() => setBulkDeleteOpen(true)}
        onClear={clearSelection}
        isLoading={isBulkLoading}
      />

      {/* ── Table ── */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div
          className={cn(
            "bg-muted/40 border-b border-border px-4 py-2.5",
            "grid items-center gap-4",
            "grid-cols-[auto_1fr_160px_110px_100px_90px_40px]"
          )}
        >
          {/* Select all */}
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            aria-label="Select all"
            className={cn(someSelected && "opacity-70")}
          />
          <SortHeader
            label="Task"
            field="title"
            sort={sort}
            onSort={handleSort}
          />
          <SortHeader
            label="Linked to"
            field="related"
            sort={sort}
            onSort={handleSort}
          />
          <SortHeader
            label="Due date"
            field="dueDate"
            sort={sort}
            onSort={handleSort}
          />
          <SortHeader
            label="Priority"
            field="priority"
            sort={sort}
            onSort={handleSort}
          />
          <SortHeader
            label="Status"
            field="status"
            sort={sort}
            onSort={handleSort}
          />
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {filtered.map((task) => {
            const relatedId = getRelatedId(task);
            const relatedLabel = getRelatedLabel(task);
            const relatedConfig = relatedToIcons[task.relatedTo];
            const RelatedIcon = relatedConfig?.icon ?? Link2;
            const isSelected = selected.has(task._id);
            const priority = priorityConfig[task.priority];

            return (
              <div
                key={task._id}
                className={cn(
                  "group px-4 py-3 grid items-center gap-4 transition-colors",
                  "grid-cols-[auto_1fr_160px_110px_100px_90px_40px]",
                  isSelected
                    ? "bg-primary/5"
                    : task.isOverdue && !task.completed
                    ? "bg-rose-50/40 dark:bg-rose-950/10"
                    : "hover:bg-muted/30"
                )}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleOne(task._id)}
                  aria-label={`Select ${task.title}`}
                />

                {/* Title + description + assignee */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate leading-snug",
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Assigned to{" "}
                    <span className="font-medium text-foreground">
                      {task.assignedTo.name}
                    </span>
                  </p>
                </div>

                {/* Linked record — entity type icon + name, any of the 6 types */}
                <div className="min-w-0">
                  {relatedLabel !== "—" ? (
                    <button
                      onClick={() => onRelatedClick?.(task.relatedTo, relatedId)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium truncate text-left w-full",
                        onRelatedClick
                          ? "text-primary hover:underline underline-offset-2"
                          : "text-foreground cursor-default"
                      )}
                    >
                      <RelatedIcon size={11} className="shrink-0 text-muted-foreground" />
                      <span className="truncate">{relatedLabel}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Due date */}
                <DueDateCell
                  dueDate={task.dueDate}
                  isOverdue={task.isOverdue}
                  completed={task.completed}
                />

                {/* Priority */}
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 h-5 font-medium w-fit",
                    priority.className
                  )}
                >
                  {priority.label}
                </Badge>

                {/* Status */}
                <div className="flex items-center">
                  {task.completed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={12} />
                      Done
                    </span>
                  ) : task.isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500">
                      <AlertTriangle size={12} />
                      Overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Circle size={12} />
                      Pending
                    </span>
                  )}
                </div>

                {/* Row actions */}
                <RowActions
                  task={task}
                  currentUserId={currentUserId}
                  onDelete={() => setDeleteTarget(task)}
                  onRelatedClick={onRelatedClick}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Single delete confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteTaskAsync(deleteTarget._id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bulk delete confirm ── */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} task{selected.size > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected tasks. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isBulkLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBulkDelete}
            >
              {isBulkLoading
                ? "Deleting..."
                : `Delete ${selected.size} task${selected.size > 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}