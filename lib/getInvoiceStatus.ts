type Status =
  string | "draft"
  | "sent"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";

import { Invoice } from "@/types";

export const getInvoiceStatus = (invoice: Invoice): Status => {
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);

  const amountPaid = invoice.payments!.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  // ✅ Paid (stronger logic)
  if (amountPaid >= invoice.total!) return "paid";

  // Cancelled stays cancelled
  if (invoice.status === "cancelled") return "cancelled";

  // Overdue
  if (dueDate < today) return "overdue";

  // Partial payment
  if (amountPaid > 0 && amountPaid < invoice.total!) {
    return "partial";
  }

  // Default
  return invoice.status;
};