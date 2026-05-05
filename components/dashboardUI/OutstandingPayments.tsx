"use client";

import { Invoice } from "@/types/invoice";
import { getOutstandingInvoices, getAmountLeft, formatDate } from "@/utils/invoiceHelper";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // shadcn
import { Badge } from "../ui/badge";
import { apiFetch } from "@/lib/apiFetch";

interface Props {
  invoices: Invoice[];
}

const sendReminder = async (invoiceId: string) => {
  try {
    await apiFetch(`/clients/${invoiceId}/remind`, {
      method: "POST",
    });
    alert("Reminder sent successfully!");
  } catch (error) {
    console.error("Error sending reminder:", error);
    alert("Failed to send reminder. Please try again.");
  };
};

export default function OutstandingPayments({ invoices }: Props) {
  const outstanding = getOutstandingInvoices(invoices);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow dark:shadow-none border border-gray-100 dark:border-gray-700 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Outstanding Payments</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {outstanding.length} invoices
        </span>
      </div>

      {/* EMPTY STATE */}
      {outstanding.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No outstanding payments 🎉
        </p>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {outstanding.map((invoice: Invoice) => {
          const amountLeft = getAmountLeft(invoice);

          return (
            <div
              key={invoice._id}
              className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {/* LEFT */}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {invoice.clientSnapshot.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due: {formatDate(invoice.dueDate)}
                </p>
              </div>

              {/* MIDDLE */}
              <div className="text-right">
                <p className="font-semibold text-red-600 dark:text-red-400">
                  ${amountLeft.toLocaleString()}
                </p>

                <Badge variant="outline" className="capitalize text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                  {invoice.status}
                </Badge>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                <Link href={`/invoices/${invoice._id}`}>
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                    View
                  </Button>
                </Link>

                <Button
                  size="sm"
                  className="dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  onClick={() =>
                    sendReminder(invoice._id!)
                  }
                >
                  Remind
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}