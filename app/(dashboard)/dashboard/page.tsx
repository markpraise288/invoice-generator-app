// app/dashboard/page.tsx

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOverviewReport } from "@/hooks/useReports";
import type { ReportParams } from "@/hooks/useReports";
import { formatDealValue } from "@/hooks/useDeals";
import { useUpcomingTasks } from "@/hooks/useTasks";

import { DashboardHeader, type DashboardRange } from "@/components/dashboardUI/DshboardHeader";
import { MetricCard, MetricGrid } from "@/components/dashboardUI/MetricCard";
import { PipelineChart } from "@/components/dashboardUI/PipelineChart";
import { LeadsBySourceChart } from "@/components/dashboardUI/LeadsBySourceChart";
import { RecentActivityFeed } from "@/components/dashboardUI/RecentActivityFeed";

import { UpcomingTasksWidget } from "@/components/tasks/UpcomingTasksWidget";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";

import {
  DollarSign,
  Trophy,
  CheckSquare,
  TrendingUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  currentUser?: { _id: string; name: string };
}

// ─── Date range resolver ───────────────────────────────────────────────────────

const resolveDateRange = (range: DashboardRange): ReportParams => {
  const now = new Date();
  const from = new Date(now);

  switch (range) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "week":
      from.setDate(now.getDate() - now.getDay());
      from.setHours(0, 0, 0, 0);
      break;
    case "month":
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      break;
    case "quarter":
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      from.setMonth(quarterStartMonth, 1);
      from.setHours(0, 0, 0, 0);
      break;
  }

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage({ currentUser }: DashboardPageProps) {
  const router = useRouter();
  const [range, setRange] = useState<DashboardRange>("month");
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const params = useMemo(() => resolveDateRange(range), [range]);

  const { data: overview, isLoading: overviewLoading } = useOverviewReport(
    params,
    {
      queryKey: ["overview-report", params],
      staleTime: 1000 * 60,
    }
  );

  // Pull a small overdue count for the tasks metric trend context
  const { data: upcomingTasks } = useUpcomingTasks({
    limit: 50,
    daysAhead: 1,
  });

  const tasksDueToday = upcomingTasks?.filter((t) => {
    const due = new Date(t.dueDate);
    const today = new Date();
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear() &&
      !t.completed
    );
  }).length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <DashboardHeader
        userName={currentUser?.name}
        range={range}
        onRangeChange={setRange}
        onCreateLead={() => router.push("/leads?create=true")}
      />

      {/* ── Metrics row ── */}
      <MetricGrid>
        <MetricCard
          label="Pipeline value"
          value={formatDealValue(overview?.deals.openValue ?? 0)}
          sub={`${overview?.deals.totalDeals ?? 0} open deals`}
          icon={DollarSign}
          iconClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={overviewLoading}
          onClick={() => router.push("/deals")}
        />
        <MetricCard
          label="Won revenue"
          value={formatDealValue(overview?.deals.wonValue ?? 0)}
          trend={
            overview
              ? {
                  value: overview.deals.winRate,
                  direction: overview.deals.winRate >= 50 ? "up" : "down",
                  label: "win rate",
                }
              : undefined
          }
          icon={Trophy}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          isLoading={overviewLoading}
          onClick={() => router.push("/deals?stage=closed")}
        />
        <MetricCard
          label="Tasks due today"
          value={tasksDueToday}
          sub={`${overview?.tasks.overdue ?? 0} overdue`}
          icon={CheckSquare}
          iconClass="text-amber-500"
          bgClass="bg-amber-500/10"
          isLoading={overviewLoading}
          onClick={() => router.push("/tasks")}
        />
        <MetricCard
          label="Lead conversion"
          value={`${overview?.leads.conversionRate ?? 0}%`}
          sub={`${overview?.leads.converted ?? 0} of ${overview?.leads.total ?? 0} leads`}
          icon={TrendingUp}
          iconClass="text-violet-500"
          bgClass="bg-violet-500/10"
          isLoading={overviewLoading}
          onClick={() => router.push("/leads")}
        />
      </MetricGrid>

      {/* ── Row 2: Pipeline + Upcoming tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PipelineChart />
        </div>
        <div>
          <UpcomingTasksWidget currentUserId={currentUser?._id ?? ""} />
        </div>
      </div>

      {/* ── Row 3: Activity feed + Leads by source ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivityFeed limit={5}/>
        </div>
        <div>
          <LeadsBySourceChart params={params} />
        </div>
      </div>

      {/* ── Quick create task dialog ── */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        currentUserId={currentUser?._id ?? null}
      />
    </div>
  );
}