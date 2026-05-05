"use client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ClientRevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
    return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
      <h2 className="font-bold mb-4 dark:text-white">Revenue Trend</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="month" stroke="#8884d8" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#fff' }} />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}