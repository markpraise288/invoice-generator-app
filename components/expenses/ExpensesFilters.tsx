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
import type { ExpensesListParams, ExpenseCategory } from "@/hooks/useExpenses";

interface ExpensesFiltersProps {
  filters: ExpensesListParams;
  onChange: (filters: ExpensesListParams) => void;
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
];

const categoryOptions: { value: ExpenseCategory | "all"; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "software", label: "Software" },
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals & Entertainment" },
  { value: "marketing", label: "Marketing" },
  { value: "payroll", label: "Payroll" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "professional_services", label: "Professional Services" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

export function ExpensesFilters({ filters, onChange }: ExpensesFiltersProps) {
  const hasActiveFilters = filters.category || filters.status || filters.dateFrom || filters.dateTo;

  const update = (patch: Partial<ExpensesListParams>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const clearAll = () => {
    onChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.category || "all"}
        onValueChange={(v) => update({ category: v === "all" ? undefined : (v as ExpenseCategory) })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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