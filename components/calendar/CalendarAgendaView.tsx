// components/calendar/CalendarAgendaView.tsx

"use client";

import { useMemo } from "react";
import { format, isToday, isTomorrow, isPast, addDays } from "date-fns";
import type { CalendarEvent } from "@/hooks/useCalendar";
import { CalendarEventCard } from "./CalendarEventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CalendarDays, CheckCircle2 } from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CalendarAgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
  onEventClick: (event: CalendarEvent) => void;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AgendaDay {
  date: Date;
  dateKey: string;
  label: string;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
  events: CalendarEvent[];
}

// ─── Day Label ─────────────────────────────────────────────────────────────────

const getDayLabel = (date: Date): string => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMMM d");
};

// ─── Build agenda days ─────────────────────────────────────────────────────────
// Groups events by day and fills empty days for 30-day window

const buildAgendaDays = (
  events: CalendarEvent[],
  from: Date,
  daysAhead = 30
): AgendaDay[] => {
  // Build a map of events by date key
  const eventMap: Record<string, CalendarEvent[]> = {};
  events.forEach((event) => {
    const key = event.startAt.slice(0, 10);
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push(event);
  });

  const days: AgendaDay[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(from, i);
    const dateKey = format(date, "yyyy-MM-dd");
    const dayEvents = (eventMap[dateKey] ?? []).sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

    // Only include days that have events OR are today
    if (dayEvents.length > 0 || isToday(date)) {
      days.push({
        date,
        dateKey,
        label: getDayLabel(date),
        isToday: isToday(date),
        isTomorrow: isTomorrow(date),
        isPast: isPast(date) && !isToday(date),
        events: dayEvents,
      });
    }
  }

  return days;
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function AgendaSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-24 shrink-0 pt-1 space-y-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex-1 space-y-2">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="rounded-xl border border-border bg-card p-4 space-y-2"
              >
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ hasEvents }: { hasEvents: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        {hasEvents ? (
          <CheckCircle2 size={20} className="text-emerald-500" />
        ) : (
          <CalendarDays size={20} className="text-muted-foreground" />
        )}
      </div>
      <p className="text-sm font-medium text-foreground">
        {hasEvents
          ? "All caught up!"
          : "No upcoming events"}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
        {hasEvents
          ? "No more events in the next 30 days"
          : "Create an event to get started"}
      </p>
    </div>
  );
}

// ─── Day Section ───────────────────────────────────────────────────────────────

function DaySection({
  day,
  onEventClick,
}: {
  day: AgendaDay;
  onEventClick: (event: CalendarEvent) => void;
}) {
  return (
    <div className="flex gap-4">
      {/* ── Date column ── */}
      <div className="w-28 shrink-0 pt-1">
        <div className="sticky top-4 flex flex-col gap-0.5">
          <span
            className={cn(
              "text-sm font-bold leading-none",
              day.isToday
                ? "text-primary"
                : day.isPast
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            {day.isToday
              ? "Today"
              : day.isTomorrow
              ? "Tomorrow"
              : format(day.date, "EEE, MMM d")}
          </span>
          {!day.isToday && !day.isTomorrow && (
            <span className="text-[11px] text-muted-foreground">
              {format(day.date, "yyyy")}
            </span>
          )}
          {day.isToday && (
            <span className="text-[11px] text-primary font-medium mt-0.5">
              {format(day.date, "MMM d")}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground mt-1">
            {day.events.length} event
            {day.events.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Events column ── */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {day.events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-4 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">
              No events scheduled
            </span>
          </div>
        ) : (
          day.events.map((event) => (
            <CalendarEventCard
              key={event._id}
              event={event}
              variant="detailed"
              onClick={() => onEventClick(event)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CalendarAgendaView({
  currentDate,
  events,
  isLoading,
  onEventClick,
}: CalendarAgendaViewProps) {
  const agendaDays = useMemo(
    () => buildAgendaDays(events, currentDate, 30),
    [events, currentDate]
  );

  if (isLoading) return <AgendaSkeleton />;

  if (agendaDays.length === 0) {
    return <EmptyState hasEvents={events.length > 0} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Month dividers ── */}
      {agendaDays.reduce<React.ReactNode[]>((acc, day, index) => {
        const prevDay = agendaDays[index - 1];
        const isNewMonth =
          !prevDay ||
          day.date.getMonth() !== prevDay.date.getMonth();

        if (isNewMonth) {
          acc.push(
            <div
              key={`month-${day.dateKey}`}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {format(day.date, "MMMM yyyy")}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
          );
        }

        acc.push(
          <DaySection
            key={day.dateKey}
            day={day}
            onEventClick={onEventClick}
          />
        );

        return acc;
      }, [])}
    </div>
  );
}