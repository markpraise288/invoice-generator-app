import { Invoice } from "@/types";

export interface Activity {
  id: string;
  type: "invoice_created" | "payment_received" | "invoice_sent" | "client_added";
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}

export function deriveActivitiesFromInvoices(invoices: Invoice[]): Activity[] {
  const activities: Activity[] = [];

  invoices.forEach((invoice) => {
    // 1. Creation Activity
    activities.push({
      id: `create-${invoice._id}`,
      type: "invoice_created",
      title: "Invoice Created",
      description: `Invoice ${invoice.invoiceNumber} for ${invoice.clientSnapshot.name}`,
      timestamp: invoice.dueDate, // Mocking creation date with due date for now
    });

    // 2. Payment Activities
    invoice.payments?.forEach((payment, index) => {
      activities.push({
        id: `pay-${invoice._id}-${index}`,
        type: "payment_received",
        title: "Payment Received",
        description: `Received payment for ${invoice.invoiceNumber}`,
        amount: payment.amount,
        timestamp: payment.date,
      });
    });
  });

  // Sort by date (descending)
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 6); // Show only top 6
}
