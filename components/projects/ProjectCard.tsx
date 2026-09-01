// components/projects/ProjectCard.tsx

"use client";

import { useState } from "react";
import {
  Calendar,
  DollarSign,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Users,
  Building2,
  Contact as ContactIcon,
  Handshake,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { ProjectProgressBar } from "@/components/projects/ProjectProgressBar";
import { useDeleteProject } from "@/hooks/useProjects";
import type { Project, ProjectRelatedTo } from "@/hooks/useProjects";
import { toast } from "sonner";

interface ProjectCardProps {
  project: Project;
  onClick: () => void; // opens details drawer
  onEdit?: (project: Project) => void;
}

// ─── Related entity display config — mirrors every other Project component
// updated this conversation ──────────────────────────────────────────────────

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

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatCurrency = (cents: number) => {
  if (!cents) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export function ProjectCard({ project, onClick, onEdit }: ProjectCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const dueDate = formatDate(project.dueDate);
  const budget = formatCurrency(project.budget);
  const relatedLabel = getRelatedLabel(project);
  const relatedDisplay = relatedToDisplay[project.relatedTo];
  const RelatedIcon = relatedDisplay?.icon ?? Users;

  const handleDelete = () => {
    deleteProject(project._id, {
      onSuccess: () => {
        toast.success("Project deleted");
        setConfirmDelete(false);
      },
      onError: () => {
        toast.error("Failed to delete project");
      },
    });
  };

  return (
    <>
      <div className="group relative flex w-full flex-col gap-2.5 rounded-lg border bg-background p-3 shadow-sm transition-shadow hover:shadow-md">
        {/* ── Actions dropdown — top-right corner, stops propagation so it
            never triggers the card's own onClick ── */}
        <div className="absolute right-2 top-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={onClick}>
                <Eye className="mr-2 h-3.5 w-3.5" />
                View details
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Clickable body — everything except the dropdown opens details ── */}
        <button
          type="button"
          onClick={onClick}
          className="flex flex-col gap-2.5 text-left"
        >
          <div className="pr-6">
            <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
              {project.name}
            </p>
            {relatedLabel && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <RelatedIcon className="h-3 w-3 shrink-0" />
                {relatedLabel}
              </p>
            )}
          </div>

          <ProjectProgressBar progress={project.progress ?? 0} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dueDate}
                </span>
              )}
              {budget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {budget}
                </span>
              )}
            </div>

            {project.members.length > 0 && (
              <div className="flex -space-x-1.5">
                {project.members.slice(0, 3).map((member) => (
                  <Avatar key={member._id} className="h-5 w-5 border-2 border-background">
                    <AvatarFallback className="text-[9px]">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.members.length > 3 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-medium text-muted-foreground">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{project.name}</span> will be
              permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}