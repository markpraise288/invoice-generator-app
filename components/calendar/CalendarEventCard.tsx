// components/calendar/CalendarEventCard.tsx

"use client";

import { format, formatDistanceToNow, isPast } from "date-fns";
import type { CalendarEvent, EventType } from "@/hooks/useCalendar";
import { EVENT_TYPE_CONFIG, formatDuration } from "@/hooks/useCalendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  MapPin,
  Video,
  Users,
  Building2,
  User,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CalendarEventCardProps {
  event: CalendarEvent;
  variant?: "compact" | "default" | "detailed";
  onClick?: () => void;
  className?: string;
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  scheduled: {
    icon: Clock,
    label: "Scheduled",
    className: "text-muted-foreground",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    className: "text-emerald-500",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    className: "text-rose-500",
  },
};

// ─── Attendee Avatars ──────────────────────────────────────────────────────────

function AttendeeAvatars({
  attendees,
  max = 3,
}: {
  attendees: CalendarEvent["attendees"];
  max?: number;
}) {
  if (!attendees || attendees.length === 0) return null;

  const visible = attendees.slice(0, max);
  const overflow = attendees.length - max;

  return (
    <div className="flex items-center">
      {visible.map((a, i) => {
        const name = a.user?.name ?? a.name ?? a.email ?? "?";
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const avatar = a.user?.avatar;

        return (
          <div
            key={i}
            className={cn(
              "size-5 rounded-full border-2 border-background",
              "flex items-center justify-center text-[9px] font-bold",
              "bg-primary/10 text-primary shrink-0",
              i > 0 && "-ml-1.5"
            )}
            title={name}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="size-5 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        );
      })}
      {overflow > 0 && (
        <div
          className={cn(
            "size-5 rounded-full border-2 border-background -ml-1.5",
            "flex items-center justify-center text-[9px] font-bold",
            "bg-muted text-muted-foreground"
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ─── CRM Link Badges ───────────────────────────────────────────────────────────

function CrmLinks({ event }: { event: CalendarEvent }) {
  const links = [];

  if (event.lead) {
    links.push({
      icon: AlertCircle,
      label: event.lead.name,
      className: "text-blue-500",
    });
  }
  if (event.contact) {
    links.push({
      icon: User,
      label: event.contact.name,
      className: "text-violet-500",
    });
  }
  if (event.deal) {
    links.push({
      icon: DollarSign,
      label: event.deal.name,
      className: "text-emerald-500",
    });
  }

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
          >
            <Icon size={10} className={link.className} />
            <span className="truncate max-w-[80px]">{link.label}</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Compact Variant (for month grid cells) ────────────────────────────────────

function CompactCard({
  event,
  onClick,
  className,
}: {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
}) {
  const config = EVENT_TYPE_CONFIG[event.type];
  const isCancelled = event.status === "cancelled";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-left",
        "transition-opacity hover:opacity-80 truncate",
        isCancelled && "opacity-50",
        className
      )}
      style={{ backgroundColor: `${config.color}20`, borderLeft: `2px solid ${config.color}` }}
    >
      <span
        className="text-[11px] font-medium truncate"
        style={{ color: config.color }}
      >
        {event.allDay ? (
          event.title
        ) : (
          <>
            {format(new Date(event.startAt), "h:mm")}
            {" "}
            {event.title}
          </>
        )}
      </span>
      {event.recurringEventId && (
        <RotateCcw size={9} className="shrink-0 opacity-60" style={{ color: config.color }} />
      )}
    </button>
  );
}

// ─── Default Variant (for week/agenda views) ───────────────────────────────────

function DefaultCard({
  event,
  onClick,
  className,
}: {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
}) {
  const config = EVENT_TYPE_CONFIG[event.type];
  const statusConf = STATUS_CONFIG[event.status];
  const StatusIcon = statusConf.icon;
  const isCancelled = event.status === "cancelled";
  const isOverdue =
    event.isPast && event.status === "scheduled";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full flex flex-col gap-1.5 px-3 py-2 rounded-lg text-left",
        "border transition-all hover:shadow-sm",
        isCancelled
          ? "opacity-60 border-border bg-muted/30"
          : isOverdue
          ? "border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10"
          : "border-border bg-card hover:border-border/80",
        className
      )}
      style={{ borderLeft: `3px solid ${config.color}` }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "text-sm font-semibold text-foreground leading-snug line-clamp-1",
            isCancelled && "line-through"
          )}
        >
          {event.title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {event.recurringEventId && (
            <RotateCcw size={11} className="text-muted-foreground" />
          )}
          <StatusIcon size={12} className={statusConf.className} />
        </div>
      </div>

      {/* Time + duration */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} />
          {event.allDay
            ? "All day"
            : `${format(new Date(event.startAt), "h:mm a")} – ${format(
                new Date(event.endAt),
                "h:mm a"
              )}`}
        </span>
        {!event.allDay && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(event.durationMinutes)}
          </span>
        )}
      </div>

      {/* Location / meeting URL */}
      {(event.location || event.meetingUrl) && (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate">
          {event.meetingUrl ? (
            <Video size={11} />
          ) : (
            <MapPin size={11} />
          )}
          <span className="truncate">
            {event.meetingUrl ? "Video call" : event.location}
          </span>
        </span>
      )}

      {/* Attendees + CRM links */}
      <div className="flex items-center justify-between gap-2">
        <CrmLinks event={event} />
        {event.attendees.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <AttendeeAvatars attendees={event.attendees} />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Detailed Variant (for agenda view + standalone) ──────────────────────────

function DetailedCard({
  event,
  onClick,
  className,
}: {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
}) {
  const config = EVENT_TYPE_CONFIG[event.type];
  const statusConf = STATUS_CONFIG[event.status];
  const StatusIcon = statusConf.icon;
  const isCancelled = event.status === "cancelled";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full flex gap-4 px-4 py-3.5 rounded-xl text-left",
        "border border-border bg-card transition-all",
        "hover:border-border/80 hover:shadow-sm",
        isCancelled && "opacity-60",
        className
      )}
    >
      {/* Color strip + time */}
      <div className="flex flex-col items-center gap-1 shrink-0 w-14">
        <div
          className="w-1 flex-1 rounded-full min-h-[40px]"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-[10px] text-muted-foreground">
          {formatDuration(event.durationMinutes)}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className={cn(
                "text-sm font-semibold text-foreground leading-snug",
                isCancelled && "line-through"
              )}
            >
              {event.title}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] h-4 px-1.5",
                  config.bgClass,
                  config.textClass
                )}
              >
                {config.label}
              </Badge>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px]",
                  statusConf.className
                )}
              >
                <StatusIcon size={10} />
                {statusConf.label}
              </span>
              {event.recurringEventId && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <RotateCcw size={10} />
                  Recurring
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Time */}
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} />
          {event.allDay
            ? "All day"
            : `${format(new Date(event.startAt), "h:mm a")} – ${format(
                new Date(event.endAt),
                "h:mm a"
              )}`}
        </span>

        {/* Location */}
        {event.location && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} />
            {event.location}
          </span>
        )}

        {/* Meeting URL */}
        {event.meetingUrl && (
          <a
            href={event.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 w-fit"
          >
            <Video size={11} />
            Join meeting
          </a>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* CRM links */}
        <CrmLinks event={event} />

        {/* Attendees */}
        {event.attendees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={11} className="text-muted-foreground" />
            <AttendeeAvatars attendees={event.attendees} max={5} />
            <span className="text-[11px] text-muted-foreground">
              {event.attendees.length} attendee
              {event.attendees.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function CalendarEventCard({
  event,
  variant = "default",
  onClick,
  className,
}: CalendarEventCardProps) {
  if (variant === "compact") {
    return (
      <CompactCard event={event} onClick={onClick} className={className} />
    );
  }
  if (variant === "detailed") {
    return (
      <DetailedCard event={event} onClick={onClick} className={className} />
    );
  }
  return (
    <DefaultCard event={event} onClick={onClick} className={className} />
  );
}

export { AttendeeAvatars, CrmLinks };