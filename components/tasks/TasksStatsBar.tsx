// components/tasks/TasksStatsBar.tsx

import { useOverdueTasks, useUpcomingTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ListTodo,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TasksStatsBarProps {
  totalTasks: number;
  completedTasks: number;
  isLoading?: boolean;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  bgClass: string;
  isLoading?: boolean;
  highlight?: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  isLoading,
  highlight,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
        highlight && "border-rose-200 dark:border-rose-900/50"
      )}
    >
      <div
        className={cn(
          "size-9 rounded-lg flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <Icon size={16} className={iconClass} />
      </div>
      <div className="flex flex-col min-w-0">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-8 mb-1" />
            <Skeleton className="h-3 w-16" />
          </>
        ) : (
          <>
            <span
              className={cn(
                "text-lg font-bold leading-none",
                highlight ? "text-rose-500" : "text-foreground"
              )}
            >
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TasksStatsBar({
  totalTasks,
  completedTasks,
  isLoading,
}: TasksStatsBarProps) {
  const { data: overdueTasks } = useOverdueTasks();
  const { data: upcomingTasks } = useUpcomingTasks({ daysAhead: 7 });

  const pendingTasks = totalTasks - completedTasks;
  const overdueCount = overdueTasks?.length ?? 0;
  const upcomingCount = upcomingTasks?.length ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total tasks"
        value={totalTasks}
        icon={ListTodo}
        iconClass="text-blue-500"
        bgClass="bg-blue-500/10"
        isLoading={isLoading}
      />
      <StatCard
        label="Pending"
        value={pendingTasks}
        icon={Circle}
        iconClass="text-amber-500"
        bgClass="bg-amber-500/10"
        isLoading={isLoading}
      />
      <StatCard
        label="Overdue"
        value={overdueCount}
        icon={AlertTriangle}
        iconClass="text-rose-500"
        bgClass="bg-rose-500/10"
        isLoading={isLoading}
        highlight={overdueCount > 0}
      />
      <StatCard
        label="Completed"
        value={completedTasks}
        icon={CheckCircle2}
        iconClass="text-emerald-500"
        bgClass="bg-emerald-500/10"
        isLoading={isLoading}
      />
    </div>
  );
}