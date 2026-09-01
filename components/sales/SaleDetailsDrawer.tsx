"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SaleStatusBadge } from "@/components/sales/SaleStatusBadge";
import { Pencil, Mail, Calendar } from "lucide-react";
import { useSale } from "@/hooks/useSales";

interface SaleDetailsDrawerProps {
  saleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const formatCurrency = (cents: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export function SaleDetailsDrawer({ saleId, open, onOpenChange, onEdit }: SaleDetailsDrawerProps) {
  const { data: sale, isLoading } = useSale(saleId || "");

  if (isLoading || !sale) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const isFinal = sale.status === "paid" || sale.status === "refunded";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg p-2">
        <SheetHeader>
          <div className="flex items-start justify-between pr-6">
            <div>
              <SheetTitle className="text-xl">{sale.saleNumber}</SheetTitle>
              <div className="mt-2 flex items-center gap-2">
                <SaleStatusBadge status={sale.status} />
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(sale.saleDate)}
                </span>
              </div>
            </div>
            {!isFinal && (
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              Customer
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{sale.customer.name}</p>
            <p className="text-xs text-muted-foreground">{sale.customer.email}</p>
          </div>

          {/* LINE ITEMS */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Line Items</p>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Item</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Price</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.lineItems.map((item, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-3 py-2 text-foreground">{item.description}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {formatCurrency(item.unitPrice, sale.currency)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">
                        {formatCurrency(item.total, sale.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTALS BREAKDOWN */}
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.subtotal, sale.currency)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-{formatCurrency(sale.discount, sale.currency)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>+{formatCurrency(sale.tax, sale.currency)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t pt-1 font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(sale.total, sale.currency)}</span>
            </div>
          </div>

          {/* PAYMENT STATUS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(sale.amountPaid, sale.currency)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Amount Due</p>
              <p
                className={`mt-1 text-sm font-medium ${
                  sale.amountDue > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                {formatCurrency(sale.amountDue, sale.currency)}
              </p>
            </div>
          </div>

          {sale.notes && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Notes</p>
              <p className="text-sm text-muted-foreground">{sale.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}