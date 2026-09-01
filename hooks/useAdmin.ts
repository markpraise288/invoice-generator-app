import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type TenantPlan = "free" | "starter" | "pro" | "enterprise";
export type TenantStatus = "active" | "trialing" | "past_due" | "suspended" | "cancelled";

export interface Tenant {
  _id: string;
  businessName: string;
  ownerEmail: string;
  ownerUser?: { _id: string; name: string; email: string; role: string } | null;
  plan: TenantPlan;
  status: TenantStatus;
  mrr: number; // cents
  userCount: number;
  trialEndsAt?: string | null;
  suspendedAt?: string | null;
  suspendedReason?: string;
  lastActiveAt?: string | null;
  signupSource?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TenantsListParams {
  search?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TenantsListResponse {
  tenants: Tenant[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialingTenants: number;
  suspendedTenants: number;
  totalMrr: number; // cents
  signupsOverTime: { period: string; count: number }[];
  planBreakdown: Record<string, number>;
}

export type AdminAction =
  | "tenant_suspended"
  | "tenant_reactivated"
  | "tenant_plan_changed"
  | "tenant_deleted"
  | "tenant_created"
  | "tenant_updated"
  | "impersonation_started"
  | "impersonation_ended"
  | "user_suspended"
  | "user_reactivated"
  | "user_role_changed"
  | "user_deleted";

export interface AuditLog {
  _id: string;
  actor: { _id: string; name: string; email: string };
  action: AdminAction;
  targetType: "tenant" | "user";
  targetId: string;
  targetLabel: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogsListParams {
  actor?: string;
  action?: AdminAction;
  targetType?: "tenant" | "user";
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsListResponse {
  logs: AuditLog[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const buildQueryString = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const adminKeys = {
  all: ["admin"] as const,
  stats: (filter: Record<string, unknown>) => [...adminKeys.all, "stats", filter] as const,
  tenants: () => [...adminKeys.all, "tenants"] as const,
  tenantsList: (params: TenantsListParams) => [...adminKeys.tenants(), params] as const,
  tenantDetail: (id: string) => [...adminKeys.tenants(), "detail", id] as const,
  auditLogs: (params: AuditLogsListParams) => [...adminKeys.all, "audit-logs", params] as const,
};

// ---------- PLATFORM STATS ----------

export const usePlatformStats = (filter: { dateFrom?: string; dateTo?: string } = {}) => {
  return useQuery({
    queryKey: adminKeys.stats(filter),
    queryFn: async () => {
      const res = await apiFetch(`/admin/stats${buildQueryString(filter)}`);
      return res.data as PlatformStats;
    },
  });
};

// ---------- TENANTS ----------

export const useTenants = (params: TenantsListParams = {}) => {
  return useQuery({
    queryKey: adminKeys.tenantsList(params),
    queryFn: async () => {
      const res = await apiFetch(`/admin/tenants${buildQueryString(params)}`);
      return res.data as TenantsListResponse;
    },
  });
};

export const useTenant = (id: string) => {
  return useQuery({
    queryKey: adminKeys.tenantDetail(id),
    queryFn: async () => {
      const res = await apiFetch(`/admin/tenants/${id}`);
      return res.data as Tenant;
    },
    enabled: !!id,
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Tenant> & { businessName: string; ownerEmail: string }) => {
      const res = await apiFetch("/admin/tenants", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Tenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tenant> }) => {
      const res = await apiFetch(`/admin/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data as Tenant;
    },
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.setQueryData(adminKeys.tenantDetail(tenant._id), tenant);
    },
  });
};

export const useSuspendTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiFetch(`/admin/tenants/${id}/suspend`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      return res.data as Tenant;
    },
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.setQueryData(adminKeys.tenantDetail(tenant._id), tenant);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useReactivateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/tenants/${id}/reactivate`, { method: "PATCH" });
      return res.data as Tenant;
    },
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.setQueryData(adminKeys.tenantDetail(tenant._id), tenant);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useChangeTenantPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      plan,
      mrr,
    }: {
      id: string;
      plan: TenantPlan;
      mrr?: number;
    }) => {
      const res = await apiFetch(`/admin/tenants/${id}/plan`, {
        method: "PATCH",
        body: JSON.stringify({ plan, mrr }),
      });
      return res.data as Tenant;
    },
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.setQueryData(adminKeys.tenantDetail(tenant._id), tenant);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/tenants/${id}`, { method: "DELETE" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// ---------- IMPERSONATION ----------

export const useImpersonateTenant = () => {
  return useMutation({
    mutationFn: async ({ tenantId, reason }: { tenantId: string; reason: string }) => {
      const res = await apiFetch("/admin/impersonate", {
        method: "POST",
        body: JSON.stringify({ tenantId, reason }),
      });
      return res.data as { token: string; expiresIn: string; tenant: Tenant };
    },
  });
};

export const useEndImpersonation = () => {
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const res = await apiFetch(`/admin/impersonate/${tenantId}/end`, { method: "POST" });
      return res.data;
    },
  });
};

// ---------- AUDIT LOGS ----------

export const useAuditLogs = (params: AuditLogsListParams = {}) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: async () => {
      const res = await apiFetch(`/admin/audit-logs${buildQueryString(params)}`);
      return res.data as AuditLogsListResponse;
    },
  });
};

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  tenant?: string | null;
  isActive: boolean;
  deactivatedAt?: string | null;
  deactivationReason?: string;
  createdAt: string;
}

export const useAdminUsers = (params: { search?: string; tenantId?: string; role?: string; page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: [...adminKeys.all, "users", params],
    queryFn: async () => {
      const res = await apiFetch(`/admin/users${buildQueryString(params)}`);
      return res.data as { users: AdminUser[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiFetch(`/admin/users/${id}/suspend`, { method: "PATCH", body: JSON.stringify({ reason }) });
      return res.data as AdminUser;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] }),
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/users/${id}/reactivate`, { method: "PATCH" });
      return res.data as AdminUser;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] }),
  });
};