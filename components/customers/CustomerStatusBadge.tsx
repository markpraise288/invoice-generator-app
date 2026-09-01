import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Customer } from "@/hooks/useCustomers";

interface CustomerStatusBadgeProps {
  status: Customer["status"];
  className?: string;
}

const statusStyles: Record<Customer["status"], string> = {
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  inactive:
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  delinquent:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const statusLabels: Record<Customer["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  delinquent: "Delinquent",
};

export function CustomerStatusBadge({
  status,
  className,
}: CustomerStatusBadgeProps) {
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