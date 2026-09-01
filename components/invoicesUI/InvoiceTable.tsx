"use client";

import StatusBadge from "@/components/invoicesUI/StatusBadge";
import { getInvoiceStatus } from "@/lib/getInvoiceStatus";
import { Invoice } from "@/types";
import InvoiceActions from "./InvoiceActions";
import { FileText } from "lucide-react";

interface InvoicesTableProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  updateInvoice: (invoice: Invoice) => void;
  downloadInvoice: (invoice: Invoice) => void;
}

// ─── Client Avatar ─────────────────────────────────────────────────────────────

function ClientAvatar({ name }: { name: string }) {
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

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <FileText size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No invoices yet</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
        Invoices you create will show up here
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InvoicesTable({
  invoices,
  onDelete,
  updateInvoice,
  downloadInvoice,
}: InvoicesTableProps) {
  const dueDate = (date: string) => {
    return date.split("T")[0];
  };

  const formatMoney = (number: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);
  };

  const visibleInvoices = invoices.filter((invoice) => !invoice.isDeleted);

  if (visibleInvoices.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-left border-collapse">
        {/* ── Header ── */}
        <thead>
          <tr className="bg-muted/40 border-b border-border">
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
              Invoice #
            </th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
              Customer
            </th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
              Amount
            </th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
              Due date
            </th>
            <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">
              Actions
            </th>
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className="divide-y divide-border">
          {visibleInvoices.map((invoice) => {
            const paidAmount = invoice.payments!.reduce(
              (sum, p) => sum + p.amount,
              0
            );
            const remaining = invoice.total! - paidAmount;

            return (
              <tr
                key={invoice._id}
                className="group transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {invoice.invoiceNumber}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ClientAvatar name={invoice.customerSnapshot.name} />
                    <span className="text-sm text-foreground truncate">
                      {invoice.customerSnapshot.name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {formatMoney(remaining || invoice.total!)}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={getInvoiceStatus(invoice)} />
                </td>

                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    {dueDate(invoice.dueDate)}
                  </span>
                </td>

                <InvoiceActions
                  invoice={invoice}
                  onDelete={onDelete}
                  updateInvoice={updateInvoice}
                  downloadInvoice={downloadInvoice}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}