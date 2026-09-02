// hooks/useTasks.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type RelatedToType = "Customer" | "Lead" | "Project" | "Deal" | "Contact" | "Company";

export interface TaskUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Populated shape of relatedId varies by relatedTo — Deal uses "title",
// everything else uses "name". Consumers should treat this loosely and prefer
// the getRelatedLabel-style helper pattern used in TasksTable.tsx rather than
// assuming one specific field is always present.
export interface TaskRelatedRecord {
  _id: string;
  name?: string;
  title?: string;
  [key: string]: unknown;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  relatedTo: RelatedToType;
  relatedId: TaskRelatedRecord; // string when unpopulated, object when populated
  assignedTo: TaskUser;
  createdBy: TaskUser;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  completedBy?: TaskUser;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  relatedTo: RelatedToType;
  relatedId: string;
  assignedTo: string;
  dueDate: string;
  priority?: TaskPriority;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority?: TaskPriority;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: TaskPriority;
  assignedTo?: string;
  relatedTo?: RelatedToType;
  relatedId?: string;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters?: TaskFilters) => ["tasks", "list", filters ?? {}] as const,
  // Tasks scoped to one specific record — e.g. every task linked to a given
  // Customer or Project, regardless of relatedTo type. Replaces leadTasks.
  related: (relatedTo: RelatedToType, relatedId: string, filters?: TaskFilters) =>
    ["tasks", "related", relatedTo, relatedId, filters ?? {}] as const,
  summary: (relatedTo?: RelatedToType, relatedId?: string) =>
    relatedId
      ? (["tasks", "summary", relatedTo, relatedId] as const)
      : (["tasks", "summary"] as const),
  detail: (taskId: string) => ["tasks", "detail", taskId] as const,
  upcoming: (params?: { limit?: number; daysAhead?: number }) =>
    ["tasks", "upcoming", params ?? {}] as const,
  overdue: () => ["tasks", "overdue"] as const,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const buildFilterQuery = (filters?: TaskFilters) => {
  const params = new URLSearchParams();
  if (filters?.completed !== undefined) params.append("completed", String(filters.completed));
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.relatedId) params.append("relatedId", filters.relatedId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

// Unwraps relatedId whether it arrived as a bare string or a populated object —
// mirrors the same helper used in TasksTable.tsx, kept here too since mutation
// success handlers need it independently of any component.
const getRelatedId = (task: Task): string =>
  typeof task.relatedId === "string" ? task.relatedId : task.relatedId._id;

// ─── API Calls ─────────────────────────────────────────────────────────────────
// All flat under /tasks now — nothing is nested under /leads/:leadId anymore,
// since a task can point at any of the six relatedTo types.

const fetchTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const res = await apiFetch(`/tasks${buildFilterQuery(filters)}`);
  return res.data;
};

const fetchRelatedTasks = async (
  relatedTo: RelatedToType,
  relatedId: string,
  filters?: TaskFilters
): Promise<Task[]> => {
  const query = buildFilterQuery({ ...filters, relatedTo, relatedId });
  const res = await apiFetch(`/tasks${query}`);
  return res.data;
};

const fetchTaskSummary = async (
  relatedTo?: RelatedToType,
  relatedId?: string
): Promise<TaskSummary> => {
  const query = relatedTo && relatedId ? buildFilterQuery({ relatedTo, relatedId }) : "";
  const res = await apiFetch(`/tasks/summary${query}`);
  return res.data;
};

const fetchUpcomingTasks = async (params?: {
  limit?: number;
  daysAhead?: number;
}): Promise<Task[]> => {
  const query = new URLSearchParams();
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.daysAhead) query.append("daysAhead", String(params.daysAhead));
  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await apiFetch(`/tasks/upcoming${qs}`);
  return res.data;
};

const fetchOverdueTasks = async (): Promise<Task[]> => {
  const res = await apiFetch("/tasks/overdue");
  return res.data;
};

const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const res = await apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateTask = async (
  taskId: string,
  payload: UpdateTaskPayload
): Promise<Task> => {
  const res = await apiFetch(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const completeTask = async (
  taskId: string,
  completed: boolean
): Promise<Task> => {
  const res = await apiFetch(`/tasks/${taskId}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
  return res.data;
};

const deleteTask = async (taskId: string): Promise<void> => {
  await apiFetch(`/tasks/${taskId}`, {
    method: "DELETE",
  });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useTasks = (filters?: TaskFilters, options?: UseQueryOptions<Task[]>) => {
  return useQuery<Task[]>({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchTasks(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

// Replaces useLeadTasks — works for any of the six relatedTo types, e.g.
// useRelatedTasks("Customer", customer._id) or useRelatedTasks("Project", project._id).
export const useRelatedTasks = (
  relatedTo: RelatedToType,
  relatedId: string,
  filters?: TaskFilters,
  options?: UseQueryOptions<Task[]>
) => {
  return useQuery<Task[]>({
    queryKey: taskKeys.related(relatedTo, relatedId, filters),
    queryFn: () => fetchRelatedTasks(relatedTo, relatedId, filters),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useTaskSummary = (relatedTo?: RelatedToType, relatedId?: string) => {
  return useQuery<TaskSummary>({
    queryKey: taskKeys.summary(relatedTo, relatedId),
    queryFn: () => fetchTaskSummary(relatedTo, relatedId),
    enabled: relatedTo ? !!relatedId : true,
    staleTime: 1000 * 60,
  });
};

export const useUpcomingTasks = (params?: {
  limit?: number;
  daysAhead?: number;
}) => {
  return useQuery<Task[]>({
    queryKey: taskKeys.upcoming(params),
    queryFn: () => fetchUpcomingTasks(params),
    staleTime: 1000 * 60,
  });
};

export const useOverdueTasks = () => {
  return useQuery<Task[]>({
    queryKey: taskKeys.overdue(),
    queryFn: fetchOverdueTasks,
    staleTime: 1000 * 30,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (newTask) => {
      const relatedId = getRelatedId(newTask);

      // Prepend to that record's task list cache, if it's currently mounted
      queryClient.setQueryData<Task[]>(
        taskKeys.related(newTask.relatedTo, relatedId),
        (prev) => (prev ? [newTask, ...prev] : [newTask])
      );

      // Broad invalidation for the flat "all tasks" list and its summary —
      // cheaper to over-invalidate here than track every filter combination
      // someone might currently have applied on the Tasks page.
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({
        queryKey: taskKeys.summary(newTask.relatedTo, relatedId),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskPayload;
    }) => updateTask(taskId, payload),
    onSuccess: (updated) => {
      const relatedId = getRelatedId(updated);

      queryClient.setQueryData<Task[]>(
        taskKeys.related(updated.relatedTo, relatedId),
        (prev) => (prev ? prev.map((t) => (t._id === updated._id ? updated : t)) : [updated])
      );
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) => completeTask(taskId, completed),
    onSuccess: (updated) => {
      const relatedId = getRelatedId(updated);

      queryClient.setQueryData<Task[]>(
        taskKeys.related(updated.relatedTo, relatedId),
        (prev) => (prev ? prev.map((t) => (t._id === updated._id ? updated : t)) : [updated])
      );
      // Also patch the flat list cache directly, since the Tasks page's main
      // table reads from useTasks() (taskKeys.list), not taskKeys.related —
      // without this, a completed checkbox would flip back on next refetch
      // until the invalidation below resolves.
      queryClient.setQueriesData<Task[]>(
        { queryKey: taskKeys.all },
        (prev) => (prev ? prev.map((t) => (t._id === updated._id ? updated : t)) : prev)
      );

      queryClient.invalidateQueries({
        queryKey: taskKeys.summary(updated.relatedTo, relatedId),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // Task is gone — we don't know its relatedTo/relatedId anymore since the
      // server only returns void on delete, so strip it from every cached list
      // (flat + related) rather than targeting one specific key.
      queryClient.setQueriesData<Task[]>(
        { queryKey: taskKeys.all },
        (prev) => (prev ? prev.filter((t) => t._id !== taskId) : prev)
      );

      queryClient.invalidateQueries({ queryKey: taskKeys.summary() });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
    },
  });
};