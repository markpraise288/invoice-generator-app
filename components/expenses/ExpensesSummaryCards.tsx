"use client";

import { Clock, CheckCircle2, DollarSign, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpensesSummary } from "@/hooks/useExpenses";

interface ExpensesSummaryCardsProps {
  filters?: { dateFrom?: string; dateTo?: string };
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
};

export function ExpensesSummaryCards({ filters }: ExpensesSummaryCardsProps) {
  const { data: summary, isLoading } = useExpensesSummary(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Pending",
      value: summary?.totalPending ?? 0,
      icon: Clock,
      accent: "text-amber-600 dark:text-amber-400",
      sub: "awaiting approval",
    },
    {
      label: "Approved",
      value: summary?.totalApproved ?? 0,
      icon: CheckCircle2,
      accent: "text-sky-600 dark:text-sky-400",
      sub: "not yet paid out",
    },
    {
      label: "Paid",
      value: summary?.totalPaid ?? 0,
      icon: DollarSign,
      accent: "text-emerald-600 dark:text-emerald-400",
      sub: "fully settled",
    },
    {
      label: "Rejected",
      value: summary?.totalRejected ?? 0,
      icon: XCircle,
      accent: "text-red-600 dark:text-red-400",
      sub: "not approved",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-muted-foreground">{card.label}</p>
              <Icon className={card.accent} size={16} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(card.value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}