// hooks/useLeadActivities.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch"; // adjust path to match your project

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "status_change"
  | "task"
  | "company"
  | "contact"
  | "deal"
  | "lead"
  | "customer"
  | "projects";

export interface ActivityUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Activity {
  _id: string;
  lead: string;
  type: ActivityType;
  title?: string;
  body?: string;
  duration?: number;
  scheduledAt?: string;
  subject?: string;
  meta?: Record<string, unknown>;
  createdBy: ActivityUser;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySummary {
  note?: number;
  call?: number;
  email?: number;
  meeting?: number;
  status_change?: number;
  task?: number;
}

export interface CreateActivityPayload {
  type: ActivityType;
  title?: string;
  body?: string;
  duration?: number;
  scheduledAt?: string;
  subject?: string;
  meta?: Record<string, unknown>;
}

export interface UpdateActivityPayload {
  title?: string;
  body?: string;
  duration?: number;
  scheduledAt?: string;
  subject?: string;
  meta?: Record<string, unknown>;
}

export interface ActivityFilters {
  type?: string;
  from?: string;
  to?: string;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const activityKeys = {
  all: (leadId: string) => ["activities", leadId] as const,
  list: (leadId: string, filters?: ActivityFilters) =>
    ["activities", leadId, "list", filters ?? {}] as const,
  summary: (leadId: string) => ["activities", leadId, "summary"] as const,
  detail: (leadId: string, activityId: string) =>
    ["activities", leadId, "detail", activityId] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchActivities = async (
  leadId: string,
  filters?: ActivityFilters
): Promise<Activity[]> => {
  const params = new URLSearchParams();
  if (filters?.type) params.append("type", filters.type);
  if (filters?.from) params.append("from", filters.from);
  if (filters?.to) params.append("to", filters.to);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/leads/${leadId}/activities${query}`);
  return res.data;
};

const fetchActivitySummary = async (
  leadId: string
): Promise<ActivitySummary> => {
  const res = await apiFetch(`/leads/${leadId}/activities/summary`);
  return res.data;
};

const createActivity = async (
  leadId: string,
  payload: CreateActivityPayload
): Promise<Activity> => {
  const res = await apiFetch(`/leads/${leadId}/activities`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateActivity = async (
  leadId: string,
  activityId: string,
  payload: UpdateActivityPayload
): Promise<Activity> => {
  const res = await apiFetch(`/leads/${leadId}/activities/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const deleteActivity = async (
  leadId: string,
  activityId: string
): Promise<void> => {
  await apiFetch(`/leads/${leadId}/activities/${activityId}`, {
    method: "DELETE",
  });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useLeadActivities = (
  leadId: string,
  filters?: ActivityFilters,
  options?: UseQueryOptions<Activity[]>
) => {
  return useQuery<Activity[]>({
    queryKey: activityKeys.list(leadId, filters),
    queryFn: () => fetchActivities(leadId, filters),
    enabled: !!leadId,
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useActivitySummary = (leadId: string) => {
  return useQuery<ActivitySummary>({
    queryKey: activityKeys.summary(leadId),
    queryFn: () => fetchActivitySummary(leadId),
    enabled: !!leadId,
    staleTime: 1000 * 60,
  });
};

export const useCreateActivity = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityPayload) =>
      createActivity(leadId, payload),
    onSuccess: (newActivity) => {
      queryClient.setQueryData<Activity[]>(
        activityKeys.list(leadId),
        (prev) => (prev ? [newActivity, ...prev] : [newActivity])
      );
      queryClient.invalidateQueries({
        queryKey: activityKeys.summary(leadId),
      });
    },
  });
};

export const useUpdateActivity = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      payload,
    }: {
      activityId: string;
      payload: UpdateActivityPayload;
    }) => updateActivity(leadId, activityId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Activity[]>(
        activityKeys.list(leadId),
        (prev) =>
          prev
            ? prev.map((a) => (a._id === updated._id ? updated : a))
            : [updated]
      );
    },
  });
};

export const useDeleteActivity = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => deleteActivity(leadId, activityId),
    onSuccess: (_, activityId) => {
      queryClient.setQueryData<Activity[]>(
        activityKeys.list(leadId),
        (prev) => (prev ? prev.filter((a) => a._id !== activityId) : [])
      );
      queryClient.invalidateQueries({
        queryKey: activityKeys.summary(leadId),
      });
    },
  });
};