// app/deals/page.tsx

"use client";

import { useState } from "react";
import {
  useDeals,
  useDeleteDeal,
  usePipelineSummary,
  dealStageConfig,
  formatDealValue,
} from "@/hooks/useDeals";
import type { Deal, DealStage, DealFilters } from "@/hooks/useDeals";
import { DealKanban } from "@/components/deals/DealKanban";
import { DealDetailsDrawer } from "@/components/deals/DealDetailsDrawer";
import { CreateDealDialog } from "@/components/deals/CreateDealDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
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
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  DollarSign,
  Plus,
  Search,
  Kanban,
  List,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  Trophy,
  AlertTriangle,
  SlidersHorizontal,
  ListChecks,
} from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { useProfile } from "@/hooks/useSettings";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = "kanban" | "list";

interface DealsPageProps {
  currentUser?: { _id: string; name: string };
}

// ─── Pipeline Stats Bar ────────────────────────────────────────────────────────

function PipelineStatsBar() {
  const { data: pipeline, isLoading } = usePipelineSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card px-4 py-3 space-y-2"
          >
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!pipeline) return null;

  const { summary } = pipeline;

  const stats = [
    {
      label: "Pipeline value",
      value: formatDealValue(summary.openValue),
      icon: DollarSign,
      iconClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
    },
    {
      label: "Won revenue",
      value: formatDealValue(summary.wonValue),
      icon: Trophy,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10",
    },
    {
      label: "Win rate",
      value: `${summary.winRate}%`,
      icon: TrendingUp,
      iconClass: "text-violet-500",
      bgClass: "bg-violet-500/10",
    },
    {
      label: "Total deals",
      value: summary.totalDeals,
      icon: SlidersHorizontal,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3"
          >
            <div
              className={cn(
                "size-9 rounded-lg flex items-center justify-center shrink-0",
                stat.bgClass,
              )}
            >
              <Icon size={16} className={stat.iconClass} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold text-foreground leading-none">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── List View Skeleton ────────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/40 border-b border-border px-4 py-2.5">
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <Skeleton className="size-4 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-16 hidden lg:block" />
            <Skeleton className="h-4 w-16 hidden lg:block" />
            <Skeleton className="size-7 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Deal List Row ─────────────────────────────────────────────────────────────

function DealListRow({
  deal,
  selected,
  onSelect,
  onDelete,
  onClick,
  setOpenTaskDialog,
}: {
  deal: Deal;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onClick: () => void;
  setOpenTaskDialog: () => void;
}) {
  const stageConf = dealStageConfig[deal.stage];

  return (
    <div
      className={cn(
        "group px-4 py-3 flex items-center gap-4 transition-colors cursor-pointer",
        selected ? "bg-primary/5" : "hover:bg-muted/30",
        deal.isOverdue &&
          !["closed_won", "closed_lost"].includes(deal.stage) &&
          "bg-rose-50/40 dark:bg-rose-950/10",
      )}
      onClick={onClick}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select ${deal.title}`}
        />
      </div>

      {/* Title + relations */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {deal.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {deal.relatedId?.name}
            </span>
        </div>
      </div>

      {/* Stage */}
      <div className="hidden sm:block shrink-0">
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] px-1.5 h-5 font-medium",
            stageConf.bgClass,
            stageConf.textClass,
          )}
        >
          {stageConf.label}
        </Badge>
      </div>

      {/* Value */}
      <div className="hidden md:block w-24 text-right shrink-0">
        <span className="text-sm font-semibold text-foreground">
          {formatDealValue(deal.value)}
        </span>
      </div>

      {/* Probability */}
      <div className="hidden lg:flex items-center gap-1 w-16 shrink-0">
        <TrendingUp size={11} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {deal.probability}%
        </span>
      </div>

      {/* Close date */}
      <div className="hidden lg:block w-28 shrink-0">
        <span
          className={cn(
            "text-xs",
            deal.isOverdue &&
              !["closed_won", "closed_lost"].includes(deal.stage)
              ? "text-rose-500 font-medium"
              : "text-muted-foreground",
          )}
        >
          {deal.isOverdue &&
            !["closed_won", "closed_lost"].includes(deal.stage) && (
              <AlertTriangle size={10} className="inline mr-1" />
            )}
          {format(new Date(deal.closeDate), "MMM d, yyyy")}
        </span>
      </div>

      {/* Actions */}
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onClick} className="text-xs">
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={setOpenTaskDialog} className="text-xs">
              <ListChecks size={13} className="mr-2" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-xs text-destructive focus:text-destructive"
            >
              <Trash2 size={13} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-4 px-1">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span> deals
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft size={13} />
        </Button>
        <span className="text-xs text-muted-foreground px-2">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
        >
          <ChevronRight size={13} />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DealsPage({ currentUser }: DealsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filters, setFilters] = useState<DealFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStage, setCreateStage] = useState<DealStage | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  const { mutate: deleteDeal, isPending: isDeleting } = useDeleteDeal();
  const { data: profile } = useProfile();

  const activeFilters: DealFilters = {
    ...filters,
    search: search || undefined,
  };

  const { data, isLoading, isError, refetch } = useDeals(
    viewMode === "list" ? activeFilters : undefined,
  );

  const deals = data?.deals ?? [];
  const pagination = data?.pagination;

  const isFiltered = !!(search || filters.stage);

  const updateFilter = (patch: Partial<DealFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortDir: "desc",
    });
  };

  // ── Selection ──────────────────────────────────────────────────────────────

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === deals.length ? new Set() : new Set(deals.map((d) => d._id)),
    );
  };

  const clearSelection = () => setSelected(new Set());
  const allSelected = deals.length > 0 && selected.size === deals.length;

  // ── Deal click ─────────────────────────────────────────────────────────────

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setDrawerOpen(true);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = (dealId: string) => {
    deleteDeal(dealId, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    let completed = 0;
    ids.forEach((id) => {
      deleteDeal(id, {
        onSuccess: () => {
          completed++;
          if (completed === ids.length) {
            setBulkDeleteOpen(false);
            clearSelection();
          }
        },
      });
    });
  };

  // ── Create ─────────────────────────────────────────────────────────────────

  const handleCreateDeal = (stage?: DealStage) => {
    setCreateStage(stage);
    setCreateOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 py-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <DollarSign size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">
              Deals
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your sales pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "kanban"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Kanban view"
            >
              <Kanban size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "list"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => handleCreateDeal()}
          >
            <Plus size={15} />
            New deal
          </Button>
        </div>
      </div>

      {/* ── Pipeline stats ── */}
      <PipelineStatsBar />

      {/* ── Kanban view ── */}
      {viewMode === "kanban" && (
        <DealKanban
          onCreateDeal={handleCreateDeal}
          onDealClick={handleDealClick}
          ownerId={currentUser?._id}
        />
      )}

      {/* ── List view ── */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-4">
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
                placeholder="Search deals..."
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

            {/* Stage filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5 text-xs",
                    filters.stage && "border-primary text-primary",
                  )}
                >
                  {filters.stage
                    ? filters.stage === "open"
                      ? "Open deals"
                      : filters.stage === "closed"
                        ? "Closed deals"
                        : dealStageConfig[filters.stage as DealStage]?.label
                    : "All stages"}
                  <ChevronDown size={12} className="opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-xs">Stage</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={!filters.stage}
                  onCheckedChange={() => updateFilter({ stage: undefined })}
                  className="text-xs"
                >
                  All stages
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.stage === "open"}
                  onCheckedChange={() =>
                    updateFilter({ stage: "open" as DealStage })
                  }
                  className="text-xs"
                >
                  Open deals
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.stage === "closed"}
                  onCheckedChange={() =>
                    updateFilter({ stage: "closed" as DealStage })
                  }
                  className="text-xs"
                >
                  Closed deals
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {(Object.keys(dealStageConfig) as DealStage[]).map((stage) => (
                  <DropdownMenuCheckboxItem
                    key={stage}
                    checked={filters.stage === stage}
                    onCheckedChange={() => updateFilter({ stage })}
                    className="text-xs gap-2"
                  >
                    <span
                      className="size-2 rounded-full shrink-0 inline-block"
                      style={{
                        backgroundColor: dealStageConfig[stage].color,
                      }}
                    />
                    {dealStageConfig[stage].label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs ml-auto"
                >
                  <SlidersHorizontal size={12} />
                  Sort
                  <ChevronDown size={12} className="opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">
                  Sort by
                </DropdownMenuLabel>
                {[
                  { label: "Date created", value: "createdAt" },
                  { label: "Deal value", value: "value" },
                  { label: "Close date", value: "closeDate" },
                  { label: "Probability", value: "probability" },
                ].map((opt) => (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={filters.sortBy === opt.value}
                    onCheckedChange={() => updateFilter({ sortBy: opt.value })}
                    className="text-xs"
                  >
                    {opt.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.sortDir === "asc"}
                  onCheckedChange={() =>
                    updateFilter({
                      sortDir: filters.sortDir === "asc" ? "desc" : "asc",
                    })
                  }
                  className="text-xs"
                >
                  Ascending
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5">
              <span className="text-xs font-medium">
                {selected.size} deal{selected.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs text-destructive hover:text-destructive border-destructive/30"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 size={12} className="mr-1.5" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={clearSelection}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          {isLoading ? (
            <ListSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-12 rounded-xl border border-border text-center">
              <p className="text-sm text-muted-foreground">
                Failed to load deals
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : deals.length === 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <DollarSign size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {isFiltered ? "No deals match your filters" : "No deals yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  {isFiltered
                    ? "Try adjusting your filters"
                    : "Create your first deal to start tracking your pipeline"}
                </p>
                {!isFiltered && (
                  <Button
                    size="sm"
                    className="mt-4 gap-1.5"
                    onClick={() => handleCreateDeal()}
                  >
                    <Plus size={13} />
                    New deal
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="bg-muted/40 border-b border-border px-4 py-2.5 flex items-center gap-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
                <span className="text-xs font-medium text-muted-foreground flex-1">
                  Deal
                </span>
                <span className="text-xs font-medium text-muted-foreground hidden sm:block w-24">
                  Stage
                </span>
                <span className="text-xs font-medium text-muted-foreground hidden md:block w-24 text-right">
                  Value
                </span>
                <span className="text-xs font-medium text-muted-foreground hidden lg:block w-16">
                  Win %
                </span>
                <span className="text-xs font-medium text-muted-foreground hidden lg:block w-28">
                  Close date
                </span>
                <span className="w-7" />
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {deals.map((deal) => (
                  <div key={deal._id}>
                    <DealListRow
                      key={deal._id}
                      deal={deal}
                      selected={selected.has(deal._id)}
                      onSelect={() => toggleOne(deal._id)}
                      onDelete={() => setDeleteTarget(deal)}
                      onClick={() => handleDealClick(deal)}
                      setOpenTaskDialog={() => setOpenTaskDialog(true)}
                    />
                    <CreateTaskDialog
                      open={openTaskDialog}
                      onOpenChange={setOpenTaskDialog}
                      currentUserId={profile?._id ?? ''}
                      relatedId={deal._id}
                      relatedTo="Deal"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          )}
        </div>
      )}

      {/* ── Deal details drawer ── */}
      <DealDetailsDrawer
        deal={selectedDeal}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDeal(null);
        }}
        currentUserId={currentUser?._id}
      />

      {/* ── Create deal dialog ── */}
      <CreateDealDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStage={createStage}
        onSuccess={() => refetch()}
      />

      {/* ── Single delete confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget._id)}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bulk delete confirm ── */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} deal{selected.size > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected deals and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBulkDelete}
            >
              {isDeleting
                ? "Deleting..."
                : `Delete ${selected.size} deal${selected.size > 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
