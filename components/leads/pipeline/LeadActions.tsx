"use client";

import {
  MoreVertical,
  Edit,
  FileText,
  CalendarPlus,
  UserCheck,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  onEdit: () => void;
  onAddNote: () => void;
  onFollowUp: () => void;
  onConvert: () => void;
}

export default function LeadActions({
  onEdit,
  onAddNote,
  onFollowUp,
  onConvert,
}: Props) {
  const stopDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onPointerDown={stopDrag}
          onClick={(e) => e.stopPropagation()}
          className="
          rounded-lg
          p-2

          hover:bg-slate-100

          dark:hover:bg-slate-800

          transition

          "
        >
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onPointerDown={(e) => e.stopPropagation()}
        className="
        w-48
        rounded-xl
        "
      >
        <DropdownMenuItem
          onClick={onEdit}
          className="
          gap-2
          cursor-pointer
          "
        >
          <Edit size={16} />
          Edit Lead
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onAddNote}
          className="
          gap-2
          cursor-pointer
          "
        >
          <FileText size={16} />
          Add Note
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onFollowUp}
          className="
          gap-2
          cursor-pointer
          "
        >
          <CalendarPlus size={16} />
          Schedule Follow-up
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onConvert}
          className="
          gap-2
          cursor-pointer
          text-green-600
          "
        >
          <UserCheck size={16} />
          Convert Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
