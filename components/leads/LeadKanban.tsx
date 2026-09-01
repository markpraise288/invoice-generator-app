"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import {
  useLeadsKanban,
  useUpdateLeadStage,
  type Lead,
  type LeadStage,
} from "@/hooks/useLeads";
import { LeadCard } from "@/components/leads/LeadCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LeadKanbanProps {
  onCardClick: (lead: Lead) => void;
  filter?: { owner?: string; source?: string };
}

const columns: { stage: LeadStage; label: string }[] = [
  { stage: "new", label: "New" },
  { stage: "contacted", label: "Contacted" },
  { stage: "qualified", label: "Qualified" },
  { stage: "proposal", label: "Proposal" },
  { stage: "negotiation", label: "Negotiation" },
  { stage: "won", label: "Won" },
  { stage: "lost", label: "Lost" },
];

function DraggableCard({ lead, onCardClick }: { lead: Lead; onCardClick: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id,
    data: { lead },
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
      <LeadCard lead={lead} onClick={() => onCardClick(lead)} />
    </div>
  );
}

function DroppableColumn({
  stage,
  label,
  leads,
  onCardClick,
}: {
  stage: LeadStage;
  label: string;
  leads: Lead[];
  onCardClick: (l: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-50 w-64 shrink-0 flex-col rounded-xl border bg-muted/30 p-3 transition-colors",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {leads.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <DraggableCard key={lead._id} lead={lead} onCardClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

export function LeadKanban({ onCardClick, filter }: LeadKanbanProps) {
  const { data: columnsData, isLoading } = useLeadsKanban(filter);
  const updateStage = useUpdateLeadStage();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Pending drop into "lost" — holds the lead + target stage while we ask for a reason
  const [pendingLostDrop, setPendingLostDrop] = useState<Lead | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLead(event.active.data.current?.lead ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadStage;
    const currentLead = active.data.current?.lead as Lead | undefined;

    if (!currentLead || currentLead.stage === newStage) return;

    if (newStage === "lost") {
      // Don't fire the mutation yet — collect a reason first
      setPendingLostDrop(currentLead);
      setLostReasonInput("");
      return;
    }

    updateStage.mutate({ id: leadId, stage: newStage });
  };

  const confirmLostDrop = () => {
    if (!pendingLostDrop) return;
    updateStage.mutate({
      id: pendingLostDrop._id,
      stage: "lost",
      lostReason: lostReasonInput,
    });
    setPendingLostDrop(null);
  };

  const cancelLostDrop = () => {
    setPendingLostDrop(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <Skeleton key={col.stage} className="h-96 w-64 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 pb-4">
          {columns.map((col) => (
            <DroppableColumn
              key={col.stage}
              stage={col.stage}
              label={col.label}
              leads={columnsData?.[col.stage] ?? []}
              onCardClick={onCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && <LeadCard lead={activeLead} onClick={() => {}} />}
        </DragOverlay>
      </DndContext>

      <Dialog open={!!pendingLostDrop} onOpenChange={(open) => !open && cancelLostDrop()}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Mark as Lost</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="lostReason">Why was this lead lost? (optional)</Label>
            <Textarea
              id="lostReason"
              value={lostReasonInput}
              onChange={(e) => setLostReasonInput(e.target.value)}
              rows={3}
              placeholder="e.g. Went with a competitor, budget cut, no response..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelLostDrop}>
              Cancel
            </Button>
            <Button
              onClick={confirmLostDrop}
              className="bg-red-600 hover:bg-red-700"
              disabled={updateStage.isPending}
            >
              Mark as Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}