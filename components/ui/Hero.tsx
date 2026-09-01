"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserPlus, Handshake, FileText, CreditCard, TrendingUp } from "lucide-react";

const flowNodes = [
  { icon: UserPlus, label: "Lead" },
  { icon: Handshake, label: "Deal won" },
  { icon: FileText, label: "Invoice sent" },
  { icon: CreditCard, label: "Payment in" },
  { icon: TrendingUp, label: "Revenue booked" },
];

const CYCLE_SECONDS = 5;

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-24 px-6 bg-white dark:bg-gray-950 min-h-screen flex items-center">
      {/* LIGHT MODE GRADIENT */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-teal-50 dark:hidden -z-10" />

      {/* DARK MODE GLOW */}
      <motion.div
        className="absolute inset-0 hidden dark:block -z-10"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-150 bg-indigo-600/10 blur-[120px] rounded-full" />
      </motion.div>

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-10">
        {/* HEADLINE */}
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white"
          >
            From first lead to final payment{" "}
            <span className="bg-linear-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              — one flow
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-lg text-gray-600 dark:text-gray-400"
          >
            BusinessFlow connects your leads, sales, invoicing, payments, and finances
            into a single system — so nothing gets lost between tools that were never
            built to talk to each other.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 flex justify-center gap-4"
          >
            <button
              onClick={() => router.push("/signup")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 hover:shadow-xl hover:bg-indigo-500 transition"
            >
              Get started free
            </button>

            <button
              onClick={() => router.push("#flow")}
              className="px-6 py-3 border rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              See how it flows
            </button>
          </motion.div>
        </div>

        {/* SIGNATURE FLOW DIAGRAM */}
        <motion.div
          id="flow"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative w-full max-w-4xl mt-6"
        >
          <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-teal-500 blur-2xl opacity-15 rounded-2xl" />

          <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl px-8 py-10">
            <div className="relative flex items-center justify-between">
              {/* connecting line */}
              <div className="absolute left-0 right-0 top-6 h-px bg-gray-200 dark:bg-gray-800" />

              {/* traveling pulse */}
              <motion.div
                className="absolute top-6 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-teal-400 shadow-[0_0_12px_4px_rgba(45,212,191,0.6)]"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: CYCLE_SECONDS, repeat: Infinity, ease: "linear" }}
              />

              {flowNodes.map((node, i) => {
                const Icon = node.icon;
                const delay = (i / (flowNodes.length - 1)) * CYCLE_SECONDS;

                return (
                  <div key={node.label} className="relative z-10 flex flex-col items-center gap-3">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      animate={{
                        borderColor: [
                          "rgb(209 213 219)",
                          i === flowNodes.length - 1 ? "rgb(245 158 11)" : "rgb(79 70 229)",
                          "rgb(209 213 219)",
                        ],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: CYCLE_SECONDS,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.08, 0.2],
                        delay,
                      }}
                    >
                      <Icon size={20} className="text-gray-500 dark:text-gray-400" />
                    </motion.div>
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">
                      {node.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}