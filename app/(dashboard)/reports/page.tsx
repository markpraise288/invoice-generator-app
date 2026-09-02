// app/reports/page.tsx

"use client";

import { useState } from "react";
import {
  useOverviewReport,
  useDealsReport,
  useLeadsReport,
  useTasksReport,
  useActivityReport,
} from "@/hooks/useReports";
import type { ReportParams } from "@/hooks/useReports";
import { formatDealValue } from "@/hooks/useDeals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Users,
  CheckSquare,
  Activity,
  Calendar,
  Trophy,
  XCircle,
  AlertTriangle,
  Building2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ReportsPageProps {
  currentUser?: { _id: string; name: string };
}

type ReportTab = "overview" | "deals" | "leads" | "tasks" | "activity";

// ─── Chart color tokens ────────────────────────────────────────────────────────
// Pulled from CSS variables (defined in globals.css) rather than raw hex, so
// every chart shares one palette that's independently tuned per light/dark
// mode — not just the same hardcoded color reused and hoping it works both ways.

const CHART_COLORS = [
  "hsl(var(--chart-1))", // indigo
  "hsl(var(--chart-2))", // teal
  "hsl(var(--chart-3))", // emerald
  "hsl(var(--chart-4))", // amber
  "hsl(var(--chart-5))", // rose
  "hsl(var(--chart-6))", // violet
];

const ACTIVITY_COLORS: Record<string, string> = {
  note: "hsl(var(--chart-6))",
  call: "hsl(var(--chart-2))",
  email: "hsl(var(--chart-1))",
  meeting: "hsl(var(--chart-4))",
  task: "hsl(var(--chart-3))",
  status_change: "hsl(var(--chart-5))",
};

// Matches the priority colors already established in CreateTaskDialog's
// dropdown (slate/blue/amber/rose for low/medium/high/urgent) — reusing the
// same semantic mapping here instead of an arbitrary index-based color cycle,
// so "urgent" means the same color everywhere in the app.
const PRIORITY_COLORS: Record<string, string> = {
  low: "hsl(var(--muted-foreground))",
  medium: "hsl(var(--chart-1))",
  high: "hsl(var(--chart-4))",
  urgent: "hsl(var(--chart-5))",
};

// Shared tooltip styling — one definition, reused across every chart, so
// there's no chance of one chart's tooltip subtly drifting from another's.
const tooltipContentStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "12px",
  padding: "8px 12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const tooltipLabelStyle = {
  color: "hsl(var(--foreground))",
  fontWeight: 600,
  marginBottom: 4,
};

const tooltipItemStyle = {
  color: "hsl(var(--muted-foreground))",
};

const axisTickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

// ─── Date Range Picker ─────────────────────────────────────────────────────────

function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const presets = [
    {
      label: "Last 30 days",
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);
        return {
          from: from.toISOString().slice(0, 10),
          to: to.toISOString().slice(0, 10),
        };
      },
    },
    {
      label: "Last 90 days",
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 90);
        return {
          from: from.toISOString().slice(0, 10),
          to: to.toISOString().slice(0, 10),
        };
      },
    },
    {
      label: "This year",
      getValue: () => {
        const now = new Date();
        return {
          from: `${now.getFullYear()}-01-01`,
          to: new Date().toISOString().slice(0, 10),
        };
      },
    },
    {
      label: "All time",
      getValue: () => ({ from: "", to: "" }),
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((preset) => {
        const val = preset.getValue();
        const isActive = val.from === from && val.to === to;
        return (
          <button
            key={preset.label}
            onClick={() => onChange(val.from, val.to)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {preset.label}
          </button>
        );
      })}
      <div className="flex items-center gap-1.5 ml-2">
        <Calendar size={13} className="text-muted-foreground" />
        <Input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className="h-7 w-36 text-xs"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          className="h-7 w-36 text-xs"
        />
      </div>
    </div>
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  bgClass,
  highlight,
  isLoading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  bgClass: string;
  highlight?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 transition-shadow hover:shadow-sm",
        highlight && "border-emerald-200 dark:border-emerald-900/50"
      )}
    >
      <div
        className={cn(
          "size-9 rounded-lg flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <Icon size={16} className={iconClass} />
      </div>
      <div className="flex flex-col min-w-0">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-12 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <span
              className={cn(
                "text-lg font-bold leading-none",
                highlight ? "text-emerald-500" : "text-foreground"
              )}
            >
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {label}
            </span>
            {sub && (
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {sub}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Chart Card ────────────────────────────────────────────────────────────────

function ChartCard({
  title,
  description,
  children,
  isLoading,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ params }: { params: ReportParams }) {
  const { data, isLoading } = useOverviewReport(params);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Pipeline value"
          value={formatDealValue(data?.deals.openValue ?? 0)}
          sub={`${data?.deals.totalDeals ?? 0} open deals`}
          icon={DollarSign}
          iconClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Won revenue"
          value={formatDealValue(data?.deals.wonValue ?? 0)}
          sub={`${data?.deals.winRate ?? 0}% win rate`}
          icon={Trophy}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          highlight={!!data && data.deals.wonValue > 0}
          isLoading={isLoading}
        />
        <MetricCard
          label="Lead conversion"
          value={`${data?.leads.conversionRate ?? 0}%`}
          sub={`${data?.leads.converted ?? 0} of ${data?.leads.total ?? 0} leads`}
          icon={TrendingUp}
          iconClass="text-violet-500"
          bgClass="bg-violet-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Task completion"
          value={`${data?.tasks.completionRate ?? 0}%`}
          sub={`${data?.tasks.overdue ?? 0} overdue`}
          icon={CheckSquare}
          iconClass="text-amber-500"
          bgClass="bg-amber-500/10"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total contacts"
          value={data?.contacts ?? 0}
          icon={Users}
          iconClass="text-sky-500"
          bgClass="bg-sky-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Total companies"
          value={data?.companies ?? 0}
          icon={Building2}
          iconClass="text-indigo-500"
          bgClass="bg-indigo-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Deals won"
          value={data?.deals.wonCount ?? 0}
          icon={Trophy}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Deals lost"
          value={data?.deals.lostCount ?? 0}
          icon={XCircle}
          iconClass="text-rose-500"
          bgClass="bg-rose-500/10"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

// ─── Deals Tab ─────────────────────────────────────────────────────────────────

function DealsTab({ params }: { params: ReportParams }) {
  const { data, isLoading } = useDealsReport(params);
  const closedTotal = (data?.winLoss.won.count ?? 0) + (data?.winLoss.lost.count ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Avg deal size"
          value={formatDealValue(data?.dealMetrics.avgDealSize ?? 0)}
          icon={DollarSign}
          iconClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Win rate"
          value={`${data?.winLoss.winRate ?? 0}%`}
          sub={`${data?.winLoss.won.count ?? 0} won · ${data?.winLoss.lost.count ?? 0} lost`}
          icon={Trophy}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Avg days to close"
          value={`${data?.velocity.avgDaysToClose ?? 0}d`}
          sub={`Min ${data?.velocity.minDaysToClose ?? 0}d · Max ${data?.velocity.maxDaysToClose ?? 0}d`}
          icon={Calendar}
          iconClass="text-violet-500"
          bgClass="bg-violet-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Total deal value"
          value={formatDealValue(data?.dealMetrics.totalValue ?? 0)}
          sub={`${data?.dealMetrics.totalCount ?? 0} deals`}
          icon={BarChart2}
          iconClass="text-amber-500"
          bgClass="bg-amber-500/10"
          isLoading={isLoading}
        />
      </div>

      {/* Monthly revenue chart — the one chart that earns a gradient fill,
          since it's the primary "headline" chart on this tab */}
      <ChartCard
        title="Monthly revenue"
        description="Won deal value by month"
        isLoading={isLoading}
        className="col-span-2"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data?.monthlyRevenue ?? []}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="label"
              tick={axisTickStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={axisTickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatDealValue(v)}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              formatter={(value) => {
                const numericValue = Array.isArray(value)
                  ? Number(value[0] ?? 0)
                  : Number(value ?? 0);

                return [formatDealValue(numericValue), "Revenue"];
              }}
            />
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Deals by stage"
          description="Count and value per pipeline stage"
          isLoading={isLoading}
        >
          <div className="flex flex-col gap-2">
            {(data?.stageBreakdown ?? []).map((item, i) => (
              <div key={item.stage} className="flex items-center gap-3">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-xs text-foreground capitalize flex-1 truncate">
                  {item.stage.replace("_", " ")}
                </span>
                <span className="text-xs font-medium text-foreground w-8 text-right">
                  {item.count}
                </span>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {formatDealValue(item.totalValue)}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Win/loss donut — now with cornerRadius, a card-colored separator
            ring between slices, and a centered total instead of a bare chart */}
        <ChartCard
          title="Win / loss ratio"
          description="Closed deal outcomes"
          isLoading={isLoading}
        >
          {data && closedTotal > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Won", value: data.winLoss.won.count },
                      { name: "Lost", value: data.winLoss.lost.count },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
                    cornerRadius={6}
                    dataKey="value"
                    stroke="hsl(var(--card))"
                    strokeWidth={3}
                  >
                    <Cell fill="hsl(var(--chart-3))" />
                    <Cell fill="hsl(var(--chart-5))" />
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center pointer-events-none" style={{ height: 180 }}>
                <span className="text-2xl font-bold text-foreground">{closedTotal}</span>
                <span className="text-[10px] text-muted-foreground">closed</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
              No closed deals yet
            </div>
          )}
        </ChartCard>
      </div>

      {(data?.ownerBreakdown ?? []).length > 0 && (
        <ChartCard
          title="Performance by rep"
          description="Deal metrics per team member"
          isLoading={isLoading}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Rep", "Deals", "Total value", "Won", "Won value"].map((h) => (
                    <th key={h} className="text-left pb-2 font-medium text-muted-foreground pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data?.ownerBreakdown ?? []).map((row) => (
                  <tr key={row._id}>
                    <td className="py-2 pr-4 font-medium text-foreground">{row.ownerName}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.totalDeals}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {formatDealValue(row.totalValue)}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                      >
                        {row.wonDeals}
                      </Badge>
                    </td>
                    <td className="py-2 font-medium text-emerald-600 dark:text-emerald-400">
                      {formatDealValue(row.wonValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

// ─── Leads Tab ─────────────────────────────────────────────────────────────────

function LeadsTab({ params }: { params: ReportParams }) {
  const { data, isLoading } = useLeadsReport(params);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total leads"
          value={data?.totals.total ?? 0}
          icon={Users}
          iconClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Converted"
          value={data?.totals.converted ?? 0}
          sub={`${data?.totals.conversionRate ?? 0}% rate`}
          icon={TrendingUp}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Total value"
          value={formatDealValue(data?.totals.totalValue ?? 0)}
          icon={DollarSign}
          iconClass="text-violet-500"
          bgClass="bg-violet-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Avg lead value"
          value={formatDealValue(data?.totals.avgValue ?? 0)}
          icon={BarChart2}
          iconClass="text-amber-500"
          bgClass="bg-amber-500/10"
          isLoading={isLoading}
        />
      </div>

      <ChartCard
        title="Monthly leads"
        description="Lead volume and conversions over time"
        isLoading={isLoading}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data?.monthlyLeads ?? []}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
              opacity={0.5}
            />
            <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            <Bar
              dataKey="count"
              name="Total leads"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="convertedCount"
              name="Converted"
              fill="hsl(var(--chart-3))"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Leads by source"
          description="Volume and conversion rate per source"
          isLoading={isLoading}
        >
          <div className="flex flex-col gap-3">
            {(data?.sourceBreakdown ?? []).map((item, i) => (
              <div key={item.source} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground capitalize">
                    {item.source}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.count} leads</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {item.conversionRate}%
                    </Badge>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${data ? (item.count / data.totals.total) * 100 : 0}%`,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Leads by stage"
          description="Current pipeline stage distribution"
          isLoading={isLoading}
        >
          <div className="flex flex-col gap-2">
            {(data?.statusBreakdown ?? []).map((item, i) => (
              <div key={item.status} className="flex items-center gap-3">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-xs text-foreground capitalize flex-1 truncate">
                  {item.status.replace("_", " ")}
                </span>
                <span className="text-xs font-medium text-foreground w-8 text-right">
                  {item.count}
                </span>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {formatDealValue(item.totalValue)}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Tasks Tab ─────────────────────────────────────────────────────────────────

function TasksTab({ params }: { params: ReportParams }) {
  const { data, isLoading } = useTasksReport(params);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total tasks"
          value={data?.summary.total ?? 0}
          icon={CheckSquare}
          iconClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Completed"
          value={data?.summary.completed ?? 0}
          sub={`${data?.summary.completionRate ?? 0}% rate`}
          icon={TrendingUp}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Pending"
          value={data?.summary.pending ?? 0}
          icon={Calendar}
          iconClass="text-amber-500"
          bgClass="bg-amber-500/10"
          isLoading={isLoading}
        />
        <MetricCard
          label="Overdue"
          value={data?.summary.overdue ?? 0}
          icon={AlertTriangle}
          iconClass="text-rose-500"
          bgClass="bg-rose-500/10"
          highlight={!!data && data.summary.overdue > 0}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Task completions"
          description="Completed tasks per month"
          isLoading={isLoading}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={data?.completionTrend ?? []}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
                opacity={0.5}
              />
              <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "hsl(var(--chart-3))", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Priority breakdown — now using semantic PRIORITY_COLORS instead of
            an arbitrary index-based color cycle, matching the priority colors
            used in CreateTaskDialog's dropdown */}
        <ChartCard
          title="Tasks by priority"
          description="Completion rate per priority level"
          isLoading={isLoading}
        >
          <div className="flex flex-col gap-3">
            {(data?.priorityBreakdown ?? []).map((item) => (
              <div key={item.priority} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground capitalize">
                    {item.priority}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.completed}/{item.total}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {item.completionRate}%
                    </Badge>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.completionRate}%`,
                      backgroundColor: PRIORITY_COLORS[item.priority] ?? CHART_COLORS[0],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {(data?.assigneeBreakdown ?? []).length > 0 && (
        <ChartCard
          title="Tasks by assignee"
          description="Task load and completion per team member"
          isLoading={isLoading}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Member", "Total", "Completed", "Overdue", "Rate"].map((h) => (
                    <th key={h} className="text-left pb-2 font-medium text-muted-foreground pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data?.assigneeBreakdown ?? []).map((row) => (
                  <tr key={row._id}>
                    <td className="py-2 pr-4 font-medium text-foreground">{row.userName}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.total}</td>
                    <td className="py-2 pr-4 text-emerald-600 dark:text-emerald-400 font-medium">
                      {row.completed}
                    </td>
                    <td className="py-2 pr-4">
                      {row.overdue > 0 ? (
                        <span className="text-rose-500 font-medium">{row.overdue}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${
                                row.total > 0
                                  ? Math.round((row.completed / row.total) * 100)
                                  : 0
                              }%`,
                              backgroundColor: "hsl(var(--chart-3))",
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground">
                          {row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

// ─── Activity Tab ──────────────────────────────────────────────────────────────

function ActivityTab({ params }: { params: ReportParams }) {
  const { data, isLoading } = useActivityReport(params);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(data?.typeBreakdown ?? []).map((item) => (
          <div
            key={item.type}
            className="rounded-xl border border-border bg-card px-3 py-2.5 flex flex-col gap-1"
          >
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-14" />
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-foreground">{item.count}</span>
                <span
                  className="text-xs font-medium capitalize"
                  style={{ color: ACTIVITY_COLORS[item.type] ?? "hsl(var(--muted-foreground))" }}
                >
                  {item.type.replace("_", " ")}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <ChartCard
        title="Activity volume"
        description="Monthly activity breakdown by type"
        isLoading={isLoading}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data?.monthlyActivity ?? []}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
              opacity={0.5}
            />
            <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            {["note", "call", "email", "meeting"].map((type) => (
              <Bar
                key={type}
                dataKey={type}
                name={type.charAt(0).toUpperCase() + type.slice(1)}
                stackId="a"
                fill={ACTIVITY_COLORS[type]}
                radius={type === "meeting" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {(data?.userBreakdown ?? []).length > 0 && (
        <ChartCard
          title="Activity by team member"
          description="Breakdown of activity types per user"
          isLoading={isLoading}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Member", "Total", "Calls", "Emails", "Meetings", "Notes"].map((h) => (
                    <th key={h} className="text-left pb-2 font-medium text-muted-foreground pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data?.userBreakdown ?? []).map((row) => (
                  <tr key={row._id}>
                    <td className="py-2 pr-4 font-medium text-foreground">{row.userName}</td>
                    <td className="py-2 pr-4 font-medium text-foreground">{row.total}</td>
                    <td className="py-2 pr-4" style={{ color: ACTIVITY_COLORS.call }}>
                      {row.calls}
                    </td>
                    <td className="py-2 pr-4" style={{ color: ACTIVITY_COLORS.email }}>
                      {row.emails}
                    </td>
                    <td className="py-2 pr-4" style={{ color: ACTIVITY_COLORS.meeting }}>
                      {row.meetings}
                    </td>
                    <td className="py-2" style={{ color: ACTIVITY_COLORS.note }}>
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params: ReportParams = {
    from: dateFrom || undefined,
    to: dateTo || undefined,
  };

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart2 size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">Reports</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analytics across your entire CRM
            </p>
          </div>
        </div>

        <DateRangePicker from={dateFrom} to={dateTo} onChange={handleDateChange} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)}>
        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto pb-0 gap-1 px-0">
          {[
            { value: "overview", label: "Overview", icon: BarChart2 },
            { value: "deals", label: "Deals", icon: DollarSign },
            { value: "leads", label: "Leads", icon: Users },
            { value: "tasks", label: "Tasks", icon: CheckSquare },
            { value: "activity", label: "Activity", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "gap-1.5 text-xs rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  "pb-3 px-3"
                )}
              >
                <Icon size={13} />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <OverviewTab params={params} />
          </TabsContent>
          <TabsContent value="deals" className="mt-0">
            <DealsTab params={params} />
          </TabsContent>
          <TabsContent value="leads" className="mt-0">
            <LeadsTab params={params} />
          </TabsContent>
          <TabsContent value="tasks" className="mt-0">
            <TasksTab params={params} />
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <ActivityTab params={params} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}