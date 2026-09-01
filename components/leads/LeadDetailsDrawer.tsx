"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Building2,
  Clock,
  Pencil,
  ArrowRight,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { LeadStageBadge } from "@/components/leads/LeadStageBadge";
import { LeadScoreIndicator } from "@/components/leads/LeadScoreIndicator";
import { ConvertLeadDialog } from "@/components/leads/ConvertLeadDialog";
import { useLead } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadDetailsDrawerProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const formatCurrency = (cents: number) => {
  if (!cents) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const sourceLabels: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  cold_outreach: "Cold Outreach",
  social_media: "Social Media",
  event: "Event",
  advertisement: "Advertisement",
  other: "Other",
};

export function LeadDetailsDrawer({
  leadId,
  open,
  onOpenChange,
  onEdit,
}: LeadDetailsDrawerProps) {
  const { data: lead, isLoading } = useLead(leadId || "");
  const [convertOpen, setConvertOpen] = useState(false);

  if (isLoading || !lead) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const isConverted = !!lead.convertedCustomer;
  const canConvert = lead.stage === "won" && !isConverted;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg p-3">
          <SheetHeader>
            <div className="flex items-start justify-between pr-6">
              <div>
                <SheetTitle className="text-xl">{lead.name}</SheetTitle>
                <div className="mt-2 flex items-center gap-2">
                  <LeadStageBadge stage={lead.stage} />
                  {lead.company && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {lead.company}
                    </span>
                  )}
                </div>
              </div>
              {!isConverted && (
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-6">
            {isConverted && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Converted to customer on {formatDate(lead.convertedAt)}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Lead Score</p>
              <LeadScoreIndicator score={lead.score} variant="detailed" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">{lead.email}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {lead.phone || "—"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  Estimated Value
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatCurrency(lead.value)}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Last Contacted
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(lead.lastContactedAt)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {sourceLabels[lead.source] || lead.source}
              </p>
            </div>

            {lead.stage === "lost" && lead.lostReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                <p className="text-xs text-red-700 dark:text-red-400">Lost Reason</p>
                <p className="mt-1 text-sm text-red-800 dark:text-red-300">{lead.lostReason}</p>
              </div>
            )}

            {lead.notes && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Notes</p>
                <p className="text-sm text-muted-foreground">{lead.notes}</p>
              </div>
            )}

            {lead.tags.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {canConvert && (
              <Button className="w-full" onClick={() => setConvertOpen(true)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Convert to Customer
              </Button>
            )}

            {isConverted && lead.convertedCustomer && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = `/customers/${lead.convertedCustomer!._id}`;
                }}
              >
                View Customer Record
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConvertLeadDialog open={convertOpen} onOpenChange={setConvertOpen} lead={lead ?? null} />
    </>
  );
}