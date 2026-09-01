import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type LeadSource =
  | "website"
  | "referral"
  | "cold_outreach"
  | "social_media"
  | "event"
  | "advertisement"
  | "other";

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  stage: LeadStage;
  score: number;
  value: number; // cents
  currency: string;
  tags: string[];
  notes?: string;
  lostReason?: string;
  lastContactedAt?: string | null;
  owner?: { _id: string; name: string; email: string } | null;
  convertedCustomer?: { _id: string; name: string; email: string; status: string } | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsListParams {
  search?: string;
  stage?: LeadStage;
  source?: LeadSource;
  owner?: string;
  minScore?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LeadsListResponse {
  leads: Lead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type LeadsKanbanColumns = Record<LeadStage, Lead[]>;

export interface LeadsSummary {
  totalLeads: number;
  totalPipelineValue: number;
  byStage: Record<string, { count: number; value: number }>;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  stage?: LeadStage;
  score?: number;
  value?: number; // cents
  currency?: string;
  tags?: string[];
  notes?: string;
  lastContactedAt?: string | null;
  owner?: string | null;
}

export type UpdateLeadPayload = Partial<Omit<CreateLeadPayload, "stage">>;

export interface ConvertLeadPayload {
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  company?: string | null;
  contact?: string | null;
}

const buildQueryString = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadsListParams) => [...leadKeys.lists(), params] as const,
  kanban: (filter: Record<string, unknown>) => [...leadKeys.all, "kanban", filter] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  summary: (filter: Record<string, unknown>) => [...leadKeys.all, "summary", filter] as const,
};

export const useLeads = (params: LeadsListParams = {}) => {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: async () => {
      const res = await apiFetch(`/leads${buildQueryString(params)}`);
      return res.data as LeadsListResponse;
    },
  });
};

export const useLeadsKanban = (filter: { owner?: string; source?: string } = {}) => {
  return useQuery({
    queryKey: leadKeys.kanban(filter),
    queryFn: async () => {
      const res = await apiFetch(`/leads/kanban${buildQueryString(filter)}`);
      return res.data as LeadsKanbanColumns;
    },
  });
};

export const useLeadsSummary = (filter: { owner?: string } = {}) => {
  return useQuery({
    queryKey: leadKeys.summary(filter),
    queryFn: async () => {
      const res = await apiFetch(`/leads/summary${buildQueryString(filter)}`);
      return res.data as LeadsSummary;
    },
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: async () => {
      const res = await apiFetch(`/leads/${id}`);
      return res.data as Lead;
    },
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLeadPayload) => {
      const res = await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeadPayload }) => {
      const res = await apiFetch(`/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data as Lead;
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      queryClient.setQueryData(leadKeys.detail(lead._id), lead);
    },
  });
};

// Optimistic stage update for Kanban drag-and-drop — mirrors
// useUpdateProjectStatus's onMutate/onError/onSettled pattern exactly.
export const useUpdateLeadStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      stage,
      lostReason,
    }: {
      id: string;
      stage: LeadStage;
      lostReason?: string;
    }) => {
      const res = await apiFetch(`/leads/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage, lostReason }),
      });
      return res.data as Lead;
    },
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: leadKeys.all });

      const previousKanban = queryClient.getQueriesData<LeadsKanbanColumns>({
        queryKey: [...leadKeys.all, "kanban"],
      });

      previousKanban.forEach(([queryKey, data]) => {
        if (!data) return;
        const next: LeadsKanbanColumns = { ...data };
        let movedCard: Lead | undefined;

        (Object.keys(next) as LeadStage[]).forEach((col) => {
          const idx = next[col].findIndex((l) => l._id === id);
          if (idx !== -1) {
            movedCard = next[col][idx];
            next[col] = next[col].filter((l) => l._id !== id);
          }
        });

        if (movedCard) {
          next[stage] = [{ ...movedCard, stage }, ...next[stage]];
        }

        queryClient.setQueryData(queryKey, next);
      });

      return { previousKanban };
    },
    onError: (_err, _vars, context) => {
      context?.previousKanban.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/leads/${id}`, { method: "DELETE" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ConvertLeadPayload }) => {
      const res = await apiFetch(`/leads/${id}/convert`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.data as { lead: Lead; customer: { _id: string; name: string } };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      queryClient.setQueryData(leadKeys.detail(result.lead._id), result.lead);
      // A new Customer now exists — invalidate the Customers list so it shows up there too
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};