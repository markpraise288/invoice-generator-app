"use client";

import Link from "next/link";
import StatusBadge from "@/components/invoicesUI/StatusBadge";
import { getInvoiceStatus } from "@/lib/getInvoiceStatus";
import { Invoice } from "@/types";
import InvoiceActions from "./InvoiceActions";

interface InvoicesTableProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  updateInvoice: (invoice: Invoice) => void;
  downloadInvoice: (invoice: Invoice) => void;
}

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-none p-6 border border-gray-100 dark:border-gray-700">
      <table className="w-full text-left">
        {/* HEADER */}
        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm uppercase">
          <tr>
            <th className="p-3">INVOICE #</th>
            <th className="p-3">CLIENT</th>
            <th className="p-3">AMOUNT</th>
            <th className="p-3">STATUS</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">ACTIONS</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-900 dark:text-gray-100">
          {invoices.map((invoice) => {
            if (invoice.isDeleted) return null;

            const paidAmount = invoice.payments!.reduce(
              (sum, p) => sum + p.amount,
              0,
            );

            const remaining = invoice.total! - paidAmount;

            return (
              <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 font-medium">{invoice.invoiceNumber}</td>

                <td className="p-3 text-gray-600 dark:text-gray-400">
                  {invoice.clientSnapshot.name}
                </td>

                <td className="p-3 text-gray-600 dark:text-gray-400">
                  {formatMoney(remaining || invoice.total!)}
                </td>

                {/* Status */}
                <td className="p-3">
                  <StatusBadge status={getInvoiceStatus(invoice)} />
                </td>

                <td className="p-3 text-gray-600 dark:text-gray-400">
                  {dueDate(invoice.dueDate)}
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
