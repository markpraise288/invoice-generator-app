"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Users,
  BarChart3,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Invoice Creation",
    desc: "Generate beautiful, professional invoices in seconds with smart templates.",
  },
  {
    icon: Send,
    title: "Instant Delivery",
    desc: "Send invoices to clients instantly via email with real-time tracking.",
  },
  {
    icon: Users,
    title: "Client Management",
    desc: "Organize and manage all your clients in one secure place.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Track revenue, payments, and business growth with powerful analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    desc: "Your data is protected with enterprise-grade security and backups.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Optimized for speed so you can focus on your business, not waiting.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto text-center">
        {/* HEADER */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold"
        >
          Everything You Need to Manage Invoices
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Built for freelancers and businesses who want a simple yet powerful
          invoicing solution.
        </motion.p>

        {/* GRID */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition bg-white dark:bg-gray-900"
              >
                {/* ICON */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-gray-800 mb-4">
                  <Icon className="text-blue-600" />
                </div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold">{feature.title}</h3>

                <div className="mt-4 rounded-xl overflow-hidden">
                  <img src="/images/feature1.png" alt="" />
                </div>

                {/* DESC */}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
