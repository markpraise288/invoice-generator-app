// hooks/useCalendar.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EventType =
  | "meeting"
  | "call"
  | "follow_up"
  | "deadline"
  | "demo"
  | "task"
  | "other";

export type EventStatus = "scheduled" | "completed" | "cancelled";
export type AttendeeStatus = "pending" | "accepted" | "declined" | "tentative";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type RecurringScope = "this" | "this_and_future" | "all";

// All eight types from the schema's relatedTo enum — Calendar can link to
// more entity types than any other model in this build (Task/Activity had 6,
// Deal had 4, Project had 4 — Calendar has 8, covering everything).
export type CalendarRelatedTo =
  | "Lead"
  | "Contact"
  | "Deal"
  | "Task"
  | "Company"
  | "Invoice"
  | "Customer"
  | "Project";

export interface EventAttendee {
  _id?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  email?: string;
  name?: string;
  status: AttendeeStatus;
}

export interface EventRecurrence {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  endDate?: string;
  occurrences?: number;
}

export interface EventReminder {
  method: "email" | "notification";
  minutesBefore: number;
  sent?: boolean;
}

// relatedId may arrive as a bare ObjectId string (unpopulated) or a populated
// record. Field names vary by type — Deal uses "title", everything else uses
// "name" — same loose shape used for every other polymorphic relatedId in
// this build. Both relatedId and relatedTo are nullable (default: null per
// schema), so a Calendar event can exist without being linked to anything.
export interface CalendarRelatedRecord {
  _id: string;
  name?: string;
  title?: string;
  email?: string;
  stage?: string;
  status?: string;
  value?: number;
  position?: string;
  company?: string;
  [key: string]: unknown;
}

export interface EventOwner {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  type: EventType;
  startAt: string;
  endAt: string;
  allDay: boolean;
  timezone: string;
  location?: string;
  meetingUrl?: string;
  relatedId?: string | CalendarRelatedRecord | null; // was: lead/contact/deal as separate fields
  relatedTo?: CalendarRelatedTo | null;
  attendees: EventAttendee[];
  recurrence?: EventRecurrence;
  recurringEventId?: string | null;
  reminders: EventReminder[];
  color: string;
  status: EventStatus;
  owner: EventOwner;
  createdBy: EventOwner;
  durationMinutes: number;
  isUpcoming: boolean;
  isPast: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarStats {
  totalThisMonth: number;
  upcomingThisWeek: number;
  completedThisMonth: number;
  typeBreakdown: Record<EventType, number>;
}

export interface CalendarPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  pagination: CalendarPagination;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  type?: EventType;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  timezone?: string;
  location?: string;
  meetingUrl?: string;
  relatedId?: string | null; // was: lead/contact/deal as separate string fields
  relatedTo?: CalendarRelatedTo | null;
  attendees?: {
    user?: string;
    email?: string;
    name?: string;
  }[];
  recurrence?: EventRecurrence;
  reminders?: { method: "email" | "notification"; minutesBefore: number }[];
  color?: string;
  status?: EventStatus;
  owner?: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  scope?: RecurringScope;
}

export interface CalendarFilters {
  from?: string;
  to?: string;
  type?: EventType;
  status?: EventStatus;
  relatedTo?: CalendarRelatedTo; // was: lead/contact/deal as separate filter params
  relatedId?: string;
  owner?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Event Type Config ─────────────────────────────────────────────────────────
// Unchanged — event types are independent of the relatedId/relatedTo schema.

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; color: string; bgClass: string; textClass: string }
> = {
  meeting: {
    label: "Meeting",
    color: "#60a5fa",
    bgClass: "bg-blue-100 dark:bg-blue-900/40",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  call: {
    label: "Call",
    color: "#34d399",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/40",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  follow_up: {
    label: "Follow-up",
    color: "#a78bfa",
    bgClass: "bg-violet-100 dark:bg-violet-900/40",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  deadline: {
    label: "Deadline",
    color: "#f87171",
    bgClass: "bg-rose-100 dark:bg-rose-900/40",
    textClass: "text-rose-600 dark:text-rose-400",
  },
  demo: {
    label: "Demo",
    color: "#fb923c",
    bgClass: "bg-orange-100 dark:bg-orange-900/40",
    textClass: "text-orange-600 dark:text-orange-400",
  },
  task: {
    label: "Task",
    color: "#facc15",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/40",
    textClass: "text-yellow-600 dark:text-yellow-400",
  },
  other: {
    label: "Other",
    color: "#94a3b8",
    bgClass: "bg-slate-100 dark:bg-slate-800",
    textClass: "text-slate-600 dark:text-slate-400",
  },
};

// ─── Related entity display config (icon + label per type) ────────────────────
// Calendar covers all eight relatedTo types — import icons for the ones added
// beyond what other hooks already declared (Invoice is new here specifically).

import {
  Target,
  ContactIcon,
  Handshake,
  CheckSquare,
  Building2,
  Receipt,
  Users,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";

export const RELATED_TO_DISPLAY: Record<
  CalendarRelatedTo,
  { label: string; icon: LucideIcon }
> = {
  Lead: { label: "Lead", icon: Target },
  Contact: { label: "Contact", icon: ContactIcon },
  Deal: { label: "Deal", icon: Handshake },
  Task: { label: "Task", icon: CheckSquare },
  Company: { label: "Company", icon: Building2 },
  Invoice: { label: "Invoice", icon: Receipt },
  Customer: { label: "Customer", icon: Users },
  Project: { label: "Project", icon: FolderKanban },
};

// ─── Polymorphic relatedId helpers ─────────────────────────────────────────────
// Same unwrapping pattern used across Task/Activity/Contact/Company/Deal/
// Project — one place handles "is this populated or a bare string," everything
// else calls these.

export const getRelatedId = (event: CalendarEvent): string | null => {
  if (!event.relatedId) return null;
  return typeof event.relatedId === "string"
    ? event.relatedId
    : event.relatedId._id;
};

export const getRelatedLabel = (event: CalendarEvent): string | null => {
  if (!event.relatedId || typeof event.relatedId === "string") return null;
  const record = event.relatedId as CalendarRelatedRecord;
  return record.name ?? record.title ?? null;
};

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (filters?: CalendarFilters) =>
    ["calendar", "events", filters ?? {}] as const,
  event: (eventId: string) =>
    ["calendar", "event", eventId] as const,
  upcoming: (params?: { limit?: number; daysAhead?: number }) =>
    ["calendar", "upcoming", params ?? {}] as const,
  stats: () => ["calendar", "stats"] as const,
  // Replaces the old record() key that accepted separate leadId/contactId/dealId
  // — now accepts the same relatedTo/relatedId pair used everywhere else.
  related: (relatedTo: CalendarRelatedTo, relatedId: string) =>
    ["calendar", "related", relatedTo, relatedId] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchEvents = async (
  filters?: CalendarFilters
): Promise<CalendarEventsResponse> => {
  const params = new URLSearchParams();
  if (filters?.from) params.append("from", filters.from);
  if (filters?.to) params.append("to", filters.to);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.relatedId) params.append("relatedId", filters.relatedId);
  if (filters?.owner) params.append("owner", filters.owner);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/calendar${query}`);
  return res.data;
};

const fetchEvent = async (eventId: string): Promise<CalendarEvent> => {
  const res = await apiFetch(`/calendar/${eventId}`);
  return res.data;
};

const fetchUpcomingEvents = async (params?: {
  limit?: number;
  daysAhead?: number;
}): Promise<CalendarEvent[]> => {
  const query = new URLSearchParams();
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.daysAhead) query.append("daysAhead", String(params.daysAhead));
  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await apiFetch(`/calendar/upcoming${qs}`);
  return res.data;
};

const fetchCalendarStats = async (): Promise<CalendarStats> => {
  const res = await apiFetch("/calendar/stats");
  return res.data;
};

// Replaces fetchRecordEvents — accepts relatedTo/relatedId instead of three
// separate leadId/contactId/dealId params, matching the new schema shape.
const fetchRelatedEvents = async (
  relatedTo: CalendarRelatedTo,
  relatedId: string,
  limit?: number
): Promise<CalendarEvent[]> => {
  const query = new URLSearchParams();
  query.append("relatedTo", relatedTo);
  query.append("relatedId", relatedId);
  if (limit) query.append("limit", String(limit));
  const res = await apiFetch(`/calendar?${query.toString()}`);
  // Backend may return paginated or flat array depending on the endpoint
  return res.data?.events ?? res.data;
};

const createEvent = async (
  payload: CreateEventPayload
): Promise<CalendarEvent> => {
  const res = await apiFetch("/calendar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const updateEvent = async (
  eventId: string,
  payload: UpdateEventPayload
): Promise<CalendarEvent> => {
  const res = await apiFetch(`/calendar/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const deleteEvent = async (
  eventId: string,
  scope?: RecurringScope
): Promise<void> => {
  const query = scope ? `?scope=${scope}` : "";
  await apiFetch(`/calendar/${eventId}${query}`, {
    method: "DELETE",
  });
};

const updateAttendeeStatus = async (
  eventId: string,
  status: AttendeeStatus
): Promise<CalendarEvent> => {
  const res = await apiFetch(`/calendar/${eventId}/rsvp`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useCalendarEvents = (
  filters?: CalendarFilters,
  options?: UseQueryOptions<CalendarEventsResponse>
) => {
  return useQuery<CalendarEventsResponse>({
    queryKey: calendarKeys.events(filters),
    queryFn: () => fetchEvents(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useCalendarEvent = (
  eventId: string,
  options?: UseQueryOptions<CalendarEvent>
) => {
  return useQuery<CalendarEvent>({
    queryKey: calendarKeys.event(eventId),
    queryFn: () => fetchEvent(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60,
    ...options,
  });
};

export const useUpcomingEvents = (params?: {
  limit?: number;
  daysAhead?: number;
}) => {
  return useQuery<CalendarEvent[]>({
    queryKey: calendarKeys.upcoming(params),
    queryFn: () => fetchUpcomingEvents(params),
    staleTime: 1000 * 60,
  });
};

export const useCalendarStats = () => {
  return useQuery<CalendarStats>({
    queryKey: calendarKeys.stats(),
    queryFn: fetchCalendarStats,
    staleTime: 1000 * 60 * 5,
  });
};

// Replaces useRecordEvents — accepts relatedTo/relatedId instead of separate
// leadId/contactId/dealId params.
// Usage: useRelatedEvents("Lead", lead._id, { limit: 5 })
//        useRelatedEvents("Deal", deal._id)
//        useRelatedEvents("Project", project._id, { limit: 10 })
export const useRelatedEvents = (
  relatedTo: CalendarRelatedTo,
  relatedId: string,
  options?: { limit?: number }
) => {
  return useQuery<CalendarEvent[]>({
    queryKey: calendarKeys.related(relatedTo, relatedId),
    queryFn: () => fetchRelatedEvents(relatedTo, relatedId, options?.limit),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 60,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });

      // Invalidate the specific related record's event list, if one was set.
      // Both fields are nullable so guard before invalidating.
      const relatedId = getRelatedId(newEvent);
      if (newEvent.relatedTo && relatedId) {
        queryClient.invalidateQueries({
          queryKey: calendarKeys.related(newEvent.relatedTo, relatedId),
        });
      }
    },
  });
};

export const useUpdateEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventPayload) =>
      updateEvent(eventId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<CalendarEvent>(
        calendarKeys.event(eventId),
        updated
      );
      // Broad invalidation — recurring updates can affect multiple events
      // across different date ranges, and relatedTo/relatedId can change as
      // part of an update, so precise cache targeting isn't reliable here.
      queryClient.invalidateQueries({ queryKey: ["calendar", "events"] });
      queryClient.invalidateQueries({ queryKey: calendarKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ["calendar", "related"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      scope,
    }: {
      eventId: string;
      scope?: RecurringScope;
    }) => deleteEvent(eventId, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

export const useUpdateAttendeeStatus = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: AttendeeStatus) =>
      updateAttendeeStatus(eventId, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<CalendarEvent>(
        calendarKeys.event(eventId),
        updated
      );
    },
  });
};

// ─── Utility helpers ───────────────────────────────────────────────────────────

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const groupEventsByDate = (
  events: CalendarEvent[]
): Record<string, CalendarEvent[]> => {
  return events.reduce(
    (acc, event) => {
      const dateKey = event.startAt.slice(0, 10);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    },
    {} as Record<string, CalendarEvent[]>
  );
};