"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadsListParams, LeadSource, LeadStage } from "@/hooks/useLeads";

interface LeadsFiltersProps {
  filters: LeadsListParams;
  onChange: (filters: LeadsListParams) => void;
}

const stageOptions: { value: LeadStage | "all"; label: string }[] = [
  { value: "all", label: "All stages" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const sourceOptions: { value: LeadSource | "all"; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "social_media", label: "Social Media" },
  { value: "event", label: "Event" },
  { value: "advertisement", label: "Advertisement" },
  { value: "other", label: "Other" },
];

export function LeadsFilters({ filters, onChange }: LeadsFiltersProps) {
  const hasActiveFilters = filters.stage || filters.source || (filters.minScore ?? 0) > 0;

  const update = (patch: Partial<LeadsListParams>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const clearAll = () => {
    onChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.stage || "all"}
        onValueChange={(v) => update({ stage: v === "all" ? undefined : (v as LeadStage) })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {stageOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.source || "all"}
        onValueChange={(v) => update({ source: v === "all" ? undefined : (v as LeadSource) })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sourceOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("gap-2", (filters.minScore ?? 0) > 0 && "border-primary text-primary")}
          >
            <Filter className="h-3.5 w-3.5" />
            Min Score {filters.minScore ? `(${filters.minScore})` : ""}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Minimum Score</Label>
              <span className="text-xs font-medium text-foreground">{filters.minScore ?? 0}</span>
            </div>
            <Slider
              value={[filters.minScore ?? 0]}
              onValueChange={([v]) => update({ minScore: v || undefined })}
              max={100}
              step={5}
            />
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}