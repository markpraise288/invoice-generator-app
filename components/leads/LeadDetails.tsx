import { Building2, Clock } from "lucide-react";
import { LeadScoreIndicator } from "@/components/leads/LeadScoreIndicator";
import type { Lead } from "@/hooks/useLeads";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

const formatCurrency = (cents: number) => {
  if (!cents) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

const formatRelativeDate = (date?: string | null) => {
  if (!date) return null;
  const diffMs = Date.now() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const sourceLabels: Record<Lead["source"], string> = {
  website: "Website",
  referral: "Referral",
  cold_outreach: "Cold Outreach",
  social_media: "Social",
  event: "Event",
  advertisement: "Ad",
  other: "Other",
};

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const value = formatCurrency(lead.value);
  const lastContacted = formatRelativeDate(lead.lastContactedAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2.5 rounded-lg border bg-background p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-snug text-foreground">
            {lead.name}
          </p>
          {lead.company && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              {lead.company}
            </p>
          )}
        </div>
        {value && (
          <span className="shrink-0 text-sm font-semibold text-foreground">{value}</span>
        )}
      </div>

      <LeadScoreIndicator score={lead.score} variant="compact" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5">
          {sourceLabels[lead.source]}
        </span>
        {lastContacted && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastContacted}
          </span>
        )}
      </div>
    </button>
  );
}