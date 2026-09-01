// app/settings/appearance/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, Check, LayoutGrid, List } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Density = "comfortable" | "compact";

// ─── Theme Preview Card ────────────────────────────────────────────────────────

function ThemePreviewCard({
  value,
  label,
  icon: Icon,
  isActive,
  onClick,
  preview,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isActive: boolean;
  onClick: () => void;
  preview: "light" | "dark" | "system";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 rounded-xl border-2 p-3 transition-all text-left",
        isActive
          ? "border-primary"
          : "border-border hover:border-border/80"
      )}
    >
      {/* Mini preview */}
      <div
        className={cn(
          "relative h-24 rounded-lg overflow-hidden border border-border/50",
          preview === "dark"
            ? "bg-zinc-900"
            : preview === "light"
            ? "bg-white"
            : "bg-gradient-to-br from-white via-white to-zinc-900"
        )}
      >
        {/* Fake sidebar */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-7",
            preview === "dark"
              ? "bg-zinc-800"
              : preview === "light"
              ? "bg-zinc-100"
              : "bg-gradient-to-b from-zinc-100 to-zinc-800"
          )}
        />
        {/* Fake content lines */}
        <div className="absolute left-10 top-3 right-3 flex flex-col gap-1.5">
          <div
            className={cn(
              "h-2 rounded-full w-2/3",
              preview === "dark"
                ? "bg-zinc-700"
                : preview === "light"
                ? "bg-zinc-200"
                : "bg-zinc-400"
            )}
          />
          <div
            className={cn(
              "h-2 rounded-full w-1/2",
              preview === "dark"
                ? "bg-zinc-700"
                : preview === "light"
                ? "bg-zinc-200"
                : "bg-zinc-400"
            )}
          />
          <div
            className={cn(
              "h-6 rounded-md w-full mt-1",
              preview === "dark"
                ? "bg-zinc-800 border border-zinc-700"
                : preview === "light"
                ? "bg-zinc-50 border border-zinc-200"
                : "bg-zinc-200/50 border border-zinc-400/50"
            )}
          />
        </div>

        {/* Active checkmark */}
        {isActive && (
          <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
            <Check size={11} className="text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Label */}
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className={isActive ? "text-primary" : "text-muted-foreground"}
        />
        <span
          className={cn(
            "text-sm font-medium",
            isActive ? "text-primary" : "text-foreground"
          )}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

// ─── Density Card ──────────────────────────────────────────────────────────────

function DensityCard({
  value,
  label,
  description,
  icon: Icon,
  isActive,
  onClick,
}: {
  value: Density;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors flex-1",
        isActive
          ? "border-primary/40 bg-primary/5"
          : "border-border hover:border-border/80 hover:bg-muted/30"
      )}
    >
      <div
        className={cn(
          "size-8 rounded-md flex items-center justify-center shrink-0",
          isActive
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon size={14} />
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <span
          className={cn(
            "text-sm font-medium",
            isActive ? "text-primary" : "text-foreground"
          )}
        >
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      {isActive && (
        <div className="size-4 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <Check size={10} className="text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [density, setDensity] = useState<Density>("comfortable");

  // Avoid hydration mismatch — theme is only known client-side
  useEffect(() => {
    setMounted(true);
    const savedDensity = localStorage.getItem("crm-density") as Density;
    if (savedDensity) setDensity(savedDensity);
  }, []);

  const handleDensityChange = (value: Density) => {
    setDensity(value);
    localStorage.setItem("crm-density", value);
    document.documentElement.setAttribute("data-density", value);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-1" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Appearance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize how InvoiceFlow looks on your device
        </p>
      </div>

      {/* ── Theme ── */}
      <SettingsSection
        title="Theme"
        description="Select how the interface looks. System will match your device settings"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ThemePreviewCard
            value="light"
            label="Light"
            icon={Sun}
            preview="light"
            isActive={theme === "light"}
            onClick={() => setTheme("light")}
          />
          <ThemePreviewCard
            value="dark"
            label="Dark"
            icon={Moon}
            preview="dark"
            isActive={theme === "dark"}
            onClick={() => setTheme("dark")}
          />
          <ThemePreviewCard
            value="system"
            label="System"
            icon={Monitor}
            preview="system"
            isActive={theme === "system"}
            onClick={() => setTheme("system")}
          />
        </div>
      </SettingsSection>

      {/* ── Density ── */}
      <SettingsSection
        title="Density"
        description="Adjust spacing to fit more or less content on screen"
        noBorder
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <DensityCard
            value="comfortable"
            label="Comfortable"
            description="More spacing between elements — easier to scan"
            icon={LayoutGrid}
            isActive={density === "comfortable"}
            onClick={() => handleDensityChange("comfortable")}
          />
          <DensityCard
            value="compact"
            label="Compact"
            description="Tighter spacing — fit more rows per screen"
            icon={List}
            isActive={density === "compact"}
            onClick={() => handleDensityChange("compact")}
          />
        </div>
      </SettingsSection>
    </div>
  );
}