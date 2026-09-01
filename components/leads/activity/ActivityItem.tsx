// components/leads/activity/ActivityItem.tsx

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Clock, Calendar, Phone } from "lucide-react";
import { ActivityIcon, activityConfig } from "./ActivityIcon";
import { useDeleteActivity, useUpdateActivity } from "@/hooks/useLeadActivities";
import type { Activity, UpdateActivityPayload } from "@/hooks/useLeadActivities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ActivityItemProps {
  activity: Activity;
  leadId: string;
  isLast: boolean;
  currentUserId?: string;
}

// ─── Inline Edit Form ──────────────────────────────────────────────────────────

interface InlineEditProps {
  activity: Activity;
  leadId: string;
  onCancel: () => void;
}

function InlineEditForm({ activity, leadId, onCancel }: InlineEditProps) {
  const [title, setTitle] = useState(activity.title ?? "");
  const [body, setBody] = useState(activity.body ?? "");
  const { mutate: updateActivity, isPending } = useUpdateActivity(leadId);

  const handleSave = () => {
    const payload: UpdateActivityPayload = {};
    if (title.trim()) payload.title = title.trim();
    if (body.trim()) payload.body = body.trim();
    if (!payload.title && !payload.body) return;

    updateActivity(
      { activityId: activity._id, payload },
      { onSuccess: onCancel }
    );
  };

  return (
    <div className="mt-2 space-y-2">
      {activity.title !== undefined && (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="h-8 text-sm"
          disabled={isPending}
        />
      )}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Details..."
        rows={3}
        className="text-sm resize-none"
        disabled={isPending}
      />
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

// ─── Activity Meta ─────────────────────────────────────────────────────────────
// Renders type-specific extra info below the body

function ActivityMeta({ activity }: { activity: Activity }) {
  if (activity.type === "call" && activity.duration !== undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
        <Phone size={11} />
        {activity.duration} min
      </span>
    );
  }

  if (activity.type === "meeting" && activity.scheduledAt) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
        <Calendar size={11} />
        {format(new Date(activity.scheduledAt), "MMM d, yyyy · h:mm a")}
      </span>
    );
  }

  if (activity.type === "email" && activity.subject) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
        Subject: {activity.subject}
      </span>
    );
  }

  if (activity.type === "status_change" && activity.meta) {
    const { from, to } = activity.meta as { from?: string; to?: string };
    if (from && to) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <span className="font-medium capitalize">{from.replace("_", " ")}</span>
          <span>→</span>
          <span className="font-medium capitalize">{to.replace("_", " ")}</span>
        </span>
      );
    }
  }

  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ActivityItem({
  activity,
  leadId,
  isLast,
  currentUserId,
}: ActivityItemProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: deleteActivity, isPending: isDeleting } = useDeleteActivity(leadId);

  const isOwner = currentUserId === activity.createdBy._id;
  const config = activityConfig[activity.type];
  const isSystemActivity = activity.type === "status_change";

  const handleDelete = () => {
    deleteActivity(activity._id, {
      onSuccess: () => setConfirmDelete(false),
    });
  };

  return (
    <>
      <div className="relative flex gap-3 group">
        {/* ── Timeline connector line ── */}
        {!isLast && (
          <div className="absolute left-4.25 top-9 bottom-0 w-px bg-border" />
        )}

        {/* ── Activity icon ── */}
        <div className="relative z-10 mt-0.5">
          <ActivityIcon type={activity.type} size="md" />
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0 pb-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-foreground">
                  {activity.createdBy.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  logged a
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    config.iconClass
                  )}
                >
                  {config.label}
                </span>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={10} className="text-muted-foreground" />
                <time
                  dateTime={activity.createdAt}
                  className="text-[11px] text-muted-foreground"
                  title={format(new Date(activity.createdAt), "PPpp")}
                >
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>

            {/* Actions — only for owner, non-system activities */}
            {isOwner && !isSystemActivity && (
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

          {/* Body */}
          {!editing ? (
            <div className="mt-1.5 space-y-1">
              {activity.title && (
                <p className="text-sm font-medium text-foreground leading-snug">
                  {activity.title}
                </p>
              )}
              {activity.body && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {activity.body}
                </p>
              )}
              <ActivityMeta activity={activity} />
            </div>
          ) : (
            <InlineEditForm
              activity={activity}
              leadId={leadId}
              onCancel={() => setEditing(false)}
            />
          )}
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the {config.label.toLowerCase()} from
              the timeline. This action cannot be undone.
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