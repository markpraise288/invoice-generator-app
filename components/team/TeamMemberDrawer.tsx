// components/team/TeamMemberDrawer.tsx

"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  useMemberStats,
  useMemberActivity,
} from "@/hooks/useTeam";
import {
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useSettings";
import type { TeamMember, TeamRole } from "@/hooks/useTeam";
import { MemberAvatar, ROLE_CONFIG } from "./TeamMemberCard";
import { formatDealValue } from "@/hooks/useDeals";
import { ActivityIcon } from "@/components/leads/activity/ActivityIcon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Trophy,
  TrendingUp,
  CheckSquare,
  Activity,
  ChevronDown,
  X,
  Trash2,
  Loader2,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TeamMemberDrawerProps {
  member: TeamMember | null;
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
}

// ─── Stat Block ────────────────────────────────────────────────────────────────

function StatBlock({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  bgClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div
        className={cn(
          "size-7 rounded-md flex items-center justify-center",
          bgClass
        )}
      >
        <Icon size={13} className={iconClass} />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold text-foreground leading-none">
          {value}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
        {sub && (
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Stats Section ─────────────────────────────────────────────────────────────

function StatsSection({ memberId }: { memberId: string }) {
  const { data: stats, isLoading } = useMemberStats(memberId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2"
          >
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatBlock
        icon={TrendingUp}
        label="Total leads"
        value={stats.leads.total}
        sub={`${stats.leads.conversionRate}% conversion`}
        iconClass="text-violet-500"
        bgClass="bg-violet-500/10"
      />
      <StatBlock
        icon={Trophy}
        label="Won revenue"
        value={formatDealValue(stats.deals.wonValue)}
        sub={`${stats.deals.winRate}% win rate`}
        iconClass="text-emerald-500"
        bgClass="bg-emerald-500/10"
      />
      <StatBlock
        icon={CheckSquare}
        label="Tasks completed"
        value={stats.tasks.completed}
        sub={`${stats.tasks.completionRate}% rate`}
        iconClass="text-amber-500"
        bgClass="bg-amber-500/10"
      />
      <StatBlock
        icon={Activity}
        label="Total activities"
        value={stats.activities.total}
        sub={
          stats.activities.breakdown
            ? Object.entries(stats.activities.breakdown)
                .slice(0, 2)
                .map(([type, count]) => `${count} ${type}s`)
                .join(" · ")
            : undefined
        }
        iconClass="text-blue-500"
        bgClass="bg-blue-500/10"
      />
    </div>
  );
}

// ─── Activity Section ──────────────────────────────────────────────────────────

function ActivitySection({ memberId }: { memberId: string }) {
  const { data: activities, isLoading } = useMemberActivity(memberId, 8);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-6">
        No recent activity
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="flex gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
        >
          <ActivityIcon
            type={activity.type as any}
            size="sm"
            className="mt-0.5 shrink-0"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-xs text-foreground leading-snug">
              <span className="font-medium capitalize">
                {activity.type.replace("_", " ")}
              </span>
              {activity.title && (
                <span className="text-muted-foreground">
                  {" — "}
                  {activity.title}
                </span>
              )}
              {activity.leadName && (
                <span className="text-muted-foreground">
                  {" on "}
                  <span className="font-medium text-foreground">
                    {activity.leadName}
                  </span>
                </span>
              )}
            </p>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Role Selector ─────────────────────────────────────────────────────────────

function RoleSelector({
  member,
  currentUserId,
}: {
  member: TeamMember;
  currentUserId?: string;
}) {
  const { mutate: updateRole, isPending } = useUpdateMemberRole();
  const isSelf = member._id === currentUserId;
  const roleConf = ROLE_CONFIG[member.role];
  const RoleIcon = roleConf.icon;

  if (isSelf) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
          roleConf.className
        )}
      >
        <RoleIcon size={12} />
        {roleConf.label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className={cn(
            "h-7 gap-1.5 text-xs font-medium",
            roleConf.className,
            "border-current/20"
          )}
        >
          {isPending ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <RoleIcon size={11} />
          )}
          {roleConf.label}
          <ChevronDown size={10} className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Change role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(ROLE_CONFIG) as TeamRole[]).map((role) => {
          const conf = ROLE_CONFIG[role];
          const Icon = conf.icon;
          return (
            <DropdownMenuItem
              key={role}
              disabled={role === member.role}
              onClick={() =>
                updateRole({ userId: member._id, role })
              }
              className={cn(
                "text-xs gap-2",
                role === member.role && "opacity-50"
              )}
            >
              <Icon size={13} className="shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{conf.label}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TeamMemberDrawer({
  member,
  open,
  onClose,
  currentUserId,
}: TeamMemberDrawerProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  if (!member) return null;

  const isSelf = member._id === currentUserId;

  const handleRemove = () => {
    removeMember(member._id, {
      onSuccess: () => {
        setConfirmRemove(false);
        onClose();
      },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-y-auto">
          {/* ── Header ── */}
          <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <MemberAvatar
                  name={member.name}
                  avatar={member.avatar}
                  size="lg"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-foreground leading-none">
                      {member.name}
                    </h2>
                    {isSelf && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1.5"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                  {member.position && (
                    <p className="text-xs text-muted-foreground">
                      {member.position}
                    </p>
                  )}
                  <RoleSelector
                    member={member}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!isSelf && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 mr-5"
                    onClick={() => setConfirmRemove(true)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* ── Body ── */}
          <div className="flex flex-col gap-6 px-6 py-5">
            {/* ── Contact info ── */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Contact
              </h3>
              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors group"
                >
                  <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Mail
                      size={13}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  </div>
                  {member.email}
                </a>
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="inline-flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors group"
                  >
                    <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Phone
                        size={13}
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </div>
                    {member.phone}
                  </a>
                )}
                {member.timezone && (
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <MapPin size={13} className="text-muted-foreground" />
                    </div>
                    {member.timezone.replace("_", " ")}
                  </div>
                )}
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Clock size={13} className="text-muted-foreground" />
                  </div>
                  Joined{" "}
                  {format(new Date(member.createdAt), "MMMM d, yyyy")}
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Performance stats ── */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Performance
              </h3>
              <StatsSection memberId={member._id} />
            </div>

            <Separator />

            {/* ── Recent activity ── */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Recent activity
              </h3>
              <ActivitySection memberId={member._id} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Remove confirmation ── */}
      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {member.name}
              </span>{" "}
              will lose access to this workspace immediately. Their owned
              records will remain but will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemove}
            >
              {isRemoving ? "Removing..." : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}