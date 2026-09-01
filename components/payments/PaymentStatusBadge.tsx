import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusStyles: Record<PaymentStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  failed:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  refunded:
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
};

const statusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}