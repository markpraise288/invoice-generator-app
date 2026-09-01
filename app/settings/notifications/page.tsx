// app/settings/notifications/page.tsx

"use client";

import { useState, useEffect } from "react";
import {
  useSettings,
  useUpdateNotifications,
} from "@/hooks/useSettings";
import type { EmailDigest, NotificationSettings } from "@/hooks/useSettings";
import {
  SettingsSection,
  ToggleRow,
  SaveBar,
  useSettingsFeedback,
} from "@/components/settings/SettingsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  Trophy,
  XCircle,
  Clock,
  AlertTriangle,
  AtSign,
  Mail,
} from "lucide-react";

// ─── Notification Item Config ──────────────────────────────────────────────────

const NOTIFICATION_ITEMS: {
  key: keyof NotificationSettings;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    key: "emailOnLeadAssigned",
    label: "Lead assigned to you",
    description: "Get notified when a lead is assigned to you",
    icon: UserPlus,
  },
  {
    key: "emailOnDealWon",
    label: "Deal won",
    description: "Get notified when a deal you own is marked as won",
    icon: Trophy,
  },
  {
    key: "emailOnDealLost",
    label: "Deal lost",
    description: "Get notified when a deal you own is marked as lost",
    icon: XCircle,
  },
  {
    key: "emailOnTaskDue",
    label: "Task due soon",
    description: "Get notified when one of your tasks is due within 24 hours",
    icon: Clock,
  },
  {
    key: "emailOnTaskOverdue",
    label: "Task overdue",
    description: "Get notified when one of your tasks becomes overdue",
    icon: AlertTriangle,
  },
  {
    key: "emailOnMentioned",
    label: "Mentioned in a note",
    description: "Get notified when someone mentions you in an activity or note",
    icon: AtSign,
  },
];

// ─── Digest Options ────────────────────────────────────────────────────────────

const DIGEST_OPTIONS: { value: EmailDigest; label: string; description: string }[] =
  [
    {
      value: "never",
      label: "Never",
      description: "Don't send me a summary email",
    },
    {
      value: "daily",
      label: "Daily",
      description: "Send a summary every morning",
    },
    {
      value: "weekly",
      label: "Weekly",
      description: "Send a summary every Monday",
    },
  ];

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-border last:border-0"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NotificationsSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateNotifications, isPending } =
    useUpdateNotifications();
  const feedback = useSettingsFeedback();

  const [prefs, setPrefs] = useState<NotificationSettings>({
    emailOnLeadAssigned: true,
    emailOnDealWon: true,
    emailOnDealLost: false,
    emailOnTaskDue: true,
    emailOnTaskOverdue: true,
    emailOnMentioned: true,
    emailDigest: "daily",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.notifications) {
      setPrefs(settings.notifications);
    }
  }, [settings]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleDigestChange = (digest: EmailDigest) => {
    setPrefs((prev) => ({ ...prev, emailDigest: digest }));
    setHasChanges(true);
  };

  const handleSave = () => {
    feedback.reset();
    updateNotifications(
      { notifications: prefs },
      {
        onSuccess: () => {
          feedback.onSuccess();
          setHasChanges(false);
        },
        onError: (err: any) =>
          feedback.onError(
            err?.message ?? "Failed to update notification settings"
          ),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 mb-8">
        <Skeleton className="h-6 w-40 mb-1" />
        <Skeleton className="h-4 w-64 mb-8" />
        <NotificationsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose what you want to be notified about by email
        </p>
      </div>

      {/* ── Email notifications ── */}
      <SettingsSection
        title="Email notifications"
        description="These notifications are sent to your account email address"
      >
        <div className="flex flex-col">
          {NOTIFICATION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </span>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={prefs[item.key] as boolean}
                  onClick={() => handleToggle(item.key)}
                  disabled={isPending}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full mt-1",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:opacity-50",
                    prefs[item.key] ? "bg-primary" : "bg-input"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block size-4 rounded-full",
                      "bg-white shadow-sm transition-transform",
                      prefs[item.key] ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      {/* ── Digest ── */}
      <SettingsSection
        title="Summary emails"
        description="Receive a digest of your CRM activity"
        noBorder
      >
        <div className="flex flex-col gap-2">
          {DIGEST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleDigestChange(opt.value)}
              disabled={isPending}
              className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
                "disabled:opacity-50",
                prefs.emailDigest === opt.value
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-border/80 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-md flex items-center justify-center shrink-0",
                  prefs.emailDigest === opt.value
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Mail size={14} />
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    prefs.emailDigest === opt.value
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {opt.description}
                </span>
              </div>
              <div
                className={cn(
                  "size-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center",
                  prefs.emailDigest === opt.value
                    ? "border-primary"
                    : "border-border"
                )}
              >
                {prefs.emailDigest === opt.value && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>

        <SaveBar
          isPending={isPending}
          isSuccess={feedback.isSuccess}
          error={feedback.error}
          onSave={handleSave}
          disabled={!hasChanges}
        />
      </SettingsSection>
    </div>
  );
}