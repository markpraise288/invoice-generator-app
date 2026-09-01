// components/dashboard/LeadsBySourceChart.tsx

"use client";

import Link from "next/link";
import { useLeadsReport } from "@/hooks/useReports";
import type { ReportParams } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Users } from "lucide-react";

// ─── Colors ────────────────────────────────────────────────────────────────────

const SOURCE_COLORS = [
  "#60a5fa",
  "#34d399",
  "#a78bfa",
  "#fb923c",
  "#facc15",
  "#f87171",
  "#38bdf8",
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface LeadsBySourceChartProps {
  params?: ReportParams;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SourceChartSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-2.5">
        <Users size={16} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No lead data yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        Leads will appear here once you start adding them
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function LeadsBySourceChart({ params }: LeadsBySourceChartProps) {
  const { data, isLoading, isError } = useLeadsReport(params);

  const sources = (data?.sourceBreakdown ?? [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const maxCount = Math.max(...sources.map((s) => s.count), 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Leads by source
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading..."
              : `${data?.totals.total ?? 0} total leads`}
          </p>
        </div>
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            Reports
            <ArrowRight size={12} />
          </Button>
        </Link>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <SourceChartSkeleton />
      ) : isError ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          Failed to load lead source data
        </p>
      ) : sources.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3.5">
          {sources.map((source, i) => {
            const widthPct =
              maxCount > 0 ? (source.count / maxCount) * 100 : 0;
            return (
              <div key={source.source} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground capitalize truncate">
                    {source.source}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {source.count}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5"
                    >
                      {source.conversionRate}%
                    </Badge>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor:
                        SOURCE_COLORS[i % SOURCE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}