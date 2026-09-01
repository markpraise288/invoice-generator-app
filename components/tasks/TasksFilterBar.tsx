// components/tasks/TasksFilterBar.tsx

import { useEffect, useState } from "react";
import type { TaskPriority } from "@/hooks/useTasks";
import { priorityConfig } from "./TaskItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  CalendarClock,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TasksFilters {
  search: string;
  priority: TaskPriority | "all";
  completed: "all" | "pending" | "completed";
  dueRange: "all" | "today" | "week" | "overdue";
}

interface TasksFilterBarProps {
  filters: TasksFilters;
  onChange: (filters: TasksFilters) => void;
  totalCount: number;
  filteredCount: number;
}

// ─── Default Filters ───────────────────────────────────────────────────────────

export const defaultTasksFilters: TasksFilters = {
  search: "",
  priority: "all",
  completed: "all",
  dueRange: "all",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const isFiltered = (filters: TasksFilters): boolean => {
  return (
    filters.search.trim() !== "" ||
    filters.priority !== "all" ||
    filters.completed !== "all" ||
    filters.dueRange !== "all"
  );
};

const activeFilterCount = (filters: TasksFilters): number => {
  let count = 0;
  if (filters.search.trim()) count++;
  if (filters.priority !== "all") count++;
  if (filters.completed !== "all") count++;
  if (filters.dueRange !== "all") count++;
  return count;
};

// ─── Due Range Options ─────────────────────────────────────────────────────────

const DUE_RANGE_OPTIONS: {
  label: string;
  value: TasksFilters["dueRange"];
}[] = [
  { label: "Any date", value: "all" },
  { label: "Due today", value: "today" },
  { label: "Due this week", value: "week" },
  { label: "Overdue", value: "overdue" },
];

// ─── Status Options ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  label: string;
  value: TasksFilters["completed"];
}[] = [
  { label: "All tasks", value: "all" },
  { label: "Pending only", value: "pending" },
  { label: "Completed only", value: "completed" },
];

// ─── Search Input with debounce ────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [local, setLocal] = useState(value);

  // Sync local state if parent resets filters
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounce — wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(timer);
  }, [local, onChange, value]);

  return (
    <div className="relative flex-1 min-w-0 max-w-xs">
      <Search
        size={14}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search tasks..."
        className="pl-8 h-9 text-sm"
      />
      {local && (
        <button
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TasksFilterBar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: TasksFilterBarProps) {
  const update = (patch: Partial<TasksFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clearAll = () => onChange(defaultTasksFilters);

  const filtered = isFiltered(filters);
  const filterCount = activeFilterCount(filters);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main filter row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <SearchInput
          value={filters.search}
          onChange={(search) => update({ search })}
        />

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs font-medium",
                filters.completed !== "all" &&
                  "border-primary text-primary"
              )}
            >
              {STATUS_OPTIONS.find((s) => s.value === filters.completed)?.label}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">
              Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={filters.completed === opt.value}
                onCheckedChange={() => update({ completed: opt.value })}
                className="text-xs"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs font-medium",
                filters.priority !== "all" && "border-primary text-primary"
              )}
            >
              {filters.priority === "all"
                ? "Any priority"
                : priorityConfig[filters.priority].label}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel className="text-xs">
              Priority
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.priority === "all"}
              onCheckedChange={() => update({ priority: "all" })}
              className="text-xs"
            >
              Any priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {(Object.keys(priorityConfig) as TaskPriority[]).map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={filters.priority === p}
                onCheckedChange={() => update({ priority: p })}
                className="text-xs"
              >
                <span
                  className={cn(
                    "mr-2 size-2 rounded-full inline-block shrink-0",
                    p === "low" && "bg-slate-400",
                    p === "medium" && "bg-blue-400",
                    p === "high" && "bg-amber-400",
                    p === "urgent" && "bg-rose-500"
                  )}
                />
                {priorityConfig[p].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Due date range filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs font-medium",
                filters.dueRange !== "all" && "border-primary text-primary"
              )}
            >
              <CalendarClock size={12} className="opacity-70" />
              {DUE_RANGE_OPTIONS.find((d) => d.value === filters.dueRange)
                ?.label ?? "Any date"}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">
              Due date
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DUE_RANGE_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={filters.dueRange === opt.value}
                onCheckedChange={() => update({ dueRange: opt.value })}
                className="text-xs"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active filter count badge + clear */}
        {filtered && (
          <div className="flex items-center gap-1.5 ml-auto">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 h-5 font-medium"
            >
              <SlidersHorizontal size={9} className="mr-1" />
              {filterCount} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X size={12} className="mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* ── Results count row ── */}
      {filtered && (
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredCount}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span>{" "}
          tasks
        </p>
      )}
    </div>
  );
}