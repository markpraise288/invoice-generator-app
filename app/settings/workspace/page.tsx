// app/settings/workspace/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateWorkspace } from "@/hooks/useSettings";
import type { CompanySize, DateFormat } from "@/hooks/useSettings";
import {
  SettingsSection,
  SettingsRow,
  SettingsForm,
  useSettingsFeedback,
} from "@/components/settings/SettingsSection";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Camera, Building2 } from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const COMPANY_SIZES: CompanySize[] = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Marketing",
  "Legal",
  "Real Estate",
  "Other",
];

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "CAD", label: "Canadian Dollar (CA$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "AED", label: "UAE Dirham (د.إ)" },
];

const DATE_FORMATS: { value: DateFormat; label: string; example: string }[] =
  [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "12/31/2026" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "31/12/2026" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-12-31" },
  ];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Select wrapper ────────────────────────────────────────────────────────────

function SettingsSelect({
  id,
  name,
  value,
  onChange,
  children,
  disabled,
  className,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        "h-9 max-w-sm rounded-md border border-input bg-background px-3",
        "text-sm focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:opacity-50",
        className
      )}
    >
      {children}
    </select>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-xl" />
        <Skeleton className="h-9 w-40" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="grid grid-cols-[1fr_1.5fr] gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full max-w-sm" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function WorkspaceSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateWorkspace, isPending } = useUpdateWorkspace();
  const feedback = useSettingsFeedback();

  const [form, setForm] = useState({
    _id: "",
    name: "",
    logo: "",
    website: "",
    industry: "",
    size: "" as CompanySize | "",
    timezone: "UTC",
    currency: "USD",
    dateFormat: "MM/DD/YYYY" as DateFormat,
    fiscalYearStart: 1,
  });

  useEffect(() => {
    if (settings?.workspaceId) {
      const w = settings.workspaceId;
      setForm({
        _id: w._id,
        name: w.name ?? "",
        logo: w.logo ?? "",
        website: w.website ?? "",
        industry: w.industry ?? "",
        size: w.size ?? "",
        timezone: w.timezone ?? "UTC",
        currency: w.currency ?? "USD",
        dateFormat: w.dateFormat ?? "MM/DD/YYYY",
        fiscalYearStart: w.fiscalYearStart ?? 1,
      });
    }
  }, [settings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "fiscalYearStart" ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    feedback.reset();
    updateWorkspace(
      {
        workspace: {
          ...form,
          size: form.size || undefined,
        },
      },
      {
        onSuccess: () => feedback.onSuccess(),
        onError: (err: any) =>
          feedback.onError(
            err?.message ?? "Failed to update workspace settings"
          ),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 mb-8">
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-64 mb-8" />
        <WorkspaceSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace identity and regional preferences
        </p>
      </div>

      <SettingsForm
        onSubmit={handleSave}
        isPending={isPending}
        isSuccess={feedback.isSuccess}
        error={feedback.error}
      >
        {/* ── Identity ── */}
        <SettingsSection title="Workspace identity">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative group">
              {form.logo ? (
                <img
                  src={form.logo}
                  alt="Workspace logo"
                  className="size-14 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 size={22} className="text-primary" />
                </div>
              )}
              <div className="absolute inset-0 size-14 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera size={15} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {form.name || "Your workspace"}
              </span>
              <span className="text-xs text-muted-foreground">
                Click the logo to upload a new image
              </span>
            </div>
          </div>

          <SettingsRow label="Workspace name" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Acme Inc"
              className="h-9 max-w-sm"
              disabled={isPending}
            />
          </SettingsRow>

          <SettingsRow label="Website" htmlFor="website">
            <Input
              id="website"
              name="website"
              type="url"
              value={form.website}
              onChange={handleChange}
              placeholder="https://acme.com"
              className="h-9 max-w-sm"
              disabled={isPending}
            />
          </SettingsRow>

          <SettingsRow label="Industry" htmlFor="industry">
            <SettingsSelect
              id="industry"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              disabled={isPending}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </SettingsSelect>
          </SettingsRow>

          <SettingsRow label="Company size" htmlFor="size">
            <SettingsSelect
              id="size"
              name="size"
              value={form.size}
              onChange={handleChange}
              disabled={isPending}
            >
              <option value="">Select size</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </SettingsSelect>
          </SettingsRow>
        </SettingsSection>

        {/* ── Regional ── */}
        <SettingsSection
          title="Regional preferences"
          description="These settings affect how dates, currency, and time are displayed across the CRM"
        >
          <SettingsRow
            label="Default currency"
            description="Used for deal values and revenue reports"
            htmlFor="currency"
          >
            <SettingsSelect
              id="currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              disabled={isPending}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </SettingsSelect>
          </SettingsRow>

          <SettingsRow label="Date format" htmlFor="dateFormat">
            <div className="flex flex-col gap-1.5 max-w-sm">
              <SettingsSelect
                id="dateFormat"
                name="dateFormat"
                value={form.dateFormat}
                onChange={handleChange}
                disabled={isPending}
                className="max-w-none"
              >
                {DATE_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </SettingsSelect>
              <span className="text-[11px] text-muted-foreground">
                Example:{" "}
                {
                  DATE_FORMATS.find((f) => f.value === form.dateFormat)
                    ?.example
                }
              </span>
            </div>
          </SettingsRow>

          <SettingsRow
            label="Fiscal year start"
            description="Aligns revenue reports to your fiscal calendar"
            htmlFor="fiscalYearStart"
          >
            <SettingsSelect
              id="fiscalYearStart"
              name="fiscalYearStart"
              value={String(form.fiscalYearStart)}
              onChange={handleChange}
              disabled={isPending}
            >
              {MONTHS.map((month, i) => (
                <option key={month} value={i + 1}>
                  {month}
                </option>
              ))}
            </SettingsSelect>
          </SettingsRow>
        </SettingsSection>
      </SettingsForm>
    </div>
  );
}