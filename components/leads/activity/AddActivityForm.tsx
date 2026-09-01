// components/leads/activity/AddActivityForm.tsx

import { useState } from "react";
import { useCreateActivity } from "@/hooks/useLeadActivities";
import type { ActivityType, CreateActivityPayload } from "@/hooks/useLeadActivities";
import { activityConfig } from "./ActivityIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AddActivityFormProps {
  leadId: string;
  onSuccess?: () => void;
}

// ─── Type Tabs ─────────────────────────────────────────────────────────────────

const ACTIVITY_TYPES: ActivityType[] = ["note", "call", "email", "meeting"];

// ─── Per-type Field Config ─────────────────────────────────────────────────────

interface FieldConfig {
  showTitle: boolean;
  showBody: boolean;
  showDuration: boolean;
  showScheduledAt: boolean;
  showSubject: boolean;
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
}

const fieldConfig: Record<ActivityType, FieldConfig> = {
  note: {
    showTitle: false,
    showBody: true,
    showDuration: false,
    showScheduledAt: false,
    showSubject: false,
    bodyPlaceholder: "Write a note about this lead...",
  },
  call: {
    showTitle: true,
    showBody: true,
    showDuration: true,
    showScheduledAt: false,
    showSubject: false,
    titlePlaceholder: "Call summary",
    bodyPlaceholder: "What was discussed?",
  },
  email: {
    showTitle: false,
    showBody: true,
    showDuration: false,
    showScheduledAt: false,
    showSubject: true,
    bodyPlaceholder: "Email content or summary...",
  },
  meeting: {
    showTitle: true,
    showBody: true,
    showDuration: false,
    showScheduledAt: true,
    showSubject: false,
    titlePlaceholder: "Meeting agenda or title",
    bodyPlaceholder: "Meeting notes or outcome...",
  },
  status_change: {
    showTitle: false,
    showBody: false,
    showDuration: false,
    showScheduledAt: false,
    showSubject: false,
  },
  task: {
    showTitle: true,
    showBody: true,
    showDuration: false,
    showScheduledAt: false,
    showSubject: false,
    titlePlaceholder: "Task title",
    bodyPlaceholder: "Task details...",
  },
};

// ─── Default Form State ────────────────────────────────────────────────────────

const defaultState = {
  title: "",
  body: "",
  duration: "",
  scheduledAt: "",
  subject: "",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function AddActivityForm({ leadId, onSuccess }: AddActivityFormProps) {
  const [activeType, setActiveType] = useState<ActivityType>("note");
  const [form, setForm] = useState(defaultState);
  const { mutate: createActivity, isPending } = useCreateActivity(leadId);

  const fields = fieldConfig[activeType];

  const handleTypeChange = (type: ActivityType) => {
    setActiveType(type);
    setForm(defaultState);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isSubmittable = () => {
    if (fields.showTitle && fields.showBody) {
      return form.title.trim() || form.body.trim();
    }
    if (fields.showBody) return form.body.trim();
    if (fields.showTitle) return form.title.trim();
    return false;
  };

  const handleSubmit = () => {
    if (!isSubmittable() || isPending) return;

    const payload: CreateActivityPayload = { type: activeType };

    if (fields.showTitle && form.title.trim()) {
      payload.title = form.title.trim();
    }
    if (fields.showBody && form.body.trim()) {
      payload.body = form.body.trim();
    }
    if (fields.showDuration && form.duration) {
      payload.duration = Number(form.duration);
    }
    if (fields.showScheduledAt && form.scheduledAt) {
      payload.scheduledAt = new Date(form.scheduledAt).toISOString();
    }
    if (fields.showSubject && form.subject.trim()) {
      payload.subject = form.subject.trim();
    }

    createActivity(payload, {
      onSuccess: () => {
        setForm(defaultState);
        onSuccess?.();
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* ── Type selector ── */}
      <div className="flex items-center gap-1">
        {ACTIVITY_TYPES.map((type) => {
          const config = activityConfig[type];
          const Icon = config.icon;
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                isActive
                  ? cn(
                      "text-foreground bg-muted ring-1",
                      config.ringClass
                    )
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon
                size={12}
                className={isActive ? config.iconClass : undefined}
              />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-border" />

      {/* ── Dynamic fields ── */}
      <div className="space-y-2.5">
        {/* Subject — email only */}
        {fields.showSubject && (
          <div className="space-y-1">
            <Label htmlFor="subject" className="text-xs">
              Subject
            </Label>
            <Input
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Email subject line"
              className="h-8 text-sm"
              disabled={isPending}
            />
          </div>
        )}

        {/* Title — call / meeting / task */}
        {fields.showTitle && (
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={fields.titlePlaceholder}
              className="h-8 text-sm"
              disabled={isPending}
            />
          </div>
        )}

        {/* Scheduled at — meeting only */}
        {fields.showScheduledAt && (
          <div className="space-y-1">
            <Label htmlFor="scheduledAt" className="text-xs">
              Scheduled date & time
            </Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={handleChange}
              className="h-8 text-sm"
              disabled={isPending}
            />
          </div>
        )}

        {/* Body — all types */}
        {fields.showBody && (
          <Textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={fields.bodyPlaceholder}
            rows={3}
            className="text-sm resize-none"
            disabled={isPending}
          />
        )}

        {/* Duration — call only */}
        {fields.showDuration && (
          <div className="space-y-1">
            <Label htmlFor="duration" className="text-xs">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min={0}
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 15"
              className="h-8 text-sm w-32"
              disabled={isPending}
            />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-muted-foreground">
          <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
            ⌘ Enter
          </kbd>
          {" "}to submit
        </p>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!isSubmittable() || isPending}
          className="h-7 px-3 text-xs"
        >
          {isPending ? "Saving..." : `Log ${activityConfig[activeType].label}`}
        </Button>
      </div>
    </div>
  );
}