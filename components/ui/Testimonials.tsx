"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "We were juggling an invoicing tool, a spreadsheet for expenses, and a separate CRM. BusinessFlow replaced all three in a week.",
    name: "Priya Shah",
    role: "Founder, Northline Consulting",
    // IMAGE: 80x80px circular headshot
    avatar: "/testimonials/priya-shah.jpg",
  },
  {
    quote:
      "The moment a deal closes, it's already an invoice. That handoff alone saves us a few hours every week.",
    name: "Marcus Webb",
    role: "Operations Lead, Foundry Studio",
    avatar: "/testimonials/marcus-webb.jpg",
  },
  {
    quote:
      "Finance finally makes sense to me. I can see cash flow and P&L without exporting anything to Excel first.",
    name: "Elena Torres",
    role: "Co-founder, Bright Path Agency",
    avatar: "/testimonials/elena-torres.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">Customers</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
            Built for businesses like yours
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col"
            >
              <Quote size={24} className="text-indigo-200 dark:text-indigo-900" />
              <p className="mt-4 text-gray-700 dark:text-gray-300 flex-1">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={`${t.name} headshot`}
                  width={40}
                  height={40}
                  className="rounded-full object-cover h-10 w-10"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}