// components/projects/ProjectDetailsDrawer.tsx

"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  Circle,
  Pencil,
  Users,
  Building2,
  Contact as ContactIcon,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectProgressBar } from "@/components/projects/ProjectProgressBar";
import { useProject, useProjectTasks } from "@/hooks/useProjects";
import type { ProjectRelatedTo } from "@/hooks/useProjects";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

interface ProjectDetailsDrawerProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  // Optional — lets the parent navigate to the linked record's own page/drawer
  onRelatedClick?: (relatedTo: ProjectRelatedTo, relatedId: string) => void;
}

// ─── Related entity display config (icon + label per type) ────────────────────
// Mirrors relatedToConfig/relatedToDisplay used across every other polymorphic
// dialog/drawer this conversation.

const relatedToDisplay: Record<ProjectRelatedTo, { icon: React.ElementType; label: string }> = {
  Customer: { icon: Users, label: "Customer" },
  Company: { icon: Building2, label: "Company" },
  Contact: { icon: ContactIcon, label: "Contact" },
  Deal: { icon: Handshake, label: "Deal" },
};

// ─── Helpers for the polymorphic relatedId field ───────────────────────────────

function getRelatedId(project: { relatedId: any }): string | null {
  if (!project.relatedId) return null;
  return typeof project.relatedId === "string" ? project.relatedId._id : project.relatedId;
}

function getRelatedLabel(project: { relatedId: any }): string | null {
  if (!project.relatedId || typeof project.relatedId === "string") return null;
  const record = project.relatedId;
  return record.name ?? record.title ?? null;
}

const getInitials = (name: string) =>
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ProjectDetailsDrawer({
  projectId,
  open,
  onOpenChange,
  onEdit,
  onRelatedClick,
}: ProjectDetailsDrawerProps) {
  const { data: project, isLoading } = useProject(projectId || "");
  const { data: tasks, isLoading: tasksLoading } = useProjectTasks(projectId || "");

  const relatedId = project ? getRelatedId(project) : null;
  const relatedLabel = project ? getRelatedLabel(project) : null;
  const relatedDisplay = project?.relatedTo ? relatedToDisplay[project.relatedTo] : null;
  const RelatedIcon = relatedDisplay?.icon ?? Users;

  // Budget vs spent — only meaningful when this project is linked to a
  // Customer, since Payments are recorded against Customer, not Company/
  // Contact/Deal. For any other relatedTo, there's no payment trail to sum,
  // so the whole "Budget Spent" section is skipped rather than showing a
  // misleading $0 spent.
  const isCustomerLinked = project?.relatedTo === "Customer" && !!relatedId;

  const { data: spentData } = useQuery({
    queryKey: ["projects", projectId, "spent"],
    queryFn: async () => {
      const res = await apiFetch(`/payments/summary?customer=${relatedId}`);
      return res.data;
    },
    enabled: isCustomerLinked,
  });

  if (isLoading || !project) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const spent = spentData?.totalCollected ?? 0;
  const budgetPct = project.budget > 0 ? Math.min(100, Math.round((spent / project.budget) * 100)) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg px-4">
        <SheetHeader>
          <div className="flex items-start justify-between pr-6">
            <div>
              <SheetTitle className="text-xl">{project.name}</SheetTitle>
              <div className="mt-2 flex items-center gap-2">
                <ProjectStatusBadge status={project.status} />
                {relatedLabel && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <RelatedIcon className="h-3.5 w-3.5" />
                    {relatedLabel}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}

          {/* ── Linked record — always shown, since relatedId/relatedTo are
              required on every Project per the schema ── */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {relatedDisplay?.label ?? "Related to"}
            </p>
            {relatedLabel ? (
              onRelatedClick && relatedId ? (
                <button
                  onClick={() => onRelatedClick(project.relatedTo, relatedId)}
                  className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <RelatedIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">
                    {relatedLabel}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <RelatedIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{relatedLabel}</span>
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Linked {relatedDisplay?.label.toLowerCase() ?? "record"} not loaded
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Due Date
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDate(project.dueDate)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                Budget
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatCurrency(project.budget)}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Task Progress</p>
              <span className="text-xs text-muted-foreground">{project.progress ?? 0}%</span>
            </div>
            <ProjectProgressBar progress={project.progress ?? 0} />
          </div>

          {project.budget > 0 && isCustomerLinked && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Budget Spent</p>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(spent)} / {formatCurrency(project.budget)}
                </span>
              </div>
              <ProjectProgressBar progress={budgetPct} />
            </div>
          )}

          {project.budget > 0 && !isCustomerLinked && (
            <p className="text-xs text-muted-foreground italic">
              Budget-vs-spent tracking is only available for projects linked to a Customer.
            </p>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Team Members</p>
            {project.members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Tasks</p>
            {tasksLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : !tasks?.length ? (
              <p className="text-sm text-muted-foreground">No tasks linked to this project.</p>
            ) : (
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={`text-sm ${
                        task.status === "completed"
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {project.tags.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}