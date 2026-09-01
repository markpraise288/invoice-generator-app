"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  ChevronDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Invoice, Payment } from "@/types";
import InvoicesTable from "@/components/invoicesUI/InvoiceTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useInvoices,
  useDeleteInvoice,
  useUpdateInvoice,
  useDownloadInvoice,
  computeInvoiceStatus,
  formatMoney,
} from "@/hooks/useInvoices";

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  bgClass: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div
        className={cn(
          "size-9 rounded-lg flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <Icon size={16} className={iconClass} />
      </div>
      <div className="flex flex-col min-w-0">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <span className="text-lg font-bold text-foreground leading-none truncate">
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Filter options ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
];

const DATE_OPTIONS = [
  { value: "all", label: "All dates" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
];

const SORT_OPTIONS: { value: "none" | "asc" | "desc"; label: string }[] = [
  { value: "none", label: "Default order" },
  { value: "desc", label: "Amount: High to low" },
  { value: "asc", label: "Amount: Low to high" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const router = useRouter();
  const { data: invoices = [], isLoading } = useInvoices();
  const deleteMutation = useDeleteInvoice();
  const updateMutation = useUpdateInvoice();
  const downloadMutation = useDownloadInvoice();

  const [isPaying, setIsPaying] = useState(false);
  const [updatedInvoice, setUpdatedInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [paymentDetails, setPaymentDetails] = useState<Payment>({
    amount: 0,
    date: new Date().toISOString(),
  });

  // ── Filter state ──────────────────────────────────────────────────────────

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortAmount, setSortAmount] = useState<"none" | "asc" | "desc">(
    "none"
  );
  const [dateFilter, setDateFilter] = useState("all");

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const visible = invoices.filter((inv) => !inv.isDeleted);

    let totalCollected = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;
    let paidCount = 0;

    visible.forEach((inv) => {
      const paid =
        inv.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = (inv.total ?? 0) - paid;
      const status = computeInvoiceStatus(inv);

      totalCollected += paid;
      if (status !== "paid") totalOutstanding += remaining;
      if (status === "overdue") overdueCount++;
      if (status === "paid") paidCount++;
    });

    return {
      total: visible.length,
      totalCollected,
      totalOutstanding,
      overdueCount,
      paidCount,
    };
  }, [invoices]);

  // ── Filter + sort engine ──────────────────────────────────────────────────

  const filteredInvoices = useMemo(() => {
    let data = invoices.filter((inv) => !inv.isDeleted);

    if (search) {
      data = data.filter(
        (inv) =>
          inv.invoiceNumber!.toLowerCase().includes(search.toLowerCase()) ||
          inv.customerSnapshot.name
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (inv) => computeInvoiceStatus(inv) === statusFilter
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();

      data = data.filter((inv) => {
        const date = new Date(inv.dueDate);

        if (dateFilter === "thisMonth") {
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        }

        if (dateFilter === "lastMonth") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);

          return (
            date.getMonth() === lastMonth.getMonth() &&
            date.getFullYear() === lastMonth.getFullYear()
          );
        }

        return true;
      });
    }

    if (sortAmount === "asc") data.sort((a, b) => a.total! - b.total!);
    if (sortAmount === "desc") data.sort((a, b) => b.total! - a.total!);

    return data;
  }, [invoices, search, statusFilter, sortAmount, dateFilter]);

  const isFiltered =
    !!search ||
    statusFilter !== "all" ||
    dateFilter !== "all" ||
    sortAmount !== "none";

  // ── Delete ─────────────────────────────────────────────────────────────────

  const onDelete = (id: string) => setDeleteTarget(id);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  // ── Payment modal ─────────────────────────────────────────────────────────

  const updateInvoice = (invoice: Invoice) => {
    setUpdatedInvoice(invoice);
    setIsPaying(true);
  };

  const handleChange = (value: string) => {
    setPaymentDetails((prev) => ({ ...prev, amount: Number(value) }));
  };

  const handleSubmit = () => {
    if (!updatedInvoice) return;

    const newPayments = [...(updatedInvoice.payments || []), paymentDetails];

    updateMutation.mutate(
      { id: updatedInvoice._id!, data: { payments: newPayments } },
      {
        onSuccess: () => {
          setPaymentDetails({ amount: 0, date: new Date().toISOString() });
          setIsPaying(false);
          setUpdatedInvoice(null);
        },
      }
    );
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortAmount("none");
    setDateFilter("all");
  };

  const downloadInvoice = (invoice: Invoice) => {
    if (!invoice._id) return;
    downloadMutation.mutate(invoice._id);
  };

  const activeStatusLabel =
    STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ??
    "All status";
  const activeDateLabel =
    DATE_OPTIONS.find((s) => s.value === dateFilter)?.label ?? "All dates";
  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortAmount)?.label ??
    "Default order";

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">
              Invoices
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.total
                ? `${stats.total} total invoice${stats.total !== 1 ? "s" : ""}`
                : "Manage your invoices"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => router.push("/invoices/create")}
        >
          <Plus size={15} />
          Create invoice
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Collected"
          value={formatMoney(stats.totalCollected)}
          icon={DollarSign}
          iconClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          isLoading={isLoading}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(stats.totalOutstanding)}
          icon={Clock}
          iconClass="text-amber-500"
          bgClass="bg-amber-500/10"
          isLoading={isLoading}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueCount}
          icon={AlertTriangle}
          iconClass="text-rose-500"
          bgClass="bg-rose-500/10"
          isLoading={isLoading}
        />
        <StatCard
          label="Paid in full"
          value={stats.paidCount}
          icon={CheckCircle2}
          iconClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={isLoading}
        />
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
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
                statusFilter !== "all" && "border-primary text-primary"
              )}
            >
              {activeStatusLabel}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">Status</DropdownMenuLabel>
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={statusFilter === opt.value}
                onCheckedChange={() => setStatusFilter(opt.value)}
                className="text-xs"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs",
                dateFilter !== "all" && "border-primary text-primary"
              )}
            >
              {activeDateLabel}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">Due date</DropdownMenuLabel>
            {DATE_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={dateFilter === opt.value}
                onCheckedChange={() => setDateFilter(opt.value)}
                className="text-xs"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-xs",
                sortAmount !== "none" && "border-primary text-primary"
              )}
            >
              <SlidersHorizontal size={12} />
              {activeSortLabel}
              <ChevronDown size={12} className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={sortAmount === opt.value}
                onCheckedChange={() => setSortAmount(opt.value)}
                className="text-xs"
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/40 border-b border-border px-4 py-2.5">
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4">
                <Skeleton className="h-3.5 w-20" />
                <div className="flex items-center gap-2.5 flex-1">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <InvoicesTable
          invoices={filteredInvoices}
          onDelete={onDelete}
          updateInvoice={updateInvoice}
          downloadInvoice={downloadInvoice}
        />
      )}

      {/* ── Payment dialog ── */}
      <Dialog open={isPaying} onOpenChange={setIsPaying}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <DollarSign size={16} className="text-primary" />
              Add payment
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="amount" className="text-xs">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              autoFocus
              className="h-9"
              onChange={(e) => handleChange(e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaying(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This invoice will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}