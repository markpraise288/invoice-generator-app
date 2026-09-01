import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import type { ExpenseCategory } from "@/hooks/useExpenses";

export type BudgetPeriod = "monthly" | "quarterly" | "yearly";

export interface Budget {
  _id: string;
  category: ExpenseCategory;
  limit: number; // cents
  period: BudgetPeriod;
  periodStart: string;
  periodEnd: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithActual extends Budget {
  spent: number; // cents
  remaining: number; // cents
  percentUsed: number;
  isOverBudget: boolean;
}

export interface BudgetsListParams {
  category?: ExpenseCategory;
  period?: BudgetPeriod;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface BudgetsListResponse {
  budgets: Budget[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateBudgetPayload {
  category: ExpenseCategory;
  limit: number; // cents
  period?: BudgetPeriod;
  periodStart: string;
  periodEnd: string;
  notes?: string;
}

export type UpdateBudgetPayload = Partial<Omit<CreateBudgetPayload, "category">>;

export interface PLPeriodPoint {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProfitLossReport {
  totalRevenue: number; // cents
  totalExpenses: number; // cents
  netProfit: number; // cents
  profitMargin: number; // percentage
  series: PLPeriodPoint[];
}

export interface CashFlowPeriodPoint {
  period: string;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
}

export interface CashFlowReport {
  totalCashIn: number; // cents
  totalCashOut: number; // cents
  netCashFlow: number; // cents
  series: CashFlowPeriodPoint[];
}

export interface ReportDateRange {
  dateFrom: string;
  dateTo: string;
  groupBy?: "day" | "week" | "month";
}

const buildQueryString = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const financeKeys = {
  all: ["finance"] as const,
  budgets: () => [...financeKeys.all, "budgets"] as const,
  budgetsList: (params: BudgetsListParams) => [...financeKeys.budgets(), params] as const,
  profitLoss: (params: ReportDateRange) => [...financeKeys.all, "profit-loss", params] as const,
  cashFlow: (params: ReportDateRange) => [...financeKeys.all, "cash-flow", params] as const,
  budgetVsActual: (params: Record<string, unknown>) =>
    [...financeKeys.all, "budget-vs-actual", params] as const,
};

// ---------- BUDGETS ----------

export const useBudgets = (params: BudgetsListParams = {}) => {
  return useQuery({
    queryKey: financeKeys.budgetsList(params),
    queryFn: async () => {
      const res = await apiFetch(`/finance/budgets${buildQueryString(params)}`);
      return res.data as BudgetsListResponse;
    },
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBudgetPayload) => {
      const res = await apiFetch("/finance/budgets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetPayload }) => {
      const res = await apiFetch(`/finance/budgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/finance/budgets/${id}`, { method: "DELETE" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
};

// ---------- REPORTS ----------

export const useProfitAndLoss = (params: ReportDateRange) => {
  return useQuery({
    queryKey: financeKeys.profitLoss(params),
    queryFn: async () => {
      const res = await apiFetch(`/finance/profit-loss${buildQueryString(params)}`);
      return res.data as ProfitLossReport;
    },
    enabled: !!params.dateFrom && !!params.dateTo,
  });
};

export const useCashFlow = (params: ReportDateRange) => {
  return useQuery({
    queryKey: financeKeys.cashFlow(params),
    queryFn: async () => {
      const res = await apiFetch(`/finance/cash-flow${buildQueryString(params)}`);
      return res.data as CashFlowReport;
    },
    enabled: !!params.dateFrom && !!params.dateTo,
  });
};

export const useBudgetVsActual = (params: { periodStart?: string; periodEnd?: string } = {}) => {
  return useQuery({
    queryKey: financeKeys.budgetVsActual(params),
    queryFn: async () => {
      const res = await apiFetch(`/finance/budget-vs-actual${buildQueryString(params)}`);
      return res.data as BudgetWithActual[];
    },
  });
};