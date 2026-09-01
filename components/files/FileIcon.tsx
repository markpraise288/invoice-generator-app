// components/files/FileIcon.tsx

"use client";

import { cn } from "@/lib/utils";
import { getFileTypeGroup } from "@/hooks/useFiles";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Presentation,
  File as FileGeneric,
} from "lucide-react";

// ─── Type → visual config ──────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconClass: string;
    bgClass: string;
  }
> = {
  document: {
    icon: FileText,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
  },
  presentation: {
    icon: Presentation,
    iconClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
  },
  image: {
    icon: FileImage,
    iconClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
  },
  archive: {
    icon: FileArchive,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  other: {
    icon: FileGeneric,
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
};

// ─── Sizes ─────────────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: { wrapper: "size-7 rounded-md", icon: 13 },
  md: { wrapper: "size-9 rounded-lg", icon: 16 },
  lg: { wrapper: "size-12 rounded-xl", icon: 20 },
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface FileIconProps {
  mimeType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function FileIcon({ mimeType, size = "md", className }: FileIconProps) {
  const group = getFileTypeGroup(mimeType);
  const config = TYPE_CONFIG[group] ?? TYPE_CONFIG.other;
  const sizeConf = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0",
        sizeConf.wrapper,
        config.bgClass,
        className
      )}
    >
      <Icon size={sizeConf.icon} className={config.iconClass} />
    </div>
  );
}

// ─── Extension badge (optional overlay for lg size) ───────────────────────────
// A small text badge showing the extension, useful in grid/card views where
// the icon alone isn't always enough to distinguish e.g. .doc vs .docx

export function FileExtensionBadge({ extension }: { extension: string }) {
  if (!extension) return null;

  return (
    <span className="absolute -bottom-1 -right-1 px-1 py-0.5 rounded bg-card border border-border text-[8px] font-bold uppercase text-muted-foreground leading-none">
      {extension}
    </span>
  );
}