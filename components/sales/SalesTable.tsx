"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { SaleStatusBadge } from "@/components/sales/SaleStatusBadge";
import { useDeleteSale, useUpdateSaleStatus, type Sale } from "@/hooks/useSales";
import { toast } from "sonner";

interface SalesTableProps {
  sales: Sale[];
  isLoading: boolean;
  onView: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
}

const formatCurrency = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(
    cents / 100
  );
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function SalesTable({ sales, isLoading, onView, onEdit }: SalesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const deleteSale = useDeleteSale();
  const updateStatus = useUpdateSaleStatus();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSale.mutateAsync(deleteTarget._id);
      toast.success("Sale deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete sale");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (sale: Sale, status: "paid" | "cancelled" | "refunded") => {
    try {
      await updateStatus.mutateAsync({ id: sale._id, status });
      toast.success(`Sale marked as ${status}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update sale status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!sales.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No sales yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first sale to start tracking revenue.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Sale #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => {
              const isFinal = sale.status === "paid" || sale.status === "refunded";

              return (
                <TableRow key={sale._id} className="cursor-pointer" onClick={() => onView(sale)}>
                  <TableCell className="font-medium text-foreground">{sale.saleNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">{sale.customer?.name}</span>
                      <span className="text-xs text-muted-foreground">{sale.customer?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SaleStatusBadge status={sale.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sale.lineItems?.length} {sale.lineItems?.length === 1 ? "item" : "items"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(sale.saleDate)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(sale.total, sale.currency)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(sale)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        {!isFinal && (
                          <DropdownMenuItem onClick={() => onEdit(sale)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {sale.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(sale, "paid")}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark paid
                          </DropdownMenuItem>
                        )}
                        {sale.status !== "cancelled" && !isFinal && (
                          <DropdownMenuItem onClick={() => handleStatusChange(sale, "cancelled")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        {sale.status === "paid" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(sale, "refunded")}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Refund
                          </DropdownMenuItem>
                        )}
                        {!isFinal && (
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400 focus:text-red-600"
                            onClick={() => setDeleteTarget(sale)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sale {deleteTarget?.saleNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this sale record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}