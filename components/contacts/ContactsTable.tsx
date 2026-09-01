// components/contacts/ContactsTable.tsx

"use client";

import { useState, useCallback } from "react";
import { useDeleteContact } from "@/hooks/useContacts";
import type {
  Contact,
  ContactStage,
  ContactFilters,
} from "@/hooks/useContacts";
import { ContactDetailsDrawer } from "./ContactDetailsDrawer";
import { CreateContactDialog } from "./CreateContactDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  ListChecks,
} from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { useProfile } from "@/hooks/useSettings";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ContactsTableProps {
  contacts: Contact[];
  isLoading?: boolean;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters: ContactFilters;
  onFilterChange: (patch: Partial<ContactFilters>) => void;
  onPageChange: (page: number) => void;
  isFiltered?: boolean;
}

// ─── Stage Config ──────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<ContactStage, { label: string; className: string }> =
  {
    subscriber: {
      label: "Subscriber",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    lead: {
      label: "Lead",
      className:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    },
    opportunity: {
      label: "Opportunity",
      className:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    },
    customer: {
      label: "Customer",
      className:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
    evangelist: {
      label: "Evangelist",
      className:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    },
    other: {
      label: "Other",
      className: "bg-muted text-muted-foreground",
    },
  };

// ─── Avatar ────────────────────────────────────────────────────────────────────

function ContactAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-primary">{initials}</span>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/40 border-b border-border px-4 py-2.5 flex items-center gap-4">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <Skeleton className="size-4 rounded shrink-0" />
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-3 w-24 hidden md:block" />
            <Skeleton className="h-5 w-20 rounded-full hidden lg:block" />
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
  onCreateContact,
  createContact,
  setCreateContact
}: {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onCreateContact?: () => void;
  createContact: boolean;
  setCreateContact: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Mail size={20} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {isFiltered ? "No contacts match your filters" : "No contacts yet"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-60">
          {isFiltered
            ? "Try adjusting or clearing your filters"
            : "Create your first contact or convert a lead"}
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
          <Button size="sm" className="mt-4" onClick={onCreateContact}>
            Add contact
          </Button>
        )}
      </div>

      <CreateContactDialog
        open={createContact}
        onOpenChange={setCreateContact}
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
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span> contacts
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

// ─── Contact Row ───────────────────────────────────────────────────────────────

function ContactRow({
  contact,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  setCreateOpen
}: {
  contact: Contact;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  setCreateOpen: () => void;
}) {
  const stage = STAGE_CONFIG[contact.stage];
  const relatedName = contact.relatedId.name

  return (
    <div
      onClick={onView}
      className={cn(
        "group px-4 py-3 flex items-center gap-4 transition-colors cursor-pointer",
        selected ? "bg-primary/5" : "hover:bg-muted/30",
      )}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select ${contact.name}`}
        />
      </div>

      {/* Avatar + name */}
      <ContactAvatar name={contact.name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {contact.name}
        </p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {contact.email && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Mail size={10} />
              <span className="truncate max-w-40">{contact.email}</span>
            </span>
          )}
          {contact.phone && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Phone size={10} />
              {contact.phone}
            </span>
          )}
        </div>
      </div>

      {/* Related To */}
      <div className="hidden md:flex items-center gap-1.5 w-40 shrink-0 min-w-0">
        {relatedName ? (
          <>
            <Building2 size={12} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {relatedName}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Stage */}
      <div className="hidden lg:block w-28 shrink-0">
        <Badge
          variant="secondary"
          className={cn("text-[10px] px-1.5 h-5 font-medium", stage.className)}
        >
          {stage.label}
        </Badge>
      </div>

      {/* Last contacted */}
      <div className="hidden xl:flex items-center gap-1 w-28 shrink-0">
        <Clock size={11} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground truncate">
          {contact.lastContactedAt
            ? formatDistanceToNow(new Date(contact.lastContactedAt), {
                addSuffix: true,
              })
            : "Never"}
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
              View details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={onEdit}>
              <Pencil size={13} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={setCreateOpen}>
              <ListChecks size={13} className="mr-2" />
              Add task
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
        {count} contact{count !== 1 ? "s" : ""} selected
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

export function ContactsTable({
  contacts,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  isFiltered,
}: ContactsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewContactId, setViewContactId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createContact, setCreateContact] = useState(false)

  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();
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
      prev.size === contacts.length
        ? new Set()
        : new Set(contacts.map((c) => c._id)),
    );
  };

  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const allSelected = contacts.length > 0 && selected.size === contacts.length;

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = (contactId: string) => {
    deleteContact(contactId, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    let done = 0;
    ids.forEach((id) => {
      deleteContact(id, {
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
    { label: "Last contacted", value: "lastContactedAt" },
    { label: "Last updated", value: "updatedAt" },
  ];

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label ?? "Date added";

  if (isLoading) return <TableSkeleton />;

  if (contacts.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        onClearFilters={() =>
          onFilterChange({
            search: undefined,
            stage: undefined,
            sortBy: "createdAt",
            sortDir: "desc",
            page: 1,
          })
        }
        onCreateContact={() => setCreateContact(true)}
        createContact={createContact}
        setCreateContact={()=>setCreateContact(false)}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* ── Toolbar row ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {pagination?.total ?? contacts.length} contact
            {(pagination?.total ?? contacts.length) !== 1 ? "s" : ""}
          </span>

          {/* Sort dropdown */}
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
              Name
            </span>
            <span className="text-xs font-medium text-muted-foreground w-40 hidden md:block">
              Company
            </span>
            <span className="text-xs font-medium text-muted-foreground w-28 hidden lg:block">
              Stage
            </span>
            <span className="text-xs font-medium text-muted-foreground w-28 hidden xl:block">
              Last contacted
            </span>
            <span className="w-7" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {contacts.map((contact) => (
              <div key={contact._id}>
                <ContactRow
                  key={contact._id}
                  contact={contact}
                  selected={selected.has(contact._id)}
                  onSelect={() => toggleOne(contact._id)}
                  onView={() => {
                    setViewContactId(contact._id);
                    setDrawerOpen(true);
                  }}
                  onEdit={() => {
                    setEditContact(contact);
                    setEditOpen(true);
                  }}
                  onDelete={() => setDeleteTarget(contact)}
                  setCreateOpen={ ()=> setCreateOpen(true)}
                />
                <CreateTaskDialog
                  open={createOpen}
                  onOpenChange={setCreateOpen}
                  currentUserId={profile?._id}
                  relatedId={contact._id}
                  relatedTo="Contact"
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

      {/* ── Contact details drawer ── */}
      <ContactDetailsDrawer
        contactId={viewContactId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewContactId(null);
        }}
        onDeleted={clearSelection}
      />

      {/* ── Edit dialog ── */}
      <CreateContactDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditContact(null);
        }}
        editContact={editContact}
      />

      {/* ── Single delete confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
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
              Delete {selected.size} contact
              {selected.size !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected contacts. This cannot be
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
                : `Delete ${selected.size} contact${selected.size !== 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
