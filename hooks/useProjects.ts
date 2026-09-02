// hooks/useProjects.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
export type ProjectRelatedTo = "Customer" | "Company" | "Contact" | "Deal";

export interface ProjectMember {
  _id: string;
  name: string;
  email: string;
}

// relatedId may arrive as a bare ObjectId string (unpopulated) or a populated
// record — field name varies by type (Deal uses "title", the other three use
// "name"), same loose-by-necessity shape used for every polymorphic relatedId
// in this build.
export interface ProjectRelatedRecord {
  _id: string;
  name?: string;
  title?: string;
  [key: string]: unknown;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  relatedId: ProjectRelatedRecord; // was: customer/company — now required, one polymorphic pair
  relatedTo: ProjectRelatedTo;
  status: ProjectStatus;
  startDate?: string | null;
  dueDate?: string | null;
  budget: number; // cents
  owner?: ProjectMember | null;
  members: ProjectMember[];
  tags: string[];
  progress?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsListParams {
  search?: string;
  status?: ProjectStatus;
  relatedTo?: ProjectRelatedTo; // was: customer?: string; company?: string
  relatedId?: string;
  owner?: string;
  member?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProjectsListResponse {
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type ProjectsKanbanColumns = Record<ProjectStatus, Project[]>;

export interface CreateProjectPayload {
  name: string;
  description?: string;
  relatedId: string; // now required
  relatedTo: ProjectRelatedTo;
  status?: ProjectStatus;
  startDate?: string | null;
  dueDate?: string | null;
  budget?: number; // cents
  owner?: string | null;
  members?: string[];
  tags?: string[];
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export interface ProjectTask {
  _id: string;
  title: string;
  status: string;
  project?: string;
  [key: string]: unknown;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getRelatedId = (project: Project): string =>
  typeof project.relatedId === "string" ? project.relatedId : project.relatedId._id;

const buildQueryString = (params: object) => {
  const search = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: ProjectsListParams) => [...projectKeys.lists(), params] as const,
  kanban: (filter: object) => [...projectKeys.all, "kanban", filter] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  tasks: (id: string) => [...projectKeys.all, "tasks", id] as const,
  // New — mirrors the "related" key pattern used across Tasks/Contacts/
  // Companies/Deals, for "every Project linked to this specific record".
  related: (relatedTo: ProjectRelatedTo, relatedId: string) =>
    [...projectKeys.all, "related", relatedTo, relatedId] as const,
};

export const useProjects = (params: ProjectsListParams = {}) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: async () => {
      const res = await apiFetch(`/projects${buildQueryString(params)}`);
      return res.data as ProjectsListResponse;
    },
  });
};

export const useProjectsKanban = (
  filter: { relatedTo?: ProjectRelatedTo; relatedId?: string; owner?: string } = {}
) => {
  return useQuery({
    queryKey: projectKeys.kanban(filter),
    queryFn: async () => {
      const res = await apiFetch(`/projects/kanban${buildQueryString(filter)}`);
      return res.data as ProjectsKanbanColumns;
    },
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const res = await apiFetch(`/projects/${id}`);
      return res.data as Project;
    },
    enabled: !!id,
  });
};

export const useProjectTasks = (id: string) => {
  return useQuery({
    queryKey: projectKeys.tasks(id),
    queryFn: async () => {
      const res = await apiFetch(`/projects/${id}/tasks`);
      return res.data as ProjectTask[];
    },
    enabled: !!id,
  });
};

// New — every Project linked to one specific Customer/Company/Contact/Deal,
// mirrors useRelatedTasks / useRelatedContacts / useRelatedCompanies / useRelatedDeals.
export const useRelatedProjects = (relatedTo: ProjectRelatedTo, relatedId: string) => {
  return useQuery({
    queryKey: projectKeys.related(relatedTo, relatedId),
    queryFn: async () => {
      const res = await apiFetch(
        `/projects?relatedTo=${relatedTo}&relatedId=${relatedId}`
      );
      return (res.data?.projects ?? res.data) as Project[];
    },
    enabled: !!relatedTo && !!relatedId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProjectPayload) => {
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data as Project;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({
        queryKey: projectKeys.related(newProject.relatedTo, getRelatedId(newProject)),
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectPayload }) => {
      const res = await apiFetch(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data as Project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.setQueryData(projectKeys.detail(project._id), project);
      // relatedTo/relatedId could have changed as part of this update —
      // broadly invalidate rather than tracking old vs. new precisely, same
      // tradeoff used for Tasks/Contacts/Companies/Deals elsewhere in this build.
      queryClient.invalidateQueries({ queryKey: [...projectKeys.all, "related"] });
    },
  });
};

// Used by the Kanban board's drag-and-drop — includes an optimistic update
// so cards move instantly instead of waiting on the network round-trip.
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const res = await apiFetch(`/projects/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return res.data as Project;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all });

      const previousKanban = queryClient.getQueriesData<ProjectsKanbanColumns>({
        queryKey: [...projectKeys.all, "kanban"],
      });

      previousKanban.forEach(([queryKey, data]) => {
        if (!data) return;
        const next: ProjectsKanbanColumns = { ...data };
        let movedCard: Project | undefined;

        (Object.keys(next) as ProjectStatus[]).forEach((col) => {
          const idx = next[col].findIndex((p) => p._id === id);
          if (idx !== -1) {
            movedCard = next[col][idx];
            next[col] = next[col].filter((p) => p._id !== id);
          }
        });

        if (movedCard) {
          next[status] = [{ ...movedCard, status }, ...next[status]];
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
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/projects/${id}`, { method: "DELETE" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: [...projectKeys.all, "related"] });
    },
  });
};