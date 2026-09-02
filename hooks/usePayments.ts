import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import type { PaymentStatus } from "@/components/payments/PaymentStatusBadge";

export type PaymentMethod = "paypal" | "card" | "bank_transfer" | "manual";

export interface Payment {
  _id: string;
  customer: { _id: string; name: string; email: string };
  invoice?: { _id: string; number: string } | null;
  amount: number; // cents
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  paidAt?: string | null;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsListParams {
  customer?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaymentsListResponse {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RecordManualPaymentPayload {
  customer: string;
  invoice?: string | null;
  amount: number; // cents
  currency?: string;
  method: "card" | "bank_transfer" | "manual";
  status?: "pending" | "completed" | "failed";
  paidAt?: string;
  notes?: string;
}

export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalFailed: number;
  totalRefunded: number;
  countCollected: number;
  countPending: number;
  countFailed: number;
  countRefunded: number;
}

const buildQueryString = <T extends object>(params: T) => {
  const search = new URLSearchParams();

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.append(key, String(value));
    }
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: PaymentsListParams) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  summary: (params: Partial<PaymentsListParams>) =>
    [...paymentKeys.all, "summary", params] as const,
};

export const usePayments = (params: PaymentsListParams = {}) => {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: async () => {
      const res = await apiFetch(`/payments${buildQueryString(params)}`);
      return res.data as PaymentsListResponse;
    },
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: async () => {
      const res = await apiFetch(`/payments/${id}`);
      return res.data as Payment;
    },
    enabled: !!id,
  });
};

export const usePaymentSummary = (
  params: { customer?: string; dateFrom?: string; dateTo?: string } = {}
) => {
  return useQuery({
    queryKey: paymentKeys.summary(params),
    queryFn: async () => {
      const res = await apiFetch(`/payments/summary${buildQueryString(params)}`);
      return res.data as PaymentSummary;
    },
  });
};

export const useRecordManualPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RecordManualPaymentPayload) => {
      const res = await apiFetch("/payments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: PaymentStatus;
      notes?: string;
    }) => {
      const res = await apiFetch(`/payments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      });
      return res.data as Payment;
    },
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.setQueryData(paymentKeys.detail(payment._id), payment);
      // customer revenue may have changed — invalidate that customer's detail cache too
      queryClient.invalidateQueries({ queryKey: ["customers", "detail", payment.customer._id] });
    },
  });
};