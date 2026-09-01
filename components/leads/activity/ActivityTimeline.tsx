// components/leads/activity/ActivityTimeline.tsx

import { useState } from "react";
import { ActivityItem } from "./ActivityItem";
import { ActivityIcon, activityConfig } from "./ActivityIcon";
import { useLeadActivities, useActivitySummary } from "@/hooks/useLeadActivities";
import type { ActivityType } from "@/hooks/useLeadActivities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LayoutList } from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ActivityTimelineProps {
  leadId: string;
  currentUserId?: string;
}

// ─── Filter Tabs ───────────────────────────────────────────────────────────────

const FILTER_TABS: { label: string; value: ActivityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Notes", value: "note" },
  { label: "Calls", value: "call" },
  { label: "Emails", value: "email" },
  { label: "Meetings", value: "meeting" },
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-9 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <LayoutList size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {filtered ? "No activities of this type" : "No activity yet"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {filtered
          ? "Try switching to a different filter"
          : "Log a note, call, email or meeting to get started"}
      </p>
    </div>
  );
}

// ─── Summary Badges ────────────────────────────────────────────────────────────

function SummaryBadges({ leadId }: { leadId: string }) {
  const { data: summary } = useActivitySummary(leadId);
  if (!summary) return null;

  const entries = Object.entries(summary) as [ActivityType, number][];
  if (entries.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {entries.map(([type, count]) => {
        const config = activityConfig[type];
        if (!config || count === 0) return null;
        return (
          <Badge
            key={type}
            variant="secondary"
            className={cn(
              "gap-1 text-[11px] px-2 py-0.5 font-medium",
              config.iconClass
            )}
          >
            <config.icon size={10} />
            {count}
          </Badge>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ActivityTimeline({ leadId, currentUserId }: ActivityTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityType | "all">("all");

  const filters =
    activeFilter === "all" ? undefined : { type: activeFilter };

  const {
    data: activities,
    isLoading,
    isError,
    refetch,
  } = useLeadActivities(leadId, filters);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">Activity</h3>
          <SummaryBadges leadId={leadId} />
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              activeFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.value !== "all" && (
              <ActivityIcon
                type={tab.value as ActivityType}
                size="sm"
                className="size-4"
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <ActivitySkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load activities
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !activities || activities.length === 0 ? (
        <EmptyState filtered={activeFilter !== "all"} />
      ) : (
        <div className="relative">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity._id}
              activity={activity}
              leadId={leadId}
              isLast={index === activities.length - 1}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}