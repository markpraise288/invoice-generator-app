import { Invoice } from "@/types/invoice";

export const getOutstandingInvoices = (invoices: Invoice[]) => {
  return invoices
    .filter((inv) => {
      const paidAmount = inv.payments!.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      return (
        !inv.isDeleted &&
        inv.status !== "paid" &&
        paidAmount < inv.total!
      );
    })
    .slice(0, 5); // limit to 5
};

export const getAmountLeft = (invoice: Invoice) => {
  const paid = invoice.payments!.reduce((sum, p) => sum + p.amount, 0);
  return invoice.total! - paid;
};

export const formatDate = (date: string) => {
  return date.split("T")[0];
};