// components/calendar/CalendarWeekView.tsx

"use client";

import { useMemo, useRef, useEffect } from "react";
import {
  format,
  isToday,
  isSameDay,
  addDays,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "@/hooks/useCalendar";
import { CalendarEventCard } from "./CalendarEventCard";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64; // px per hour
const START_HOUR = 7; // scroll to 7am on mount

// ─── Time Label ────────────────────────────────────────────────────────────────

function TimeLabel({ hour }: { hour: number }) {
  if (hour === 0) return null;
  const label = hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
  return (
    <div
      className="absolute right-2 text-[10px] text-muted-foreground select-none"
      style={{ top: `${hour * HOUR_HEIGHT - 8}px` }}
    >
      {label}
    </div>
  );
}

// ─── Current Time Indicator ────────────────────────────────────────────────────

function CurrentTimeIndicator() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = (minutes / 60) * HOUR_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="size-2.5 rounded-full bg-primary shrink-0 -ml-1.5" />
      <div className="flex-1 h-px bg-primary" />
    </div>
  );
}

// ─── Event Block ───────────────────────────────────────────────────────────────

function EventBlock({
  event,
  onClick,
  columnOffset = 0,
  columnWidth = 100,
}: {
  event: CalendarEvent;
  onClick: () => void;
  columnOffset?: number;
  columnWidth?: number;
}) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const durationMinutes = Math.max(endMinutes - startMinutes, 30);

  const top = (startMinutes / 60) * HOUR_HEIGHT;
  const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 24);

  return (
    <div
      className="absolute z-10"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${columnOffset}%`,
        width: `${columnWidth - 1}%`,
        minWidth: 0,
      }}
    >
      <CalendarEventCard
        event={event}
        variant="default"
        onClick={onClick}
        className="h-full overflow-hidden text-xs"
      />
    </div>
  );
}

// ─── Overlap resolver ──────────────────────────────────────────────────────────
// Groups overlapping events into columns to avoid visual overlap

const resolveOverlaps = (
  events: CalendarEvent[]
): { event: CalendarEvent; col: number; totalCols: number }[] => {
  if (events.length === 0) return [];

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  const columns: CalendarEvent[][] = [];

  sorted.forEach((event) => {
    const eventStart = new Date(event.startAt).getTime();
    const eventEnd = new Date(event.endAt).getTime();

    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const lastInCol = columns[col][columns[col].length - 1];
      const lastEnd = new Date(lastInCol.endAt).getTime();
      if (eventStart >= lastEnd) {
        columns[col].push(event);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([event]);
  });

  const result: {
    event: CalendarEvent;
    col: number;
    totalCols: number;
  }[] = [];

  columns.forEach((col, colIndex) => {
    col.forEach((event) => {
      const eventStart = new Date(event.startAt).getTime();
      const eventEnd = new Date(event.endAt).getTime();

      // Count how many columns overlap with this event's time range
      const overlappingCols = columns.filter((otherCol) =>
        otherCol.some((e) => {
          const eStart = new Date(e.startAt).getTime();
          const eEnd = new Date(e.endAt).getTime();
          return eStart < eventEnd && eEnd > eventStart;
        })
      ).length;

      result.push({
        event,
        col: colIndex,
        totalCols: overlappingCols,
      });
    });
  });

  return result;
};

// ─── Day Column ────────────────────────────────────────────────────────────────

function DayColumn({
  date,
  events,
  onEventClick,
  onSlotClick,
  showCurrentTime,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
  showCurrentTime: boolean;
}) {
  const timedEvents = events.filter((e) => !e.allDay);
  const resolved = resolveOverlaps(timedEvents);

  return (
    <div
      className="relative flex-1 border-r border-border last:border-r-0"
      style={{ height: `${HOUR_HEIGHT * 24}px` }}
    >
      {/* ── Hour slot lines ── */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-border/40 cursor-pointer hover:bg-muted/20 transition-colors"
          style={{
            top: `${hour * HOUR_HEIGHT}px`,
            height: `${HOUR_HEIGHT}px`,
          }}
          onClick={() => onSlotClick(date, hour)}
        />
      ))}

      {/* ── Current time indicator ── */}
      {showCurrentTime && <CurrentTimeIndicator />}

      {/* ── Event blocks ── */}
      {resolved.map(({ event, col, totalCols }) => (
        <EventBlock
          key={event._id}
          event={event}
          onClick={() => onEventClick(event)}
          columnOffset={(col / totalCols) * 100}
          columnWidth={100 / totalCols}
        />
      ))}
    </div>
  );
}

// ─── All Day Row ───────────────────────────────────────────────────────────────

function AllDayRow({
  days,
  events,
  onEventClick,
}: {
  days: Date[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const allDayEvents = events.filter((e) => e.allDay);
  if (allDayEvents.length === 0) return null;

  return (
    <div className="flex border-b border-border">
      {/* Time gutter */}
      <div className="w-14 shrink-0 px-2 py-1 flex items-center justify-end">
        <span className="text-[10px] text-muted-foreground">All day</span>
      </div>

      {/* Day cells */}
      {days.map((day) => {
        const dayEvents = allDayEvents.filter((e) =>
          isSameDay(new Date(e.startAt), day)
        );
        return (
          <div
            key={day.toISOString()}
            className="flex-1 border-r border-border last:border-r-0 p-1 min-h-[32px] flex flex-col gap-0.5"
          >
            {dayEvents.map((event) => (
              <CalendarEventCard
                key={event._id}
                event={event}
                variant="compact"
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CalendarWeekView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
}: CalendarWeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to working hours on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = START_HOUR * HOUR_HEIGHT - 32;
    }
  }, []);

  const weekStart = useMemo(
    () => startOfWeek(currentDate),
    [currentDate]
  );

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map[key] = events.filter((e) =>
        isSameDay(new Date(e.startAt), day)
      );
    });
    return map;
  }, [days, events]);

  const todayIndex = days.findIndex((d) => isToday(d));

  return (
    <div className="flex flex-col rounded-xl border border-border overflow-hidden">
      {/* ── Day headers ── */}
      <div className="flex border-b border-border bg-muted/40 shrink-0">
        {/* Time gutter spacer */}
        <div className="w-14 shrink-0" />

        {days.map((day, i) => {
          const isCurrentDay = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex-1 flex flex-col items-center py-2 gap-0.5 border-r border-border last:border-r-0",
                isCurrentDay && "bg-primary/5"
              )}
            >
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {format(day, "EEE")}
              </span>
              <div
                className={cn(
                  "size-7 flex items-center justify-center rounded-full text-sm font-bold",
                  isCurrentDay
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── All day row ── */}
      <AllDayRow
        days={days}
        events={events}
        onEventClick={onEventClick}
      />

      {/* ── Scrollable time grid ── */}
      <div
        ref={scrollRef}
        className="flex overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        {/* ── Time labels ── */}
        <div
          className="w-14 shrink-0 relative border-r border-border bg-background"
          style={{ height: `${HOUR_HEIGHT * 24}px` }}
        >
          {HOURS.map((hour) => (
            <TimeLabel key={hour} hour={hour} />
          ))}
        </div>

        {/* ── Day columns ── */}
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          return (
            <DayColumn
              key={key}
              date={day}
              events={eventsByDay[key] ?? []}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
              showCurrentTime={i === todayIndex}
            />
          );
        })}
      </div>
    </div>
  );
}