"use client";

import { Building2, DollarSign, Clock, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformStats } from "@/hooks/useAdmin";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

export function PlatformStatsCards() {
  const { data: stats, isLoading } = usePlatformStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Tenants",
      value: stats?.totalTenants ?? 0,
      icon: Building2,
      accent: "text-slate-600 dark:text-slate-400",
      sub: `${stats?.activeTenants ?? 0} active`,
    },
    {
      label: "Monthly Recurring Revenue",
      value: formatCurrency(stats?.totalMrr ?? 0),
      icon: DollarSign,
      accent: "text-emerald-600 dark:text-emerald-400",
      sub: "from active + past due tenants",
    },
    {
      label: "Trialing",
      value: stats?.trialingTenants ?? 0,
      icon: Clock,
      accent: "text-sky-600 dark:text-sky-400",
      sub: "in free trial period",
    },
    {
      label: "Suspended",
      value: stats?.suspendedTenants ?? 0,
      icon: ShieldAlert,
      accent: "text-red-600 dark:text-red-400",
      sub: "access currently revoked",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {card.label}
              </p>
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