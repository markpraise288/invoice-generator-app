"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type TicketCategory = "bug" | "billing" | "feature_request" | "account" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Attachment {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface SupportMessage {
  _id: string;
  ticketId: string;
  senderId: string;
  senderRole: "user" | "admin";
  body: string;
  attachments: Attachment[];
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  lastMessageAt: string;
  lastMessagePreview: string;
  userUnreadCount: number;
  createdAt: string;
}

const ticketKeys = {
  all: ["support-tickets"] as const,
  list: () => [...ticketKeys.all, "list"] as const,
  detail: (id: string) => [...ticketKeys.all, "detail", id] as const,
};

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.list(),
    queryFn: async () => {
      const res = await apiFetch("/support-tickets");
      return res.data as SupportTicket[];
    },
    refetchInterval: 15000, // catches status changes / unread counts from admin replies
  });
}

export function useMyTicket(ticketId: string | null) {
  return useQuery({
    queryKey: ticketKeys.detail(ticketId || ""),
    queryFn: async () => {
      const res = await apiFetch(`/support-tickets/${ticketId}`);
      return res.data as { ticket: SupportTicket; messages: SupportMessage[] };
    },
    enabled: !!ticketId,
    refetchInterval: 4000, // faster polling while a thread is actually open
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      subject,
      body,
      files,
    }: {
      category: TicketCategory;
      subject: string;
      body: string;
      files?: File[];
    }) => {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("subject", subject);
      formData.append("body", body);
      (files || []).forEach((file) => formData.append("attachments", file));

      const res = await apiFetch("/support-tickets", {
        method: "POST",
        body: formData,
      });
      return res.data as { ticket: SupportTicket; message: SupportMessage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.list() });
    },
  });
}

export function useSendTicketMessage(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, files }: { body: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append("body", body);
      (files || []).forEach((file) => formData.append("attachments", file));

      const res = await apiFetch(`/support-tickets/${ticketId}/messages`, {
        method: "POST",
        body: formData,
      });
      return res.data as SupportMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.list() });
    },
  });
}