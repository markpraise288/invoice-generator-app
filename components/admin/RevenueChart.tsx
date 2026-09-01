"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformStats } from "@/hooks/useAdmin";

const formatPeriodLabel = (period: string) => {
  // period comes in as "YYYY-MM" from the backend aggregation
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

export function RevenueChart() {
  const { data: stats, isLoading } = usePlatformStats();

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  const chartData = (stats?.signupsOverTime ?? []).map((point) => ({
    period: formatPeriodLabel(point.period),
    signups: point.count,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">No signup data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Tenant Signups Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="period"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            stroke="currentColor"
          />
          <YAxis
            allowDecimals={false}
            className="text-xs"
            tick={{ fill: "currentColor" }}
            stroke="currentColor"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="signups"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}