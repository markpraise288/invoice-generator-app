// app/files/page.tsx

"use client";

import { useCallback, useState } from "react";
import {
  useFiles,
  useStorageStats,
  useDeleteFile,
  useRestoreFile,
  usePermanentlyDeleteFile,
  useUpdateFile,
  FILE_TYPE_GROUPS,
} from "@/hooks/useFiles";
import type { FileFilters, FileRecord } from "@/hooks/useFiles";
import { FileCard } from "@/components/files/FileCard";
import { FileUploadDialog } from "@/components/files/FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  HardDrive,
  Files as FilesIcon,
  Folder,
  LayoutGrid,
  List,
  Trash2,
} from "lucide-react";

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  bgClass: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div
        className={cn(
          "size-9 rounded-lg flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <Icon size={16} className={iconClass} />
      </div>
      <div className="flex flex-col min-w-0">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-14 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <span className="text-lg font-bold text-foreground leading-none truncate">
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Bytes formatter (matches backend sizeFormatted style) ────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

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
  const [folder, setFolder] = useState(file?.folder ?? "");
  const [description, setDescription] = useState(file?.description ?? "");
  const { mutate: updateFile, isPending } = useUpdateFile();

  const currentFileId = file?._id;
  const [syncedId, setSyncedId] = useState<string | undefined>();
  if (file && currentFileId !== syncedId) {
    setName(file.originalName);
    setFolder(file.folder ?? "");
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
          folder: folder.trim() || null,
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
            <Label htmlFor="fileFolder" className="text-xs">
              Folder
            </Label>
            <Input
              id="fileFolder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="e.g. Contracts/2026"
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

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  isFiltered,
  onClearFilters,
  onUpload,
}: {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-border bg-card text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <FolderOpen size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {isFiltered ? "No files match your filters" : "No files yet"}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
        {isFiltered
          ? "Try adjusting or clearing your filters"
          : "Upload documents, images, and other files to your workspace"}
      </p>
      {isFiltered ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : (
        <Button size="sm" className="mt-4 gap-1.5" onClick={onUpload}>
          <Plus size={14} />
          Upload file
        </Button>
      )}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function LibrarySkeleton({ view }: { view: "row" | "grid" }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function FilesPage() {
  const [filters, setFilters] = useState<FileFilters>({
    page: 1,
    limit: 40,
  });
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"row" | "grid">("row");
  const [showTrash, setShowTrash] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FileRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<FileRecord | null>(null);

  const activeFilters: FileFilters = { ...filters, search: search || undefined };

  const { data, isLoading } = useFiles(activeFilters);
  const { data: stats, isLoading: statsLoading } = useStorageStats();

  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const { mutate: restoreFile } = useRestoreFile();
  const { mutate: permanentlyDelete, isPending: isPermanentlyDeleting } =
    usePermanentlyDeleteFile();

  const files = data?.files ?? [];
  const pagination = data?.pagination;
  const isFiltered = !!(search || filters.folder);

  const updateFilter = useCallback((patch: Partial<FileFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const clearFilters = () => {
    setSearch("");
    updateFilter({ folder: undefined });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteFile(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
  };

  const handlePermanentDeleteConfirm = () => {
    if (!permanentDeleteTarget) return;
    permanentlyDelete(permanentDeleteTarget._id, {
      onSuccess: () => setPermanentDeleteTarget(null),
    });
  };

  const activeFolderLabel = filters.folder ?? "All folders";

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FolderOpen size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">
              Files
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pagination?.total
                ? `${pagination.total} file${pagination.total !== 1 ? "s" : ""}`
                : "Your workspace document library"}
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setUploadOpen(true)}>
          <Plus size={15} />
          Upload file
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total files"
          value={stats?.totalFiles ?? 0}
          icon={FilesIcon}
          iconClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={statsLoading}
        />
        <StatCard
          label="Storage used"
          value={formatBytes(stats?.totalSize ?? 0)}
          icon={HardDrive}
          iconClass="text-violet-500"
          bgClass="bg-violet-500/10"
          isLoading={statsLoading}
        />
        <StatCard
          label="Folders"
          value={stats?.folders.length ?? 0}
          icon={Folder}
          iconClass="text-amber-500"
          bgClass="bg-amber-500/10"
          isLoading={statsLoading}
        />
        <StatCard
          label="Documents"
          value={stats?.typeBreakdown ? Object.values(stats.typeBreakdown).reduce((a, b) => a + b, 0) : 0}
          icon={FolderOpen}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          isLoading={statsLoading}
        />
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="pl-8 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Folder filter */}
        {stats && stats.folders.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 gap-1.5 text-xs",
                  filters.folder && "border-primary text-primary"
                )}
              >
                <Folder size={12} />
                {activeFolderLabel}
                <ChevronDown size={12} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">Folder</DropdownMenuLabel>
              {stats.folders.map((f) => (
                <DropdownMenuCheckboxItem
                  key={f.folder}
                  checked={filters.folder === f.folder}
                  onCheckedChange={() =>
                    updateFilter({
                      folder: filters.folder === f.folder ? undefined : f.folder,
                    })
                  }
                  className="text-xs"
                >
                  {f.folder}
                  <span className="text-muted-foreground ml-auto">
                    {f.count}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isFiltered && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X size={12} />
            Clear
          </button>
        )}

        {/* View toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-muted gap-0.5 ml-auto">
          <button
            onClick={() => setView("row")}
            className={cn(
              "flex items-center justify-center size-7 rounded-md transition-all",
              view === "row"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List size={13} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center justify-center size-7 rounded-md transition-all",
              view === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid size={13} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <LibrarySkeleton view={view} />
      ) : files.length === 0 ? (
        <EmptyState
          isFiltered={isFiltered}
          onClearFilters={clearFilters}
          onUpload={() => setUploadOpen(true)}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {files.map((file) => (
            <FileCard
              key={file._id}
              file={file}
              variant="grid"
              onEdit={() => setEditTarget(file)}
              onDelete={() => setDeleteTarget(file)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {files.map((file) => (
              <FileCard
                key={file._id}
                file={file}
                variant="row"
                onEdit={() => setEditTarget(file)}
                onDelete={() => setDeleteTarget(file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-4 px-1">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium text-foreground">{pagination.total}</span> files
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => updateFilter({ page: pagination.page - 1 })}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft size={13} />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => updateFilter({ page: pagination.page + 1 })}
              disabled={!pagination.hasNext}
            >
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Upload dialog ── */}
      <FileUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* ── Edit dialog ── */}
      <EditFileDialog
        file={editTarget}
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      />

      {/* ── Delete (soft) confirmation ── */}
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
              will be moved to trash. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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