"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 px-6 bg-linear-to-br from-blue-600 to-indigo-700 text-white">
      <div className="max-w-5xl mx-auto text-center">
        
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold"
        >
          Start Creating Invoices Today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-blue-100"
        >
          Join thousands of freelancers and businesses using InvoiceFlow to simplify invoicing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            Get Started Free
          </Link>

          <Link
            href="#pricing"
            className="px-8 py-3 border border-white rounded-xl hover:bg-white/10 transition"
          >
            View Pricing
          </Link>
        </motion.div>
      </div>
    </section>
  );
}