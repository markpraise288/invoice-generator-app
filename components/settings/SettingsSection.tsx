// components/settings/SettingsSection.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
}

interface SettingsFormProps {
  onSubmit: () => void | Promise<void>;
  isPending?: boolean;
  isSuccess?: boolean;
  error?: string | null;
  submitLabel?: string;
  successLabel?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface SaveBarProps {
  isPending: boolean;
  isSuccess: boolean;
  error?: string | null;
  onSave: () => void;
  submitLabel?: string;
  successLabel?: string;
  disabled?: boolean;
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// ─── Settings Section ──────────────────────────────────────────────────────────

export function SettingsSection({
  title,
  description,
  children,
  className,
  noBorder = false,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        !noBorder && "pb-8 border-b border-border last:border-0 last:pb-0",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// ─── Settings Row ──────────────────────────────────────────────────────────────

export function SettingsRow({
  label,
  description,
  children,
  className,
  htmlFor,
  required,
  error,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.5fr] sm:gap-6 items-start",
        className
      )}
    >
      <div className="flex flex-col gap-0.5 pt-0.5">
        <label
          htmlFor={htmlFor}
          className={cn(
            "text-sm font-medium text-foreground",
            htmlFor && "cursor-pointer"
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-0.5">*</span>
          )}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {error && (
          <span className="inline-flex items-center gap-1 text-xs text-destructive mt-1">
            <AlertCircle size={11} />
            {error}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

// ─── Save Bar ──────────────────────────────────────────────────────────────────

export function SaveBar({
  isPending,
  isSuccess,
  error,
  onSave,
  submitLabel = "Save changes",
  successLabel = "Saved",
  disabled = false,
}: SaveBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4 mt-2 border-t border-border">
      <div className="flex items-center gap-2 min-h-[20px]">
        {isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 size={13} className="animate-spin" />
            Saving...
          </span>
        )}
        {isSuccess && !isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={13} />
            {successLabel}
          </span>
        )}
        {error && !isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle size={13} />
            {error}
          </span>
        )}
      </div>
      <Button
        size="sm"
        onClick={onSave}
        disabled={isPending || disabled}
        className="shrink-0 gap-1.5"
      >
        {isPending ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Saving...
          </>
        ) : isSuccess && !error ? (
          <>
            <CheckCircle2 size={13} />
            {successLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}

// ─── Settings Form ─────────────────────────────────────────────────────────────

export function SettingsForm({
  onSubmit,
  isPending = false,
  isSuccess = false,
  error,
  submitLabel = "Save changes",
  successLabel = "Saved",
  children,
  className,
  disabled = false,
}: SettingsFormProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {children}
      <SaveBar
        isPending={isPending}
        isSuccess={isSuccess}
        error={error}
        onSave={onSubmit}
        submitLabel={submitLabel}
        successLabel={successLabel}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Toggle Row ────────────────────────────────────────────────────────────────

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </span>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full",
          "transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-4 rounded-full",
            "bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

// ─── Feedback Hook ─────────────────────────────────────────────────────────────
// Utility hook for managing save/success/error state in settings forms

export function useSettingsFeedback(duration = 3000) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSuccess = () => {
    setError(null);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), duration);
  };

  const onError = (message: string) => {
    setIsSuccess(false);
    setError(message);
  };

  const reset = () => {
    setIsSuccess(false);
    setError(null);
  };

  return { isSuccess, error, onSuccess, onError, reset };
}