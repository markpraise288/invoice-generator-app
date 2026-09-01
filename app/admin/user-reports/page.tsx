"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAdminTickets, useTicketStats } from "@/hooks/useAdminSupportTickets";
import type { TicketCategory, TicketStatus } from "@/hooks/useSupportTickets";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Bug,
  CreditCard,
  Sparkles,
  UserCog,
  HelpCircle,
  Inbox,
} from "lucide-react";

const CATEGORY_CONFIG: Record<
  TicketCategory,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  bug: { label: "Bug", icon: Bug },
  billing: { label: "Billing", icon: CreditCard },
  feature_request: { label: "Feature request", icon: Sparkles },
  account: { label: "Account", icon: UserCog },
  other: { label: "Other", icon: HelpCircle },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" },
  in_progress: { label: "In progress", className: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
};

const STATUS_TABS: (TicketStatus | "all")[] = ["all", "open", "in_progress", "resolved", "closed"];

function InboxSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUserReportsPage() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const { data: stats } = useTicketStats();
  const { data, isLoading } = useAdminTickets(
    statusFilter === "all" ? {} : { status: statusFilter }
  );

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">User reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Support messages from every workspace
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.open}</span>
            <span className="text-xs text-muted-foreground">open</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.inProgress}</span>
            <span className="text-xs text-muted-foreground">in progress</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.resolved}</span>
            <span className="text-xs text-muted-foreground">resolved</span>
          </div>
          {stats.unreadTotal > 0 && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600 dark:text-teal-400">
                  {stats.unreadTotal}
                </span>
                <span className="text-xs text-muted-foreground">unread</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {tab === "all" ? "All" : STATUS_CONFIG[tab].label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <InboxSkeleton />
      ) : data && data.tickets.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {data.tickets.map((ticket) => {
              const CategoryIcon = CATEGORY_CONFIG[ticket.category].icon;
              return (
                <Link
                  key={ticket._id}
                  href={`/admin/user-reports/${ticket._id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0 relative">
                    <CategoryIcon size={14} className="text-muted-foreground" />
                    {ticket.adminUnreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-indigo-600 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {ticket.subject}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        · {ticket.userId?.name || "Unknown"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {ticket.workspaceId?.name} · {ticket.lastMessagePreview}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                    {formatDistanceToNow(new Date(ticket.lastMessageAt), { addSuffix: true })}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium shrink-0",
                      STATUS_CONFIG[ticket.status].className
                    )}
                  >
                    {STATUS_CONFIG[ticket.status].label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
          <Inbox size={24} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No reports match this filter.</p>
        </div>
      )}
    </div>
  );
}