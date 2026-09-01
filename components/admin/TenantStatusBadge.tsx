import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TenantStatus } from "@/hooks/useAdmin";

interface TenantStatusBadgeProps {
  status: TenantStatus;
  className?: string;
}

const statusStyles: Record<TenantStatus, string> = {
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  trialing:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  past_due:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  suspended:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  cancelled:
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
};

const statusLabels: Record<TenantStatus, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past Due",
  suspended: "Suspended",
  cancelled: "Cancelled",
};

export function TenantStatusBadge({ status, className }: TenantStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status], className)}
    >
      {statusLabels[status]}
    </Badge>
  );
}