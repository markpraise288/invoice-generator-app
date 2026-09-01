// components/files/FileUploadDialog.tsx

"use client";

import { useCallback, useRef, useState } from "react";
import { useUploadFile } from "@/hooks/useFiles";
import type { FileRelatedTo } from "@/hooks/useFiles";
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
import { Progress } from "@/components/ui/progress";
import { FileIcon } from "./FileIcon";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Plus,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────
// Mirrors backend file.validate.js — kept in sync manually so the frontend
// can reject obviously-bad files before even attempting the upload.

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "txt", "csv", "rtf", "jpg", "jpeg", "png", "gif",
  "webp", "svg", "zip", "rar", "json",
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // When opened from a record drawer (Lead/Customer/Project/etc.), these
  // pre-wire the upload so the file attaches automatically — the folder/
  // relation fields are hidden from the form in that case.
  relatedId?: string;
  relatedTo?: FileRelatedTo;
  defaultFolder?: string;
  onSuccess?: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

// ─── Dropzone ──────────────────────────────────────────────────────────────────

function Dropzone({
  onFileSelect,
  disabled,
}: {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect, disabled]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 px-4 text-center transition-colors cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-border/80 hover:bg-muted/30",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
        <Upload size={18} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          Drop a file here, or{" "}
          <span className="text-primary">browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Up to {formatBytes(MAX_FILE_SIZE_BYTES)} — documents, images,
          spreadsheets, archives
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />
    </div>
  );
}

// ─── Selected File Preview ─────────────────────────────────────────────────────

function SelectedFilePreview({
  file,
  onClear,
  disabled,
}: {
  file: File;
  onClear: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <FileIcon mimeType={file.type} size="md" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate">
          {file.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatBytes(file.size)}
        </span>
      </div>
      <button
        onClick={onClear}
        disabled={disabled}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Tag Input ─────────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  disabled,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 20) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a tag and press Enter"
          className="h-9 text-sm"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          onClick={addTag}
          disabled={disabled || !input.trim()}
        >
          <Plus size={14} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs text-foreground"
            >
              {tag}
              <button
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                disabled={disabled}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FileUploadDialog({
  open,
  onOpenChange,
  relatedId,
  relatedTo,
  defaultFolder,
  onSuccess,
}: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState(defaultFolder ?? "");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate: uploadFile, isPending, isSuccess, reset } = useUploadFile();

  const isScopedToRecord = !!(relatedId && relatedTo);

  const resetForm = () => {
    setFile(null);
    setFolder(defaultFolder ?? "");
    setDescription("");
    setTags([]);
    setValidationError(null);
    reset();
  };

  const handleClose = () => {
    if (isPending) return;
    resetForm();
    onOpenChange(false);
  };

  const handleFileSelect = (selected: File) => {
    setValidationError(null);

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File is too large. Maximum size is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`
      );
      return;
    }

    const ext = getExtension(selected.name);
    if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(
        `".${ext}" files aren't supported. Allowed: documents, images, spreadsheets, archives.`
      );
      return;
    }

    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;

    uploadFile(
      {
        file,
        folder: folder.trim() || undefined,
        description: description.trim() || undefined,
        tags,
        relatedId,
        relatedTo,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          setTimeout(() => {
            resetForm();
            onOpenChange(false);
          }, 700); // brief success state before closing
        },
        onError: (err: any) => {
          setValidationError(err?.message ?? "Failed to upload file");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Upload size={16} className="text-primary" />
            Upload file
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── Dropzone / preview ── */}
          {!file ? (
            <Dropzone onFileSelect={handleFileSelect} disabled={isPending} />
          ) : (
            <SelectedFilePreview
              file={file}
              onClear={() => setFile(null)}
              disabled={isPending}
            />
          )}

          {/* ── Validation error ── */}
          {validationError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/5">
              <AlertCircle size={13} className="text-destructive shrink-0" />
              <p className="text-xs text-destructive">{validationError}</p>
            </div>
          )}

          {/* ── Upload progress (indeterminate — fetch doesn't expose real progress easily) ── */}
          {isPending && (
            <div className="flex flex-col gap-1.5">
              <Progress value={undefined} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading...
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-300/40 bg-emerald-50 dark:bg-emerald-950/20">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                File uploaded successfully
              </p>
            </div>
          )}

          {/* ── Folder — only shown when not pre-scoped to a record ── */}
          {!isScopedToRecord && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="folder" className="text-xs">
                Folder
                <span className="text-muted-foreground ml-1 font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="e.g. Contracts/2026"
                className="h-9 text-sm"
                disabled={isPending}
              />
            </div>
          )}

          {/* ── Description ── */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-xs">
              Description
              <span className="text-muted-foreground ml-1 font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this file for?"
              rows={2}
              className="resize-none text-sm"
              disabled={isPending}
            />
          </div>

          {/* ── Tags ── */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">
              Tags
              <span className="text-muted-foreground ml-1 font-normal">
                (optional)
              </span>
            </Label>
            <TagInput tags={tags} onChange={setTags} disabled={isPending} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={!file || isPending || !!validationError}
          >
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}