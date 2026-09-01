"use client";

import { useDraggable } from "@dnd-kit/core";
import { Mail, DollarSign } from "lucide-react";

import LeadActions from "./LeadActions";
import { Lead } from "@/types/leads";
import { useState } from "react";
import EditLeadDialog from "../EditLeadDialog";
import LeadDetails from "../LeadDetails";

interface Props {
  lead: Lead;
}

export default function PipelineCard({ lead }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead._id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="
      rounded-2xl
      border
      bg-white
      p-4
      shadow-sm

      dark:bg-slate-900
      dark:border-slate-700

      hover:shadow-md

      cursor-grab
      active:cursor-grabbing

      transition
      "
    >
      {/* HEADER */}

      <div
        className="
        flex
        justify-between
        items-start
        "
      >
        <div>
          <h3
            className="
            font-semibold
            "
          >
            {lead.name}
          </h3>

          <p
            className="
            text-sm
            text-muted-foreground
            "
          >
            {lead.company || "No company"}
          </p>
        </div>

        {
          // Props cast to any to satisfy differing LeadActions prop types
        }
        {(() => {
          const actionsProps = {
            lead,
            onView: () => setDetailsOpen(true),
            onEdit: () => setEditOpen(true),
            onArchive: () => console.log("Archive lead"),
          } as any;

          return <LeadActions {...actionsProps} />;
        })()}
      </div>

      {/* CONTACT */}

      <div
        className="
        mt-4
        space-y-2
        text-sm
        "
      >
        <div className="flex gap-2 items-center">
          <Mail size={14} />

          <span className="truncate">{lead.email}</span>
        </div>
      </div>

      {/* VALUE */}

      <div
        className="
        mt-4
        flex
        justify-between
        items-center
        "
      >
        <span
          className="
          text-sm
          text-muted-foreground
          "
        >
          Deal Value
        </span>

        <span
          className="
          flex
          items-center
          gap-1
          font-semibold
          "
        >
          <DollarSign size={14} />

          {lead.value?.toLocaleString() || 0}
        </span>
      </div>
      <LeadDetails
        lead={lead}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
      <EditLeadDialog
        lead={lead}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
