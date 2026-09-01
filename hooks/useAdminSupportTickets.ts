"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import type { SupportTicket, SupportMessage, TicketStatus } from "@/hooks/useSupportTickets";

export interface AdminSupportTicket extends SupportTicket {
  userId: { _id: string; name: string; email: string };
  workspaceId: { _id: string; name: string };
  adminUnreadCount: number;
}

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  unreadTotal: number;
}

const adminTicketKeys = {
  all: ["admin-support-tickets"] as const,
  list: (filters: { status?: string; category?: string }) =>
    [...adminTicketKeys.all, "list", filters] as const,
  detail: (id: string) => [...adminTicketKeys.all, "detail", id] as const,
  stats: () => [...adminTicketKeys.all, "stats"] as const,
};

export function useAdminTickets(filters: { status?: string; category?: string } = {}) {
  return useQuery({
    queryKey: adminTicketKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      const res = await apiFetch(`/admin/support-tickets?${params}`);
      return res.data as {
        tickets: AdminSupportTicket[];
        total: number;
        page: number;
        limit: number;
      };
    },
    refetchInterval: 10000,
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: adminTicketKeys.stats(),
    queryFn: async () => {
      const res = await apiFetch("/admin/support-tickets/stats");
      return res.data as TicketStats;
    },
    refetchInterval: 15000,
  });
}

export function useAdminTicket(ticketId: string | null) {
  return useQuery({
    queryKey: adminTicketKeys.detail(ticketId || ""),
    queryFn: async () => {
      const res = await apiFetch(`/admin/support-tickets/${ticketId}`);
      return res.data as { ticket: AdminSupportTicket; messages: SupportMessage[] };
    },
    enabled: !!ticketId,
    refetchInterval: 4000,
  });
}

export function useAdminSendMessage(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, files }: { body: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append("body", body);
      (files || []).forEach((file) => formData.append("attachments", file));

      const res = await apiFetch(`/admin/support-tickets/${ticketId}/messages`, {
        method: "POST",
        body: formData,
      });
      return res.data as SupportMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.all });
    },
  });
}

export function useUpdateTicketStatus(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: TicketStatus) => {
      const res = await apiFetch(`/admin/support-tickets/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return res.data as AdminSupportTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.all });
    },
  });
}