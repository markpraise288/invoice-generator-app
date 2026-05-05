"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import { MonthlyFinanceData } from "@/types/finance";

interface FinanceChartProps {
  data: MonthlyFinanceData[];
}

export default function FinanceChart({ data }: FinanceChartProps) {
  const [range, setRange] = useState<"6m" | "12m">("12m");

  const filteredData = range === "6m" ? data.slice(-6) : data;

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = filteredData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = filteredData.reduce((sum, item) => sum + item.profit, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue vs Expenses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monthly financial performance overview
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setRange("6m")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              range === "6m"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            6M
          </button>
          <button
            onClick={() => setRange("12m")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              range === "12m"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            12M
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Profit</p>
          <p className={`text-xl font-bold ${totalProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>
            {formatCurrency(totalProfit)}
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                borderColor: "#374151",
                borderRadius: "8px",
                color: "#f9fafb",
              }}
              formatter={(value: number) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value),
              ]}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
