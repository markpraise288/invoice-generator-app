"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentsListParams } from "@/hooks/usePayments";

interface PaymentsFiltersProps {
  filters: PaymentsListParams;
  onChange: (filters: PaymentsListParams) => void;
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const methodOptions = [
  { value: "all", label: "All methods" },
  { value: "paypal", label: "PayPal" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "manual", label: "Manual" },
];

export function PaymentsFilters({ filters, onChange }: PaymentsFiltersProps) {
  const hasActiveFilters =
    filters.status || filters.method || filters.dateFrom || filters.dateTo;

  const update = (patch: Partial<PaymentsListParams>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const clearAll = () => {
    onChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status || "all"}
        onValueChange={(v) => update({ status: v === "all" ? undefined : (v as any) })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.method || "all"}
        onValueChange={(v) => update({ method: v === "all" ? undefined : (v as any) })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {methodOptions.map((opt) => (
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
            className={cn(
              "gap-2",
              (filters.dateFrom || filters.dateTo) && "border-primary text-primary"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {filters.dateFrom || filters.dateTo
              ? `${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`
              : "Date range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="start">
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="dateFrom" className="text-xs">From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => update({ dateFrom: e.target.value || undefined })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dateTo" className="text-xs">To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => update({ dateTo: e.target.value || undefined })}
              />
            </div>
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