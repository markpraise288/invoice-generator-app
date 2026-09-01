// hooks/useDeals.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DealStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "contract_sent"
  | "closed_won"
  | "closed_lost";

export type DealRelatedTo = "Lead" | "Customer" | "Company" | "Contact";

export interface DealUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

// relatedId may arrive as a bare ObjectId string (unpopulated) or a populated
// record — field name varies by type (Lead/Customer/Company/Contact all use
// "name" per their own models), so this stays loose rather than assuming one
// fixed shape, same pattern as every other polymorphic relatedId in this build.
export interface DealRelatedRecord {
  _id: string;
  name?: string;
  email?: string;
  domain?: string;
  status?: string;
  industry?: string;
  position?: string;
  [key: string]: unknown;
}

export interface Deal {
  _id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  closeDate: string;
  relatedId?: string | DealRelatedRecord | null; // not required — a Deal can specify relatedTo without relatedId set yet
  relatedTo: DealRelatedTo;
  owner: DealUser;
  createdBy: DealUser;
  closedAt?: string | null;
  lostReason?: string | null;
  description?: string;
  tags: string[];
  weightedValue: number;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  count: number;
  value: number;
}

export interface KanbanData {
  grouped: Record<DealStage, Deal[]>;
  stageTotals: Record<DealStage, KanbanColumn>;
}

export interface PipelineSummary {
  summary: {
    totalDeals: number;
    totalValue: number;
    openValue: number;
    wonValue: number;
    lostValue: number;
    wonCount: number;
    lostCount: number;
    winRate: number;
  };
  byStage: Record<
    DealStage,
    {
      count: number;
      totalValue: number;
      avgValue: number;
      weightedValue: number;
    }
  >;
}

export interface DealsPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DealsResponse {
  deals: Deal[];
  pagination: DealsPagination;
}

export interface CreateDealPayload {
  title: string;
  value: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  closeDate: string;
  relatedTo: DealRelatedTo; // required
  relatedId?: string; // optional — matches the schema's looser requirement on this field specifically
  owner?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateDealPayload {
  title?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  closeDate?: string;
  relatedTo?: DealRelatedTo;
  relatedId?: string | null;
  owner?: string;
  description?: string;
  lostReason?: string;
  tags?: string[];
}

export interface MoveStagePaylod {
  stage: DealStage;
  probability?: number;
  lostReason?: string;
}

export interface DealFilters {
  search?: string;
  stage?: DealStage | "open" | "closed";
  owner?: string;
  relatedTo?: DealRelatedTo; // was: contact?: string; company?: string (now one filter pair)
  relatedId?: string;
  minValue?: number;
  maxValue?: number;
  closeDateFrom?: string;
  closeDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ─── Stage Config ──────────────────────────────────────────────────────────────
// Unchanged — stage config has nothing to do with relatedId/relatedTo.

export const dealStageConfig: Record<
  DealStage,
  {
    label: string;
    color: string;
    bgClass: string;
    textClass: string;
    probability: number;
  }
> = {
  prospecting: {
    label: "Prospecting",
    color: "#94a3b8",
    bgClass: "bg-slate-100 dark:bg-slate-800",
    textClass: "text-slate-600 dark:text-slate-400",
    probability: 10,
  },
  qualification: {
    label: "Qualification",
    color: "#60a5fa",
    bgClass: "bg-blue-100 dark:bg-blue-900/40",
    textClass: "text-blue-600 dark:text-blue-400",
    probability: 20,
  },
  proposal: {
    label: "Proposal",
    color: "#a78bfa",
    bgClass: "bg-violet-100 dark:bg-violet-900/40",
    textClass: "text-violet-600 dark:text-violet-400",
    probability: 40,
  },
  negotiation: {
    label: "Negotiation",
    color: "#fb923c",
    bgClass: "bg-orange-100 dark:bg-orange-900/40",
    textClass: "text-orange-600 dark:text-orange-400",
    probability: 60,
  },
  contract_sent: {
    label: "Contract Sent",
    color: "#facc15",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/40",
    textClass: "text-yellow-600 dark:text-yellow-400",
    probability: 80,
  },
  closed_won: {
    label: "Closed Won",
    color: "#34d399",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/40",
    textClass: "text-emerald-600 dark:text-emerald-400",
    probability: 100,
  },
  closed_lost: {
    label: "Closed Lost",
    color: "#f87171",
    bgClass: "bg-rose-100 dark:bg-rose-900/40",
    textClass: "text-rose-600 dark:text-rose-400",
    probability: 0,
  },
};

// ─── Revenue formatter ─────────────────────────────────────────────────────────

export const formatDealValue = (cents: number): string => {
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)}B`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  return `$${dollars.toLocaleString()}`;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getRelatedId = (deal: Deal): string | null => {
  if (!deal.relatedId) return null;
  return typeof deal.relatedId === "string" ? deal.relatedId : deal.relatedId._id;
};

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const dealKeys = {
  all: ["deals"] as const,
  list: (filters?: DealFilters) =>
    ["deals", "list", filters ?? {}] as const,
  detail: (dealId: string) =>
    ["deals", "detail", dealId] as const,
  kanban: (filters?: { owner?: string; relatedTo?: DealRelatedTo; relatedId?: string }) =>
    ["deals", "kanban", filters ?? {}] as const,
  pipeline: (ownerId?: string) =>
    ["deals", "pipeline", ownerId ?? "all"] as const,
  search: (q: string) =>
    ["deals", "search", q] as const,
  // New — mirrors the "related" key pattern used across Tasks/Contacts/Companies,
  // for "every Deal linked to this specific Lead/Customer/Company/Contact".
  related: (relatedTo: DealRelatedTo, relatedId: string) =>
    ["deals", "related", relatedTo, relatedId] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchDeals = async (filters?: DealFilters): Promise<DealsResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.stage) params.append("stage", filters.stage);
  if (filters?.owner) params.append("owner", filters.owner);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.relatedId) params.append("relatedId", filters.relatedId);
  if (filters?.minValue !== undefined)
    params.append("minValue", String(filters.minValue));
  if (filters?.maxValue !== undefined)
    params.append("maxValue", String(filters.maxValue));
  if (filters?.closeDateFrom)
    params.append("closeDateFrom", filters.closeDateFrom);
  if (filters?.closeDateTo)
    params.append("closeDateTo", filters.closeDateTo);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortDir) params.append("sortDir", filters.sortDir);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/deals${query}`);
  return res.data;
};

const fetchKanbanDeals = async (filters?: {
  owner?: string;
  relatedTo?: DealRelatedTo;
  relatedId?: string;
}): Promise<KanbanData> => {
  const params = new URLSearchParams();
  if (filters?.owner) params.append("owner", filters.owner);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.relatedId) params.append("relatedId", filters.relatedId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/deals/kanban${query}`);
  return res.data;
};

const fetchPipelineSummary = async (
  ownerId?: string
): Promise<PipelineSummary> => {
  const query = ownerId ? `?owner=${ownerId}` : "";
  const res = await apiFetch(`/deals/pipeline-summary${query}`);
  return res.data;
};

const fetchDeal = async (dealId: string): Promise<Deal> => {
  const res = await apiFetch(`/deals/${dealId}`);
  return res.data;
};

const searchDeals = async (q: string): Promise<Deal[]> => {
  const res = await apiFetch(
    `/deals/search?${new URLSearchParams({ q }).toString()}`
  );
  return res.data;
};

// New — every Deal linked to one specific Lead/Customer/Company/Contact,
// mirrors useRelatedTasks / useRelatedContacts / useRelatedCompanies.
const fetchRelatedDeals = async (
  relatedTo: DealRelatedTo,
  relatedId: string
): Promise<Deal[]> => {
  const res = await apiFetch(
    `/deals?relatedTo=${relatedTo}&relatedId=${relatedId}`
  );
  return res.data?.deals ?? res.data;
};

const createDeal = async (payload: CreateDealPayload): Promise<Deal> => {
  const res = await apiFetch("/deals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateDeal = async (
  dealId: string,
  payload: UpdateDealPayload
): Promise<Deal> => {
  const res = await apiFetch(`/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const moveDealStage = async (
  dealId: string,
  payload: MoveStagePaylod
): Promise<Deal> => {
  const res = await apiFetch(`/deals/${dealId}/stage`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const deleteDeal = async (dealId: string): Promise<void> => {
  await apiFetch(`/deals/${dealId}`, { method: "DELETE" });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useDeals = (
  filters?: DealFilters,
  options?: UseQueryOptions<DealsResponse>
) => {
  return useQuery<DealsResponse>({
    queryKey: dealKeys.list(filters),
    queryFn: () => fetchDeals(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useKanbanDeals = (filters?: {
  owner?: string;
  relatedTo?: DealRelatedTo;
  relatedId?: string;
}) => {
  return useQuery<KanbanData>({
    queryKey: dealKeys.kanban(filters),
    queryFn: () => fetchKanbanDeals(filters),
    staleTime: 1000 * 30,
  });
};

export const usePipelineSummary = (ownerId?: string) => {
  return useQuery<PipelineSummary>({
    queryKey: dealKeys.pipeline(ownerId),
    queryFn: () => fetchPipelineSummary(ownerId),
    staleTime: 1000 * 60,
  });
};

export const useDeal = (
  dealId: string,
  options?: UseQueryOptions<Deal>
) => {
  return useQuery<Deal>({
    queryKey: dealKeys.detail(dealId),
    queryFn: () => fetchDeal(dealId),
    enabled: !!dealId,
    staleTime: 1000 * 60,
    ...options,
  });
};

export const useDealSearch = (q: string) => {
  return useQuery<Deal[]>({
    queryKey: dealKeys.search(q),
    queryFn: () => searchDeals(q),
    enabled: q.length >= 1,
    staleTime: 1000 * 30,
  });
};

export const useRelatedDeals = (relatedTo: DealRelatedTo, relatedId: string) => {
  return useQuery<Deal[]>({
    queryKey: dealKeys.related(relatedTo, relatedId),
    queryFn: () => fetchRelatedDeals(relatedTo, relatedId),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 60,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(payload),
    onSuccess: (newDeal) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });

      // Invalidate the specific related record's deal list too, if one was set
      const relatedId = getRelatedId(newDeal);
      if (relatedId) {
        queryClient.invalidateQueries({
          queryKey: dealKeys.related(newDeal.relatedTo, relatedId),
        });
      }
    },
  });
};

export const useUpdateDeal = (dealId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDealPayload) => updateDeal(dealId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Deal>(dealKeys.detail(dealId), updated);

      queryClient.setQueryData<DealsResponse>(
        dealKeys.list(),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            deals: prev.deals.map((d) =>
              d._id === updated._id ? updated : d
            ),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "pipeline"] });
      // relatedTo/relatedId could have changed as part of this update —
      // broadly invalidate rather than tracking old vs. new precisely, same
      // tradeoff used for Tasks/Contacts/Companies elsewhere in this build.
      queryClient.invalidateQueries({ queryKey: ["deals", "related"] });
    },
  });
};

export const useMoveStage = (dealId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MoveStagePaylod) => moveDealStage(dealId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Deal>(dealKeys.detail(dealId), updated);

      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "pipeline"] });

      queryClient.setQueryData<DealsResponse>(
        dealKeys.list(),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            deals: prev.deals.map((d) =>
              d._id === updated._id ? updated : d
            ),
          };
        }
      );
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealId: string) => deleteDeal(dealId),
    onSuccess: (_, dealId) => {
      queryClient.setQueryData<DealsResponse>(
        dealKeys.list(),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            deals: prev.deals.filter((d) => d._id !== dealId),
            pagination: {
              ...prev.pagination,
              total: prev.pagination.total - 1,
            },
          };
        }
      );

      queryClient.removeQueries({ queryKey: dealKeys.detail(dealId) });

      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "related"] });
    },
  });
};