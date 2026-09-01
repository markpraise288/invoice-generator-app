// hooks/useActivities.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

// Mirrors backend activity.model.js RELATED_TO_TYPES
export type ActivityRelatedTo =
  | "Lead"
  | "Contact"
  | "Deal"
  | "Task"
  | "Company"
  | "Invoice"
  | "Customer"
  | "Project";

// Mirrors backend activity.model.js ACTIVITY_TYPES (full set — includes
// system-generated types, since the workspace feed can be filtered by any
// of these even though only USER_CREATABLE_TYPES can be POSTed by a user)
export type ActivityType =
  | "created"
  | "updated"
  | "deleted"
  | "assigned"
  | "status_changed"
  | "stage_changed"
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "task_completed"
  | "invoice_sent"
  | "invoice_viewed"
  | "invoice_paid"
  | "invoice_overdue"
  | "invoice_cancelled"
  | "deal_won"
  | "deal_lost"
  | "member_invited"
  | "member_joined"
  | "member_removed"
  | "member_role_changed";

// Mirrors backend activity.validate.js USER_CREATABLE_TYPES — the only
// types a user can submit via POST /api/activities
export const USER_CREATABLE_TYPES: ActivityType[] = [
  "note",
  "call",
  "email",
  "meeting",
];

export interface ActivityUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Activity {
  _id: string;
  relatedId: string;
  relatedTo: ActivityRelatedTo;
  workspaceId: string;
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

export interface ActivityPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: ActivityPagination;
}

export interface ActivityStats {
  total: number;
  breakdown: Record<string, number>;
}

export interface CreateActivityPayload {
  relatedId: string;
  relatedTo: ActivityRelatedTo;
  type: "note" | "call" | "email" | "meeting";
  title?: string;
  body?: string;
  duration?: number; // call only
  scheduledAt?: string; // meeting only
  subject?: string; // email only
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

export interface WorkspaceFeedFilters {
  type?: ActivityType;
  relatedTo?: ActivityRelatedTo;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Activity type display config ──────────────────────────────────────────────
// Icon/color per *action* type — what happened. Separate from entity-type
// config (below), since an activity's icon reflects the kind of event, not
// which record it's attached to.

export const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; iconClass: string; bgClass: string; ringClass: string }
> = {
  created: {
    label: "Created",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    ringClass: "ring-emerald-500/20",
  },
  updated: {
    label: "Updated",
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    ringClass: "ring-blue-500/20",
  },
  deleted: {
    label: "Deleted",
    iconClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    ringClass: "ring-rose-500/20",
  },
  assigned: {
    label: "Assigned",
    iconClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    ringClass: "ring-violet-500/20",
  },
  status_changed: {
    label: "Status changed",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    ringClass: "ring-amber-500/20",
  },
  stage_changed: {
    label: "Stage changed",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    ringClass: "ring-amber-500/20",
  },
  note: {
    label: "Note",
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    ringClass: "ring-blue-500/20",
  },
  call: {
    label: "Call",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    ringClass: "ring-emerald-500/20",
  },
  email: {
    label: "Email",
    iconClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    ringClass: "ring-violet-500/20",
  },
  meeting: {
    label: "Meeting",
    iconClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
    ringClass: "ring-orange-500/20",
  },
  task_completed: {
    label: "Task completed",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    ringClass: "ring-emerald-500/20",
  },
  invoice_sent: {
    label: "Invoice sent",
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    ringClass: "ring-blue-500/20",
  },
  invoice_viewed: {
    label: "Invoice viewed",
    iconClass: "text-slate-500",
    bgClass: "bg-slate-500/10",
    ringClass: "ring-slate-500/20",
  },
  invoice_paid: {
    label: "Invoice paid",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    ringClass: "ring-emerald-500/20",
  },
  invoice_overdue: {
    label: "Invoice overdue",
    iconClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    ringClass: "ring-rose-500/20",
  },
  invoice_cancelled: {
    label: "Invoice cancelled",
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
    ringClass: "ring-border",
  },
  deal_won: {
    label: "Deal won",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    ringClass: "ring-emerald-500/20",
  },
  deal_lost: {
    label: "Deal lost",
    iconClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    ringClass: "ring-rose-500/20",
  },
  member_invited: {
    label: "Member invited",
    iconClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    ringClass: "ring-violet-500/20",
  },
  member_joined: {
    label: "Member joined",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    ringClass: "ring-emerald-500/20",
  },
  member_removed: {
    label: "Member removed",
    iconClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    ringClass: "ring-rose-500/20",
  },
  member_role_changed: {
    label: "Role changed",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    ringClass: "ring-amber-500/20",
  },
};

// ─── Entity type display config ────────────────────────────────────────────────
// Icon/color per *entity* (relatedTo) — which record this activity belongs
// to. Used in the workspace-wide feed where activities from many different
// record types are mixed together and need a way to show "this one's about
// a Deal" vs "this one's about a Customer".

export const RELATED_TO_DISPLAY: Record<
  ActivityRelatedTo,
  { label: string; iconClass: string; bgClass: string }
> = {
  Lead: { label: "Lead", iconClass: "text-blue-500", bgClass: "bg-blue-500/10" },
  Contact: {
    label: "Contact",
    iconClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
  },
  Deal: {
    label: "Deal",
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
  },
  Task: {
    label: "Task",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  Company: {
    label: "Company",
    iconClass: "text-blue-600",
    bgClass: "bg-blue-600/10",
  },
  Invoice: {
    label: "Invoice",
    iconClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
  },
  Customer: {
    label: "Customer",
    iconClass: "text-indigo-500",
    bgClass: "bg-indigo-500/10",
  },
  Project: {
    label: "Project",
    iconClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
  },
};

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const activityKeys = {
  all: ["activities"] as const,
  record: (relatedTo: ActivityRelatedTo, relatedId: string) =>
    ["activities", "record", relatedTo, relatedId] as const,
  recordStats: (relatedTo: ActivityRelatedTo, relatedId: string) =>
    ["activities", "record-stats", relatedTo, relatedId] as const,
  feed: (filters?: WorkspaceFeedFilters) =>
    ["activities", "feed", filters ?? {}] as const,
  recent: (limit?: number) => ["activities", "recent", limit ?? 8] as const,
  detail: (activityId: string) => ["activities", "detail", activityId] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchRecordActivities = async (
  relatedTo: ActivityRelatedTo,
  relatedId: string,
  page = 1,
  limit = 50
): Promise<ActivitiesResponse> => {
  const params = new URLSearchParams({
    relatedTo,
    relatedId,
    page: String(page),
    limit: String(limit),
  });
  const res = await apiFetch(`/activities/record?${params.toString()}`);
  return res.data;
};

const fetchRecordActivityStats = async (
  relatedTo: ActivityRelatedTo,
  relatedId: string
): Promise<ActivityStats> => {
  const params = new URLSearchParams({ relatedTo, relatedId });
  const res = await apiFetch(`/activities/record/stats?${params.toString()}`);
  return res.data;
};

const fetchWorkspaceFeed = async (
  filters?: WorkspaceFeedFilters
): Promise<ActivitiesResponse> => {
  const params = new URLSearchParams();
  if (filters?.type) params.append("type", filters.type);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.userId) params.append("userId", filters.userId);
  if (filters?.from) params.append("from", filters.from);
  if (filters?.to) params.append("to", filters.to);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/activities${query}`);
  return res.data;
};

const fetchRecentActivity = async (limit = 8): Promise<Activity[]> => {
  const res = await apiFetch(`/activities/recent?limit=${limit}`);
  return res.data;
};

const fetchActivity = async (activityId: string): Promise<Activity> => {
  const res = await apiFetch(`/activities/${activityId}`);
  return res.data;
};

const createActivityApi = async (
  payload: CreateActivityPayload
): Promise<Activity> => {
  const res = await apiFetch("/activities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateActivityApi = async (
  activityId: string,
  payload: UpdateActivityPayload
): Promise<Activity> => {
  const res = await apiFetch(`/activities/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const deleteActivityApi = async (activityId: string): Promise<void> => {
  await apiFetch(`/activities/${activityId}`, { method: "DELETE" });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useRecordActivities = (
  relatedTo: ActivityRelatedTo,
  relatedId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery<ActivitiesResponse>({
    queryKey: activityKeys.record(relatedTo, relatedId),
    queryFn: () =>
      fetchRecordActivities(relatedTo, relatedId, params?.page, params?.limit),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 30,
  });
};

export const useRecordActivityStats = (
  relatedTo: ActivityRelatedTo,
  relatedId: string
) => {
  return useQuery<ActivityStats>({
    queryKey: activityKeys.recordStats(relatedTo, relatedId),
    queryFn: () => fetchRecordActivityStats(relatedTo, relatedId),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 60,
  });
};

export const useActivityFeed = (
  filters?: WorkspaceFeedFilters,
  options?: UseQueryOptions<ActivitiesResponse>
) => {
  return useQuery<ActivitiesResponse>({
    queryKey: activityKeys.feed(filters),
    queryFn: () => fetchWorkspaceFeed(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useRecentActivity = (limit = 8) => {
  return useQuery<Activity[]>({
    queryKey: activityKeys.recent(limit),
    queryFn: () => fetchRecentActivity(limit),
    staleTime: 1000 * 30,
  });
};

export const useActivity = (activityId: string) => {
  return useQuery<Activity>({
    queryKey: activityKeys.detail(activityId),
    queryFn: () => fetchActivity(activityId),
    enabled: !!activityId,
    staleTime: 1000 * 60,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityPayload) => createActivityApi(payload),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.record(activity.relatedTo, activity.relatedId),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.recordStats(
          activity.relatedTo,
          activity.relatedId
        ),
      });
      queryClient.invalidateQueries({ queryKey: ["activities", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["activities", "recent"] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      data,
    }: {
      activityId: string;
      data: UpdateActivityPayload;
    }) => updateActivityApi(activityId, data),
    onSuccess: (activity) => {
      queryClient.setQueryData(activityKeys.detail(activity._id), activity);
      queryClient.invalidateQueries({
        queryKey: activityKeys.record(activity.relatedTo, activity.relatedId),
      });
      queryClient.invalidateQueries({ queryKey: ["activities", "feed"] });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
    }: {
      activityId: string;
      // relatedTo/relatedId passed through so onSuccess can target the
      // right cache without needing the deleted activity's data back
      relatedTo: ActivityRelatedTo;
      relatedId: string;
    }) => deleteActivityApi(activityId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.record(variables.relatedTo, variables.relatedId),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.recordStats(
          variables.relatedTo,
          variables.relatedId
        ),
      });
      queryClient.invalidateQueries({ queryKey: ["activities", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["activities", "recent"] });
    },
  });
};