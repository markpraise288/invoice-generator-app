// app/settings/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/useSettings";
import {
  SettingsSection,
  SettingsRow,
  SettingsForm,
  useSettingsFeedback,
} from "@/components/settings/SettingsSection";
import { ProfileAvatar } from "@/components/settings/SettingsSideBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Camera,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─── Timezone options (common subset) ──────────────────────────────────────────

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

// ─── Password Strength Indicator ───────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /\d/.test(password) },
  ];

  const validCount = checks.filter((c) => c.valid).length;

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < validCount
                ? validCount === 4
                  ? "bg-emerald-500"
                  : validCount >= 2
                  ? "bg-amber-500"
                  : "bg-rose-500"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((check) => (
          <span
            key={check.label}
            className={cn(
              "text-[11px] inline-flex items-center gap-1",
              check.valid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          >
            <CheckCircle2
              size={10}
              className={check.valid ? "opacity-100" : "opacity-30"}
            />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Skeleton ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-[1fr_1.5fr] gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSavingProfile } =
    useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();

  // ── Profile form state ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    timezone: "UTC",
    avatar: "",
  });

  const profileFeedback = useSettingsFeedback();

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        position: profile.position ?? "",
        timezone: profile.timezone ?? "UTC",
        avatar: profile.avatar ?? "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    profileFeedback.reset();
    updateProfile(form, {
      onSuccess: () => profileFeedback.onSuccess(),
      onError: (err: any) =>
        profileFeedback.onError(
          err?.message ?? "Failed to update profile"
        ),
    });
  };

  // ── Password form state ──────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const passwordFeedback = useSettingsFeedback();

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const passwordsMatch =
    !passwordForm.confirmPassword ||
    passwordForm.newPassword === passwordForm.confirmPassword;

  const canSubmitPassword =
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length >= 8 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  const handleSavePassword = () => {
    passwordFeedback.reset();
    changePassword(passwordForm, {
      onSuccess: () => {
        passwordFeedback.onSuccess();
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      onError: (err: any) =>
        passwordFeedback.onError(
          err?.message ?? "Failed to change password"
        ),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 mb-8">
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-64 mb-8" />
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and account settings
        </p>
      </div>

      {/* ── Avatar + basic info ── */}
      <SettingsSection
        title="Personal information"
        description="This information may be visible to other team members"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="relative group">
            <ProfileAvatar
              name={form.name || "?"}
              avatar={form.avatar}
              size="md"
            />
            <div className="absolute inset-0 size-9 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera size={13} className="text-white" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {form.name || "Your name"}
            </span>
            <span className="text-xs text-muted-foreground">
              {form.email}
            </span>
          </div>
        </div>

        <SettingsForm
          onSubmit={handleSaveProfile}
          isPending={isSavingProfile}
          isSuccess={profileFeedback.isSuccess}
          error={profileFeedback.error}
        >
          <SettingsRow
            label="Full name"
            htmlFor="name"
            required
          >
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="h-9 max-w-sm"
              disabled={isSavingProfile}
            />
          </SettingsRow>

          <SettingsRow
            label="Email address"
            description="Used for login and notifications"
            htmlFor="email"
            required
          >
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@company.com"
              className="h-9 max-w-sm"
              disabled={isSavingProfile}
            />
          </SettingsRow>

          <SettingsRow
            label="Job title"
            htmlFor="position"
          >
            <Input
              id="position"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Sales Manager"
              className="h-9 max-w-sm"
              disabled={isSavingProfile}
            />
          </SettingsRow>

          <SettingsRow
            label="Phone number"
            htmlFor="phone"
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="h-9 max-w-sm"
              disabled={isSavingProfile}
            />
          </SettingsRow>

          <SettingsRow
            label="Timezone"
            description="Used to display dates and times"
            htmlFor="timezone"
          >
            <select
              id="timezone"
              name="timezone"
              value={form.timezone}
              onChange={handleChange}
              disabled={isSavingProfile}
              className={cn(
                "h-9 max-w-sm rounded-md border border-input bg-background px-3",
                "text-sm focus:outline-none focus:ring-1 focus:ring-ring",
                "disabled:opacity-50"
              )}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </option>
              ))}
            </select>
          </SettingsRow>
        </SettingsForm>
      </SettingsSection>

      {/* ── Password ── */}
      <SettingsSection
        title="Password"
        description="Change your password to keep your account secure"
        noBorder
      >
        <SettingsForm
          onSubmit={handleSavePassword}
          isPending={isChangingPassword}
          isSuccess={passwordFeedback.isSuccess}
          error={passwordFeedback.error}
          submitLabel="Update password"
          successLabel="Password updated"
          disabled={!canSubmitPassword}
        >
          <SettingsRow
            label="Current password"
            htmlFor="currentPassword"
            required
          >
            <div className="relative max-w-sm">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="h-9 pr-9"
                disabled={isChangingPassword}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </SettingsRow>

          <SettingsRow
            label="New password"
            htmlFor="newPassword"
            required
          >
            <div className="max-w-sm">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="h-9"
                disabled={isChangingPassword}
                autoComplete="new-password"
              />
              <PasswordStrength password={passwordForm.newPassword} />
            </div>
          </SettingsRow>

          <SettingsRow
            label="Confirm new password"
            htmlFor="confirmPassword"
            required
            error={
              !passwordsMatch ? "Passwords do not match" : undefined
            }
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className={cn(
                "h-9 max-w-sm",
                !passwordsMatch &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isChangingPassword}
              autoComplete="new-password"
            />
          </SettingsRow>
        </SettingsForm>
      </SettingsSection>
    </div>
  );
}