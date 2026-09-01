// components/dashboard/DashboardHeader.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DashboardRange = "today" | "week" | "month" | "quarter";

interface DashboardHeaderProps {
  userName?: string;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  onCreateLead?: () => void;
}

// ─── Range Options ──────────────────────────────────────────────────────────────

const RANGE_OPTIONS: { label: string; value: DashboardRange }[] = [
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "This quarter", value: "quarter" },
];

// ─── Greeting helper ─────────────────────────────────────────────────────────────

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// ─── Main Component ────────────────────────────────────────────────────────────

export function DashboardHeader({
  userName,
  range,
  onRangeChange,
  onCreateLead,
}: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const activeRangeLabel =
    RANGE_OPTIONS.find((r) => r.value === range)?.label ?? "This month";

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {getGreeting()}
          {userName ? `, ${userName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Calendar size={13} />
              {activeRangeLabel}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {RANGE_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onRangeChange(opt.value)}
                className={cn(
                  "text-xs",
                  range === opt.value && "bg-muted"
                )}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" className="h-9 gap-1.5" onClick={onCreateLead}>
          <Plus size={15} />
          New lead
        </Button>
      </div>
    </div>
  );
}