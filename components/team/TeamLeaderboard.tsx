// components/team/TeamLeaderboard.tsx

"use client";

import { useState } from "react";
import { useLeaderboard, type LeaderboardMetric } from "@/hooks/useTeam";
import { MemberAvatar, ROLE_CONFIG } from "./TeamMemberCard";
import { formatDealValue } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trophy,
  TrendingUp,
  CheckSquare,
  Activity,
  DollarSign,
  Medal,
} from "lucide-react";

// ─── Metric Config ─────────────────────────────────────────────────────────────

const METRIC_OPTIONS: {
  value: LeaderboardMetric;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  format: (v: number) => string;
}[] = [
  {
    value: "wonValue",
    label: "Won revenue",
    icon: DollarSign,
    format: (v) => formatDealValue(v),
  },
  {
    value: "wonDeals",
    label: "Deals won",
    icon: Trophy,
    format: (v) => String(v),
  },
  {
    value: "totalLeads",
    label: "Total leads",
    icon: TrendingUp,
    format: (v) => String(v),
  },
  {
    value: "conversionRate",
    label: "Conversion rate",
    icon: CheckSquare,
    format: (v) => `${v}%`,
  },
  {
    value: "totalActivities",
    label: "Activities",
    icon: Activity,
    format: (v) => String(v),
  },
];

// ─── Rank Badge ────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="size-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
        <Trophy size={13} className="text-amber-500" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
        <Medal size={13} className="text-slate-400" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="size-7 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
        <Medal size={13} className="text-orange-400" />
      </div>
    );
  }
  return (
    <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-muted-foreground">
        {rank}
      </span>
    </div>
  );
}

// ─── Score Bar ─────────────────────────────────────────────────────────────────

function ScoreBar({
  score,
  maxScore,
  rank,
}: {
  score: number;
  maxScore: number;
  rank: number;
}) {
  const pct = maxScore > 0 ? Math.max(4, (score / maxScore) * 100) : 0;

  const barColor =
    rank === 1
      ? "bg-amber-400"
      : rank === 2
      ? "bg-slate-400"
      : rank === 3
      ? "bg-orange-400"
      : "bg-primary/40";

  return (
    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", barColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3"
        >
          <Skeleton className="size-7 rounded-full shrink-0" />
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-2.5">
        <Trophy size={16} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        No data yet
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Leaderboard will populate as your team logs activity
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TeamLeaderboard() {
  const [metric, setMetric] = useState<LeaderboardMetric>("wonValue");
  const { data: leaderboard, isLoading, isError } = useLeaderboard(metric);

  const activeMetric = METRIC_OPTIONS.find((m) => m.value === metric)!;
  const maxScore = leaderboard?.[0]?.score ?? 0;

  const hasData = leaderboard && leaderboard.some((e) => e.score > 0);

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Trophy size={13} className="text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Leaderboard
          </h3>
        </div>

        {/* ── Metric tabs ── */}
        <div className="flex items-center gap-1 flex-wrap">
          {METRIC_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setMetric(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors",
                  metric === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={11} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-xs text-muted-foreground">
            Failed to load leaderboard
          </p>
          <Button variant="outline" size="sm">
            Try again
          </Button>
        </div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {(leaderboard ?? []).map((entry) => {
            const roleConf = ROLE_CONFIG[entry.user.role];
            const RoleIcon = roleConf.icon;

            return (
              <div
                key={entry.user._id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors",
                  entry.rank === 1
                    ? "bg-amber-50/50 dark:bg-amber-950/10"
                    : "hover:bg-muted/30"
                )}
              >
                {/* Rank */}
                <RankBadge rank={entry.rank} />

                {/* Avatar */}
                <MemberAvatar
                  name={entry.user.name}
                  avatar={entry.user.avatar}
                  size="sm"
                />

                {/* Name + bar */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {entry.user.name}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] shrink-0",
                        roleConf.className,
                        "px-1 py-0 rounded"
                      )}
                    >
                      <RoleIcon size={9} />
                      {roleConf.label}
                    </span>
                  </div>
                  <ScoreBar
                    score={entry.score}
                    maxScore={maxScore}
                    rank={entry.rank}
                  />
                </div>

                {/* Score */}
                <span
                  className={cn(
                    "text-sm font-bold shrink-0 w-20 text-right",
                    entry.rank === 1
                      ? "text-amber-500"
                      : entry.rank <= 3
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {activeMetric.format(entry.score)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}