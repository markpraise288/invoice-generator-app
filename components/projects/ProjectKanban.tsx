"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { useProjectsKanban, useUpdateProjectStatus, type Project, type ProjectStatus } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProjectKanbanProps {
  onCardClick: (project: Project) => void;
  filter?: { customer?: string; company?: string; owner?: string };
}

const columns: { status: ProjectStatus; label: string }[] = [
  { status: "planning", label: "Planning" },
  { status: "active", label: "Active" },
  { status: "on_hold", label: "On Hold" },
  { status: "completed", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
];

function DraggableCard({ project, onCardClick }: { project: Project; onCardClick: (p: Project) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project._id,
    data: { project },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      <ProjectCard project={project} onClick={() => onCardClick(project)} />
    </div>
  );
}

function DroppableColumn({
  status,
  label,
  projects,
  onCardClick,
}: {
  status: ProjectStatus;
  label: string;
  projects: Project[];
  onCardClick: (p: Project) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[200px] w-72 shrink-0 flex-col rounded-xl border bg-muted/30 p-3 transition-colors",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {projects.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {projects.map((project) => (
          <DraggableCard key={project._id} project={project} onCardClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

export function ProjectKanban({ onCardClick, filter }: ProjectKanbanProps) {
  const { data: columnsData, isLoading } = useProjectsKanban(filter);
  const updateStatus = useUpdateProjectStatus();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveProject(event.active.data.current?.project ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveProject(null);
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as ProjectStatus;
    const currentProject = active.data.current?.project as Project | undefined;

    if (currentProject && currentProject.status !== newStatus) {
      updateStatus.mutate({ id: projectId, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <Skeleton key={col.status} className="h-96 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 pb-4 max-w-6xl overflow-x-auto">
        {columns.map((col) => (
          <DroppableColumn
            key={col.status}
            status={col.status}
            label={col.label}
            projects={columnsData?.[col.status] ?? []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject && <ProjectCard project={activeProject} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}