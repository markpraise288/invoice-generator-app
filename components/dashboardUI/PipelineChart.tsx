// components/dashboard/PipelineChart.tsx

"use client";

import { useKanbanDeals, dealStageConfig, formatDealValue } from "@/hooks/useDeals";
import type { DealStage } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

// ─── Open stages only ──────────────────────────────────────────────────────────

const PIPELINE_STAGES: DealStage[] = [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "contract_sent",
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function PipelineChartSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-20 shrink-0" />
          <Skeleton className="h-5 flex-1 rounded-md" />
          <Skeleton className="h-3 w-14 shrink-0" />
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
        <TrendingUp size={16} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No open deals</p>
      <p className="text-xs text-muted-foreground mt-1">
        Create a deal to start tracking your pipeline
      </p>
    </div>
  );
}

// ─── Stage Bar ─────────────────────────────────────────────────────────────────

function StageBar({
  stage,
  count,
  value,
  maxValue,
}: {
  stage: DealStage;
  count: number;
  value: number;
  maxValue: number;
}) {
  const config = dealStageConfig[stage];
  const widthPct = maxValue > 0 ? Math.max(4, (value / maxValue) * 100) : 0;

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs font-medium text-muted-foreground w-24 shrink-0 truncate">
        {config.label}
      </span>

      <div className="flex-1 h-6 rounded-md bg-muted/50 relative overflow-hidden">
        <div
          className="h-full rounded-md transition-all duration-500 flex items-center px-2"
          style={{
            width: `${widthPct}%`,
            backgroundColor: config.color,
          }}
        >
          {widthPct > 20 && (
            <span className="text-[10px] font-semibold text-white/90 whitespace-nowrap">
              {count} deal{count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {widthPct <= 20 && count > 0 && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-foreground whitespace-nowrap">
            {count}
          </span>
        )}
      </div>

      <span className="text-xs font-semibold text-foreground w-16 text-right shrink-0">
        {formatDealValue(value)}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PipelineChart() {
  const { data, isLoading, isError } = useKanbanDeals();

  const stageData = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: data?.stageTotals[stage]?.count ?? 0,
    value: data?.stageTotals[stage]?.value ?? 0,
  }));

  const maxValue = Math.max(...stageData.map((s) => s.value), 0);
  const totalValue = stageData.reduce((sum, s) => sum + s.value, 0);
  const totalCount = stageData.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Pipeline overview
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading..."
              : `${totalCount} open deal${totalCount !== 1 ? "s" : ""} · ${formatDealValue(totalValue)}`}
          </p>
        </div>
        <Link href="/deals">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            View all
            <ArrowRight size={12} />
          </Button>
        </Link>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <PipelineChartSkeleton />
      ) : isError ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          Failed to load pipeline data
        </p>
      ) : totalCount === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {stageData.map((s) => (
            <StageBar
              key={s.stage}
              stage={s.stage}
              count={s.count}
              value={s.value}
              maxValue={maxValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}