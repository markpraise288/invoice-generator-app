// hooks/useInvoices.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import type { Invoice, Payment } from "@/types";
import { refreshAccessToken } from "@/lib/apiFetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "partial" | "paid" | "overdue";

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | "all";
  from?: string;
  to?: string;
}

export interface CreateInvoicePayload {
  customer: string;
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
  dueDate: string;
  notes?: string;
  tax?: number;
  discount?: number;
}

export interface UpdateInvoicePayload {
  items?: {
    description: string;
    quantity: number;
    price: number;
  }[];
  dueDate?: string;
  notes?: string;
  tax?: number;
  discount?: number;
  payments?: Payment[];
  status?: InvoiceStatus;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (filters?: InvoiceFilters) =>
    ["invoices", "list", filters ?? {}] as const,
  detail: (invoiceId: string) => ["invoices", "detail", invoiceId] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchInvoices = async (filters?: InvoiceFilters): Promise<Invoice[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status && filters.status !== "all")
    params.append("status", filters.status);
  if (filters?.from) params.append("from", filters.from);
  if (filters?.to) params.append("to", filters.to);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/invoices${query}`);
  return res.data;
};

const fetchInvoice = async (invoiceId: string): Promise<Invoice> => {
  const res = await apiFetch(`/invoices/${invoiceId}`);
  return res.data;
};

const updateInvoice = async (
  invoiceId: string,
  payload: UpdateInvoicePayload,
): Promise<Invoice> => {
  const res = await apiFetch(`/invoices/${invoiceId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const deleteInvoice = async (invoiceId: string): Promise<void> => {
  await apiFetch(`/invoices/${invoiceId}`, {
    method: "DELETE",
  });
};

// hooks/useInvoices.ts — replace downloadInvoicePdf with this

const downloadInvoicePdf = async (invoiceId: string): Promise<void> => {
  const makeRequest = () =>
    fetch(`${API_BASE}/invoices/${invoiceId}/download`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/pdf" },
    });

  let res = await makeRequest();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please login again.");
    }
    res = await makeRequest();
  }

  if (!res.ok) {
    throw new Error("Failed to download invoice");
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `invoice-${invoiceId}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useInvoices = (
  filters?: InvoiceFilters,
  options?: UseQueryOptions<Invoice[]>,
) => {
  return useQuery<Invoice[]>({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => fetchInvoices(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useInvoice = (
  invoiceId: string,
  options?: UseQueryOptions<Invoice>,
) => {
  return useQuery<Invoice>({
    queryKey: invoiceKeys.detail(invoiceId),
    queryFn: () => fetchInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 1000 * 60,
    ...options,
  });
};

// hooks/useInvoices.ts — replace createInvoice + useCreateInvoice with this

export interface CreateInvoiceResult {
  fileName: string;
}

// The create endpoint returns the generated PDF directly (same shape as
// download), driven by a `send` query flag rather than a JSON body —
// so like downloadInvoicePdf, this bypasses apiFetch's JSON parsing and
// triggers the browser download itself as a side effect.
// hooks/useInvoices.ts

// The create endpoint returns the generated PDF directly (same shape as
// download), driven by a `send` query flag rather than a JSON body — so
// like apiFetch, this handles 401 by refreshing the access token once and
// retrying, and redirects to /login if the refresh itself fails (403).
const createInvoice = async (
  payload: Record<string, unknown>,
  send: boolean,
): Promise<CreateInvoiceResult> => {
  const makeRequest = () =>
    fetch(`${API_BASE}/invoices?send=${send}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  let res = await makeRequest();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please login again.");
    }
    res = await makeRequest();
  }

  if (!res.ok) {
    // Preserve the raw Response on the thrown error so callers can
    // inspect status / parse the JSON error body themselves.
    const err = new Error("CREATE_INVOICE_FAILED") as Error & {
      response?: Response;
    };
    err.response = res;
    throw err;
  }

  const blob = await res.blob();

  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] ?? "invoice.pdf";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { fileName };
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      send,
    }: {
      data: Record<string, unknown>;
      send: boolean;
    }) => createInvoice(data, send),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoicePayload }) =>
      updateInvoice(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Invoice>(
        invoiceKeys.detail(updated._id!),
        updated,
      );
      queryClient.invalidateQueries({ queryKey: ["invoices", "list"] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => deleteInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (invoiceId: string) => downloadInvoicePdf(invoiceId),
  });
};

// ─── Utility helpers ───────────────────────────────────────────────────────────

export const computeInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
  const totalPaid =
    invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const dueDate = new Date(invoice.dueDate);
  const today = new Date();

  if (totalPaid === 0) return "draft";
  if (totalPaid < (invoice.total ?? 0)) {
    return dueDate < today ? "overdue" : "partial";
  }
  if (totalPaid === invoice.total) return "paid";

  return (invoice.status as InvoiceStatus) ?? "draft";
};

export const formatMoney = (n: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
