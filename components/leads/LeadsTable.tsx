"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, Pencil, Trash2, Eye, Target, ListChecks } from "lucide-react";
import { LeadStageBadge } from "@/components/leads/LeadStageBadge";
import { LeadScoreIndicator } from "@/components/leads/LeadScoreIndicator";
import { useDeleteLead, type Lead } from "@/hooks/useLeads";
import { toast } from "sonner";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
}

const formatCurrency = (cents: number) => {
  if (!cents) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const sourceLabels: Record<Lead["source"], string> = {
  website: "Website",
  referral: "Referral",
  cold_outreach: "Cold Outreach",
  social_media: "Social Media",
  event: "Event",
  advertisement: "Advertisement",
  other: "Other",
};

export function LeadsTable({
  leads,
  isLoading,
  onView,
  onEdit,
}: LeadsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const deleteLead = useDeleteLead();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLead.mutateAsync(deleteTarget._id);
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Target className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No leads yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first lead to start building your pipeline.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead._id}
                className="cursor-pointer"
                onClick={() => onView(lead)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {lead.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lead.company || lead.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <LeadStageBadge stage={lead.stage} />
                </TableCell>
                <TableCell>
                  <LeadScoreIndicator score={lead.score} variant="compact" />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sourceLabels[lead.source]}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(lead.lastContactedAt)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(lead.value)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(lead)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(lead)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        Add task
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 focus:text-red-600"
                        onClick={() => setDeleteTarget(lead)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <CreateTaskDialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    currentUserId={lead.owner?._id}
                    relatedId={lead._id}
                    relatedTo="Lead"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
