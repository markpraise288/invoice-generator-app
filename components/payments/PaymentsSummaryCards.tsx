"use client";

import { ArrowUpRight, Clock, XCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentSummary, type PaymentsListParams } from "@/hooks/usePayments";
import { cn } from "@/lib/utils";

interface PaymentsSummaryCardsProps {
  filters: Pick<PaymentsListParams, "customer" | "dateFrom" | "dateTo">;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

interface CardConfig {
  label: string;
  key: "totalCollected" | "totalPending" | "totalFailed" | "totalRefunded";
  countKey: "countCollected" | "countPending" | "countFailed" | "countRefunded";
  icon: React.ElementType;
  accent: string;
}

const cards: CardConfig[] = [
  {
    label: "Total Collected",
    key: "totalCollected",
    countKey: "countCollected",
    icon: ArrowUpRight,
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Pending",
    key: "totalPending",
    countKey: "countPending",
    icon: Clock,
    accent: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Failed",
    key: "totalFailed",
    countKey: "countFailed",
    icon: XCircle,
    accent: "text-red-600 dark:text-red-400",
  },
  {
    label: "Refunded",
    key: "totalRefunded",
    countKey: "countRefunded",
    icon: RotateCcw,
    accent: "text-slate-600 dark:text-slate-400",
  },
];

export function PaymentsSummaryCards({ filters }: PaymentsSummaryCardsProps) {
  const { data: summary, isLoading } = usePaymentSummary(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary?.[card.key] ?? 0;
        const count = summary?.[card.countKey] ?? 0;

        return (
          <div key={card.key} className="rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {card.label}
              </p>
              <Icon className={cn("h-4 w-4", card.accent)} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {count} {count === 1 ? "payment" : "payments"}
            </p>
          </div>
        );
      })}
    </div>
  );
}