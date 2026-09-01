// hooks/useReports.ts

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Shared param types ────────────────────────────────────────────────────────

export interface ReportParams {
  from?: string;   // ISO date string
  to?: string;     // ISO date string
  owner?: string;  // userId
  createdBy?: string; // userId
}

// ─── Overview Report Types ─────────────────────────────────────────────────────

export interface OverviewReport {
  deals: {
    totalDeals: number;
    openValue: number;
    wonValue: number;
    wonCount: number;
    lostCount: number;
    winRate: number;
  };
  leads: {
    total: number;
    converted: number;
    totalValue: number;
    conversionRate: number;
  };
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  contacts: number;
  companies: number;
}

// ─── Deals Report Types ────────────────────────────────────────────────────────

export interface DealStageBreakdown {
  stage: string;
  count: number;
  totalValue: number;
  avgValue: number;
  weightedValue: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  label: string;
  revenue: number;
  count: number;
  avgValue: number;
}

export interface OwnerBreakdown {
  _id: string;
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  wonValue: number;
  ownerName: string;
  ownerEmail: string;
}

export interface DealsReport {
  stageBreakdown: DealStageBreakdown[];
  monthlyRevenue: MonthlyRevenue[];
  ownerBreakdown: OwnerBreakdown[];
  winLoss: {
    won: { count: number; value: number };
    lost: { count: number; value: number };
    winRate: number;
  };
  dealMetrics: {
    avgDealSize: number;
    maxDeal: number;
    minDeal: number;
    totalValue: number;
    totalCount: number;
  };
  velocity: {
    avgDaysToClose: number;
    minDaysToClose: number;
    maxDaysToClose: number;
  };
}

// ─── Leads Report Types ────────────────────────────────────────────────────────

export interface LeadStatusBreakdown {
  status: string;
  count: number;
  totalValue: number;
}

export interface LeadSourceBreakdown {
  source: string;
  count: number;
  totalValue: number;
  convertedCount: number;
  conversionRate: number;
}

export interface MonthlyLeads {
  year: number;
  month: number;
  label: string;
  count: number;
  totalValue: number;
  convertedCount: number;
}

export interface LeadsReport {
  statusBreakdown: LeadStatusBreakdown[];
  sourceBreakdown: LeadSourceBreakdown[];
  monthlyLeads: MonthlyLeads[];
  totals: {
    total: number;
    converted: number;
    conversionRate: number;
    totalValue: number;
    avgValue: number;
  };
}

// ─── Tasks Report Types ────────────────────────────────────────────────────────

export interface TaskPriorityBreakdown {
  priority: string;
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface TaskAssigneeBreakdown {
  _id: string;
  total: number;
  completed: number;
  overdue: number;
  userName: string;
  userEmail: string;
}

export interface TaskCompletionTrend {
  year: number;
  month: number;
  label: string;
  completed: number;
}

export interface TasksReport {
  priorityBreakdown: TaskPriorityBreakdown[];
  assigneeBreakdown: TaskAssigneeBreakdown[];
  completionTrend: TaskCompletionTrend[];
  summary: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
}

// ─── Activity Report Types ─────────────────────────────────────────────────────

export interface ActivityTypeBreakdown {
  type: string;
  count: number;
}

export interface MonthlyActivity {
  year: number;
  month: number;
  label: string;
  note: number;
  call: number;
  email: number;
  meeting: number;
  task: number;
  status_change: number;
}

export interface ActivityUserBreakdown {
  _id: string;
  total: number;
  calls: number;
  emails: number;
  meetings: number;
  notes: number;
  userName: string;
  userEmail: string;
}

export interface ActivityReport {
  typeBreakdown: ActivityTypeBreakdown[];
  monthlyActivity: MonthlyActivity[];
  userBreakdown: ActivityUserBreakdown[];
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const reportKeys = {
  all: ["reports"] as const,
  overview: (params?: ReportParams) =>
    ["reports", "overview", params ?? {}] as const,
  deals: (params?: ReportParams) =>
    ["reports", "deals", params ?? {}] as const,
  leads: (params?: ReportParams) =>
    ["reports", "leads", params ?? {}] as const,
  tasks: (params?: ReportParams) =>
    ["reports", "tasks", params ?? {}] as const,
  activity: (params?: ReportParams) =>
    ["reports", "activity", params ?? {}] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const buildQuery = (params?: ReportParams): string => {
  const p = new URLSearchParams();
  if (params?.from) p.append("from", params.from);
  if (params?.to) p.append("to", params.to);
  if (params?.owner) p.append("owner", params.owner);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
};

const fetchOverviewReport = async (
  params?: ReportParams
): Promise<OverviewReport> => {
  const res = await apiFetch(`/reports/overview${buildQuery(params)}`);
  return res.data;
};

const fetchDealsReport = async (
  params?: ReportParams
): Promise<DealsReport> => {
  const res = await apiFetch(`/reports/deals${buildQuery(params)}`);
  return res.data;
};

const fetchLeadsReport = async (
  params?: ReportParams
): Promise<LeadsReport> => {
  const res = await apiFetch(`/reports/leads${buildQuery(params)}`);
  return res.data;
};

const fetchTasksReport = async (
  params?: ReportParams
): Promise<TasksReport> => {
  const res = await apiFetch(`/reports/tasks${buildQuery(params)}`);
  return res.data;
};

const fetchActivityReport = async (
  params?: ReportParams
): Promise<ActivityReport> => {
  const res = await apiFetch(`/reports/activity${buildQuery(params)}`);
  return res.data;
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useOverviewReport = (
  params?: ReportParams,
  options?: UseQueryOptions<OverviewReport>
) => {
  return useQuery<OverviewReport>({
    queryKey: reportKeys.overview(params),
    queryFn: () => fetchOverviewReport(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useDealsReport = (
  params?: ReportParams,
  options?: UseQueryOptions<DealsReport>
) => {
  return useQuery<DealsReport>({
    queryKey: reportKeys.deals(params),
    queryFn: () => fetchDealsReport(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useLeadsReport = (
  params?: ReportParams,
  options?: UseQueryOptions<LeadsReport>
) => {
  return useQuery<LeadsReport>({
    queryKey: reportKeys.leads(params),
    queryFn: () => fetchLeadsReport(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useTasksReport = (
  params?: ReportParams,
  options?: UseQueryOptions<TasksReport>
) => {
  return useQuery<TasksReport>({
    queryKey: reportKeys.tasks(params),
    queryFn: () => fetchTasksReport(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useActivityReport = (
  params?: ReportParams,
  options?: UseQueryOptions<ActivityReport>
) => {
  return useQuery<ActivityReport>({
    queryKey: reportKeys.activity(params),
    queryFn: () => fetchActivityReport(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};