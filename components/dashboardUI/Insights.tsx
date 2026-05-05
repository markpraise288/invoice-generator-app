"use client";

import { Invoice } from "@/types/invoice";

interface Props {
  invoices: Invoice[];
}

export default function Insights({ invoices }: Props) {
  const now = new Date();

  // -------- CALCULATIONS --------
  const totalRevenue = invoices.reduce((sum, inv) => {
    const paid = inv.payments!.reduce((s, p) => s + p.amount, 0);
    return sum + paid;
  }, 0);

  const outstanding = invoices.reduce((sum, inv) => {
    const paid = inv.payments!.reduce((s, p) => s + p.amount, 0);
    return sum + (inv.total! - paid);
  }, 0);

  const overdueCount = invoices.filter(
    (inv) => new Date(inv.dueDate) < now && inv.status !== "paid"
  ).length;

  const topClientMap: Record<string, number> = {};

  invoices.forEach((inv) => {
    const name = inv.clientSnapshot.name;
    const paid = inv.payments!.reduce((s, p) => s + p.amount, 0);

    topClientMap[name] = (topClientMap[name] || 0) + paid;
  });

  const topClient = Object.entries(topClientMap).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // -------- UI --------
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow dark:shadow-none border border-gray-100 dark:border-gray-700 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Insights</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <p className="text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="font-semibold text-green-600 dark:text-green-400">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-between">
          <p className="text-gray-500 dark:text-gray-400">Outstanding Amount</p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            ${outstanding.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-between">
          <p className="text-gray-500 dark:text-gray-400">Overdue Invoices</p>
          <p className="font-semibold text-yellow-600 dark:text-yellow-400">
            {overdueCount}
          </p>
        </div>

        {topClient && (
          <div className="flex justify-between">
            <p className="text-gray-500 dark:text-gray-400">Top Client</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {topClient[0]}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER MESSAGE */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        {overdueCount > 0
          ? `⚠️ You have ${overdueCount} overdue invoices.`
          : "✅ All invoices are on track."}
      </div>
    </div>
  );
}