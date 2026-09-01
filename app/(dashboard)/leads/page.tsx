"use client";

import { useState } from "react";
import { Plus, Search, LayoutGrid, List as ListIcon, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useLeads,
  useLeadsSummary,
  type Lead,
  type LeadsListParams,
} from "@/hooks/useLeads";
import { LeadKanban } from "@/components/leads/LeadKanban";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { LeadFormDialog } from "@/components/leads/LeadFormDialog";
import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { div } from "framer-motion/client";

type ViewMode = "kanban" | "list";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

export default function LeadsPage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listFilters, setListFilters] = useState<LeadsListParams>({
    page: 1,
    limit: 50,
  });

  const { data: summary, isLoading: summaryLoading } = useLeadsSummary();
  const { data: listData, isLoading: listLoading } = useLeads({
    ...listFilters,
    search: debouncedSearch,
  });

  const openDrawer = (lead: Lead) => {
    setDrawerLeadId(lead._id);
    setDrawerOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  };

  const openEditFromDrawer = () => {
    const lead =
      listData?.leads.find((l) => l._id === drawerLeadId) ||
      (drawerLeadId ? ({ _id: drawerLeadId } as Lead) : null);
    setDrawerOpen(false);
    if (lead) openEdit(lead);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingLead(null);
  };

  const wonCount = summary?.byStage?.won?.count ?? 0;
  const lostCount = summary?.byStage?.lost?.count ?? 0;
  const activeCount = (summary?.totalLeads ?? 0) - wonCount - lostCount;
  const winRate =
    wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Track your sales pipeline from first contact to close.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Lead
        </Button>
      </div>

      {/* SUMMARY CARDS */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Active Leads
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{activeCount}</p>
          </div>
          <div className="rounded-xl border p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Pipeline Value
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(summary?.totalPipelineValue ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border p-5">
            <p className="text-xs font-medium uppercase text-emerald-600 dark:text-emerald-400">
              Won
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{wonCount}</p>
          </div>
          <div className="rounded-xl border p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Win Rate
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{winRate}%</p>
          </div>
        </div>
      )}

      {/* SEARCH + VIEW TOGGLE */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {view === "list" && (
            <LeadsFilters filters={listFilters} onChange={setListFilters} />
          )}
        </div>

        <div className="flex items-center rounded-lg border p-0.5">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "kanban"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Pipeline
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "list"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListIcon className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {/* BOARD / LIST */}
      {view === "kanban" ? (
        <div className="overflow-x-scroll max-w-6xl">
          <LeadKanban onCardClick={openDrawer} />
        </div>
      ) : (
        <>
          <LeadsTable
            leads={listData?.leads ?? []}
            isLoading={listLoading}
            onView={openDrawer}
            onEdit={openEdit}
          />

          {listData?.pagination && listData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {listData.pagination.page} of {listData.pagination.totalPages} ·{" "}
                {listData.pagination.total} leads
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={listFilters.page === 1}
                  onClick={() =>
                    setListFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={listFilters.page === listData.pagination.totalPages}
                  onClick={() =>
                    setListFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <LeadFormDialog open={formOpen} onOpenChange={handleFormOpenChange} lead={editingLead} />

      <LeadDetailsDrawer
        leadId={drawerLeadId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={openEditFromDrawer}
      />

    </div>
  );
}