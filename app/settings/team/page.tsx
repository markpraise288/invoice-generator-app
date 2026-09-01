// app/settings/team/page.tsx

"use client";

import { useState } from "react";
import {
  useTeam,
  useUpdateMemberRole,
  useRemoveMember,
  useProfile,
} from "@/hooks/useSettings";
import type { TeamMember, UserRole } from "@/hooks/useSettings";
import {
  useInvitations,
  useInviteMember,
  useResendInvitation,
  useCancelInvitation,
  type Invitation,
  type InvitationStatus,
} from "@/hooks/useInvitations";
import { ProfileAvatar } from "@/components/settings/SettingsSideBar";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Shield,
  ShieldCheck,
  Eye,
  Trash2,
  Mail,
  ChevronDown,
  AlertCircle,
  Loader2,
  Clock,
  RotateCw,
  X as XIcon,
} from "lucide-react";

// ─── Role Config ───────────────────────────────────────────────────────────────
// superadmin excluded from invites — platform-level, not a workspace role
// an owner/admin can hand out. Still shown here since existing members
// might already carry it.

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; className: string }
> = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary",
  },
  superadmin: {
    label: "Super Admin",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary",
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
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access including workspace settings, billing, and team management",
  superadmin: "Full access including workspace settings, billing, and team management",
  member: "Can create, edit, and manage leads, deals, contacts, and tasks",
  viewer: "Read-only access to view records without making changes",
};

const INVITABLE_ROLES: UserRole[] = ["admin", "member", "viewer"];

const INVITATION_STATUS_CONFIG: Record<
  InvitationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    className: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
};

// ─── Invite Dialog — wired to the real invite endpoint ────────────────────────

function InviteMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [error, setError] = useState<string | null>(null);
  const { mutate: inviteMember, isPending } = useInviteMember();

  const handleInvite = () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError(null);
    inviteMember(
      { email: email.trim(), role },
      {
        onSuccess: () => {
          setEmail("");
          setRole("member");
          onOpenChange(false);
        },
        onError: (err: any) => {
          setError(err?.message || "Failed to send invite");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail size={16} className="text-primary" />
            Invite team member
          </DialogTitle>
          <DialogDescription className="text-xs">
            They&apos;ll receive an email invitation to join your workspace
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Email address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="h-9"
              disabled={isPending}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Role
            </label>
            <div className="flex flex-col gap-2">
              {INVITABLE_ROLES.map((r) => {
                const config = ROLE_CONFIG[r];
                const Icon = config.icon;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                      role === r
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-border/80 hover:bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "size-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                        config.className
                      )}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        {ROLE_DESCRIPTIONS[r]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/5">
              <AlertCircle size={13} className="text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleInvite} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                Sending...
              </>
            ) : (
              "Send invite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Role Selector ─────────────────────────────────────────────────────────────

function RoleSelector({
  member,
  onRoleChange,
  isPending,
}: {
  member: TeamMember;
  onRoleChange: (role: UserRole) => void;
  isPending: boolean;
}) {
  const config = ROLE_CONFIG[member.role];
  const Icon = config.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
            "transition-colors disabled:opacity-50",
            config.className
          )}
        >
          <Icon size={11} />
          {config.label}
          <ChevronDown size={10} className="opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {(Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => {
          const c = ROLE_CONFIG[r];
          const RoleIcon = c.icon;
          return (
            <DropdownMenuItem
              key={r}
              onClick={() => onRoleChange(r)}
              disabled={r === member.role}
              className="flex items-start gap-2.5 py-2"
            >
              <RoleIcon size={13} className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">{c.label}</span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  {ROLE_DESCRIPTIONS[r]}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Member Row ────────────────────────────────────────────────────────────────

function MemberRow({
  member,
  currentUserId,
  onRemove,
}: {
  member: TeamMember;
  currentUserId?: string;
  onRemove: () => void;
}) {
  const { mutate: updateRole, isPending: isUpdatingRole } =
    useUpdateMemberRole();

  const isSelf = member._id === currentUserId;

  return (
    <div className="flex items-center gap-3 px-4 py-3 group">
      <ProfileAvatar name={member.name} avatar={member.avatar} />

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {member.name}
          </span>
          {isSelf && (
            <Badge
              variant="secondary"
              className="text-[10px] h-4 px-1.5"
            >
              You
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">
          {member.email}
        </span>
      </div>

      <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
        Joined{" "}
        {formatDistanceToNow(new Date(member.createdAt), {
          addSuffix: true,
        })}
      </span>

      {isSelf ? (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shrink-0",
            ROLE_CONFIG[member.role].className
          )}
        >
          {ROLE_CONFIG[member.role].label}
        </span>
      ) : (
        <RoleSelector
          member={member}
          onRoleChange={(role) =>
            updateRole({ userId: member._id, role })
          }
          isPending={isUpdatingRole}
        />
      )}

      <div className="shrink-0 w-7">
        {!isSelf && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 size={13} />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Invitation Row ────────────────────────────────────────────────────────────

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const { mutate: resend, isPending: isResending } = useResendInvitation();
  const { mutate: cancel, isPending: isCancelling } = useCancelInvitation();
  const statusConfig = INVITATION_STATUS_CONFIG[invitation.status];
  const canAct = invitation.status === "pending" || invitation.status === "expired";

  return (
    <div className="flex items-center gap-3 px-4 py-3 group">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
        <Mail size={14} className="text-muted-foreground" />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate">
          {invitation.email}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          Invited by {invitation.invitedBy?.name || "someone"} ·{" "}
          {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
        </span>
      </div>

      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shrink-0",
          ROLE_CONFIG[invitation.role].className
        )}
      >
        {ROLE_CONFIG[invitation.role].label}
      </span>

      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium shrink-0",
          statusConfig.className
        )}
      >
        <Clock size={10} />
        {statusConfig.label}
      </span>

      {canAct && (
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => resend(invitation._id)}
            disabled={isResending || isCancelling}
            title="Resend invitation"
          >
            {isResending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RotateCw size={13} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => cancel(invitation._id)}
            disabled={isResending || isCancelling}
            title="Cancel invitation"
          >
            {isCancelling ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <XIcon size={13} />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function TeamSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="size-7 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamSettingsPage() {
  const { data: members, isLoading } = useTeam();
  const { data: currentUser } = useProfile();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
  const { data: invitations, isLoading: isLoadingInvitations } = useInvitations();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const handleRemove = () => {
    if (!removeTarget) return;
    removeMember(removeTarget._id, {
      onSuccess: () => setRemoveTarget(null),
    });
  };

  const adminCount =
    members?.filter((m) => m.role === "admin").length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage who has access to your workspace
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setInviteOpen(true)}
        >
          <Plus size={15} />
          Invite member
        </Button>
      </div>

      {/* ── Stats ── */}
      {!isLoading && members && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {members.length}
            </span>
            <span className="text-xs text-muted-foreground">
              total member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {adminCount}
            </span>
            <span className="text-xs text-muted-foreground">
              admin{adminCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* ── Members list ── */}
      <SettingsSection title="Members" noBorder>
        {isLoading ? (
          <TeamSkeleton />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {(members ?? []).map((member) => (
                <MemberRow
                  key={member._id}
                  member={member}
                  currentUserId={currentUser?._id}
                  onRemove={() => setRemoveTarget(member)}
                />
              ))}
            </div>
          </div>
        )}
      </SettingsSection>

      {/* ── Pending invitations ── */}
      <SettingsSection
        title="Pending invitations"
        description="Invitations that haven't been accepted yet"
        noBorder
      >
        {isLoadingInvitations ? (
          <TeamSkeleton />
        ) : invitations && invitations.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {invitations.map((invitation) => (
                <InvitationRow key={invitation._id} invitation={invitation} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No pending invitations right now.
            </p>
          </div>
        )}
      </SettingsSection>

      {/* ── Invite dialog ── */}
      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* ── Remove confirm ── */}
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
              onClick={handleRemove}
            >
              {isRemoving ? "Removing..." : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}