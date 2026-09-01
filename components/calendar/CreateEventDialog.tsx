// components/calendar/CreateEventDialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import {
  useCreateEvent,
  EVENT_TYPE_CONFIG,
  RELATED_TO_DISPLAY,
} from "@/hooks/useCalendar";
import type {
  EventType,
  CreateEventPayload,
  EventRecurrence,
  RecurrenceFrequency,
  CalendarRelatedTo,
} from "@/hooks/useCalendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  RotateCcw,
  Bell,
  ChevronDown,
  X,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Related entity search endpoints ───────────────────────────────────────────
// One entry per type in CalendarRelatedTo — Invoice/Task included since
// Calendar's enum is wider than any other model's.

const RELATED_SEARCH_ENDPOINT: Record<CalendarRelatedTo, string> = {
  Lead: "/leads",
  Contact: "/contacts",
  Deal: "/deals",
  Task: "/tasks",
  Company: "/companies",
  Invoice: "/invoices",
  Customer: "/customers",
  Project: "/projects",
};

const relatedToTypes = Object.keys(RELATED_TO_DISPLAY) as CalendarRelatedTo[];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  defaultHour?: number;
  defaultType?: EventType;
  defaultRelatedId?: string; // fixed context — e.g. opened from a Lead's/Deal's own page
  defaultRelatedTo?: CalendarRelatedTo;
  defaultRelatedLabel?: string; // display name for the locked chip
  onSuccess?: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const toDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getDefaultForm = (
  defaultDate?: Date,
  defaultHour?: number,
  defaultType?: EventType
) => {
  const start = defaultDate ? new Date(defaultDate) : new Date();
  if (defaultHour !== undefined) {
    start.setHours(defaultHour, 0, 0, 0);
  } else {
    const mins = start.getMinutes();
    if (mins < 30) start.setMinutes(30, 0, 0);
    else {
      start.setHours(start.getHours() + 1, 0, 0, 0);
    }
  }

  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  return {
    title: "",
    description: "",
    type: (defaultType ?? "meeting") as EventType,
    startAt: toDatetimeLocal(start),
    endAt: toDatetimeLocal(end),
    allDay: false,
    location: "",
    meetingUrl: "",
    color: EVENT_TYPE_CONFIG[defaultType ?? "meeting"].color,
  };
};

// ─── Field Error ────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle size={11} />
      {message}
    </span>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-border">
      <Icon size={13} className="text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// ─── Type Selector (event type — meeting/call/etc, unrelated to relatedTo) ─────

function TypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: EventType;
  onChange: (type: EventType) => void;
  disabled?: boolean;
}) {
  const config = EVENT_TYPE_CONFIG[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-9 gap-2 justify-start"
          style={{ borderColor: `${config.color}40`, color: config.color }}
        >
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: config.color }}
          />
          {config.label}
          <ChevronDown size={12} className="ml-auto opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        {(Object.entries(EVENT_TYPE_CONFIG) as [EventType, typeof EVENT_TYPE_CONFIG[EventType]][]).map(
          ([type, conf]) => (
            <DropdownMenuItem
              key={type}
              onClick={() => onChange(type)}
              className={cn("gap-2 text-xs", type === value && "bg-muted")}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: conf.color }}
              />
              {conf.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Recurrence Selector ────────────────────────────────────────────────────────

function RecurrenceSelector({
  value,
  onChange,
  disabled,
}: {
  value: EventRecurrence | undefined;
  onChange: (r: EventRecurrence | undefined) => void;
  disabled?: boolean;
}) {
  const FREQ_OPTIONS: { label: string; value: RecurrenceFrequency | "none" }[] =
    [
      { label: "Does not repeat", value: "none" },
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
      { label: "Yearly", value: "yearly" },
    ];

  const current = value?.frequency ?? "none";
  const currentLabel =
    FREQ_OPTIONS.find((o) => o.value === current)?.label ?? "Does not repeat";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-9 gap-2 justify-start w-full",
            value && "border-primary/40 text-primary"
          )}
        >
          <RotateCcw size={13} />
          {currentLabel}
          <ChevronDown size={12} className="ml-auto opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {FREQ_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() =>
              onChange(
                opt.value === "none"
                  ? undefined
                  : { frequency: opt.value as RecurrenceFrequency, interval: 1 }
              )
            }
            className={cn(
              "text-xs",
              current === opt.value && "bg-muted"
            )}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Reminder Selector ──────────────────────────────────────────────────────────

const REMINDER_OPTIONS = [
  { label: "5 minutes before", minutes: 5 },
  { label: "15 minutes before", minutes: 15 },
  { label: "30 minutes before", minutes: 30 },
  { label: "1 hour before", minutes: 60 },
  { label: "1 day before", minutes: 1440 },
];

function ReminderSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}) {
  const label =
    REMINDER_OPTIONS.find((o) => o.minutes === value)?.label ??
    `${value} minutes before`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-9 gap-2 justify-start"
        >
          <Bell size={13} />
          {label}
          <ChevronDown size={12} className="ml-auto opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {REMINDER_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.minutes}
            onClick={() => onChange(opt.minutes)}
            className={cn("text-xs", value === opt.minutes && "bg-muted")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Related record search combobox ────────────────────────────────────────────
// Same pattern used across every polymorphic dialog this session — one
// component driven by a type→endpoint map, now covering 8 possible types.

function RelatedRecordSearch({
  relatedTo,
  selected,
  onSelect,
  onClear,
  disabled,
}: {
  relatedTo: CalendarRelatedTo;
  selected: { _id: string; name: string } | null;
  onSelect: (record: { _id: string; name: string }) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [q, setQ] = useState("");
  const endpoint = RELATED_SEARCH_ENDPOINT[relatedTo];
  const label = RELATED_TO_DISPLAY[relatedTo].label;
  const Icon = RELATED_TO_DISPLAY[relatedTo].icon;

  const { data: results, isLoading } = useQuery({
    queryKey: [endpoint, "calendar-link-search", q],
    queryFn: async () => {
      const res = await apiFetch(`${endpoint}?search=${encodeURIComponent(q)}&limit=10`);
      const key = Object.keys(res.data || {}).find((k) => Array.isArray(res.data[k]));
      return (key ? res.data[key] : res.data ?? []) as any[];
    },
    enabled: q.length >= 1,
  });

  if (selected) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/40 h-9">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={13} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{selected.name}</span>
        </div>
        <button
          onClick={onClear}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search
        size={13}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}s...`}
        className="pl-8 h-9 text-sm"
        disabled={disabled}
      />
      {q.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          ) : !results || results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No {label.toLowerCase()}s found
            </p>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {results.map((record: any) => {
                const recordLabel = record.name ?? record.title ?? record._id;
                return (
                  <button
                    key={record._id}
                    onClick={() => {
                      onSelect({ _id: record._id, name: recordLabel });
                      setQ("");
                    }}
                    className="w-full flex flex-col px-3 py-2 text-left hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{recordLabel}</span>
                    {(record.email || record.domain) && (
                      <span className="text-xs text-muted-foreground">
                        {record.email || record.domain}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function CreateEventDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultHour,
  defaultType,
  defaultRelatedId,
  defaultRelatedTo,
  defaultRelatedLabel,
  onSuccess,
}: CreateEventDialogProps) {
  const isFixedContext = !!defaultRelatedId && !!defaultRelatedTo;

  const [form, setForm] = useState(() =>
    getDefaultForm(defaultDate, defaultHour, defaultType)
  );
  const [recurrence, setRecurrence] = useState<EventRecurrence | undefined>();
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Picker-mode state — an event can link to at most ONE record now (not a
  // Contact AND a Company simultaneously, as the old CrmLinkSearch allowed).
  const [pickerType, setPickerType] = useState<CalendarRelatedTo>(
    defaultRelatedTo ?? "Contact"
  );
  const [pickerRecord, setPickerRecord] = useState<{ _id: string; name: string } | null>(
    null
  );

  const { mutate: createEvent, isPending } = useCreateEvent();

  useEffect(() => {
    if (open) {
      setForm(getDefaultForm(defaultDate, defaultHour, defaultType));
      setRecurrence(undefined);
      setReminderMinutes(15);
      setErrors({});
      setPickerType(defaultRelatedTo ?? "Contact");
      setPickerRecord(null);
    }
  }, [open, defaultDate, defaultHour, defaultType, defaultRelatedTo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleTypeChange = (type: EventType) => {
    setForm((prev) => ({
      ...prev,
      type,
      color: EVENT_TYPE_CONFIG[type].color,
    }));
  };

  const handlePickerTypeChange = (type: CalendarRelatedTo) => {
    setPickerType(type);
    setPickerRecord(null); // switching type invalidates whatever record was picked
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.startAt) next.startAt = "Start time is required";
    if (!form.endAt) next.endAt = "End time is required";
    if (
      form.startAt &&
      form.endAt &&
      new Date(form.endAt) <= new Date(form.startAt)
    ) {
      next.endAt = "End time must be after start time";
    }
    // No requirement that a related record be picked — relatedId/relatedTo
    // are both nullable per schema, so an unlinked event is valid.
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isPending) return;

    const payload: CreateEventPayload = {
      title: form.title.trim(),
      type: form.type,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      allDay: form.allDay,
      color: form.color,
      reminders: [{ method: "notification", minutesBefore: reminderMinutes }],
    };

    if (form.description.trim()) payload.description = form.description.trim();
    if (form.location.trim()) payload.location = form.location.trim();
    if (form.meetingUrl.trim()) payload.meetingUrl = form.meetingUrl.trim();
    if (recurrence) payload.recurrence = recurrence;

    if (isFixedContext) {
      payload.relatedId = defaultRelatedId!;
      payload.relatedTo = defaultRelatedTo!;
    } else if (pickerRecord) {
      payload.relatedId = pickerRecord._id;
      payload.relatedTo = pickerType;
    }

    createEvent(payload, {
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const fixedDisplay = defaultRelatedTo ? RELATED_TO_DISPLAY[defaultRelatedTo] : null;
  const FixedIcon = fixedDisplay?.icon ?? Users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar size={16} className="text-primary" />
            New event
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* ── Title + Type ── */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Event title"
                className={cn(
                  "h-10 text-base font-medium",
                  errors.title &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isPending}
                autoFocus
              />
              <FieldError message={errors.title} />
            </div>
            <TypeSelector
              value={form.type}
              onChange={handleTypeChange}
              disabled={isPending}
            />
          </div>

          {/* ── Time ── */}
          <div className="flex flex-col gap-2">
            <SectionHeader icon={Clock} label="Time" />

            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                name="allDay"
                checked={form.allDay}
                onChange={handleChange}
                className="rounded border-border"
                disabled={isPending}
              />
              <span className="text-sm text-foreground">All day</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Start</Label>
                <Input
                  name="startAt"
                  type={form.allDay ? "date" : "datetime-local"}
                  value={
                    form.allDay
                      ? form.startAt.slice(0, 10)
                      : form.startAt
                  }
                  onChange={handleChange}
                  className={cn(
                    "h-9 text-sm",
                    errors.startAt &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isPending}
                />
                <FieldError message={errors.startAt} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">End</Label>
                <Input
                  name="endAt"
                  type={form.allDay ? "date" : "datetime-local"}
                  value={
                    form.allDay ? form.endAt.slice(0, 10) : form.endAt
                  }
                  onChange={handleChange}
                  className={cn(
                    "h-9 text-sm",
                    errors.endAt &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isPending}
                />
                <FieldError message={errors.endAt} />
              </div>
            </div>

            <RecurrenceSelector
              value={recurrence}
              onChange={setRecurrence}
              disabled={isPending}
            />
          </div>

          {/* ── Location ── */}
          <div className="flex flex-col gap-2">
            <SectionHeader icon={MapPin} label="Location" />
            <Input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Add location"
              className="h-9 text-sm"
              disabled={isPending}
            />
            <div className="relative">
              <Video
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                name="meetingUrl"
                value={form.meetingUrl}
                onChange={handleChange}
                placeholder="Meeting URL (https://...)"
                className="h-9 text-sm pl-8"
                disabled={isPending}
              />
            </div>
          </div>

          {/* ── Description ── */}
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add description..."
            rows={2}
            className="resize-none text-sm"
            disabled={isPending}
          />

          {/* ── Reminder ── */}
          <div className="flex flex-col gap-2">
            <SectionHeader icon={Bell} label="Reminder" />
            <ReminderSelector
              value={reminderMinutes}
              onChange={setReminderMinutes}
              disabled={isPending}
            />
          </div>

          {/* ── Linked record: locked chip OR type + record picker ──
              Optional — relatedId/relatedTo are both nullable, so an event
              can be created with nothing linked at all. */}
          {isFixedContext ? (
            <div className="flex flex-col gap-2">
              <SectionHeader icon={Users} label="Linked to" />
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40 h-9">
                <FixedIcon size={13} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">
                  {defaultRelatedLabel || defaultRelatedId}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <SectionHeader icon={Users} label="Link to CRM (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={pickerType}
                  onValueChange={(v) => handlePickerTypeChange(v as CalendarRelatedTo)}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {relatedToTypes.map((type) => {
                      const Icon = RELATED_TO_DISPLAY[type].icon;
                      return (
                        <SelectItem key={type} value={type}>
                          <span className="flex items-center gap-2">
                            <Icon size={13} className="text-muted-foreground" />
                            {RELATED_TO_DISPLAY[type].label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <RelatedRecordSearch
                  relatedTo={pickerType}
                  selected={pickerRecord}
                  onSelect={setPickerRecord}
                  onClear={() => setPickerRecord(null)}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center gap-1 mr-auto">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">⌘</kbd>
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">↵</kbd>
            <span className="text-[11px] text-muted-foreground ml-0.5">to save</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                Creating...
              </>
            ) : (
              "Create event"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}