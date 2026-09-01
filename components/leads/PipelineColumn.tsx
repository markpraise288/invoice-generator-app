"use client";

import { useDroppable } from "@dnd-kit/core";

import LeadCard from "./LeadCard";

import { Lead, LeadStatus } from "./LeadsTable";

interface Props {
  stage: {
    id: LeadStatus;

    label: string;
  };

  leads: Lead[];
}

export default function PipelineColumn({
  stage,

  leads,
}: Props) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="
rounded-2xl
border
bg-slate-50
p-3
min-h-[400px]

dark:border-slate-700
dark:bg-slate-900

"
    >
      <div className="flex justify-between mb-4">
        <h3 className="font-bold">{stage.label}</h3>

        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead._id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
