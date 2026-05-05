"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type RevenueData = {
  month: string;
  paid: number;
  unpaid: number;
};

interface Props {
  data: RevenueData[];
}

export default function RevenueChart({ data }: Props) {
  const [range, setRange] = useState<"6m" | "12m">("12m");

  // Filter data
  const filteredData = range === "6m" ? data.slice(-6) : data;

  // Total revenue (paid only)
  const totalPaid = filteredData.reduce(
    (sum, item) => sum + item.paid,
    0
  );

  const totalUnpaid = filteredData.reduce(
    (sum, item) => sum + item.unpaid,
    0
  );

    return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow dark:shadow-none border border-gray-100 dark:border-gray-700 h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your earnings and pending payments
          </p>
        </div>

        {/* FILTER */}
        <div className="flex gap-2">
          <button
            onClick={() => setRange("6m")}
            className={`px-3 py-1 rounded ${
              range === "6m"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            6M
          </button>

          <button
            onClick={() => setRange("12m")}
            className={`px-3 py-1 rounded ${
              range === "12m"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            12M
          </button>
        </div>
      </div>

      {/* TOTALS */}
      <div className="flex gap-10 mb-4">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Paid</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalPaid)}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Unpaid</p>
          <p className="text-xl font-bold text-red-500 dark:text-red-400">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalUnpaid)}
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="w-full h-75">
        <ResponsiveContainer>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="paidColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="unpaidColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis dataKey="month" stroke="#9ca3af" />

            <YAxis stroke="#9ca3af" />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                borderColor: "#374151",
                color: "#f9fafb",
              }}
              formatter={(value: number | undefined) =>
                value
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(value)
                  : ""
              }
            />

            <Legend />

            {/* PAID */}
            <Area
              type="monotone"
              dataKey="paid"
              stroke="#16a34a"
              fill="url(#paidColor)"
              strokeWidth={2}
            />

            {/* UNPAID */}
            <Area
              type="monotone"
              dataKey="unpaid"
              stroke="#dc2626"
              fill="url(#unpaidColor)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}