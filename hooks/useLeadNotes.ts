import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "status_change"
  | "task";

export interface ActivityCreator {
  _id: string;
  name: string;
  email: string;
}

export interface LeadNote {
  _id: string;
  lead: string;
  type: ActivityType;
  title: string;
  description?: string;
  createdBy: ActivityCreator;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadNotePayload {
  type: ActivityType;
  title: string;
  description?: string;
}

export const useLeadNotes = (leadId: string) => {
  return useQuery({
    queryKey: ["leadNotes", leadId],
    queryFn: async (): Promise<LeadNote[]> => {
      const res = await apiFetch(`/leads/${leadId}/notes`);
      return res.data;
    },
    enabled: !!leadId,
  });
};

export const useCreateLeadNote = (leadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLeadNotePayload) => {
      const res = await apiFetch(`/leads/${leadId}/notes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadNotes", leadId] });
    },
  });
};

export const useDeleteLeadNote = (leadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      await apiFetch(`/notes/${noteId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadNotes", leadId] });
    },
  });
};