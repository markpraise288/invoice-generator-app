// components/files/FileList.tsx

"use client";

import { useState } from "react";
import {
  useRecordFiles,
  useDeleteFile,
  useUpdateFile,
} from "@/hooks/useFiles";
import type { FileRecord, FileRelatedTo } from "@/hooks/useFiles";
import { FileCard } from "./FileCard";
import { FileUploadDialog } from "./FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Paperclip, Plus, FolderOpen } from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface FileListProps {
  relatedTo: FileRelatedTo;
  relatedId: string;
  // Optional — caps the visible list before "show all" (drawer contexts
  // often want a compact preview rather than an unbounded list)
  previewLimit?: number;
  title?: string;
}

// ─── Edit Details Dialog ────────────────────────────────────────────────────────

function EditFileDialog({
  file,
  open,
  onOpenChange,
}: {
  file: FileRecord | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [name, setName] = useState(file?.originalName ?? "");
  const [description, setDescription] = useState(file?.description ?? "");
  const { mutate: updateFile, isPending } = useUpdateFile();

  // Re-sync local state whenever a different file is opened for editing
  const currentFileId = file?._id;
  const [syncedId, setSyncedId] = useState<string | undefined>();
  if (file && currentFileId !== syncedId) {
    setName(file.originalName);
    setDescription(file.description ?? "");
    setSyncedId(currentFileId);
  }

  if (!file) return null;

  const handleSave = () => {
    updateFile(
      {
        fileId: file._id,
        data: {
          originalName: name.trim() || file.originalName,
          description: description.trim(),
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Edit file details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fileName" className="text-xs">
              Name
            </Label>
            <Input
              id="fileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm"
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fileDescription" className="text-xs">
              Description
            </Label>
            <Input
              id="fileDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="h-9 text-sm"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function FileListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border"
        >
          <Skeleton className="size-7 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border text-center">
      <div className="size-8 rounded-full bg-muted flex items-center justify-center mb-2">
        <FolderOpen size={14} className="text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground">No files attached</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2.5 h-7 px-2.5 text-xs gap-1"
        onClick={onUpload}
      >
        <Plus size={11} />
        Add file
      </Button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FileList({
  relatedTo,
  relatedId,
  previewLimit,
  title = "Files",
}: FileListProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [editTarget, setEditTarget] = useState<FileRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);

  const { data: files, isLoading } = useRecordFiles(relatedTo, relatedId);
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();

  const visibleFiles =
    previewLimit && !showAll ? files?.slice(0, previewLimit) : files;

  const hasMore =
    previewLimit && files && files.length > previewLimit && !showAll;

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteFile(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Paperclip size={11} />
          {title}
          {files && files.length > 0 && (
            <span className="text-muted-foreground/70 font-normal normal-case">
              ({files.length})
            </span>
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1"
          onClick={() => setUploadOpen(true)}
        >
          <Plus size={11} />
          Add
        </Button>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <FileListSkeleton />
      ) : !files || files.length === 0 ? (
        <EmptyState onUpload={() => setUploadOpen(true)} />
      ) : (
        <div className="flex flex-col gap-1.5">
          {visibleFiles!.map((file) => (
            <FileCard
              key={file._id}
              file={file}
              variant="compact"
              showDetachOption
              onDelete={() => setDeleteTarget(file)}
            />
          ))}

          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-primary hover:underline underline-offset-2 text-left px-1 mt-0.5"
            >
              Show {files.length - previewLimit!} more
            </button>
          )}
        </div>
      )}

      {/* ── Upload dialog ── */}
      <FileUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        relatedId={relatedId}
        relatedTo={relatedTo}
      />

      {/* ── Edit dialog ── */}
      <EditFileDialog
        file={editTarget}
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      />

      {/* ── Delete confirmation ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.originalName}
              </span>{" "}
              will be moved to trash. You can restore it later from the Files
              library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}