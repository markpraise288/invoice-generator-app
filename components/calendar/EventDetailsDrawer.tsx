// components/calendar/EventDetailsDrawer.tsx

"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  useUpdateEvent,
  useDeleteEvent,
  useUpdateAttendeeStatus,
  EVENT_TYPE_CONFIG,
  RELATED_TO_DISPLAY,
  formatDuration,
  getRelatedId,
  getRelatedLabel,
} from "@/hooks/useCalendar";
import type {
  CalendarEvent,
  EventStatus,
  AttendeeStatus,
  RecurringScope,
  CalendarRelatedTo,
} from "@/hooks/useCalendar";
import { AttendeeAvatars } from "./CalendarEventCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Clock,
  MapPin,
  Video,
  RotateCcw,
  Bell,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  ChevronDown,
  Link2,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface EventDetailsDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  currentUserId?: string;
}

// ─── Recurring Scope Dialog ────────────────────────────────────────────────────

function RecurringScopeDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  action: "edit" | "delete";
  onConfirm: (scope: RecurringScope) => void;
  isPending: boolean;
}) {
  const [scope, setScope] = useState<RecurringScope>("this");

  const options: {
    value: RecurringScope;
    label: string;
    description: string;
  }[] = [
    {
      value: "this",
      label: "This event",
      description: "Only this occurrence will be affected",
    },
    {
      value: "this_and_future",
      label: "This and following events",
      description: "This and all future occurrences will be affected",
    },
    {
      value: "all",
      label: "All events",
      description: "Every occurrence in this series will be affected",
    },
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === "edit"
              ? "Edit recurring event"
              : "Delete recurring event"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This is a recurring event. Which occurrences do you want to{" "}
            {action === "edit" ? "edit" : "delete"}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setScope(opt.value)}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                scope === opt.value
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "size-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center",
                  scope === opt.value ? "border-primary" : "border-border"
                )}
              >
                {scope === opt.value && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {opt.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {opt.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className={
              action === "delete"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
            onClick={() => onConfirm(scope)}
          >
            {isPending && (
              <Loader2 size={13} className="animate-spin mr-1.5" />
            )}
            {action === "edit" ? "Continue" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EventStatus }) {
  const config = {
    scheduled: {
      label: "Scheduled",
      className:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    },
    completed: {
      label: "Completed",
      className:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
    },
  }[status];

  return (
    <Badge
      variant="secondary"
      className={cn("text-[10px] h-5 px-2", config.className)}
    >
      {config.label}
    </Badge>
  );
}

// ─── RSVP Selector ─────────────────────────────────────────────────────────────

function RsvpSelector({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: AttendeeStatus;
}) {
  const { mutate: updateRsvp, isPending } = useUpdateAttendeeStatus(eventId);

  const options: {
    value: AttendeeStatus;
    label: string;
    icon: React.ComponentType<any>;
  }[] = [
    { value: "accepted", label: "Accept", icon: CheckCircle2 },
    { value: "tentative", label: "Maybe", icon: Clock },
    { value: "declined", label: "Decline", icon: XCircle },
  ];

  const statusColors: Record<AttendeeStatus, string> = {
    accepted: "text-emerald-500",
    tentative: "text-amber-500",
    declined: "text-rose-500",
    pending: "text-muted-foreground",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="h-8 gap-1.5 text-xs"
        >
          {isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <span className={cn("capitalize", statusColors[currentStatus])}>
              {currentStatus === "pending" ? "RSVP" : currentStatus}
            </span>
          )}
          <ChevronDown size={11} className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => updateRsvp(opt.value)}
              disabled={currentStatus === opt.value}
              className={cn(
                "text-xs gap-2",
                currentStatus === opt.value && "opacity-50"
              )}
            >
              <Icon size={13} className={statusColors[opt.value]} />
              {opt.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Detail Row ────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pt-1">
        {children}
      </div>
    </div>
  );
}

// ─── Linked Record Card ────────────────────────────────────────────────────────
// Uses RELATED_TO_DISPLAY from useCalendar for icon + label —
// no local config needed, single source of truth in the hook.

function LinkedRecordCard({ event }: { event: CalendarEvent }) {
  if (!event.relatedTo || !event.relatedId) return null;

  const display = RELATED_TO_DISPLAY[event.relatedTo as CalendarRelatedTo];
  if (!display) return null;

  const Icon = display.icon;
  const label = getRelatedLabel(event) ?? getRelatedId(event) ?? "—";

  // Color mapping per entity type — consistent with the rest of the CRM
  const colorMap: Record<CalendarRelatedTo, { icon: string; bg: string }> = {
    Lead: { icon: "text-blue-500", bg: "bg-blue-500/10" },
    Contact: { icon: "text-violet-500", bg: "bg-violet-500/10" },
    Deal: { icon: "text-emerald-500", bg: "bg-emerald-500/10" },
    Task: { icon: "text-amber-500", bg: "bg-amber-500/10" },
    Company: { icon: "text-blue-600", bg: "bg-blue-600/10" },
    Invoice: { icon: "text-rose-500", bg: "bg-rose-500/10" },
    Customer: { icon: "text-indigo-500", bg: "bg-indigo-500/10" },
    Project: { icon: "text-orange-500", bg: "bg-orange-500/10" },
  };

  const colors = colorMap[event.relatedTo as CalendarRelatedTo];

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-card">
      <div
        className={cn(
          "size-7 rounded-md flex items-center justify-center shrink-0",
          colors.bg
        )}
      >
        <Icon size={13} className={colors.icon} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {display.label}
        </span>
        <span className="text-xs font-medium text-foreground truncate">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Attendee List ─────────────────────────────────────────────────────────────

function AttendeeList({
  attendees,
  eventId,
  currentUserId,
}: {
  attendees: CalendarEvent["attendees"];
  eventId: string;
  currentUserId?: string;
}) {
  if (!attendees || attendees.length === 0) return null;

  const statusColors: Record<AttendeeStatus, string> = {
    accepted: "text-emerald-500",
    tentative: "text-amber-500",
    declined: "text-rose-500",
    pending: "text-muted-foreground",
  };

  const statusIcons: Record<AttendeeStatus, React.ComponentType<any>> = {
    accepted: CheckCircle2,
    tentative: Clock,
    declined: XCircle,
    pending: Clock,
  };

  const currentAttendee = attendees.find((a) => a.user?._id === currentUserId);

  return (
    <div className="flex flex-col gap-3">
      {/* RSVP for current user */}
      {currentAttendee && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border">
          <span className="text-xs text-muted-foreground">Your response</span>
          <RsvpSelector
            eventId={eventId}
            currentStatus={currentAttendee.status}
          />
        </div>
      )}

      {/* All attendees */}
      <div className="flex flex-col gap-2">
        {attendees.map((attendee, i) => {
          const name =
            attendee.user?.name ??
            attendee.name ??
            attendee.email ??
            "Unknown";
          const email = attendee.user?.email ?? attendee.email;
          const StatusIcon = statusIcons[attendee.status];

          return (
            <div key={i} className="flex items-center gap-2.5">
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground truncate">
                  {name}
                  {attendee.user?._id === currentUserId && (
                    <span className="text-muted-foreground font-normal ml-1">
                      (you)
                    </span>
                  )}
                </span>
                {email && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {email}
                  </span>
                )}
              </div>
              <StatusIcon
                size={13}
                className={cn("shrink-0", statusColors[attendee.status])}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function EventDetailsDrawer({
  event,
  open,
  onClose,
  onEdit,
  currentUserId,
}: EventDetailsDrawerProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recurringDeleteOpen, setRecurringDeleteOpen] = useState(false);
  const [recurringEditOpen, setRecurringEditOpen] = useState(false);

  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent(
    event?._id ?? ""
  );
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  if (!event) return null;

  const typeConfig = EVENT_TYPE_CONFIG[event.type];
  const isRecurring = !!event.recurringEventId;
  const hasLinkedRecord = !!(event.relatedTo && event.relatedId);

  // ── Status update ──────────────────────────────────────────────────────────

  const handleStatusUpdate = (status: EventStatus) => {
    updateEvent({ status });
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDeleteClick = () => {
    if (isRecurring) {
      setRecurringDeleteOpen(true);
    } else {
      setDeleteOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    deleteEvent(
      { eventId: event._id },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          onClose();
        },
      }
    );
  };

  const handleRecurringDeleteConfirm = (scope: RecurringScope) => {
    deleteEvent(
      { eventId: event._id, scope },
      {
        onSuccess: () => {
          setRecurringDeleteOpen(false);
          onClose();
        },
      }
    );
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const handleEditClick = () => {
    if (isRecurring) {
      setRecurringEditOpen(true);
    } else {
      onEdit?.(event);
    }
  };

  const handleRecurringEditConfirm = (_scope: RecurringScope) => {
    setRecurringEditOpen(false);
    onEdit?.(event);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-y-auto">
          {/* ── Header ── */}
          <SheetHeader className="p-0 shrink-0">
            {/* Color strip */}
            <div
              className="h-2 w-full"
              style={{ backgroundColor: event.color }}
            />

            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <h2 className="text-base font-bold text-foreground leading-snug">
                    {event.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] h-5 px-2",
                        typeConfig.bgClass,
                        typeConfig.textClass
                      )}
                    >
                      {typeConfig.label}
                    </Badge>
                    <StatusBadge status={event.status} />
                    {isRecurring && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <RotateCcw size={10} />
                        Recurring
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 mr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        className="text-xs"
                        onClick={handleEditClick}
                      >
                        <Pencil size={13} className="mr-2" />
                        Edit event
                      </DropdownMenuItem>

                      {event.status !== "completed" && (
                        <DropdownMenuItem
                          className="text-xs text-emerald-600 focus:text-emerald-600"
                          onClick={() => handleStatusUpdate("completed")}
                          disabled={isUpdating}
                        >
                          <CheckCircle2 size={13} className="mr-2" />
                          Mark complete
                        </DropdownMenuItem>
                      )}

                      {event.status !== "cancelled" && (
                        <DropdownMenuItem
                          className="text-xs text-amber-600 focus:text-amber-600"
                          onClick={() => handleStatusUpdate("cancelled")}
                          disabled={isUpdating}
                        >
                          <XCircle size={13} className="mr-2" />
                          Cancel event
                        </DropdownMenuItem>
                      )}

                      {event.status !== "scheduled" && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() => handleStatusUpdate("scheduled")}
                          disabled={isUpdating}
                        >
                          <Calendar size={13} className="mr-2" />
                          Reopen event
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-xs text-destructive focus:text-destructive"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 size={13} className="mr-2" />
                        Delete event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* ── Body ── */}
          <div className="flex flex-col gap-5 px-6 py-5">
            {/* ── Time ── */}
            <DetailRow icon={Clock}>
              <span className="text-sm font-medium text-foreground">
                {event.allDay
                  ? format(new Date(event.startAt), "EEEE, MMMM d, yyyy")
                  : `${format(
                      new Date(event.startAt),
                      "EEEE, MMMM d, yyyy"
                    )} · ${format(
                      new Date(event.startAt),
                      "h:mm a"
                    )} – ${format(new Date(event.endAt), "h:mm a")}`}
              </span>
              {!event.allDay && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(event.durationMinutes)}
                </span>
              )}
              {event.allDay && (
                <span className="text-xs text-muted-foreground">All day</span>
              )}
            </DetailRow>

            {/* ── Location ── */}
            {event.location && (
              <DetailRow icon={MapPin}>
                <span className="text-sm text-foreground">
                  {event.location}
                </span>
              </DetailRow>
            )}

            {/* ── Meeting URL ── */}
            {event.meetingUrl && (
              <DetailRow icon={Video}>
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline underline-offset-2 inline-flex items-center gap-1.5"
                >
                  Join meeting
                  <ExternalLink size={11} />
                </a>
              </DetailRow>
            )}

            {/* ── Recurrence ── */}
            {event.recurrence?.frequency && (
              <DetailRow icon={RotateCcw}>
                <span className="text-sm text-foreground capitalize">
                  Repeats {event.recurrence.frequency}
                  {event.recurrence.interval && event.recurrence.interval > 1
                    ? ` every ${event.recurrence.interval} ${event.recurrence.frequency}s`
                    : ""}
                </span>
                {event.recurrence.endDate && (
                  <span className="text-xs text-muted-foreground">
                    Until{" "}
                    {format(
                      new Date(event.recurrence.endDate),
                      "MMM d, yyyy"
                    )}
                  </span>
                )}
              </DetailRow>
            )}

            {/* ── Reminders ── */}
            {event.reminders && event.reminders.length > 0 && (
              <DetailRow icon={Bell}>
                <div className="flex flex-col gap-1">
                  {event.reminders.map((r, i) => (
                    <span key={i} className="text-sm text-foreground">
                      {r.minutesBefore < 60
                        ? `${r.minutesBefore} minutes before`
                        : r.minutesBefore === 60
                        ? "1 hour before"
                        : r.minutesBefore === 1440
                        ? "1 day before"
                        : `${r.minutesBefore} minutes before`}
                      <span className="text-xs text-muted-foreground ml-1.5 capitalize">
                        via {r.method}
                      </span>
                    </span>
                  ))}
                </div>
              </DetailRow>
            )}

            {/* ── Description ── */}
            {event.description && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </>
            )}

            {/* ── Linked record ── */}
            {hasLinkedRecord && (
              <>
                <Separator />
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Link2 size={11} />
                    Linked record
                  </h3>
                  <LinkedRecordCard event={event} />
                </div>
              </>
            )}

            {/* ── Attendees ── */}
            {event.attendees && event.attendees.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Attendees ({event.attendees.length})
                    </h3>
                    <AttendeeAvatars attendees={event.attendees} max={5} />
                  </div>
                  <AttendeeList
                    attendees={event.attendees}
                    eventId={event._id}
                    currentUserId={currentUserId}
                  />
                </div>
              </>
            )}

            {/* ── Meta ── */}
            <Separator />
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Meta
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Created by
                </span>
                <span className="text-xs font-medium text-foreground">
                  {event.createdBy.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Created</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Owner</span>
                <span className="text-xs font-medium text-foreground">
                  {event.owner.name}
                </span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Simple delete confirmation ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{event.title}</span>{" "}
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Recurring delete scope dialog ── */}
      <RecurringScopeDialog
        open={recurringDeleteOpen}
        onOpenChange={setRecurringDeleteOpen}
        action="delete"
        onConfirm={handleRecurringDeleteConfirm}
        isPending={isDeleting}
      />

      {/* ── Recurring edit scope dialog ── */}
      <RecurringScopeDialog
        open={recurringEditOpen}
        onOpenChange={setRecurringEditOpen}
        action="edit"
        onConfirm={handleRecurringEditConfirm}
        isPending={false}
      />
    </>
  );
}