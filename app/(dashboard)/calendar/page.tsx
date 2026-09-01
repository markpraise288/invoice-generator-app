// app/calendar/page.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useCalendarEvents,
  useUpcomingEvents,
  getWeekRange,
  getMonthRange,
} from "@/hooks/useCalendar";
import type { CalendarEvent, CalendarFilters } from "@/hooks/useCalendar";
import { CalendarHeader, type CalendarView } from "@/components/calendar/CalendarHeader";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarAgendaView } from "@/components/calendar/CalendarAgendaView";
import { CreateEventDialog } from "@/components/calendar/CreateEventDialog";
import { EventDetailsDrawer } from "@/components/calendar/EventDetailsDrawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
} from "date-fns";
import { CalendarDays } from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CalendarPageProps {
  currentUser?: { _id: string; name: string };
}

// ─── Mini upcoming sidebar ──────────────────────────────────────────────────────

function UpcomingEventsSidebar({
  onEventClick,
}: {
  onEventClick: (event: CalendarEvent) => void;
}) {
  const { data: upcoming, isLoading } = useUpcomingEvents({
    limit: 5,
    daysAhead: 14,
  });

  return (
    <div className="flex flex-col gap-3 w-64 shrink-0">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
        Upcoming
      </h3>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border p-3 space-y-1.5"
            >
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : !upcoming || upcoming.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 flex flex-col items-center justify-center text-center">
          <CalendarDays size={18} className="text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">
            No upcoming events
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {upcoming.map((event) => {
            const eventDate = new Date(event.startAt);
            const isEventToday = isToday(eventDate);

            return (
              <button
                key={event._id}
                onClick={() => onEventClick(event)}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-border/80 hover:shadow-sm transition-all"
              >
                {/* Date badge */}
                <div
                  className={cn(
                    "flex flex-col items-center justify-center size-10 rounded-lg shrink-0",
                    isEventToday
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <span className="text-[10px] font-medium uppercase leading-none">
                    {format(eventDate, "MMM")}
                  </span>
                  <span className="text-base font-bold leading-none mt-0.5">
                    {format(eventDate, "d")}
                  </span>
                </div>

                {/* Event info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {event.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {event.allDay
                      ? "All day"
                      : format(eventDate, "h:mm a")}
                  </span>
                  {(event.lead || event.contact) && (
                    <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {event.contact?.name ?? event.lead?.name}
                    </span>
                  )}
                </div>

                {/* Color dot */}
                <div
                  className="size-2 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: event.color }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Day View (simple implementation) ─────────────────────────────────────────

function CalendarDayView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, hour: number) => void;
}) {
  // Reuse the week view with a single day
  return (
    <CalendarWeekView
      currentDate={currentDate}
      events={events}
      onEventClick={onEventClick}
      onSlotClick={onSlotClick}
    />
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function CalendarPage({ currentUser }: CalendarPageProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<Date | undefined>();
  const [createHour, setCreateHour] = useState<number | undefined>();

  // ── Compute date range for current view ───────────────────────────────────

  const dateRange = useMemo(() => {
    switch (view) {
      case "month": {
        const range = getMonthRange(currentDate);
        // Extend by one week on each side to cover padding days
        const from = new Date(range.start);
        from.setDate(from.getDate() - 7);
        const to = new Date(range.end);
        to.setDate(to.getDate() + 7);
        return { from: from.toISOString(), to: to.toISOString() };
      }
      case "week": {
        const range = getWeekRange(currentDate);
        return {
          from: range.start.toISOString(),
          to: range.end.toISOString(),
        };
      }
      case "day": {
        const start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        return { from: start.toISOString(), to: end.toISOString() };
      }
      case "agenda": {
        const from = new Date(currentDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(currentDate);
        to.setDate(to.getDate() + 30);
        to.setHours(23, 59, 59, 999);
        return { from: from.toISOString(), to: to.toISOString() };
      }
    }
  }, [view, currentDate]);

  const filters: CalendarFilters = {
    from: dateRange.from,
    to: dateRange.to,
    limit: 200,
  };

  const { data: eventsData, isLoading } = useCalendarEvents(filters);
  const events = eventsData?.events ?? [];

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNavigate = useCallback(
    (direction: "prev" | "next" | "today") => {
      if (direction === "today") {
        setCurrentDate(new Date());
        return;
      }

      setCurrentDate((prev) => {
        switch (view) {
          case "month":
            return direction === "next"
              ? addMonths(prev, 1)
              : subMonths(prev, 1);
          case "week":
            return direction === "next"
              ? addWeeks(prev, 1)
              : subWeeks(prev, 1);
          case "day":
            return direction === "next"
              ? addDays(prev, 1)
              : subDays(prev, 1);
          case "agenda":
            return direction === "next"
              ? addMonths(prev, 1)
              : subMonths(prev, 1);
          default:
            return prev;
        }
      });
    },
    [view]
  );

  // ── Event interactions ────────────────────────────────────────────────────

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  }, []);

  const handleDayClick = useCallback(
    (date: Date) => {
      if (view === "month") {
        setCurrentDate(date);
        setView("day");
      }
    },
    [view]
  );

  const handleSlotClick = useCallback((date: Date, hour: number) => {
    setCreateDate(date);
    setCreateHour(hour);
    setCreateOpen(true);
  }, []);

  const handleCreateEvent = useCallback((date?: Date) => {
    setCreateDate(date);
    setCreateHour(undefined);
    setCreateOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onCreateEvent={() => handleCreateEvent()}
      />

      {/* ── Main layout ── */}
      <div className="flex gap-5 items-start">
        {/* ── Calendar views ── */}
        <div className="flex-1 min-w-0">
          {isLoading && view !== "agenda" ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="py-2 flex justify-center">
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-h-[110px] p-1.5 border-b border-r border-border"
                  >
                    <Skeleton className="h-5 w-5 rounded-full mb-2" />
                  </div>
                ))}
              </div>
            </div>
          ) : view === "month" ? (
            <CalendarMonthView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
              onCreateEvent={handleCreateEvent}
            />
          ) : view === "week" ? (
            <CalendarWeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          ) : view === "day" ? (
            <CalendarWeekView
              currentDate={currentDate}
              events={events.filter((e) => {
                const d = new Date(e.startAt);
                return (
                  d.getDate() === currentDate.getDate() &&
                  d.getMonth() === currentDate.getMonth() &&
                  d.getFullYear() === currentDate.getFullYear()
                );
              })}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          ) : (
            <CalendarAgendaView
              currentDate={currentDate}
              events={events}
              isLoading={isLoading}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* ── Upcoming sidebar — hidden on small screens ── */}
        <div className="hidden xl:block">
          <UpcomingEventsSidebar onEventClick={handleEventClick} />
        </div>
      </div>

      {/* ── Create event dialog ── */}
      <CreateEventDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) {
            setCreateDate(undefined);
            setCreateHour(undefined);
          }
        }}
        defaultDate={createDate}
        defaultHour={createHour}
        currentUserId={currentUser?._id}
      />

      {/* ── Event details drawer ── */}
      <EventDetailsDrawer
        event={selectedEvent}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={(event) => {
          setDrawerOpen(false);
          setCreateDate(new Date(event.startAt));
          setCreateOpen(true);
        }}
        currentUserId={currentUser?._id}
      />
    </div>
  );
}