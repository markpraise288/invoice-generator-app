// components/dashboard/RecentActivityFeed.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRecentActivity } from "@/hooks/useActivities";
import type { Activity, ActivityRelatedTo } from "@/hooks/useActivities";
import { ActivityIcon, RelatedToIcon } from "@/components/leads/activity/ActivityIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Inbox } from "lucide-react";

// ─── Related record → link builder ─────────────────────────────────────────────
// Path builders are my best guess at your routing conventions based on what's
// shown elsewhere in this build (Leads/Contacts/Companies use a shared page,
// Customers/Deals/Projects use dynamic [id] routes) — confirm/correct these
// against your real app router.

const RELATED_TO_HREF: Record<ActivityRelatedTo, (id: string) => string> = {
  Lead: () => `/leads`,
  Contact: () => `/contacts`,
  Company: () => `/companies`,
  Deal: (id) => `/deals/${id}`,
  Task: (id) => `/tasks/${id}`,
  Invoice: (id) => `/invoices/${id}`,
  Customer: (id) => `/customers/${id}`,
  Project: (id) => `/projects/${id}`,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
// relatedId may arrive as a bare ObjectId string (unpopulated) or a populated
// object — field name varies by entity (Deal uses "title", most use "name").

interface RelatedRecord {
  _id: string;
  name?: string;
  title?: string;
  [key: string]: unknown;
}

const getRelatedId = (activity: Activity): string | null => {
  if (!activity.relatedId) return null;
  return typeof activity.relatedId === "string"
    ? activity.relatedId
    : (activity.relatedId as unknown as RelatedRecord)._id;
};

const getRelatedLabel = (activity: Activity): string | null => {
  if (!activity.relatedId || typeof activity.relatedId === "string") return null;
  const record = activity.relatedId as unknown as RelatedRecord;
  return record.name ?? record.title ?? null;
};

const getActivityDescription = (activity: Activity): string => {
  switch (activity.type) {
    case "created":
      return "created";
    case "updated":
      return "updated";
    case "deleted":
      return "deleted";
    case "assigned":
      return "assigned";
    case "status_changed":
      return "changed the status of";
    case "stage_changed":
      return "moved the stage of";
    case "note":
      return "added a note to";
    case "call":
      return "logged a call on";
    case "email":
      return "logged an email on";
    case "meeting":
      return "logged a meeting on";
    case "task_completed":
      return "completed a task on";
    case "invoice_sent":
      return "sent";
    case "invoice_viewed":
      return "viewed";
    case "invoice_paid":
      return "received payment on";
    case "invoice_overdue":
      return "flagged as overdue";
    case "invoice_cancelled":
      return "cancelled";
    case "deal_won":
      return "won";
    case "deal_lost":
      return "lost";
    case "member_invited":
      return "invited a member to";
    case "member_joined":
      return "joined";
    case "member_removed":
      return "removed a member from";
    case "member_role_changed":
      return "changed a role on";
    default:
      return "updated";
  }
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function FeedSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
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
        <Inbox size={16} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No recent activity</p>
      <p className="text-xs text-muted-foreground mt-1">
        Activity across your leads, deals, and customers will show up here
      </p>
    </div>
  );
}

// ─── Activity Row ──────────────────────────────────────────────────────────────

function ActivityRow({ activity }: { activity: Activity }) {
  const relatedId = getRelatedId(activity);
  const relatedLabel = getRelatedLabel(activity);
  const description = getActivityDescription(activity);
  const href =
    relatedId && activity.relatedTo
      ? RELATED_TO_HREF[activity.relatedTo](relatedId)
      : null;

  const content = (
    <>
      <ActivityIcon type={activity.type} size="sm" className="mt-0.5" />
      <div className="flex flex-col min-w-0 flex-1">
        <p className="text-xs text-foreground leading-snug">
          <span className="font-medium">{activity.createdBy.name}</span>{" "}
          <span className="text-muted-foreground">{description}</span>
          {relatedLabel && (
            <>
              {" "}
              <span
                className={cn(
                  "font-medium inline-flex items-center gap-1",
                  href && "group-hover:text-primary transition-colors"
                )}
              >
                {activity.relatedTo && (
                  <RelatedToIcon relatedTo={activity.relatedTo} size="sm" />
                )}
                {relatedLabel}
              </span>
            </>
          )}
        </p>
        {activity.title && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {activity.title}
          </p>
        )}
        <span className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>
    </>
  );

  // Only render as a link when we actually have somewhere to send someone —
  // an activity missing relatedTo/relatedId degrades to plain, non-clickable
  // text instead of a dead link.
  if (href) {
    return (
      <Link
        href={href}
        className="flex gap-3 group -mx-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex gap-3 -mx-2 px-2 py-1.5">{content}</div>;
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface RecentActivityFeedProps {
  // Number of activities shown by default. Defaults to 5.
  limit?: number;
  // When true, shows a "Show more" link that reveals the rest (up to
  // whatever the API returned) instead of a hard cap. Defaults to false —
  // set true for a dashboard widget where drawer space is limited but you
  // still want an escape hatch; leave false for a fixed-size summary card.
  expandable?: boolean;
  title?: string;
  viewAllHref?: string;
}

export function RecentActivityFeed({
  limit = 5,
  expandable = false,
  title = "Recent activity",
  viewAllHref = "/leads",
}: RecentActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);

  // Fetch a bit more than `limit` when expandable so there's something to
  // reveal; otherwise fetch exactly `limit` since nothing beyond it is ever shown.
  const fetchLimit = expandable ? Math.max(limit * 3, limit + 10) : limit;

  const { data, isLoading, isError } = useRecentActivity(fetchLimit);

  const visible = expandable && !showAll ? data?.slice(0, limit) : data;
  const hasMore = expandable && data && data.length > limit && !showAll;

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Link href={viewAllHref}>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            View leads
            <ArrowRight size={12} />
          </Button>
        </Link>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <FeedSkeleton count={limit} />
      ) : isError ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          Failed to load recent activity
        </p>
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-1">
          {visible!.map((activity) => (
            <ActivityRow key={activity._id} activity={activity} />
          ))}

          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-primary hover:underline underline-offset-2 text-left px-1 mt-1"
            >
              Show {data.length - limit} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}