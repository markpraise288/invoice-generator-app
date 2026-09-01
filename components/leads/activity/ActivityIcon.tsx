// components/activities/ActivityIcon.tsx

import { cn } from "@/lib/utils";
import {
  ACTIVITY_TYPE_CONFIG,
  RELATED_TO_DISPLAY,
  type ActivityType,
  type ActivityRelatedTo,
} from "@/hooks/useActivities";
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  GitCommitHorizontal,
  CheckSquare,
  PlusCircle,
  Pencil,
  Trash2,
  UserPlus,
  Trophy,
  XCircle,
  Send,
  Eye,
  DollarSign,
  AlertTriangle,
  Ban,
  UserCheck,
  UserMinus,
  ShieldCheck,
  Target,
  Contact as ContactIconLucide,
  Handshake,
  Building2,
  Receipt,
  Users,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";

// ─── Icon lookup — one icon per ActivityType ───────────────────────────────────
// Kept separate from ACTIVITY_TYPE_CONFIG (which only holds label/color) so
// the hook file stays framework-agnostic (no JSX/component imports there).

const ACTIVITY_TYPE_ICONS: Record<ActivityType, LucideIcon> = {
  created: PlusCircle,
  updated: Pencil,
  deleted: Trash2,
  assigned: UserPlus,
  status_changed: GitCommitHorizontal,
  stage_changed: GitCommitHorizontal,
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task_completed: CheckSquare,
  invoice_sent: Send,
  invoice_viewed: Eye,
  invoice_paid: DollarSign,
  invoice_overdue: AlertTriangle,
  invoice_cancelled: Ban,
  deal_won: Trophy,
  deal_lost: XCircle,
  member_invited: UserPlus,
  member_joined: UserCheck,
  member_removed: UserMinus,
  member_role_changed: ShieldCheck,
};

// ─── Icon lookup — one icon per ActivityRelatedTo (entity type) ───────────────

const RELATED_TO_ICONS: Record<ActivityRelatedTo, LucideIcon> = {
  Lead: Target,
  Contact: ContactIconLucide,
  Deal: Handshake,
  Task: CheckSquare,
  Company: Building2,
  Invoice: Receipt,
  Customer: Users,
  Project: FolderKanban,
};

// ─── Sizes ─────────────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: { wrapper: "size-7", icon: 13 },
  md: { wrapper: "size-9", icon: 15 },
  lg: { wrapper: "size-11", icon: 18 },
};

// ─── ActivityIcon — the action that happened (note/call/deal_won/etc.) ────────

interface ActivityIconProps {
  type: ActivityType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ActivityIcon({ type, size = "md", className }: ActivityIconProps) {
  const config = ACTIVITY_TYPE_CONFIG[type];
  const Icon = ACTIVITY_TYPE_ICONS[type];
  const { wrapper, icon: iconSize } = SIZE_CONFIG[size];

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full ring-2 shrink-0",
        config.bgClass,
        config.ringClass,
        wrapper,
        className
      )}
      aria-label={config.label}
      title={config.label}
    >
      <Icon size={iconSize} className={config.iconClass} strokeWidth={2} />
    </span>
  );
}

// ─── RelatedToIcon — which entity this activity belongs to ────────────────────
// Used in mixed contexts like the workspace-wide feed, where activities from
// different record types are shown together and need a "this one's about a
// Deal" badge alongside the action icon.

interface RelatedToIconProps {
  relatedTo: ActivityRelatedTo;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RelatedToIcon({
  relatedTo,
  size = "sm",
  className,
}: RelatedToIconProps) {
  const config = RELATED_TO_DISPLAY[relatedTo];
  const Icon = RELATED_TO_ICONS[relatedTo];
  const { wrapper, icon: iconSize } = SIZE_CONFIG[size];

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-md shrink-0",
        config.bgClass,
        wrapper,
        className
      )}
      aria-label={config.label}
      title={config.label}
    >
      <Icon size={iconSize} className={config.iconClass} strokeWidth={2} />
    </span>
  );
}

// ─── RelatedToBadge — text pill version, for compact inline use ───────────────

export function RelatedToBadge({ relatedTo }: { relatedTo: ActivityRelatedTo }) {
  const config = RELATED_TO_DISPLAY[relatedTo];
  const Icon = RELATED_TO_ICONS[relatedTo];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
        config.bgClass,
        config.iconClass
      )}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// ─── Re-exports for convenience ────────────────────────────────────────────────

export { ACTIVITY_TYPE_CONFIG, RELATED_TO_DISPLAY };