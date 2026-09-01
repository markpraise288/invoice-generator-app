// hooks/useSettings.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type EmailDigest = "never" | "daily" | "weekly";
export type UserRole = "admin" | "member" | "viewer" | "superadmin";

export interface WorkspaceSettings {
  _id: string;
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  timezone: string;
  currency: string;
  dateFormat: DateFormat;
  fiscalYearStart: number;
}

export interface NotificationSettings {
  emailOnLeadAssigned: boolean;
  emailOnDealWon: boolean;
  emailOnDealLost: boolean;
  emailOnTaskDue: boolean;
  emailOnTaskOverdue: boolean;
  emailOnMentioned: boolean;
  emailDigest: EmailDigest;
}

export interface FeatureSettings {
  dealsEnabled: boolean;
  reportsEnabled: boolean;
  tasksEnabled: boolean;
}

export interface Settings {
  _id: string;
  workspaceId: WorkspaceSettings;
  notifications: NotificationSettings;
  features: FeatureSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  position?: string;
  timezone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember extends UserProfile {
  role: UserRole;
}

export interface Session {
  _id: string;
  device?: string;
  ip?: string;
  lastActiveAt?: string;
  createdAt: string;
}

export interface ApiKey {
  _id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UpdateWorkspacePayload {
  workspace: Partial<WorkspaceSettings>;
}

export interface UpdateNotificationsPayload {
  notifications: Partial<NotificationSettings>;
}

export interface UpdateFeaturesPayload {
  features: Partial<FeatureSettings>;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  timezone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const settingsKeys = {
  all: ["settings"] as const,
  settings: () => ["settings", "global"] as const,
  profile: () => ["settings", "profile"] as const,
  team: () => ["settings", "team"] as const,
  sessions: () => ["settings", "sessions"] as const,
  apiKeys: () => ["settings", "api-keys"] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchSettings = async (): Promise<Settings> => {
  const res = await apiFetch("/settings");
  console.log(res.data)
  return res.data;
};

const fetchProfile = async (): Promise<UserProfile> => {
  const res = await apiFetch("/settings/profile");
  return res.data;
};

const fetchTeam = async (): Promise<TeamMember[]> => {
  const res = await apiFetch("/settings/team");
  return res.data;
};

const fetchSessions = async (): Promise<Session[]> => {
  const res = await apiFetch("/settings/sessions");
  return res.data;
};

const fetchApiKeys = async (): Promise<ApiKey[]> => {
  const res = await apiFetch("/settings/api-keys");
  return res.data;
};

const updateWorkspace = async (
  payload: UpdateWorkspacePayload
): Promise<Settings> => {
  const res = await apiFetch(`/settings/workspace/${payload.workspace._id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateNotifications = async (
  payload: UpdateNotificationsPayload
): Promise<Settings> => {
  const res = await apiFetch("/settings/notifications", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateFeatures = async (
  payload: UpdateFeaturesPayload
): Promise<Settings> => {
  const res = await apiFetch("/settings/features", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<UserProfile> => {
  const res = await apiFetch("/settings/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const changePassword = async (
  payload: ChangePasswordPayload
): Promise<void> => {
  await apiFetch("/settings/profile/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

const updateMemberRole = async (
  userId: string,
  role: UserRole
): Promise<TeamMember> => {
  const res = await apiFetch(`/settings/team/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return res.data;
};

const removeMember = async (userId: string): Promise<void> => {
  await apiFetch(`/settings/team/${userId}`, {
    method: "DELETE",
  });
};

const revokeSession = async (sessionId: string): Promise<void> => {
  await apiFetch(`/settings/sessions/${sessionId}`, {
    method: "DELETE",
  });
};

const revokeAllOtherSessions = async (): Promise<void> => {
  await apiFetch("/settings/sessions/all", {
    method: "DELETE",
  });
};

const createApiKey = async (
  name: string
): Promise<{ key: string; name: string }> => {
  const res = await apiFetch("/settings/api-keys", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return res.data;
};

const revokeApiKey = async (keyId: string): Promise<void> => {
  await apiFetch(`/settings/api-keys/${keyId}`, {
    method: "DELETE",
  });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useSettings = (options?: UseQueryOptions<Settings>) => {
  return useQuery<Settings>({
    queryKey: settingsKeys.settings(),
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useProfile = (options?: UseQueryOptions<UserProfile>) => {
  return useQuery<UserProfile>({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useTeam = (options?: UseQueryOptions<TeamMember[]>) => {
  return useQuery<TeamMember[]>({
    queryKey: settingsKeys.team(),
    queryFn: fetchTeam,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

export const useSessions = (options?: UseQueryOptions<Session[]>) => {
  return useQuery<Session[]>({
    queryKey: settingsKeys.sessions(),
    queryFn: fetchSessions,
    staleTime: 1000 * 60,
    ...options,
  });
};

export const useApiKeys = (options?: UseQueryOptions<ApiKey[]>) => {
  return useQuery<ApiKey[]>({
    queryKey: settingsKeys.apiKeys(),
    queryFn: fetchApiKeys,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWorkspacePayload) =>
      updateWorkspace(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Settings>(
        settingsKeys.settings(),
        updated
      );
    },
  });
};

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNotificationsPayload) =>
      updateNotifications(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Settings>(
        settingsKeys.settings(),
        updated
      );
    },
  });
};

export const useUpdateFeatures = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFeaturesPayload) =>
      updateFeatures(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Settings>(
        settingsKeys.settings(),
        updated
      );
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<UserProfile>(
        settingsKeys.profile(),
        updated
      );
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      changePassword(payload),
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => updateMemberRole(userId, role),
    onSuccess: (updated) => {
      queryClient.setQueryData<TeamMember[]>(
        settingsKeys.team(),
        (prev) =>
          prev
            ? prev.map((m) => (m._id === updated._id ? updated : m))
            : [updated]
      );
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<TeamMember[]>(
        settingsKeys.team(),
        (prev) => (prev ? prev.filter((m) => m._id !== userId) : [])
      );
    },
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData<Session[]>(
        settingsKeys.sessions(),
        (prev) =>
          prev ? prev.filter((s) => s._id !== sessionId) : []
      );
    },
  });
};

export const useRevokeAllOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.sessions(),
      });
    },
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createApiKey(name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.apiKeys(),
      });
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => revokeApiKey(keyId),
    onSuccess: (_, keyId) => {
      queryClient.setQueryData<ApiKey[]>(
        settingsKeys.apiKeys(),
        (prev) => (prev ? prev.filter((k) => k._id !== keyId) : [])
      );
    },
  });
};