import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type SaleStatus = "draft" | "pending" | "paid" | "cancelled" | "refunded";

export interface SaleLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // cents
  total: number; // cents
}

export interface Sale {
  _id: string;
  customer: { _id: string; name: string; email: string };
  saleNumber: string;
  lineItems: SaleLineItem[];
  subtotal: number; // cents
  discount: number; // cents
  tax: number; // cents
  total: number; // cents
  currency: string;
  status: SaleStatus;
  saleDate: string;
  notes?: string;
  owner?: { _id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaleWithPaymentInfo extends Sale {
  amountPaid: number; // cents
  amountDue: number; // cents
}

export interface SalesListParams {
  search?: string;
  customer?: string;
  status?: SaleStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SalesListResponse {
  sales: Sale[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface SalesSummary {
  totalRevenue: number; // cents, paid sales only
  pendingRevenue: number; // cents, pending sales
  totalSalesCount: number;
  byStatus: Record<string, { count: number; total: number }>;
}

export interface CreateSaleLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number; // cents
}

export interface CreateSalePayload {
  customer: string;
  lineItems: CreateSaleLineItemInput[];
  discount?: number; // cents
  tax?: number; // cents
  currency?: string;
  status?: SaleStatus;
  saleDate?: string;
  notes?: string;
  owner?: string | null;
}

export type UpdateSalePayload = Partial<Omit<CreateSalePayload, "status">>;

const buildQueryString = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

// Client-side mirror of sale.service.js's computeSaleAmounts — used purely
// for live totals in the form UI before submission. The server recomputes
// this independently and is the actual source of truth; this never gets
// trusted as the final total, only shown as a preview.
export const computeLineItemsPreview = (
  lineItems: CreateSaleLineItemInput[],
  discount = 0,
  tax = 0
) => {
  const itemsWithTotals = lineItems.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount + tax);
  return { lineItems: itemsWithTotals, subtotal, total };
};

export const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (params: SalesListParams) => [...saleKeys.lists(), params] as const,
  details: () => [...saleKeys.all, "detail"] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  summary: (params: Record<string, unknown>) => [...saleKeys.all, "summary", params] as const,
};

export const useSales = (params: SalesListParams = {}) => {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: async () => {
      const res = await apiFetch(`/sales${buildQueryString(params)}`);
      return res.data as SalesListResponse;
    },
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: async () => {
      const res = await apiFetch(`/sales/${id}`);
      return res.data as SaleWithPaymentInfo;
    },
    enabled: !!id,
  });
};

export const useSalesSummary = (params: { dateFrom?: string; dateTo?: string } = {}) => {
  return useQuery({
    queryKey: saleKeys.summary(params),
    queryFn: async () => {
      const res = await apiFetch(`/sales/summary${buildQueryString(params)}`);
      return res.data as SalesSummary;
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      const res = await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSalePayload }) => {
      const res = await apiFetch(`/sales/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data as Sale;
    },
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.setQueryData(saleKeys.detail(sale._id), sale);
    },
  });
};

export const useUpdateSaleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SaleStatus }) => {
      const res = await apiFetch(`/sales/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return res.data as Sale;
    },
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.setQueryData(saleKeys.detail(sale._id), sale);
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/sales/${id}`, { method: "DELETE" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
  });
};