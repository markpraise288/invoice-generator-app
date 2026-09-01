// components/files/FileCard.tsx

"use client";

import { formatDistanceToNow } from "date-fns";
import type { FileRecord } from "@/hooks/useFiles";
import { useFileDownload, useDeleteFile, useDetachFile } from "@/hooks/useFiles";
import { FileIcon } from "./FileIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Download,
  Pencil,
  Trash2,
  Link2Off,
  RotateCcw,
  Loader2,
} from "lucide-react";

// ─── Variants ──────────────────────────────────────────────────────────────────

type FileCardVariant = "row" | "grid" | "compact";

interface FileCardProps {
  file: FileRecord;
  variant?: FileCardVariant;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showDetachOption?: boolean;
  isTrash?: boolean;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  className?: string;
}

// ─── Actions menu (shared across variants) ─────────────────────────────────────

function FileActionsMenu({
  file,
  onEdit,
  onDelete,
  showDetachOption,
  isTrash,
  onRestore,
  onPermanentDelete,
  trigger,
}: {
  file: FileRecord;
  onEdit?: () => void;
  onDelete?: () => void;
  showDetachOption?: boolean;
  isTrash?: boolean;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  trigger: React.ReactNode;
}) {
  const { mutate: download, isPending: isDownloading } = useFileDownload();
  const { mutate: detach, isPending: isDetaching } = useDetachFile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {isTrash ? (
          <>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => onRestore?.()}
            >
              <RotateCcw size={13} className="mr-2" />
              Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onPermanentDelete?.()}
            >
              <Trash2 size={13} className="mr-2" />
              Delete forever
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              className="text-xs"
              disabled={isDownloading}
              onClick={() => download(file._id)}
            >
              {isDownloading ? (
                <Loader2 size={13} className="mr-2 animate-spin" />
              ) : (
                <Download size={13} className="mr-2" />
              )}
              Download
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem className="text-xs" onClick={onEdit}>
                <Pencil size={13} className="mr-2" />
                Edit details
              </DropdownMenuItem>
            )}
            {showDetachOption && file.relatedId && (
              <DropdownMenuItem
                className="text-xs"
                disabled={isDetaching}
                onClick={() => detach(file._id)}
              >
                <Link2Off size={13} className="mr-2" />
                Unlink from record
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onDelete?.()}
            >
              <Trash2 size={13} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Row variant — for library table / record file lists ──────────────────────

function RowCard({
  file,
  onClick,
  onEdit,
  onDelete,
  showDetachOption,
  isTrash,
  onRestore,
  onPermanentDelete,
  className,
}: FileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        onClick && "cursor-pointer hover:bg-muted/30",
        className
      )}
    >
      <FileIcon mimeType={file.mimeType} size="md" />

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate">
          {file.originalName}
        </span>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {file.sizeFormatted}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {file.uploadedBy.name}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(file.createdAt), {
              addSuffix: true,
            })}
          </span>
          {file.version > 1 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              v{file.version}
            </Badge>
          )}
        </div>
      </div>

      {file.tags.length > 0 && (
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {file.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] h-5 px-1.5"
            >
              {tag}
            </Badge>
          ))}
          {file.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{file.tags.length - 2}
            </span>
          )}
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      >
        <FileActionsMenu
          file={file}
          onEdit={onEdit}
          onDelete={onDelete}
          showDetachOption={showDetachOption}
          isTrash={isTrash}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal size={14} />
            </Button>
          }
        />
      </div>
    </div>
  );
}

// ─── Grid variant — for a visual file gallery ──────────────────────────────────

function GridCard({
  file,
  onClick,
  onEdit,
  onDelete,
  showDetachOption,
  isTrash,
  onRestore,
  onPermanentDelete,
  className,
}: FileCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        "transition-all hover:border-border/80 hover:shadow-sm",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <FileIcon mimeType={file.mimeType} size="lg" />
        <div
          onClick={(e) => e.stopPropagation()}
        >
          <FileActionsMenu
            file={file}
            onEdit={onEdit}
            onDelete={onDelete}
            showDetachOption={showDetachOption}
            isTrash={isTrash}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={14} />
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">
          {file.originalName}
        </span>
        <span className="text-xs text-muted-foreground">
          {file.sizeFormatted}
        </span>
      </div>

      {file.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {file.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] h-4 px-1.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/50">
        <span className="text-[11px] text-muted-foreground truncate">
          {file.uploadedBy.name}
        </span>
        <span className="text-[11px] text-muted-foreground shrink-0">
          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

// ─── Compact variant — for embedding inside record drawers ────────────────────

function CompactCard({
  file,
  onClick,
  onDelete,
  showDetachOption,
  className,
}: FileCardProps) {
  const { mutate: download, isPending: isDownloading } = useFileDownload();

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border",
        "hover:bg-muted/30 transition-colors",
        className
      )}
    >
      <FileIcon mimeType={file.mimeType} size="sm" />

      <button
        onClick={onClick}
        className="flex flex-col min-w-0 flex-1 text-left"
      >
        <span className="text-xs font-medium text-foreground truncate">
          {file.originalName}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {file.sizeFormatted} ·{" "}
          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
        </span>
      </button>

      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          disabled={isDownloading}
          onClick={() => download(file._id)}
        >
          {isDownloading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Download size={11} />
          )}
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 size={11} />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function FileCard(props: FileCardProps) {
  const variant = props.variant ?? "row";

  if (variant === "grid") return <GridCard {...props} />;
  if (variant === "compact") return <CompactCard {...props} />;
  return <RowCard {...props} />;
}