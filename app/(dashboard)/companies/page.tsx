// app/companies/page.tsx — replace the existing file

"use client";

import { useState, useCallback } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import type { CompanyFilters, CompanySize } from "@/hooks/useCompanies";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { CreateCompanyDialog } from "@/components/companies/CreateCompanyDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Building2, Plus, Search, X, ChevronDown } from "lucide-react";

export default function CompaniesPage() {
  const [filters, setFilters] = useState<CompanyFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const activeFilters: CompanyFilters = {
    ...filters,
    search: search || undefined,
  };

  const { data, isLoading } = useCompanies(activeFilters);

  const companies = data?.companies ?? [];
  const pagination = data?.pagination;
  const isFiltered = !!(search || filters.industry || filters.size);

  const updateFilter = useCallback((patch: Partial<CompanyFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">
              Companies
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pagination?.total
                ? `${pagination.total} total companies`
                : "Manage your company relationships"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={15} />
          Add company
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            placeholder="Search companies..."
            className="pl-8 h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Size filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs",
                filters.size && "border-primary text-primary"
              )}
            >
              {filters.size ? `${filters.size} employees` : "Any size"}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">Size</DropdownMenuLabel>
            {(
              [
                "1-10",
                "11-50",
                "51-200",
                "201-500",
                "501-1000",
                "1000+",
              ] as CompanySize[]
            ).map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={filters.size === s}
                onCheckedChange={() =>
                  updateFilter({
                    size: filters.size === s ? undefined : s,
                  })
                }
                className="text-xs"
              >
                {s} employees
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Industry filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs",
                filters.industry && "border-primary text-primary"
              )}
            >
              {filters.industry ?? "Any industry"}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs">Industry</DropdownMenuLabel>
            {[
              "Technology","Finance","Healthcare","Education",
              "Retail","Manufacturing","Marketing","Legal",
              "Real Estate","Other",
            ].map((ind) => (
              <DropdownMenuCheckboxItem
                key={ind}
                checked={filters.industry === ind}
                onCheckedChange={() =>
                  updateFilter({
                    industry: filters.industry === ind ? undefined : ind,
                  })
                }
                className="text-xs"
              >
                {ind}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isFiltered && (
          <button
            onClick={() => {
              setSearch("");
              updateFilter({ industry: undefined, size: undefined });
            }}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <CompaniesTable
        companies={companies}
        isLoading={isLoading}
        pagination={pagination}
        filters={filters}
        onFilterChange={updateFilter}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        isFiltered={isFiltered}
      />

      {/* Create dialog */}
      <CreateCompanyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}