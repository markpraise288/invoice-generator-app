"use client";

import { Invoice } from "@/types/invoice";

interface Props {
  invoices: Invoice[];
}

export default function TopClients({ invoices }: Props) {
  const clientTotals: Record<string, number> = {};

  invoices.forEach((inv) => {
    const name = inv.clientSnapshot.name;

    const paid = inv.payments!.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    clientTotals[name] = (clientTotals[name] || 0) + paid;
  });

  const sortedClients = Object.entries(clientTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow dark:shadow-none border border-gray-100 dark:border-gray-700 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Clients</h2>

      {sortedClients.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No client data yet
        </p>
      )}

      <div className="space-y-3">
        {sortedClients.map(([name, total], index) => (
          <div
            key={name}
            className="flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {index === 0 && "🥇"}
                {index === 1 && "🥈"}
                {index === 2 && "🥉"}
              </span>
              <p className="font-medium text-gray-900 dark:text-white">{name}</p>
            </div>

            <p className="font-semibold text-green-600 dark:text-green-400">
              ${total.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}