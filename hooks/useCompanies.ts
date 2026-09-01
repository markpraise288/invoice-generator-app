// hooks/useCompanies.ts

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

export type CompanyRelatedTo = "Lead" | "Customer";

export interface CompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface CompanyUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

// relatedId may arrive as a bare ObjectId string (unpopulated) or a populated
// record — Lead and Customer both expose "name" per their own models, so this
// stays a bit loose rather than assuming one fixed shape, same pattern used
// for every other polymorphic relatedId in this build.
export interface CompanyRelatedRecord {
  _id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface Company {
  _id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: CompanySize;
  website?: string;
  phone?: string;
  email?: string;
  address?: CompanyAddress;
  description?: string;
  revenue?: number;
  relatedId: string | CompanyRelatedRecord; // new — every Company must be linked to a Lead or Customer
  relatedTo: CompanyRelatedTo;
  /** @deprecated superseded by relatedTo === "Lead" ? relatedId : null — kept only in case older code still reads this */
  convertedFromLead?: string | null;
  owner: CompanyUser;
  createdBy: CompanyUser;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyStats {
  contactCount: number;
  leadCount: number;
}

export interface CompanyPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CompaniesResponse {
  companies: Company[];
  pagination: CompanyPagination;
}

export interface CreateCompanyPayload {
  name: string;
  relatedId: string; // now required, matches the schema
  relatedTo: CompanyRelatedTo;
  domain?: string;
  industry?: string;
  size?: CompanySize;
  website?: string;
  phone?: string;
  email?: string;
  address?: CompanyAddress;
  description?: string;
  revenue?: number;
  owner?: string;
  tags?: string[];
}

export interface UpdateCompanyPayload {
  name?: string;
  relatedId?: string;
  relatedTo?: CompanyRelatedTo;
  domain?: string;
  industry?: string;
  size?: CompanySize;
  website?: string;
  phone?: string;
  email?: string;
  address?: CompanyAddress;
  description?: string;
  revenue?: number;
  owner?: string;
  tags?: string[];
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  size?: CompanySize;
  relatedTo?: CompanyRelatedTo; // new — e.g. "show me only companies converted from Leads"
  relatedId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getRelatedId = (company: Company): string =>
  typeof company.relatedId === "string" ? company.relatedId : company.relatedId._id;

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const companyKeys = {
  all: ["companies"] as const,
  list: (filters?: CompanyFilters) =>
    ["companies", "list", filters ?? {}] as const,
  detail: (companyId: string) =>
    ["companies", "detail", companyId] as const,
  stats: (companyId: string) =>
    ["companies", "stats", companyId] as const,
  search: (q: string) =>
    ["companies", "search", q] as const,
  // New — mirrors the "related" key pattern used in useTasks/useContacts, for
  // "every Company linked to this specific Lead/Customer" lookups.
  related: (relatedTo: CompanyRelatedTo, relatedId: string) =>
    ["companies", "related", relatedTo, relatedId] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchCompanies = async (
  filters?: CompanyFilters
): Promise<CompaniesResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.industry) params.append("industry", filters.industry);
  if (filters?.size) params.append("size", filters.size);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.relatedId) params.append("relatedId", filters.relatedId);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortDir) params.append("sortDir", filters.sortDir);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/companies${query}`);
  return res.data;
};

const fetchCompany = async (companyId: string): Promise<Company> => {
  const res = await apiFetch(`/companies/${companyId}`);
  return res.data;
};

const fetchCompanyStats = async (companyId: string): Promise<CompanyStats> => {
  const res = await apiFetch(`/companies/${companyId}/stats`);
  return res.data;
};

const searchCompanies = async (q: string): Promise<Company[]> => {
  const res = await apiFetch(
    `/companies/search?${new URLSearchParams({ q }).toString()}`
  );
  return res.data;
};

// New — every Lead/Customer linked to companies, mirrors useRelatedTasks /
// useRelatedContacts. E.g. useRelatedCompanies("Customer", customer._id).
const fetchRelatedCompanies = async (
  relatedTo: CompanyRelatedTo,
  relatedId: string
): Promise<Company[]> => {
  const res = await apiFetch(
    `/companies?relatedTo=${relatedTo}&relatedId=${relatedId}`
  );
  return res.data?.companies ?? res.data;
};

const createCompany = async (
  payload: CreateCompanyPayload
): Promise<Company> => {
  const res = await apiFetch("/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateCompany = async (
  companyId: string,
  payload: UpdateCompanyPayload
): Promise<Company> => {
  const res = await apiFetch(`/companies/${companyId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const deleteCompany = async (companyId: string): Promise<void> => {
  await apiFetch(`/companies/${companyId}`, {
    method: "DELETE",
  });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useCompanies = (
  filters?: CompanyFilters,
  options?: UseQueryOptions<CompaniesResponse>
) => {
  return useQuery<CompaniesResponse>({
    queryKey: companyKeys.list(filters),
    queryFn: () => fetchCompanies(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useCompany = (
  companyId: string,
  options?: UseQueryOptions<Company>
) => {
  return useQuery<Company>({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => fetchCompany(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60,
    ...options,
  });
};

export const useCompanyStats = (companyId: string) => {
  return useQuery<CompanyStats>({
    queryKey: companyKeys.stats(companyId),
    queryFn: () => fetchCompanyStats(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60,
  });
};

export const useCompanySearch = (q: string) => {
  return useQuery<Company[]>({
    queryKey: companyKeys.search(q),
    queryFn: () => searchCompanies(q),
    enabled: q.length >= 1,
    staleTime: 1000 * 30,
  });
};

export const useRelatedCompanies = (relatedTo: CompanyRelatedTo, relatedId: string) => {
  return useQuery<Company[]>({
    queryKey: companyKeys.related(relatedTo, relatedId),
    queryFn: () => fetchRelatedCompanies(relatedTo, relatedId),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 60,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => createCompany(payload),
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.all,
      });

      // Invalidate the specific related record's company list too — e.g. if
      // this Company was just created from a Customer's own page.
      queryClient.invalidateQueries({
        queryKey: companyKeys.related(newCompany.relatedTo, getRelatedId(newCompany)),
      });
    },
  });
};

export const useUpdateCompany = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCompanyPayload) =>
      updateCompany(companyId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Company>(
        companyKeys.detail(companyId),
        updated
      );

      queryClient.setQueryData<CompaniesResponse>(
        companyKeys.list(),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            companies: prev.companies.map((c) =>
              c._id === updated._id ? updated : c
            ),
          };
        }
      );

      // relatedTo/relatedId could have changed as part of this update —
      // broadly invalidate rather than tracking old vs. new precisely, same
      // tradeoff used for Tasks/Contacts elsewhere in this build.
      queryClient.invalidateQueries({
        queryKey: ["companies", "related"],
      });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => deleteCompany(companyId),
    onSuccess: (_, companyId) => {
      queryClient.setQueryData<CompaniesResponse>(
        companyKeys.list(),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            companies: prev.companies.filter((c) => c._id !== companyId),
            pagination: {
              ...prev.pagination,
              total: prev.pagination.total - 1,
            },
          };
        }
      );

      queryClient.removeQueries({
        queryKey: companyKeys.detail(companyId),
      });

      queryClient.removeQueries({
        queryKey: companyKeys.stats(companyId),
      });

      queryClient.invalidateQueries({
        queryKey: ["companies", "related"],
      });
    },
  });
};