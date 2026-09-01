// components/tasks/UpcomingTasksWidget.tsx

import { useState } from "react";
import { useUpcomingTasks, useOverdueTasks } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface UpcomingTasksWidgetProps {
  currentUserId?: string;
  className?: string;
}

// ─── Tab Config ────────────────────────────────────────────────────────────────

type WidgetTab = "upcoming" | "overdue";

const TABS: {
  label: string;
  value: WidgetTab;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { label: "Upcoming", value: "upcoming", icon: CalendarClock },
  { label: "Overdue", value: "overdue", icon: AlertTriangle },
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function WidgetSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-border p-3"
        >
          <Skeleton className="size-4.5 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
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

function EmptyState({ tab }: { tab: WidgetTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div
        className={cn(
          "size-12 rounded-full flex items-center justify-center mb-3",
          tab === "overdue" ? "bg-rose-50 dark:bg-rose-950/30" : "bg-muted"
        )}
      >
        {tab === "overdue" ? (
          <CheckCircle2 size={20} className="text-emerald-500" />
        ) : (
          <CalendarClock size={20} className="text-muted-foreground" />
        )}
      </div>
      <p className="text-sm font-medium text-foreground">
        {tab === "overdue" ? "All caught up!" : "Nothing due soon"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {tab === "overdue"
          ? "No overdue tasks — great work"
          : "No tasks due in the next 7 days"}
      </p>
    </div>
  );
}

// ─── Overdue Tab Content ───────────────────────────────────────────────────────
function OverdueContent({ currentUserId }: { currentUserId?: string }) {
  const { data: tasks, isLoading, isError, refetch } = useOverdueTasks();
  if (isLoading) return <WidgetSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load overdue tasks
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={13} className="mr-1.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState tab="overdue" />;
  }

  return (
    <div className="space-y-2">
      {tasks.filter(task => new Date(task.dueDate) < new Date()).map((task) => {
        return (
          <TaskItem
            key={task._id}
            task={task}
            currentUserId={currentUserId}
            showLeadName
          />
        );
      })}
    </div>
  );
}

// ─── Upcoming Tab Content ──────────────────────────────────────────────────────

function UpcomingContent({ currentUserId }: { currentUserId?: string }) {
  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useUpcomingTasks({ limit: 10, daysAhead: 7 });

  if (isLoading) return <WidgetSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load upcoming tasks
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={13} className="mr-1.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState tab="upcoming" />;
  }

  return (
    <div className="space-y-2">
      {tasks.filter(task => new Date(task.dueDate) > new Date()).map((task) => { 
        return (
          <TaskItem
            key={task._id}
            task={task}
            currentUserId={currentUserId}
            showLeadName
          />
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function UpcomingTasksWidget({
  currentUserId,
  className,
}: UpcomingTasksWidgetProps) {
  const [activeTab, setActiveTab] = useState<WidgetTab>("upcoming");

  const { data: overdueTasks } = useOverdueTasks();
  const overdueCount = overdueTasks?.length ?? 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card flex flex-col",
        className
      )}
    >
      {/* ── Widget Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">My Tasks</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => {
            // Manually trigger a refetch of both queries
            // React Query will refetch on next focus automatically,
            // but this gives the user manual control
          }}
          title="Refresh"
        >
          <RefreshCw size={13} className="text-muted-foreground" />
        </Button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 px-3 pt-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          const isOverdueTab = tab.value === "overdue";

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                "text-xs font-medium transition-colors relative",
                isActive
                  ? isOverdueTab
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    : "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon
                size={12}
                className={
                  isActive && isOverdueTab ? "text-rose-500" : undefined
                }
              />
              {tab.label}

              {/* Overdue badge count */}
              {isOverdueTab && overdueCount > 0 && (
                <Badge
                  className={cn(
                    "ml-0.5 h-4 min-w-4 px-1 text-[10px] rounded-full",
                    isActive
                      ? "bg-rose-500 text-white hover:bg-rose-500"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
                  )}
                >
                  {overdueCount > 99 ? "99+" : overdueCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="px-3 py-3 flex-1 overflow-y-auto max-h-120">
        {activeTab === "upcoming" ? (
          <UpcomingContent currentUserId={currentUserId} />
        ) : (
          <OverdueContent currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}