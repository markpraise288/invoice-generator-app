import { Invoice } from "@/types";

export function getMonthlyStats(invoices: Invoice[]) {
  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear =
    currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentRevenue = 0;
  let lastRevenue = 0;

  let currentInvoices = 0;
  let lastInvoices = 0;

  for (const invoice of invoices) {
    if (invoice.isDeletedAt) continue;

    const createdDate = new Date(invoice.createdAt);

    const month = createdDate.getMonth();
    const year = createdDate.getFullYear();

    const paidAmount = invoice.payments!.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // CURRENT MONTH
    if (month === currentMonth && year === currentYear) {
      currentInvoices++;
      currentRevenue += paidAmount;
    }

    // LAST MONTH
    if (month === lastMonth && year === lastMonthYear) {
      lastInvoices++;
      lastRevenue += paidAmount;
    }
  }

  return {
    currentRevenue,
    lastRevenue,
    currentInvoices,
    lastInvoices,
  };
}
export function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}