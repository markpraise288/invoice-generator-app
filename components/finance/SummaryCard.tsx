"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "positive" | "negative" | "neutral";
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  trend,
  variant = "neutral",
}: SummaryCardProps) {
  const TrendIcon = trend && trend.value >= 0 ? ArrowUp : ArrowDown;
  const trendColor = trend
    ? trend.value >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" 
              ? new Intl.NumberFormat("en-US", { 
                  style: "currency", 
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value)
              : value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700 ${iconColor}`}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} strokeWidth={1.5} />
          <span className={trendColor}>
            {trend.value >= 0 ? "+" : ""}{trend.value.toFixed(1)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">
            {trend.label}
          </span>
        </div>
      )}
    </motion.div>
  );
}
