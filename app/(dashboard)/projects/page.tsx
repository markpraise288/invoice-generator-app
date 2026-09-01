// app/projects/page.tsx

"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, Search, MoreHorizontal, Eye, Pencil, Trash2, Users, Building2, Contact as ContactIcon, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ProjectKanban } from "@/components/projects/ProjectKanban";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ProjectDetailsDrawer } from "@/components/projects/ProjectDetailsDrawer";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectProgressBar } from "@/components/projects/ProjectProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useDeleteProject, type Project, type ProjectRelatedTo } from "@/hooks/useProjects";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "kanban" | "list";

// ─── Related entity display config — same map used across every Project
// component updated this conversation ───────────────────────────────────────

const relatedToDisplay: Record<ProjectRelatedTo, { icon: React.ElementType; label: string }> = {
  Customer: { icon: Users, label: "Customer" },
  Company: { icon: Building2, label: "Company" },
  Contact: { icon: ContactIcon, label: "Contact" },
  Deal: { icon: Handshake, label: "Deal" },
};

function getRelatedLabel(project: Project): string | null {
  if (typeof project.relatedId === "string") return null;
  const record = project.relatedId as any;
  return record.name ?? record.title ?? null;
}

// ─── List row — includes its own dropdown menu, same three actions as
// ProjectCard's Kanban version ──────────────────────────────────────────────

function ProjectListRow({
  project,
  onView,
  onEdit,
  onDeleteRequest,
}: {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDeleteRequest: (project: Project) => void;
}) {
  const relatedLabel = getRelatedLabel(project);
  const relatedDisplay = relatedToDisplay[project.relatedTo];
  const RelatedIcon = relatedDisplay?.icon ?? Users;

  return (
    <div
      onClick={() => onView(project)}
      className="group flex w-full cursor-pointer items-center justify-between border-b p-4 text-left last:border-b-0 hover:bg-muted/40"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{project.name}</span>
          <ProjectStatusBadge status={project.status} />
        </div>
        {relatedLabel && (
          <span className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <RelatedIcon className="h-3 w-3 shrink-0" />
            {relatedLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-40">
          <ProjectProgressBar progress={project.progress ?? 0} showLabel />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onView(project)}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 dark:text-red-400"
              onClick={() => onDeleteRequest(project)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [status, setStatus] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [drawerProjectId, setDrawerProjectId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const { data, isLoading } = useProjects({
    search: debouncedSearch,
    status: status === "all" ? undefined : (status as any),
    limit: 50,
  });

  const deleteProject = useDeleteProject();

  const openDrawer = (project: Project) => {
    setDrawerProjectId(project._id);
    setDrawerOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleEditFromDrawer = () => {
    const project =
      data?.projects.find((p) => p._id === drawerProjectId) ||
      (drawerProjectId ? ({ _id: drawerProjectId } as Project) : null);
    setDrawerOpen(false);
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingProject(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteProject.mutate(deleteTarget._id, {
      onSuccess: () => {
        toast.success("Project deleted");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Failed to delete project");
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Track project delivery, budgets, and team assignments.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {viewMode === "list" && (
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-1">
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "kanban"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <ProjectKanban onCardClick={openDrawer} onCardEdit={openEdit} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !data?.projects.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium text-foreground">No projects found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start tracking delivery.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          {data.projects.map((project) => (
            <ProjectListRow
              key={project._id}
              project={project}
              onView={openDrawer}
              onEdit={openEdit}
              onDeleteRequest={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        project={editingProject}
      />

      <ProjectDetailsDrawer
        projectId={drawerProjectId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={handleEditFromDrawer}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> will be
              permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProject.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteProject.isPending}
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}