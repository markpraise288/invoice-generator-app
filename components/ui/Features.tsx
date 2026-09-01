"use client";

import { motion } from "framer-motion";
import {
  Target,
  Handshake,
  Receipt,
  CreditCard,
  FolderKanban,
  Wallet,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const featureGroups = [
  {
    label: "Win the deal",
    accent: "text-indigo-600 dark:text-indigo-400",
    items: [
      { icon: Target, title: "Lead pipeline", desc: "Score, tag, and move leads through a Kanban built for how deals actually close." },
      { icon: Handshake, title: "Deals & customers", desc: "Run deals through their own Kanban, then convert won ones into real customer accounts — no re-entering data." },
    ],
  },
  {
    label: "Get paid",
    accent: "text-teal-600 dark:text-teal-400",
    items: [
      { icon: Receipt, title: "Sales & invoicing", desc: "Itemized sales with automatic totals, tax, and discounts — sent in seconds." },
      { icon: CreditCard, title: "Payments & billing", desc: "Accept one-time payments or run recurring subscriptions, built in." },
    ],
  },
  {
    label: "Deliver the work",
    accent: "text-amber-600 dark:text-amber-400",
    items: [
      { icon: FolderKanban, title: "Projects", desc: "Track delivery against budget with a Kanban board tied to real task progress." },
    ],
  },
  {
    label: "Know your numbers",
    accent: "text-emerald-600 dark:text-emerald-400",
    items: [
      { icon: Wallet, title: "Expenses", desc: "Submit, approve, and track spending by category — with a real approval trail." },
      { icon: BarChart3, title: "Finance reports", desc: "Live profit & loss and cash flow, computed from your actual sales and expenses." },
    ],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">What&apos;s inside</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
            One system, four jobs
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Every part of BusinessFlow feeds the next — a lead becomes a deal, a deal becomes
            an invoice, an invoice becomes a number on your P&amp;L.
          </p>
        </motion.div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureGroups.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <p className={`font-mono text-xs uppercase tracking-wider ${group.accent}`}>
                {group.label}
              </p>
              <div className="mt-4 flex flex-col gap-6">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Icon size={18} className="text-gray-700 dark:text-gray-300" />
                      </div>
                      <p className="mt-3 font-display font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}