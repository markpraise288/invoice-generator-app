// components/tasks/TaskItem.tsx

import { useState } from "react";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useCompleteTask, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import type { Task, UpdateTaskPayload, TaskPriority } from "@/hooks/useTasks";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Priority Config ───────────────────────────────────────────────────────────

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  high: {
    label: "High",
    className: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  urgent: {
    label: "Urgent",
    className: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  },
};

// ─── Due Date Label ────────────────────────────────────────────────────────────

function DueDateLabel({
  dueDate,
  completed,
  isOverdue,
}: {
  dueDate: string;
  completed: boolean;
  isOverdue: boolean;
}) {
  const date = new Date(dueDate);

  const label = isToday(date)
    ? "Due today"
    : isTomorrow(date)
    ? "Due tomorrow"
    : isPast(date)
    ? `${formatDistanceToNow(date)} overdue`
    : `Due ${format(date, "MMM d")}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
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
      {isOverdue && !completed ? (
        <AlertTriangle size={10} />
      ) : (
        <CalendarClock size={10} />
      )}
      {label}
    </span>
  );
}

// ─── Inline Edit Form ──────────────────────────────────────────────────────────

function InlineEditForm({
  task,
  onCancel,
}: {
  task: Task;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 16) : ""
  );
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const { mutate: updateTask, isPending } = useUpdateTask();

  const handleSave = () => {
    const payload: UpdateTaskPayload = {};
    if (title.trim() && title !== task.title) payload.title = title.trim();
    if (dueDate && dueDate !== task.dueDate.slice(0, 16)) {
      payload.dueDate = new Date(dueDate).toISOString();
    }
    if (priority !== task.priority) payload.priority = priority;
    if (Object.keys(payload).length === 0) return onCancel();

    updateTask({ taskId: task._id, payload }, { onSuccess: onCancel });
  };

  return (
    <div className="mt-2 space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="h-8 text-sm"
        disabled={isPending}
      />
      <div className="flex items-center gap-2">
        <Input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="h-8 text-sm flex-1"
          disabled={isPending}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          disabled={isPending}
          className={cn(
            "h-8 rounded-md border border-input bg-background px-2",
            "text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:opacity-50"
          )}
        >
          {(Object.keys(priorityConfig) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {priorityConfig[p].label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TaskItemProps {
  task: Task;
  currentUserId?: string;
  showLeadName?: boolean;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TaskItem({
  task,
  currentUserId,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: completeTask, isPending: isCompleting } =
    useCompleteTask();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const isOwner = currentUserId === task.createdBy._id;
  const priority = priorityConfig[task.priority];

  const handleToggleComplete = () => {
    completeTask({ taskId: task._id, completed: !task.completed });
  };

  const handleDelete = () => {
    deleteTask(task._id, { onSuccess: () => setConfirmDelete(false) });
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-start gap-3 rounded-lg border p-3 transition-colors",
          task.completed
            ? "bg-muted/30 border-border/50"
            : task.isOverdue
            ? "bg-rose-50/50 border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-900/40"
            : "bg-card border-border hover:border-border/80"
        )}
      >
        {/* ── Complete toggle ── */}
        <button
          onClick={handleToggleComplete}
          disabled={isCompleting}
          className={cn(
            "mt-0.5 shrink-0 transition-colors",
            task.completed
              ? "text-emerald-500"
              : "text-muted-foreground hover:text-emerald-500"
          )}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? (
            <CheckCircle2 size={18} />
          ) : (
            <Circle size={18} />
          )}
        </button>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          {!editing ? (
            <>
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium leading-snug",
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {task.title}
                  </span>

                  {/* Lead name — shown in widget context */}
                </div>

                {/* Actions */}
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <MoreHorizontal size={13} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => setEditing(true)}>
                        <Pencil size={13} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setConfirmDelete(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 size={13} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] px-1.5 py-0 h-4", priority.className)}
                >
                  {priority.label}
                </Badge>

                <DueDateLabel
                  dueDate={task.dueDate}
                  completed={task.completed}
                  isOverdue={task.isOverdue}
                />

                {task.assignedTo && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock size={10} />
                    {task.assignedTo.name}
                  </span>
                )}

                {task.completed && task.completedAt && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </>
          ) : (
            <InlineEditForm
              task={task}
              onCancel={() => setEditing(false)}
            />
          )}
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{task.title}</span>
              {" "}will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { priorityConfig };