// hooks/useTeam.ts

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TeamRole = "admin" | "member" | "viewer";

export type LeaderboardMetric =
  | "wonValue"
  | "wonDeals"
  | "totalLeads"
  | "conversionRate"
  | "totalActivities";

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  position?: string;
  timezone?: string;
  role: TeamRole;
  createdAt: string;
  updatedAt: string;
}

export interface TeamOverview {
  totalMembers: number;
  roles: {
    admin: number;
    member: number;
    viewer: number;
  };
  totalLeads: number;
  totalDeals: number;
  totalWonValue: number;
}

export interface MemberLeadStats {
  total: number;
  converted: number;
  totalValue: number;
  thisMonth: number;
  conversionRate: number;
}

export interface MemberDealStats {
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  openValue: number;
  wonValue: number;
  winRate: number;
}

export interface MemberTaskStats {
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface MemberActivityStats {
  total: number;
  breakdown: Record<string, number>;
}

export interface MemberStats {
  leads: MemberLeadStats;
  deals: MemberDealStats;
  tasks: MemberTaskStats;
  activities: MemberActivityStats;
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    position?: string;
    role: TeamRole;
  };
  stats: MemberStats;
}

export interface MemberActivity {
  _id: string;
  type: string;
  title?: string;
  body?: string;
  leadName?: string;
  leadId?: string;
  createdAt: string;
}

export interface TeamFilters {
  search?: string;
  role?: TeamRole;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const teamKeys = {
  all: ["team"] as const,
  members: (filters?: TeamFilters) =>
    ["team", "members", filters ?? {}] as const,
  overview: () => ["team", "overview"] as const,
  leaderboard: (metric?: LeaderboardMetric) =>
    ["team", "leaderboard", metric ?? "wonValue"] as const,
  memberStats: (userId: string) =>
    ["team", "stats", userId] as const,
  memberActivity: (userId: string, limit?: number) =>
    ["team", "activity", userId, limit ?? 10] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchTeamMembers = async (
  filters?: TeamFilters
): Promise<TeamMember[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.role) params.append("role", filters.role);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/team${query}`);
  return res.data;
};

const fetchTeamOverview = async (): Promise<TeamOverview> => {
  const res = await apiFetch("/team/overview");
  return res.data;
};

const fetchLeaderboard = async (
  metric?: LeaderboardMetric
): Promise<LeaderboardEntry[]> => {
  const query = metric ? `?metric=${metric}` : "";
  const res = await apiFetch(`/team/leaderboard${query}`);
  return res.data;
};

const fetchMemberStats = async (userId: string): Promise<MemberStats> => {
  const res = await apiFetch(`/team/${userId}/stats`);
  return res.data;
};

const fetchMemberActivity = async (
  userId: string,
  limit = 10
): Promise<MemberActivity[]> => {
  const res = await apiFetch(`/team/${userId}/activity?limit=${limit}`);
  return res.data;
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useTeamMembers = (
  filters?: TeamFilters,
  options?: UseQueryOptions<TeamMember[]>
) => {
  return useQuery<TeamMember[]>({
    queryKey: teamKeys.members(filters),
    queryFn: () => fetchTeamMembers(filters),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

export const useTeamOverview = (
  options?: UseQueryOptions<TeamOverview>
) => {
  return useQuery<TeamOverview>({
    queryKey: teamKeys.overview(),
    queryFn: fetchTeamOverview,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

export const useLeaderboard = (
  metric?: LeaderboardMetric,
  options?: UseQueryOptions<LeaderboardEntry[]>
) => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: teamKeys.leaderboard(metric),
    queryFn: () => fetchLeaderboard(metric),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useMemberStats = (
  userId: string,
  options?: UseQueryOptions<MemberStats>
) => {
  return useQuery<MemberStats>({
    queryKey: teamKeys.memberStats(userId),
    queryFn: () => fetchMemberStats(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

export const useMemberActivity = (
  userId: string,
  limit = 10,
  options?: UseQueryOptions<MemberActivity[]>
) => {
  return useQuery<MemberActivity[]>({
    queryKey: teamKeys.memberActivity(userId, limit),
    queryFn: () => fetchMemberActivity(userId, limit),
    enabled: !!userId,
    staleTime: 1000 * 60,
    ...options,
  });
};