"use client";

import { Invoice } from "@/types";

interface Props {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}

export default function ServiceFields({ invoice, setInvoice }: Props) {
  const service = invoice.serviceDetails || {};

  const total =
    (service.totalHours || 0) * (service.hourlyRate || 0);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 dark:text-white">
        Service Details
      </h3>

      {/* PROJECT NAME */}
      <div>
        <label className="text-sm text-gray-500 dark:text-gray-400">
          Project Name
        </label>
        <input
          type="text"
          placeholder="e.g. Website Development"
          value={service.projectName || ""}
          onChange={(e) =>
            setInvoice((prev) => ({
              ...prev,
              serviceDetails: {
                ...prev.serviceDetails,
                projectName: e.target.value,
              },
            }))
          }
          className="w-full border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      {/* HOURS */}
      <div>
        <label className="text-sm text-gray-500 dark:text-gray-400">
          Total Hours
        </label>
        <input
          type="number"
          placeholder="e.g. 40"
          value={service.totalHours || ""}
          onChange={(e) =>
            setInvoice((prev) => ({
              ...prev,
              serviceDetails: {
                ...prev.serviceDetails,
                totalHours: Number(e.target.value),
              },
            }))
          }
          className="w-full border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      {/* RATE */}
      <div>
        <label className="text-sm text-gray-500 dark:text-gray-400">
          Hourly Rate
        </label>
        <input
          type="number"
          placeholder="e.g. 50"
          value={service.hourlyRate || ""}
          onChange={(e) =>
            setInvoice((prev) => ({
              ...prev,
              serviceDetails: {
                ...prev.serviceDetails,
                hourlyRate: Number(e.target.value),
              },
            }))
          }
          className="w-full border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      {/* 🔥 LIVE TOTAL PREVIEW */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Service Total
        </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}