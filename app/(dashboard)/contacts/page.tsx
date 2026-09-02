// app/contacts/page.tsx — replace the existing file
// Change the header button and add ContactsTable + CreateContactDialog

"use client";

import { useState, useCallback } from "react";
import { useContacts } from "@/hooks/useContacts";
import type { ContactFilters } from "@/hooks/useContacts";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { CreateContactDialog } from "@/components/contacts/CreateContactDialog";
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
import { Users, Plus, Search, X, ChevronDown } from "lucide-react";

export default function ContactsPage() {
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const activeFilters: ContactFilters = {
    ...filters,
    search: search || undefined,
  };

  const { data, isLoading } = useContacts(activeFilters);

  const contacts = data?.contacts ?? [];
  const pagination = data?.pagination;
  const isFiltered = !!(search || filters.stage);

  const updateFilter = useCallback((patch: Partial<ContactFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">
              Contacts
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pagination?.total
                ? `${pagination.total} total contacts`
                : "Manage your contact relationships"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={15} />
          Add contact
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
            placeholder="Search contacts..."
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs",
                filters.stage && "border-primary text-primary"
              )}
            >
              {filters.stage
                ? filters.stage.charAt(0).toUpperCase() +
                  filters.stage.slice(1)
                : "Any stage"}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">Stage</DropdownMenuLabel>
            {[
              "subscriber",
              "lead",
              "opportunity",
              "customer",
              "evangelist",
              "other",
            ].map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={filters.stage === s}
                onCheckedChange={() =>
                  updateFilter({
                    stage: filters.stage === s ? undefined : (s as any),
                  })
                }
                className="text-xs capitalize"
              >
                {s}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isFiltered && (
          <button
            onClick={() => {
              setSearch("");
              updateFilter({ stage: undefined });
            }}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <ContactsTable
        contacts={contacts}
        isLoading={isLoading}
        pagination={pagination}
        filters={filters}
        onFilterChange={updateFilter}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        isFiltered={isFiltered}
      />

      {/* Create dialog */}
      <CreateContactDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}