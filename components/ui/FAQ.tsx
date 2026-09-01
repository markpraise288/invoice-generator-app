"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Can I migrate from just using invoicing software?",
    a: "Yes — BusinessFlow imports your existing customers and past invoices, so your history comes with you instead of starting from zero.",
  },
  {
    q: "Do I need a PayPal account to accept payments?",
    a: "You'll need a PayPal Business account to receive funds, but setup happens once — after that, one-time payments and recurring subscriptions both run through the same connection.",
  },
  {
    q: "Can my whole team use it, or is this just for me?",
    a: "Growth and Enterprise plans support multiple team members with assigned roles, so sales, delivery, and finance can all work from the same data.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "You can export your leads, sales, invoices, and finance history at any time — cancelling never locks your own data behind a paywall.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">Questions</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
            Frequently asked
          </h2>
        </div>

        <div className="mt-12 flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} className="text-gray-500 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}