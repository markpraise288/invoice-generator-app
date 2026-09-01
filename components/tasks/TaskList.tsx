// components/tasks/TaskList.tsx

import { useState } from "react";
import { useLeadTasks, useTaskSummary } from "@/hooks/useTasks";
import type { TaskFilters, TaskPriority } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TaskListProps {
  leadId: string;
  currentUserId?: string;
  onCreateClick: () => void;
}

// ─── Filter Tabs ───────────────────────────────────────────────────────────────

type CompletionFilter = "all" | "pending" | "completed";

const COMPLETION_TABS: { label: string; value: CompletionFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

const PRIORITY_FILTERS: { label: string; value: TaskPriority | "all" }[] = [
  { label: "Any priority", value: "all" },
  { label: "Urgent", value: "urgent" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function TaskSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-border p-3"
        >
          <Skeleton className="size-4.5 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-32" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  filtered,
  onCreateClick,
}: {
  filtered: boolean;
  onCreateClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <ClipboardList size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {filtered ? "No tasks match this filter" : "No tasks yet"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {filtered
          ? "Try adjusting the filters above"
          : "Create a task to track follow-ups for this lead"}
      </p>
      {!filtered && (
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={onCreateClick}
        >
          Create first task
        </Button>
      )}
    </div>
  );
}

// ─── Summary Bar ───────────────────────────────────────────────────────────────

function SummaryBar({ leadId }: { leadId: string }) {
  const { data: summary } = useTaskSummary(leadId);
  if (!summary) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Circle size={12} className="text-muted-foreground" />
        <span>
          <span className="font-semibold text-foreground">{summary.pending}</span>
          {" "}pending
        </span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle2 size={12} className="text-emerald-500" />
        <span>
          <span className="font-semibold text-foreground">{summary.completed}</span>
          {" "}completed
        </span>
      </span>

      {summary.overdue > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs text-rose-500">
          <AlertTriangle size={12} />
          <span>
            <span className="font-semibold">{summary.overdue}</span>
            {" "}overdue
          </span>
        </span>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TaskList({
  leadId,
  currentUserId,
  onCreateClick,
}: TaskListProps) {
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );

  const filters: TaskFilters = {};
  if (completionFilter === "pending") filters.completed = false;
  if (completionFilter === "completed") filters.completed = true;
  if (priorityFilter !== "all") filters.priority = priorityFilter;

  const isFiltered =
    completionFilter !== "all" || priorityFilter !== "all";

  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useLeadTasks(leadId, filters);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
          <SummaryBar leadId={leadId} />
        </div>
        <Button size="sm" onClick={onCreateClick} className="h-7 px-3 text-xs shrink-0">
          Add task
        </Button>
      </div>

      {/* ── Completion filter tabs ── */}
      <div className="flex items-center gap-1">
        {COMPLETION_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCompletionFilter(tab.value)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              completionFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}

        {/* ── Priority filter ── */}
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as TaskPriority | "all")
          }
          className={cn(
            "ml-auto h-7 rounded-md border border-input bg-background px-2",
            "text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring",
            "text-muted-foreground"
          )}
        >
          {PRIORITY_FILTERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Active filter indicator ── */}
      {isFiltered && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          {completionFilter !== "all" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {completionFilter}
            </Badge>
          )}
          {priorityFilter !== "all" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {priorityFilter}
            </Badge>
          )}
          <button
            onClick={() => {
              setCompletionFilter("all");
              setPriorityFilter("all");
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <TaskSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted-foreground">Failed to load tasks</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState filtered={isFiltered} onCreateClick={onCreateClick} />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              leadId={leadId}
              currentUserId={currentUserId}
              showLeadName={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}