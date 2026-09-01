"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import type { UserRole } from "@/hooks/useSettings";

export type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";

export interface Invitation {
  _id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  invitedBy?: { name: string; email: string };
  expiresAt: string;
  createdAt: string;
}

const invitationKeys = {
  all: ["invitations"] as const,
  list: () => [...invitationKeys.all, "list"] as const,
};

export function useInvitations() {
  return useQuery({
    queryKey: invitationKeys.list(),
    queryFn: async () => {
      const res = await apiFetch("/team-invitations/invitations");
      return res.data as Invitation[];
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: UserRole }) => {
      const res = await apiFetch("/team-invitations/invite", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      return res.data as Invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.list() });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await apiFetch(`/team-invitations/invitations/${invitationId}/resend`, {
        method: "POST",
      });
      return res.data as Invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.list() });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await apiFetch(`/team-invitations/invitations/${invitationId}/cancel`, {
        method: "POST",
      });
      return res.data as Invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.list() });
    },
  });
}