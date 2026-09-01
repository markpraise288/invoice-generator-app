import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SaleStatus } from "@/hooks/useSales";

interface SaleStatusBadgeProps {
  status: SaleStatus;
  className?: string;
}

const statusStyles: Record<SaleStatus, string> = {
  draft:
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  paid:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  cancelled:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
  refunded:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const statusLabels: Record<SaleStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function SaleStatusBadge({ status, className }: SaleStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status], className)}
    >
      {statusLabels[status]}
    </Badge>
  );
}