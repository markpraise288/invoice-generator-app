// hooks/useContacts.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ContactStage =
  | "subscriber"
  | "lead"
  | "opportunity"
  | "customer"
  | "evangelist"
  | "other";

export type RelatedTo = "Customer" | "Company" | "Lead";

export interface ContactUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface ContactSocial {
  linkedin?: string;
  twitter?: string;
}

// relatedId may arrive as a bare ObjectId string (unpopulated) or a populated
// record — field name varies by relatedTo (Company/Customer use "name", Lead
// also uses "name" per lead.model.js), so this stays loose rather than
// assuming one fixed shape.
export interface ContactRelatedRecord {
  _id: string;
  name?: string;
  [key: string]: unknown;
}

export interface Contact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  relatedId: ContactRelatedRecord; // now required — every Contact must be linked to something
  relatedTo: RelatedTo;
  stage: ContactStage;
  social?: ContactSocial;
  address?: ContactAddress;
  description?: string;
  owner: ContactUser;
  createdBy: ContactUser;
  tags: string[];
  lastContactedAt?: string | null;
  fullAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactStats {
  activityCount: number;
  taskCount: number;
  openTaskCount: number;
}

export interface ContactPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination: ContactPagination;
}

export interface CreateContactPayload {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  relatedId: string; // was: company?: string — now required, matches the schema
  relatedTo: RelatedTo;
  stage?: ContactStage;
  social?: ContactSocial;
  address?: ContactAddress;
  description?: string;
  owner?: string;
  tags?: string[];
}

export interface UpdateContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  relatedId?: string; // was: company?: string | null
  relatedTo?: RelatedTo;
  stage?: ContactStage;
  social?: ContactSocial;
  address?: ContactAddress;
  description?: string;
  owner?: string;
  tags?: string[];
  lastContactedAt?: string | null;
}

export interface ContactFilters {
  search?: string;
  relatedTo?: RelatedTo; // was: company?: string
  relatedId?: string;
  stage?: ContactStage;
  owner?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getRelatedId = (contact: Contact): string =>
  typeof contact.relatedId === "string" ? contact.relatedId : contact.relatedId._id;

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const contactKeys = {
  all: ["contacts"] as const,
  list: (filters?: ContactFilters) =>
    ["contacts", "list", filters ?? {}] as const,
  detail: (contactId: string) =>
    ["contacts", "detail", contactId] as const,
  stats: (contactId: string) =>
    ["contacts", "stats", contactId] as const,
  search: (q: string, relatedTo?: RelatedTo, relatedId?: string) =>
    ["contacts", "search", q, relatedTo ?? null, relatedId ?? null] as const,
  // Renamed from the old (broken — never matched what useContactsByCompany
  // actually called) "relatedId" key to "related", and generalized to accept
  // any relatedTo type, not just Company.
  related: (relatedTo: RelatedTo, relatedId: string) =>
    ["contacts", "related", relatedTo, relatedId] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchContacts = async (
  filters?: ContactFilters
): Promise<ContactsResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.relatedId) params.append("relatedId", filters.relatedId);
  if (filters?.stage) params.append("stage", filters.stage);
  if (filters?.owner) params.append("owner", filters.owner);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortDir) params.append("sortDir", filters.sortDir);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/contacts${query}`);
  return res.data;
};

const fetchContact = async (contactId: string): Promise<Contact> => {
  const res = await apiFetch(`/contacts/${contactId}`);
  return res.data;
};

const fetchContactStats = async (contactId: string): Promise<ContactStats> => {
  const res = await apiFetch(`/contacts/${contactId}/stats`);
  return res.data;
};

const searchContacts = async (
  q: string,
  relatedTo?: RelatedTo,
  relatedId?: string
): Promise<Contact[]> => {
  const params = new URLSearchParams({ q });
  if (relatedTo) params.append("relatedTo", relatedTo);
  if (relatedId) params.append("relatedId", relatedId);
  const res = await apiFetch(`/contacts/search?${params.toString()}`);
  return res.data;
};

// Replaces fetchContactsByCompany — works for any relatedTo type now, not
// just Company. If your backend route is still literally
// "/companies/:id/contacts" (Company-specific), keep using that path only
// when relatedTo === "Company"; otherwise this assumes a flat
// "/contacts?relatedTo=X&relatedId=Y" route exists, matching fetchContacts'
// own filter shape. Confirm against your actual contact.routes.js.
const fetchRelatedContacts = async (
  relatedTo: RelatedTo,
  relatedId: string
): Promise<Contact[]> => {
  const res = await apiFetch(
    `/contacts?relatedTo=${relatedTo}&relatedId=${relatedId}`
  );
  return res.data?.contacts ?? res.data;
};

const createContact = async (
  payload: CreateContactPayload
): Promise<Contact> => {
  const res = await apiFetch("/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateContact = async (
  contactId: string,
  payload: UpdateContactPayload
): Promise<Contact> => {
  const res = await apiFetch(`/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const deleteContact = async (contactId: string): Promise<void> => {
  await apiFetch(`/contacts/${contactId}`, {
    method: "DELETE",
  });
};

const updateLastContacted = async (contactId: string): Promise<void> => {
  await apiFetch(`/contacts/${contactId}/last-contacted`, {
    method: "PATCH",
  });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useContacts = (
  filters?: ContactFilters,
  options?: UseQueryOptions<ContactsResponse>
) => {
  return useQuery<ContactsResponse>({
    queryKey: contactKeys.list(filters),
    queryFn: () => fetchContacts(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useContact = (
  contactId: string,
  options?: UseQueryOptions<Contact>
) => {
  return useQuery<Contact>({
    queryKey: contactKeys.detail(contactId),
    queryFn: () => fetchContact(contactId),
    enabled: !!contactId,
    staleTime: 1000 * 60,
    ...options,
  });
};

export const useContactStats = (contactId: string) => {
  return useQuery<ContactStats>({
    queryKey: contactKeys.stats(contactId),
    queryFn: () => fetchContactStats(contactId),
    enabled: !!contactId,
    staleTime: 1000 * 60,
  });
};

export const useContactSearch = (q: string, relatedTo?: RelatedTo, relatedId?: string) => {
  return useQuery<Contact[]>({
    queryKey: contactKeys.search(q, relatedTo, relatedId),
    queryFn: () => searchContacts(q, relatedTo, relatedId),
    enabled: q.length >= 1,
    staleTime: 1000 * 30,
  });
};

// Replaces useContactsByCompany — now generic across Company/Customer/Lead.
// e.g. useRelatedContacts("Company", company._id) or
// useRelatedContacts("Lead", lead._id).
export const useRelatedContacts = (relatedTo: RelatedTo, relatedId: string) => {
  return useQuery<Contact[]>({
    queryKey: contactKeys.related(relatedTo, relatedId),
    queryFn: () => fetchRelatedContacts(relatedTo, relatedId),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 60,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContactPayload) => createContact(payload),
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.all,
      });

      // Invalidate the specific related-record's contact list, whatever type
      // it is — not just when it happens to be a Company anymore.
      const relatedId = getRelatedId(newContact);
      queryClient.invalidateQueries({
        queryKey: contactKeys.related(newContact.relatedTo, relatedId),
      });
    },
  });
};

export const useUpdateContact = (contactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateContactPayload) =>
      updateContact(contactId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Contact>(
        contactKeys.detail(contactId),
        updated
      );

      queryClient.setQueryData<ContactsResponse>(
        contactKeys.list(),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            contacts: prev.contacts.map((c) =>
              c._id === updated._id ? updated : c
            ),
          };
        }
      );

      // Broadly invalidate every "related" cache, since relatedTo/relatedId
      // could have changed as part of this update (e.g. reassigning a
      // Contact from one Company to another, or from a Lead to a Customer
      // after conversion) — same broad-invalidate tradeoff used elsewhere in
      // this build rather than tracking the old vs. new related record precisely.
      queryClient.invalidateQueries({
        queryKey: ["contacts", "related"],
      });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteContact(contactId),
    onSuccess: (_, contactId) => {
      queryClient.setQueryData<ContactsResponse>(
        contactKeys.list(),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            contacts: prev.contacts.filter((c) => c._id !== contactId),
            pagination: {
              ...prev.pagination,
              total: prev.pagination.total - 1,
            },
          };
        }
      );

      queryClient.removeQueries({
        queryKey: contactKeys.detail(contactId),
      });

      queryClient.invalidateQueries({
        queryKey: ["contacts", "related"],
      });
    },
  });
};

export const useUpdateLastContacted = (contactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => updateLastContacted(contactId),
    onSuccess: () => {
      queryClient.setQueryData<Contact>(
        contactKeys.detail(contactId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            lastContactedAt: new Date().toISOString(),
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: contactKeys.all,
      });
    },
  });
};