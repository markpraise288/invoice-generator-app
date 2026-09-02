import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type ExpenseCategory =
  | "office_supplies"
  | "software"
  | "travel"
  | "meals"
  | "marketing"
  | "payroll"
  | "rent"
  | "utilities"
  | "professional_services"
  | "equipment"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid";
export type RecurringInterval = "weekly" | "monthly" | "yearly";

export interface Expense {
  _id: string;
  description: string;
  category: ExpenseCategory;
  vendor?: string;
  amount: number; // cents
  currency: string;
  status: ExpenseStatus;
  expenseDate: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval | null;
  receiptUrl?: string | null;
  notes?: string;
  rejectionReason?: string;
  submittedBy: { _id: string; name: string; email: string };
  approvedBy?: { _id: string; name: string; email: string } | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesListParams {
  search?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  isRecurring?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ExpensesListResponse {
  expenses: Expense[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ExpensesSummary {
  totalPending: number; // cents
  totalApproved: number; // cents
  totalPaid: number; // cents
  totalRejected: number; // cents
  byCategory: Record<string, number>; // cents, approved+paid only
}

export interface CreateExpensePayload {
  description: string;
  category?: ExpenseCategory;
  vendor?: string;
  amount: number; // cents
  currency?: string;
  expenseDate?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval | null;
  receiptUrl?: string;
  notes?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

const buildQueryString = (params: object) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (params: ExpensesListParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  summary: (params: Record<string, unknown>) => [...expenseKeys.all, "summary", params] as const,
};

export const useExpenses = (params: ExpensesListParams = {}) => {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: async () => {
      const res = await apiFetch(`/expenses${buildQueryString(params)}`);
      return res.data as ExpensesListResponse;
    },
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: async () => {
      const res = await apiFetch(`/expenses/${id}`);
      return res.data as Expense;
    },
    enabled: !!id,
  });
};

export const useExpensesSummary = (params: { dateFrom?: string; dateTo?: string } = {}) => {
  return useQuery({
    queryKey: expenseKeys.summary(params),
    queryFn: async () => {
      const res = await apiFetch(`/expenses/summary${buildQueryString(params)}`);
      return res.data as ExpensesSummary;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const res = await apiFetch("/expenses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExpensePayload }) => {
      const res = await apiFetch(`/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data as Expense;
    },
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.setQueryData(expenseKeys.detail(expense._id), expense);
    },
  });
};

export const useApproveExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/expenses/${id}/approve`, { method: "PATCH" });
      return res.data as Expense;
    },
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.setQueryData(expenseKeys.detail(expense._id), expense);
    },
  });
};

export const useRejectExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rejectionReason }: { id: string; rejectionReason: string }) => {
      const res = await apiFetch(`/expenses/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejectionReason }),
      });
      return res.data as Expense;
    },
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.setQueryData(expenseKeys.detail(expense._id), expense);
    },
  });
};

export const useMarkExpensePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paidAt }: { id: string; paidAt?: string }) => {
      const res = await apiFetch(`/expenses/${id}/mark-paid`, {
        method: "PATCH",
        body: JSON.stringify({ paidAt }),
      });
      return res.data as Expense;
    },
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.setQueryData(expenseKeys.detail(expense._id), expense);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/expenses/${id}`, { method: "DELETE" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
};