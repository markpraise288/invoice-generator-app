import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export interface BillingAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  billingAddress?: BillingAddress;
  company?: { _id: string; name: string } | null;
  contact?: { _id: string; name: string; email: string } | null;
  status: "active" | "inactive" | "delinquent";
  totalRevenue: number;
  currency: string;
  notes?: string;
  owner?: { _id: string; name: string; email: string } | null;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CustomersListParams {
  search?: string;
  status?: string;
  company?: string;
  contact?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CustomersListResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  billingAddress?: BillingAddress;
  company?: string | null;
  contact?: string | null;
  status?: Customer["status"];
  currency?: string;
  notes?: string;
  owner?: string | null;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

const buildQueryString = (params: CustomersListParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: CustomersListParams) =>
    [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export const useCustomers = (params: CustomersListParams = {}) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async () => {
      const res = await apiFetch(`/customers${buildQueryString(params)}`);
      return res.data as CustomersListResponse;
    },
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const res = await apiFetch(`/customers/${id}`);
      return res.data as Customer;
    },
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCustomerPayload) => {
      const res = await apiFetch("/customers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomerPayload;
    }) => {
      const res = await apiFetch(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data as Customer;
    },
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.setQueryData(customerKeys.detail(customer._id), customer);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/customers/${id}`, {
        method: "DELETE",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};