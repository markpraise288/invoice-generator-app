"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlow, type ReportDateRange } from "@/hooks/useFinance";

interface CashFlowChartProps {
  dateRange: ReportDateRange;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const formatPeriodLabel = (period: string, groupBy?: string) => {
  const date = new Date(period);
  if (groupBy === "day" || groupBy === "week") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

export function CashFlowChart({ dateRange }: CashFlowChartProps) {
  const { data: report, isLoading } = useCashFlow(dateRange);

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (!report || !report.series.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">No payment or paid-expense data for this period.</p>
      </div>
    );
  }

  const chartData = report.series.map((point) => ({
    period: formatPeriodLabel(point.period, dateRange.groupBy),
    "Cash In": point.cashIn / 100,
    "Cash Out": point.cashOut / 100,
  }));

  return (
    <div className="rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cash Flow</h3>
          <p className="text-xs text-muted-foreground">
            Actual money movement — payments received vs. expenses paid out
          </p>
        </div>
        <div className="flex gap-4 text-right text-xs">
          <div>
            <p className="text-muted-foreground">Cash In</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(report.totalCashIn)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Cash Out</p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(report.totalCashOut)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Net</p>
            <p
              className={`font-semibold ${
                report.netCashFlow >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(report.netCashFlow)}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="cashInGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cashOutGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="period" className="text-xs" tick={{ fill: "currentColor" }} stroke="currentColor" />
          <YAxis className="text-xs" tick={{ fill: "currentColor" }} stroke="currentColor" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => {
              const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
              return `$${numericValue.toLocaleString()}`;
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Area
            type="monotone"
            dataKey="Cash In"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#cashInGradient)"
          />
          <Area
            type="monotone"
            dataKey="Cash Out"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#cashOutGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}