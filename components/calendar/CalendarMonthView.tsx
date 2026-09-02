// components/calendar/CalendarMonthView.tsx

"use client";

import { useMemo, useState } from "react";
import { format, isSameMonth, isToday, isSameDay } from "date-fns";
import type { CalendarEvent } from "@/hooks/useCalendar";
import { groupEventsByDate } from "@/hooks/useCalendar";
import { CalendarEventCard } from "./CalendarEventCard";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  onCreateEvent: (date: Date) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_EVENTS = 3;

// ─── Build calendar grid ───────────────────────────────────────────────────────

const buildCalendarGrid = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // Pad start with days from previous month
  const startPadding = firstDay.getDay();
  // Pad end to complete the last week
  const endPadding = 6 - lastDay.getDay();

  const days: Date[] = [];

  // Previous month days
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Next month days
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }

  // Always render 6 weeks (42 cells) for a stable grid height
  while (days.length < 42) {
    const last = days[days.length - 1];
    days.push(
      new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
    );
  }

  return days;
};

// ─── Day Cell ──────────────────────────────────────────────────────────────────

function DayCell({
  date,
  currentMonth,
  events,
  onEventClick,
  onDayClick,
  onCreateEvent,
}: {
  date: Date;
  currentMonth: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  onCreateEvent: (date: Date) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isCurrentDay = isToday(date);
  const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
  const overflowCount = events.length - MAX_VISIBLE_EVENTS;

  return (
    <div
      className={cn(
        "group relative flex flex-col min-h-[110px] p-1.5 border-b border-r border-border",
        "transition-colors",
        !isCurrentMonth && "bg-muted/20",
        hovered && "bg-muted/30"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDayClick(date)}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDayClick(date);
          }}
          className={cn(
            "size-6 flex items-center justify-center rounded-full",
            "text-xs font-medium transition-colors",
            isCurrentDay
              ? "bg-primary text-primary-foreground"
              : isCurrentMonth
              ? "text-foreground hover:bg-muted"
              : "text-muted-foreground/50"
          )}
        >
          {format(date, "d")}
        </button>

        {/* Quick create button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateEvent(date);
          }}
          className={cn(
            "size-5 rounded flex items-center justify-center",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-0.5 flex-1">
        {visibleEvents.map((event) => (
          <CalendarEventCard
            key={event._id}
            event={event}
            variant="compact"
            onClick={() => {
              onEventClick(event);
            }}
          />
        ))}

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDayClick(date);
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground px-1.5 text-left transition-colors"
          >
            +{overflowCount} more
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CalendarMonthView({
  currentDate,
  events,
  onEventClick,
  onDayClick,
  onCreateEvent,
}: CalendarMonthViewProps) {
  const days = useMemo(
    () => buildCalendarGrid(currentDate),
    [currentDate]
  );

  const eventsByDate = useMemo(
    () => groupEventsByDate(events),
    [events]
  );

  return (
    <div className="flex flex-col rounded-xl border border-border overflow-hidden">
      {/* ── Weekday headers ── */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] ?? [];

          // Sort events: all-day first, then by start time
          const sortedEvents = [...dayEvents].sort((a, b) => {
            if (a.allDay && !b.allDay) return -1;
            if (!a.allDay && b.allDay) return 1;
            return (
              new Date(a.startAt).getTime() -
              new Date(b.startAt).getTime()
            );
          });

          return (
            <DayCell
              key={dateKey}
              date={day}
              currentMonth={currentDate}
              events={sortedEvents}
              onEventClick={onEventClick}
              onDayClick={onDayClick}
              onCreateEvent={onCreateEvent}
            />
          );
        })}
      </div>
    </div>
  );
}