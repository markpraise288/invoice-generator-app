"use client";

import { TrendingUp, Clock, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesSummary } from "@/hooks/useSales";

interface SalesSummaryCardsProps {
  filters?: { dateFrom?: string; dateTo?: string };
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
};

export function SalesSummaryCards({ filters }: SalesSummaryCardsProps) {
  const { data: summary, isLoading } = useSalesSummary(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase text-muted-foreground">Total Revenue</p>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatCurrency(summary?.totalRevenue ?? 0)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">from paid sales</p>
      </div>

      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase text-muted-foreground">Pending Revenue</p>
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatCurrency(summary?.pendingRevenue ?? 0)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">awaiting payment</p>
      </div>

      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase text-muted-foreground">Total Sales</p>
          <ShoppingBag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {summary?.totalSalesCount ?? 0}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">across all statuses</p>
      </div>
    </div>
  );
}