"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto rounded-3xl bg-linear-to-br from-indigo-600 to-teal-500 px-10 py-16 text-center"
      >
        <h2 className="font-display text-4xl font-bold text-white">
          Bring your business into one flow
        </h2>
        <p className="mt-4 text-indigo-100 max-w-xl mx-auto">
          Set up your pipeline, send your first invoice, and see your first finance report —
          all in your first afternoon.
        </p>
        <button
          onClick={() => router.push("/signup")}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-indigo-600 hover:scale-105 transition"
        >
          Get started free
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </section>
  );
}