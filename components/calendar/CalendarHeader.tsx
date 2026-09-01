// components/calendar/CalendarHeader.tsx

"use client";

import { format } from "date-fns";
import { useCalendarStats } from "@/hooks/useCalendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Columns,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CalendarView = "month" | "week" | "day" | "agenda";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: "prev" | "next" | "today") => void;
  onCreateEvent: () => void;
}

// ─── View Config ───────────────────────────────────────────────────────────────

const VIEW_OPTIONS: {
  value: CalendarView;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { value: "month", label: "Month", icon: LayoutGrid },
  { value: "week", label: "Week", icon: Columns },
  { value: "day", label: "Day", icon: Calendar },
  { value: "agenda", label: "Agenda", icon: List },
];

// ─── Stats Strip ───────────────────────────────────────────────────────────────

function StatsStrip() {
  const { data: stats, isLoading } = useCalendarStats();

  const items = [
    {
      icon: Calendar,
      label: "This month",
      value: stats?.totalThisMonth ?? 0,
      iconClass: "text-blue-500",
    },
    {
      icon: Clock,
      label: "This week",
      value: stats?.upcomingThisWeek ?? 0,
      iconClass: "text-amber-500",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: stats?.completedThisMonth ?? 0,
      iconClass: "text-emerald-500",
    },
  ];

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-1.5"
          >
            <Icon size={13} className={item.iconClass} />
            {isLoading ? (
              <Skeleton className="h-3 w-16" />
            ) : (
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {item.value}
                </span>
                {" "}{item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Date Title ────────────────────────────────────────────────────────────────

function DateTitle({
  date,
  view,
}: {
  date: Date;
  view: CalendarView;
}) {
  const title = (() => {
    switch (view) {
      case "month":
        return format(date, "MMMM yyyy");
      case "week": {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        if (start.getMonth() === end.getMonth()) {
          return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
        }
        return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
      }
      case "day":
        return format(date, "EEEE, MMMM d, yyyy");
      case "agenda":
        return `Agenda · ${format(date, "MMMM yyyy")}`;
    }
  })();

  return (
    <h2 className="text-base font-bold text-foreground whitespace-nowrap">
      {title}
    </h2>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onCreateEvent,
}: CalendarHeaderProps) {
  const isToday =
    format(currentDate, "yyyy-MM-dd") ===
    format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-3">
      {/* ── Top row ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onNavigate("prev")}
            >
              <ChevronLeft size={15} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onNavigate("next")}
            >
              <ChevronRight size={15} />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs px-3",
              isToday && "border-primary text-primary"
            )}
            onClick={() => onNavigate("today")}
          >
            Today
          </Button>

          <DateTitle date={currentDate} view={view} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted gap-0.5">
            {VIEW_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => onViewChange(opt.value)}
                  title={opt.label}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                    view === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Create event */}
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={onCreateEvent}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New event</span>
          </Button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <StatsStrip />
    </div>
  );
}