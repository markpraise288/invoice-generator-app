"use client";

import { useDroppable } from "@dnd-kit/core";

import PipelineCard from "./PipelineCard";
import type { Lead as LeadType } from "../../../types/leads";

type Stage = { id: string; label: string };

export default function PipelineColumn({ stage, leads }: { stage: Stage; leads: LeadType[] }) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="
min-w-[280px]
rounded-2xl
border
bg-white
dark:bg-slate-900
dark:border-slate-700
"
    >
      <div
        className="
flex
justify-between
items-center
p-4
border-b
dark:border-slate-700
"
      >
        <h3
          className="
font-semibold
"
        >
          {stage.label}
        </h3>

        <span
          className="
text-xs
rounded-full
px-2
py-1
bg-slate-100
dark:bg-slate-800
"
        >
          {leads.length}
        </span>
      </div>

      <div
        className="
p-4
space-y-4
min-h-[400px]
"
      >
        {leads.map((lead: LeadType) => (
          <PipelineCard key={lead._id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
