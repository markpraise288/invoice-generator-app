"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfitAndLoss, type ReportDateRange } from "@/hooks/useFinance";

interface ProfitLossChartProps {
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
  if (groupBy === "day") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (groupBy === "week") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

export function ProfitLossChart({ dateRange }: ProfitLossChartProps) {
  const { data: report, isLoading } = useProfitAndLoss(dateRange);

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (!report || !report.series.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">No revenue or expense data for this period.</p>
      </div>
    );
  }

  const chartData = report.series.map((point) => ({
    period: formatPeriodLabel(point.period, dateRange.groupBy),
    Revenue: point.revenue / 100,
    Expenses: point.expenses / 100,
    Profit: point.profit / 100,
  }));

  return (
    <div className="rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Profit &amp; Loss</h3>
        <div className="flex gap-4 text-right text-xs">
          <div>
            <p className="text-muted-foreground">Revenue</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(report.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expenses</p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(report.totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Net Profit</p>
            <p
              className={`font-semibold ${
                report.netProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(report.netProfit)} ({report.profitMargin}%)
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}