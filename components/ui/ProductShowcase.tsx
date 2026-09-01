"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Receipt, BarChart3 } from "lucide-react";

const tabs = [
  {
    key: "pipeline",
    label: "Pipeline",
    icon: Target,
    heading: "See every deal, at every stage",
    desc: "Drag leads from first contact to closed-won, with score and value visible the whole way.",
    // IMAGE: place your Leads Kanban board screenshot at this path
    image: "/screenshots/pipeline.png",
    alt: "BusinessFlow lead pipeline Kanban board showing deals across stages",
  },
  {
    key: "invoicing",
    label: "Invoicing",
    icon: Receipt,
    heading: "Invoice and get paid without leaving the app",
    desc: "Itemized sales with automatic totals, tax, and discounts — sent and tracked in one place.",
    // IMAGE: place your Sale/Invoice detail or Payments table screenshot at this path
    image: "/screenshots/invoicing.png",
    alt: "BusinessFlow invoice detail view showing line items and payment status",
  },
  {
    key: "finance",
    label: "Finance",
    icon: BarChart3,
    heading: "Know your numbers without spreadsheets",
    desc: "Live profit & loss and cash flow charts, computed straight from your sales and expenses.",
    // IMAGE: place your Finance dashboard (P&L / cash flow charts) screenshot at this path
    image: "/screenshots/finance.png",
    alt: "BusinessFlow finance dashboard showing profit and loss and cash flow charts",
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState(tabs[0].key);
  const activeTab = tabs.find((t) => t.key === active)!;

  return (
    <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">See it in action</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
            The same app, wherever you are in the flow
          </h2>
        </div>

        {/* TABS */}
        <div className="mt-10 flex justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="mt-12 grid md:grid-cols-2 gap-10 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.key + "-text"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-display text-2xl font-semibold text-gray-900 dark:text-white">
                {activeTab.heading}
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400">{activeTab.desc}</p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.key + "-image"}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900"
            >
              <Image
                src={activeTab.image}
                alt={activeTab.alt}
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}