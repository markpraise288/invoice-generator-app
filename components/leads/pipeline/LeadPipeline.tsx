"use client";

import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";

import { useState } from "react";

import { Lead } from "@/types/leads";

import { useUpdateLead } from "@/hooks/useLeads";

import PipelineColumn from "./PipelineColumn";
import PipelineCard from "./PipelineCard";

import { pipelineStages } from "./PipelineStages";

interface Props {
  leads: Lead[];
}

export default function LeadPipeline({ leads }: Props) {
  const updateLead = useUpdateLead();

  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveLead(null);

    if (!over) return;

    const lead = leads.find((item) => item._id === active.id);

    if (!lead) return;

    const newStatus = over.id.toString();

    if (lead.status === newStatus) return;

    updateLead.mutate({
      id: lead._id,

      data: {
        status: newStatus as Lead["status"],
      },
    });
  }

  return (
    <DndContext
      onDragStart={(event) => {
        const lead = leads.find((item) => item._id === event.active.id);

        setActiveLead(lead || null);
      }}
      onDragEnd={handleDragEnd}
    >
      <div
        className="
        flex
        flex-row
        gap-5
        overflow-x-scroll
        pb-5
        "
      >
        {pipelineStages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leads={leads.filter((lead) => lead.status === stage.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && <PipelineCard lead={activeLead} />}
      </DragOverlay>
    </DndContext>
  );
}
