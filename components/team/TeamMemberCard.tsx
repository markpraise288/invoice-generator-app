// components/team/TeamMemberCard.tsx

"use client";

import { formatDealValue } from "@/hooks/useDeals";
import { useMemberStats } from "@/hooks/useTeam";
import type { TeamMember } from "@/hooks/useTeam";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Shield,
  Eye,
  Mail,
  Phone,
  TrendingUp,
  Trophy,
  CheckSquare,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// ─── Role Config ───────────────────────────────────────────────────────────────

export const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    className:
      "bg-primary/10 text-primary",
  },
  superadmin: {
    label: "Super Admin",
    icon: ShieldCheck,
    className:
      "bg-primary/10 text-primary",
  },
  member: {
    label: "Member",
    icon: Shield,
    className:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    className: "bg-muted text-muted-foreground",
  },
} as const;

// ─── Avatar ────────────────────────────────────────────────────────────────────

export function MemberAvatar({
  name,
  avatar,
  size = "md",
  className,
}: {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-base",
  }[size];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn(
          "rounded-full object-cover shrink-0",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center",
        "font-semibold text-primary shrink-0",
        sizeClass,
        className
      )}
    >
      {initials}
    </div>
  );
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  value,
  label,
  iconClass,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string | number;
  label: string;
  iconClass: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <Icon size={13} className={iconClass} />
      <span className="text-sm font-bold text-foreground leading-none">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Stats Row ─────────────────────────────────────────────────────────────────

function MemberStatsRow({ memberId }: { memberId: string }) {
  const { data: stats, isLoading } = useMemberStats(memberId);

  if (isLoading) {
    return (
      <div className="flex gap-2 pt-2 border-t border-border/50">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 flex-1"
          >
            <Skeleton className="size-3 rounded" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-2.5 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex gap-2 pt-2 border-t border-border/50">
      <StatPill
        icon={TrendingUp}
        value={stats.leads.total}
        label="Leads"
        iconClass="text-violet-500"
      />
      <div className="w-px bg-border/50" />
      <StatPill
        icon={Trophy}
        value={formatDealValue(stats.deals.wonValue)}
        label="Won"
        iconClass="text-emerald-500"
      />
      <div className="w-px bg-border/50" />
      <StatPill
        icon={CheckSquare}
        value={`${stats.tasks.completionRate}%`}
        label="Tasks"
        iconClass="text-amber-500"
      />
      <div className="w-px bg-border/50" />
      <StatPill
        icon={Activity}
        value={stats.activities.total}
        label="Actions"
        iconClass="text-blue-500"
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface TeamMemberCardProps {
  member: TeamMember;
  onClick: () => void;
  currentUserId?: string;
  onRemove?: () => void;
}

export function TeamMemberCard({
  member,
  onClick,
  currentUserId,
  onRemove,
}: TeamMemberCardProps) {
  const roleConf = ROLE_CONFIG[member.role];
  const RoleIcon = roleConf?.icon;
  const isSelf = member._id === currentUserId;

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        "transition-all hover:border-border/80 hover:shadow-sm cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatar
            name={member.name}
            avatar={member.avatar}
            size="md"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-foreground truncate">
                {member.name}
              </span>
              {isSelf && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 shrink-0"
                >
                  You
                </Badge>
              )}
            </div>
            {member.position && (
              <span className="text-xs text-muted-foreground truncate mt-0.5">
                {member.position}
              </span>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-xs"
                onClick={() => onClick()}
              >
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() =>
                  (window.location.href = `mailto:${member.email}`)
                }
              >
                <Mail size={12} className="mr-2" />
                Send email
              </DropdownMenuItem>
              {!isSelf && onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs text-destructive focus:text-destructive"
                    onClick={onRemove}
                  >
                    Remove member
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Role + contact ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium",
            roleConf?.className
          )}
        >
          {/*<RoleIcon size={11} />*/}
          {roleConf?.label}
        </span>

        <div className="flex items-center gap-2">
          {member.phone && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Phone size={10} />
              {member.phone}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[140px]">
            <Mail size={10} />
            {member.email}
          </span>
        </div>
      </div>

      {/* ── Stats ── */}
      <MemberStatsRow memberId={member._id} />
    </div>
  );
}