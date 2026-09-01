"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "12,400+", label: "Businesses running on BusinessFlow" },
  { value: "$180M+", label: "Processed through the platform" },
  { value: "6", label: "Tools replaced by one system" },
  { value: "99.98%", label: "Platform uptime" },
];

export default function StatsStrip() {
  return (
    <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center md:text-left"
          >
            <p className="font-mono text-3xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}