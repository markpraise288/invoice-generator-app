// components/companies/CompaniesTable.tsx

"use client";

import { useState, useCallback } from "react";
import { useDeleteCompany } from "@/hooks/useCompanies";
import type { Company, CompanyFilters } from "@/hooks/useCompanies";
import { CompanyDetailsDrawer } from "./CompanyDetailsDrawer";
import { CreateCompanyDialog } from "./CreateCompanyDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
  Globe,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  DollarSign,
  ListChecks,
} from "lucide-react";
import { useProfile } from "@/hooks/useSettings";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters: CompanyFilters;
  onFilterChange: (patch: Partial<CompanyFilters>) => void;
  onPageChange: (page: number) => void;
  isFiltered?: boolean;
}

// ─── Revenue formatter ─────────────────────────────────────────────────────────

const formatRevenue = (cents?: number): string => {
  if (!cents) return "—";
  const d = cents / 100;
  if (d >= 1_000_000_000) return `$${(d / 1_000_000_000).toFixed(1)}B`;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${(d / 1_000).toFixed(1)}K`;
  return `$${d.toLocaleString()}`;
};

// ─── Company Avatar ────────────────────────────────────────────────────────────

function CompanyAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-blue-500">{initials}</span>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/40 border-b border-border px-4 py-2.5 flex items-center gap-4">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <Skeleton className="size-4 rounded shrink-0" />
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-20 hidden md:block" />
            <Skeleton className="h-3 w-16 hidden lg:block" />
            <Skeleton className="h-3 w-16 hidden xl:block" />
            <Skeleton className="h-3 w-20 hidden xl:block" />
            <Skeleton className="size-7 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  isFiltered,
  onClearFilters,
  setCreateCompany,
  createCompany,
  onCreateCompany,
}: {
  isFiltered?: boolean;
  setCreateCompany: () => void;
  createCompany: boolean;
  onClearFilters?: () => void;
  onCreateCompany?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Building2 size={20} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {isFiltered ? "No companies match your filters" : "No companies yet"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
          {isFiltered
            ? "Try adjusting or clearing your filters"
            : "Create your first company or convert a lead"}
        </p>
        {isFiltered ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        ) : (
          <Button size="sm" className="mt-4" onClick={onCreateCompany}>
            Add company
          </Button>
        )}
      </div>
      
      <CreateCompanyDialog
        open={createCompany}
        onOpenChange={setCreateCompany}
      />
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
        <span className="font-medium text-foreground">{from}–{to}</span>
        {" "}of{" "}
        <span className="font-medium text-foreground">{total}</span>
        {" "}companies
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

// ─── Company Row ───────────────────────────────────────────────────────────────

function CompanyRow({
  company,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  setCreateOpen
}: {
  company: Company;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  setCreateOpen: () => void;
}) {
  return (
    <div
      onClick={onView}
      className={cn(
        "group px-4 py-3 flex items-center gap-4 transition-colors cursor-pointer",
        selected ? "bg-primary/5" : "hover:bg-muted/30"
      )}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select ${company.name}`}
        />
      </div>

      {/* Avatar + name + domain */}
      <CompanyAvatar name={company.name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {company.name}
        </p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {company.domain && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Globe size={10} />
              {company.domain}
            </span>
          )}
          {company.industry && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase size={10} />
              {company.industry}
            </span>
          )}
        </div>
      </div>

      {/* Size */}
      <div className="hidden md:flex items-center gap-1 w-28 shrink-0">
        {company.size ? (
          <>
            <Users size={11} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {company.size}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Revenue */}
      <div className="hidden lg:block w-20 shrink-0">
        <span className="text-xs font-medium text-foreground">
          {formatRevenue(company.revenue)}
        </span>
      </div>

      {/* Owner */}
      <div className="hidden xl:block w-28 shrink-0">
        <span className="text-xs text-muted-foreground truncate">
          {company.owner.name}
        </span>
      </div>

      {/* Added */}
      <div className="hidden xl:block w-24 shrink-0">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(company.createdAt), {
            addSuffix: true,
          })}
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
            <DropdownMenuItem className="text-xs" onClick={onView}>
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={onEdit}>
              <Pencil size={13} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={setCreateOpen}>
              <ListChecks size={13} className="mr-2" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={onDelete}
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

// ─── Bulk Action Bar ───────────────────────────────────────────────────────────

function BulkActionBar({
  count,
  onDelete,
  onClear,
  isLoading,
}: {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  isLoading: boolean;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5">
      <span className="text-xs font-medium">
        {count} compan{count !== 1 ? "ies" : "y"} selected
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs text-destructive hover:text-destructive border-destructive/30"
          onClick={onDelete}
          disabled={isLoading}
        >
          <Trash2 size={12} className="mr-1.5" />
          Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={onClear}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CompaniesTable({
  companies,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  isFiltered,
}: CompaniesTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewCompanyId, setViewCompanyId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCompany, setCreateCompany] = useState(false);

  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();
  const { data: profile } = useProfile();

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
      prev.size === companies.length
        ? new Set()
        : new Set(companies.map((c) => c._id))
    );
  };

  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const allSelected =
    companies.length > 0 && selected.size === companies.length;

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = (companyId: string) => {
    deleteCompany(companyId, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    let done = 0;
    ids.forEach((id) => {
      deleteCompany(id, {
        onSuccess: () => {
          done++;
          if (done === ids.length) {
            setBulkDeleteOpen(false);
            clearSelection();
          }
        },
      });
    });
  };

  // ── Sort ───────────────────────────────────────────────────────────────────

  const SORT_OPTIONS = [
    { label: "Date added", value: "createdAt" },
    { label: "Name", value: "name" },
    { label: "Revenue", value: "revenue" },
    { label: "Last updated", value: "updatedAt" },
  ];

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label ?? "Date added";

  if (isLoading) return <TableSkeleton />;

  if (companies.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        onClearFilters={() =>
          onFilterChange({
            search: undefined,
            industry: undefined,
            size: undefined,
            sortBy: "createdAt",
            sortDir: "desc",
            page: 1,
          })
        }
        onCreateCompany={() => setCreateCompany(true)}
        createCompany={createCompany}
        setCreateCompany={() => setCreateCompany(false)}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {pagination?.total ?? companies.length} compan
            {(pagination?.total ?? companies.length) !== 1 ? "ies" : "y"}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs ml-auto"
              >
                <SlidersHorizontal size={12} />
                {activeSortLabel}
                <ChevronDown size={12} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={filters.sortBy === opt.value}
                  onCheckedChange={() =>
                    onFilterChange({ sortBy: opt.value, page: 1 })
                  }
                  className="text-xs"
                >
                  {opt.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.sortDir === "asc"}
                onCheckedChange={() =>
                  onFilterChange({
                    sortDir: filters.sortDir === "asc" ? "desc" : "asc",
                    page: 1,
                  })
                }
                className="text-xs"
              >
                Ascending
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Bulk action bar ── */}
        <BulkActionBar
          count={selected.size}
          onDelete={() => setBulkDeleteOpen(true)}
          onClear={clearSelection}
          isLoading={isDeleting}
        />

        {/* ── Table ── */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-muted/40 border-b border-border px-4 py-2.5 flex items-center gap-4">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              aria-label="Select all"
            />
            <span className="text-xs font-medium text-muted-foreground flex-1">
              Company
            </span>
            <span className="text-xs font-medium text-muted-foreground w-28 hidden md:block">
              Size
            </span>
            <span className="text-xs font-medium text-muted-foreground w-20 hidden lg:block">
              Revenue
            </span>
            <span className="text-xs font-medium text-muted-foreground w-28 hidden xl:block">
              Owner
            </span>
            <span className="text-xs font-medium text-muted-foreground w-24 hidden xl:block">
              Added
            </span>
            <span className="w-7" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {companies.map((company) => (
              <div key={company._id}>
              <CompanyRow
                key={company._id}
                company={company}
                selected={selected.has(company._id)}
                onSelect={() => toggleOne(company._id)}
                onView={() => {
                  setViewCompanyId(company._id);
                  setDrawerOpen(true);
                }}
                onEdit={() => {
                  setEditCompany(company);
                  setEditOpen(true);
                }}
                onDelete={() => setDeleteTarget(company)}
                setCreateOpen={()=> setCreateOpen(true)}
              />
              <CreateTaskDialog
                  open={createOpen}
                  onOpenChange={setCreateOpen}
                  currentUserId={profile?._id ?? ''}
                  relatedId={company._id}
                  relatedTo="Company"
                />
                </div>
            ))}
          </div>
        </div>

        {/* ── Pagination ── */}
        {pagination && pagination.pages > 1 && (
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {/* ── Company details drawer ── */}
      <CompanyDetailsDrawer
        companyId={viewCompanyId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewCompanyId(null);
        }}
        onDeleted={clearSelection}
      />

      {/* ── Edit dialog ── */}
      <CreateCompanyDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditCompany(null);
        }}
        editCompany={editCompany}
      />

      {/* ── Single delete confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this company?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              will be permanently removed. Associated contacts will not be
              deleted but will be unlinked. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget && handleDelete(deleteTarget._id)
              }
            >
              {isDeleting ? "Deleting..." : "Delete company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bulk delete confirm ── */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} compan
              {selected.size !== 1 ? "ies" : "y"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Selected companies will be permanently removed. Associated
              contacts will not be deleted but will be unlinked.
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
                : `Delete ${selected.size} compan${selected.size !== 1 ? "ies" : "y"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}