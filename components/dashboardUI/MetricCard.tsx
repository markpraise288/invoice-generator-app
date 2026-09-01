// components/dashboard/MetricCard.tsx

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  bgClass: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "flat";
    label?: string;
  };
  sub?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

// ─── Trend Indicator ───────────────────────────────────────────────────────────

function TrendIndicator({
  trend,
}: {
  trend: NonNullable<MetricCardProps["trend"]>;
}) {
  const Icon =
    trend.direction === "up"
      ? ArrowUp
      : trend.direction === "down"
      ? ArrowDown
      : Minus;

  const colorClass =
    trend.direction === "up"
      ? "text-emerald-500"
      : trend.direction === "down"
      ? "text-rose-500"
      : "text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        colorClass
      )}
    >
      <Icon size={10} />
      {Math.abs(trend.value)}%
      {trend.label && (
        <span className="text-muted-foreground font-normal ml-0.5">
          {trend.label}
        </span>
      )}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  trend,
  sub,
  isLoading,
  onClick,
}: MetricCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-4 text-left",
        "transition-all",
        onClick && "hover:border-border/80 hover:shadow-sm cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "size-9 rounded-lg flex items-center justify-center shrink-0",
            bgClass
          )}
        >
          <Icon size={16} className={iconClass} />
        </div>
        {trend && !isLoading && <TrendIndicator trend={trend} />}
      </div>

      <div className="flex flex-col gap-0.5">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <span className="text-xl font-bold text-foreground leading-none">
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {label}
            </span>
            {sub && (
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {sub}
              </span>
            )}
          </>
        )}
      </div>
    </Wrapper>
  );
}

// ─── Metric Grid Wrapper ───────────────────────────────────────────────────────
// Convenience wrapper for laying out 4 metric cards consistently

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>
  );
}