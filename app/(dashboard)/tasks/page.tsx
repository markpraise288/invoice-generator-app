// app/tasks/page.tsx

"use client";

import { useState, useCallback } from "react";
import { useUpcomingTasks } from "@/hooks/useTasks";
import { TasksStatsBar } from "@/components/tasks/TasksStatsBar";
import { TasksFilterBar, defaultTasksFilters } from "@/components/tasks/TasksFilterBar";
import { TasksTable } from "@/components/tasks/TasksTable";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { UpcomingTasksWidget } from "@/components/tasks/UpcomingTasksWidget";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import type { TasksFilters } from "@/components/tasks/TasksFilterBar";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CurrentUser {
  _id: string;
  name: string;
  email: string;
}

interface TasksPageProps {
  currentUser?: CurrentUser;
}

// ─── Page Header ───────────────────────────────────────────────────────────────

function PageHeader({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <ClipboardList size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-none">
            Tasks
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and track all your follow-up tasks
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onCreateClick}
        className="gap-1.5 shrink-0"
      >
        <Plus size={15} />
        New task
      </Button>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function TasksPage({ currentUser }: TasksPageProps) {
  const [filters, setFilters] = useState<TasksFilters>(defaultTasksFilters);
  const [filteredCount, setFilteredCount] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch all tasks assigned to current user
  // We fetch upcoming with a wide window to get all tasks for the table
  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useUpcomingTasks({ limit: 200, daysAhead: 365 });

  // Derived stats from raw task list
  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.completed).length ?? 0;

  const handleFilteredCountChange = useCallback((count: number) => {
    setFilteredCount(count);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* ── Page header ── */}
      <PageHeader onCreateClick={() => setCreateOpen(true)} />

      {/* ── Stats bar ── */}
      <TasksStatsBar
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        isLoading={isLoading}
      />

      {/* ── Main content + sidebar ── */}
      <div className="flex gap-6 items-start">
        {/* ── Left: filter + table ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Filter bar */}
          <TasksFilterBar
            filters={filters}
            onChange={setFilters}
            totalCount={totalTasks}
            filteredCount={filteredCount}
          />

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center gap-2 py-12 text-center rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">
                Failed to load tasks
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {/* Table */}
          {!isError && (
            <TasksTable
              tasks={tasks ?? []}
              isLoading={isLoading}
              filters={filters}
              onFilteredCountChange={handleFilteredCountChange}
              currentUserId={currentUser?._id}
            />
          )}
        </div>

        {/* ── Right: upcoming widget ── */}
        <div className="w-80 shrink-0 hidden lg:block sticky top-6">
          <UpcomingTasksWidget
            currentUserId={currentUser?._id}
            className="w-full"
          />
        </div>
      </div>

      {/* ── Create task dialog ── */}
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentUserId={currentUser?._id}
        onSuccess={() => refetch()}
      />
    </div>
  );
}