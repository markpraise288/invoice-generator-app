"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-24 px-6 bg-white dark:bg-gray-950 min-h-screen flex items-center">
      
      {/* LIGHT MODE GRADIENT */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:hidden -z-10" />

      {/* DARK MODE GLOW */}
      <motion.div
        className="absolute inset-0 hidden dark:block -z-10"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-150 bg-indigo-600/10 blur-[120px] rounded-full" />
      </motion.div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT CONTENT */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl font-bold leading-tight"
          >
            Create Professional Invoices{" "}
            <span className="text-indigo-600">in Seconds</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-lg text-gray-600 dark:text-gray-400"
          >
            Powerful invoicing platform designed for freelancers and businesses.
            Create, send, and track invoices effortlessly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 flex gap-4"
          >
            <button
              onClick={() => router.push("/signup")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition"
            >
              Get Started Free
            </button>

            <button className="px-6 py-3 border rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              Live Demo
            </button>
          </motion.div>
        </div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative"
        >
          {/* GLOW */}
          <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-purple-500 blur-2xl opacity-20 rounded-2xl" />

          {/* FLOATING IMAGE */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/invoice-preview.png"
              alt="Invoice dashboard preview"
              width={900}
              height={600}
              priority
              className="rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
            />
          </motion.div>

          {/* OPTIONAL FLOATING SMALL CARD (NEXT LEVEL) */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-4 hidden md:block"
          >
            <p className="text-sm font-semibold">Invoice Paid</p>
            <p className="text-green-500 text-sm">$1,250</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}