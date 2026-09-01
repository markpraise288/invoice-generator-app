// components/team/TeamStatsBar.tsx

"use client";

import { useTeamOverview } from "@/hooks/useTeam";
import { formatDealValue } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  Shield,
  Eye,
  TrendingUp,
  DollarSign,
} from "lucide-react";

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  bgClass: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div
        className={cn(
          "size-9 rounded-lg flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <Icon size={16} className={iconClass} />
      </div>
      <div className="flex flex-col min-w-0">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-12 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <span className="text-lg font-bold text-foreground leading-none">
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Role Breakdown ─────────────────────────────────────────────────────────────

function RoleBreakdown({
  roles,
  total,
  isLoading,
}: {
  roles: { admin: number; member: number; viewer: number };
  total: number;
  isLoading: boolean;
}) {
  const items = [
    {
      label: "Admins",
      count: roles.admin,
      icon: ShieldCheck,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      label: "Members",
      count: roles.member,
      icon: Shield,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10",
    },
    {
      label: "Viewers",
      count: roles.viewer,
      icon: Eye,
      iconClass: "text-muted-foreground",
      bgClass: "bg-muted",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Role distribution
        </span>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            {total} total
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 flex-1 rounded-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            {items.map((item) => {
              const pct =
                total > 0 ? (item.count / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={item.label}
                  className={cn("h-full transition-all", item.bgClass)}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${item.count}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                >
                  <Icon size={11} className={item.iconClass} />
                  {item.count} {item.label}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TeamStatsBar() {
  const { data: overview, isLoading } = useTeamOverview();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Team members"
        value={overview?.totalMembers ?? 0}
        icon={Users}
        iconClass="text-blue-500"
        bgClass="bg-blue-500/10"
        isLoading={isLoading}
      />
      <StatCard
        label="Total leads"
        value={(overview?.totalLeads ?? 0).toLocaleString()}
        icon={TrendingUp}
        iconClass="text-violet-500"
        bgClass="bg-violet-500/10"
        isLoading={isLoading}
      />
      <StatCard
        label="Won revenue"
        value={formatDealValue(overview?.totalWonValue ?? 0)}
        icon={DollarSign}
        iconClass="text-emerald-500"
        bgClass="bg-emerald-500/10"
        isLoading={isLoading}
      />
      <RoleBreakdown
        roles={overview?.roles ?? { admin: 0, member: 0, viewer: 0 }}
        total={overview?.totalMembers ?? 0}
        isLoading={isLoading}
      />
    </div>
  );
}