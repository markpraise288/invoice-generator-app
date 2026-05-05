import { Invoice } from "@/types";
export function computeDashboardStats(invoices: Invoice[]) {
  let totalInvoices = 0;
  let paidInvoices = 0;
  let pendingInvoices = 0;
  let totalRevenue = 0;

  for (const invoice of invoices) {
    if (invoice.isDeletedAt) continue;

    totalInvoices++;

    const paidAmount = invoice.payments!.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    const remaining = invoice.total! - paidAmount;

    // ✅ PAID
    if (paidAmount >= invoice.total!) {
      paidInvoices++;
    }

    // ✅ PENDING (partial or unpaid but sent)
    if (paidAmount > 0 && paidAmount < invoice.total!) {
      pendingInvoices++;
    }

    // optional: unpaid but active
    if (paidAmount === 0 && invoice.status !== "draft") {
      pendingInvoices++;
    }

    // ✅ REVENUE = ONLY money received
    totalRevenue += paidAmount;
  }

  return {
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    totalRevenue,
  };
}