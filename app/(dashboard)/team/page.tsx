// app/team/page.tsx

"use client";

import { useState, useCallback } from "react";
import { useProfile, useTeam } from "@/hooks/useSettings";
import { useRemoveMember } from "@/hooks/useSettings";
import type { TeamMember as SettingsTeamMember } from "@/hooks/useSettings";
import type { TeamMember, TeamRole } from "@/hooks/useTeam";
import { TeamStatsBar } from "@/components/team/TeamStatsBar";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { TeamMemberDrawer } from "@/components/team/TeamMemberDrawer";
import { TeamLeaderboard } from "@/components/team/TeamLeaderboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  X,
  ChevronDown,
  UserPlus,
  ShieldCheck,
  Shield,
  Eye,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TeamsPageProps {
  currentUser?: { _id: string; name: string };
}

// ─── Role filter options ───────────────────────────────────────────────────────

const ROLE_OPTIONS: {
  label: string;
  value: TeamRole | "all";
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { label: "All roles", value: "all", icon: Users },
  { label: "Admins", value: "admin", icon: ShieldCheck },
  { label: "Members", value: "member", icon: Shield },
  { label: "Viewers", value: "viewer", icon: Eye },
];

// ─── Skeleton grid ─────────────────────────────────────────────────────────────

function MembersGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="size-7 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border/50">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex flex-col items-center gap-1 flex-1">
                <Skeleton className="size-3 rounded" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  filtered,
  onClear,
}: {
  filtered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-border bg-card text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Users size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {filtered ? "No members match your filters" : "No team members yet"}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
        {filtered
          ? "Try adjusting or clearing your filters"
          : "Invite team members from Settings → Team"}
      </p>
      {filtered && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onClear}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamPage({ currentUser }: TeamsPageProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<TeamRole | "all">("all");
  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [removeTarget, setRemoveTarget] =
    useState<TeamMember | null>(null);

  const { data: profile } = useProfile();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  // Fetch members from settings hook — it already has all fields we need
  const { data: rawMembers, isLoading } = useTeam();

  // Cast to TeamMember shape (they're compatible)
  const members = (rawMembers ?? []) as unknown as TeamMember[];

  // ── Client-side filter ─────────────────────────────────────────────────────

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.position ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const isFiltered = search.trim() !== "" || roleFilter !== "all";

  const clearFilters = useCallback(() => {
    setSearch("");
    setRoleFilter("all");
  }, []);

  // ── Member click ───────────────────────────────────────────────────────────

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setDrawerOpen(true);
  };

  // ── Remove ─────────────────────────────────────────────────────────────────

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    removeMember(removeTarget._id, {
      onSuccess: () => {
        setRemoveTarget(null);
        if (selectedMember?._id === removeTarget._id) {
          setDrawerOpen(false);
          setSelectedMember(null);
        }
      },
    });
  };

  const activeRoleOption = ROLE_OPTIONS.find(
    (r) => r.value === roleFilter
  )!;
  const ActiveRoleIcon = activeRoleOption.icon;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">
              Team
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {members.length > 0
                ? `${members.length} member${members.length !== 1 ? "s" : ""}`
                : "Manage your workspace team"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() =>
            (window.location.href = "/settings/team")
          }
        >
          <UserPlus size={15} />
          Invite member
        </Button>
      </div>

      {/* ── Stats bar ── */}
      <TeamStatsBar />

      {/* ── Main content ── */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        {/* ── Left: members grid ── */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-8 h-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Role filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5 text-xs",
                    roleFilter !== "all" && "border-primary text-primary"
                  )}
                >
                  <ActiveRoleIcon size={13} />
                  {activeRoleOption.label}
                  <ChevronDown size={12} className="opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel className="text-xs">
                  Filter by role
                </DropdownMenuLabel>
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={roleFilter === opt.value}
                      onCheckedChange={() => setRoleFilter(opt.value)}
                      className="text-xs gap-2"
                    >
                      <Icon size={12} className="shrink-0" />
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Active filter badge */}
            {isFiltered && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 h-5"
                >
                  {filteredMembers.length} result
                  {filteredMembers.length !== 1 ? "s" : ""}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X size={12} className="mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Members grid */}
          {isLoading ? (
            <MembersGridSkeleton />
          ) : filteredMembers.length === 0 ? (
            <EmptyState filtered={isFiltered} onClear={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {filteredMembers.map((member) => (
                <TeamMemberCard
                  key={member._id}
                  member={member}
                  onClick={() => handleMemberClick(member)}
                  currentUserId={profile?._id}
                  onRemove={() => setRemoveTarget(member)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: leaderboard ── */}
        <div className="w-full xl:w-80 shrink-0">
          <TeamLeaderboard />
        </div>
      </div>

      {/* ── Member drawer ── */}
      <TeamMemberDrawer
        member={selectedMember}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedMember(null);
        }}
        currentUserId={profile?._id}
      />

      {/* ── Remove confirmation ── */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {removeTarget?.name}
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
              onClick={handleRemoveConfirm}
            >
              {isRemoving ? "Removing..." : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}