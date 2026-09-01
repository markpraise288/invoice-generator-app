import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export interface BillingPlan {
  _id: string;
  name: string;
  description?: string;
  price: number; // cents
  currency: string;
  interval: "month" | "year";
  paypalPlanId: string | null;
  paypalProductId: string | null;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = "active" | "cancelled" | "suspended" | "expired";

export interface Subscription {
  _id: string;
  customer: { _id: string; name: string; email: string };
  plan: { _id: string; name: string; price: number; currency: string; interval: string };
  paypalSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillingPlanPayload {
  name: string;
  description?: string;
  price: number; // cents
  currency?: string;
  interval: "month" | "year";
  features?: string[];
  isActive?: boolean;
}

export interface CreateOrderPayload {
  customer: string;
  invoice?: string | null;
  amount: number; // cents
  currency?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  approvalUrl: string;
  status: string;
}

export const billingKeys = {
  all: ["billing"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
  plansList: (isActive?: boolean) => [...billingKeys.plans(), { isActive }] as const,
  subscriptions: () => [...billingKeys.all, "subscriptions"] as const,
  subscriptionsList: (params: { customer?: string; status?: string }) =>
    [...billingKeys.subscriptions(), params] as const,
};

// ---------- PLANS ----------

export const useBillingPlans = (isActive?: boolean) => {
  return useQuery({
    queryKey: billingKeys.plansList(isActive),
    queryFn: async () => {
      const qs = isActive !== undefined ? `?isActive=${isActive}` : "";
      const res = await apiFetch(`/billing/plans${qs}`);
      return (res.data?.plans ?? []) as BillingPlan[];
    },
  });
};

export const useCreateBillingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBillingPlanPayload) => {
      const res = await apiFetch("/billing/plans", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as BillingPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.plans() });
    },
  });
};

export const useUpdateBillingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<CreateBillingPlanPayload, "name" | "description" | "features" | "isActive">>;
    }) => {
      const res = await apiFetch(`/billing/plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return res.data as BillingPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.plans() });
    },
  });
};

export const useSyncPlanToPayPal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiFetch(`/billing/plans/${planId}/sync`, {
        method: "POST",
      });
      return res.data as BillingPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.plans() });
    },
  });
};

// ---------- SUBSCRIPTIONS ----------

export const useSubscriptions = (params: { customer?: string; status?: string } = {}) => {
  return useQuery({
    queryKey: billingKeys.subscriptionsList(params),
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params.customer) search.append("customer", params.customer);
      if (params.status) search.append("status", params.status);
      const qs = search.toString();
      const res = await apiFetch(`/billing/subscriptions${qs ? `?${qs}` : ""}`);
      return (res.data?.subscriptions ?? []) as Subscription[];
    },
  });
};

export const useSubscribeCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { customer: string; plan: string }) => {
      const res = await apiFetch("/billing/subscriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as { subscription: Subscription; approvalUrl: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reason,
      immediately,
    }: {
      id: string;
      reason?: string;
      immediately?: boolean;
    }) => {
      const res = await apiFetch(`/billing/subscriptions/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason, immediately }),
      });
      return res.data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
    },
  });
};

// ---------- ONE-TIME ORDERS ----------

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const res = await apiFetch("/billing/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as CreateOrderResponse;
    },
  });
};

export const useCaptureOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiFetch("/billing/orders/capture", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};