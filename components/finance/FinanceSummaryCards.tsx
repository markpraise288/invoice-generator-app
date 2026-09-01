"use client";

import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfitAndLoss, useCashFlow, type ReportDateRange } from "@/hooks/useFinance";

interface FinanceSummaryCardsProps {
  dateRange: ReportDateRange;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
};

export function FinanceSummaryCards({ dateRange }: FinanceSummaryCardsProps) {
  const { data: pl, isLoading: plLoading } = useProfitAndLoss(dateRange);
  const { data: cashFlow, isLoading: cfLoading } = useCashFlow(dateRange);

  const isLoading = plLoading || cfLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const netProfitPositive = (pl?.netProfit ?? 0) >= 0;
  const netCashFlowPositive = (cashFlow?.netCashFlow ?? 0) >= 0;

  const cards = [
    {
      label: "Revenue",
      value: formatCurrency(pl?.totalRevenue ?? 0),
      icon: TrendingUp,
      accent: "text-emerald-600 dark:text-emerald-400",
      sub: "from paid sales",
    },
    {
      label: "Expenses",
      value: formatCurrency(pl?.totalExpenses ?? 0),
      icon: TrendingDown,
      accent: "text-red-600 dark:text-red-400",
      sub: "approved + paid",
    },
    {
      label: "Net Profit",
      value: formatCurrency(pl?.netProfit ?? 0),
      icon: DollarSign,
      accent: netProfitPositive
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
      sub: `${pl?.profitMargin ?? 0}% margin`,
    },
    {
      label: "Net Cash Flow",
      value: formatCurrency(cashFlow?.netCashFlow ?? 0),
      icon: Wallet,
      accent: netCashFlowPositive
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
      sub: "actual cash movement",
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
            <p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}