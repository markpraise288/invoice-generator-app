"use client";

import { motion } from "framer-motion";
import { Layers, Zap, ShieldCheck, Users } from "lucide-react";

const values = [
  {
    icon: Layers,
    title: "One system",
    desc: "Leads, invoices, projects, and finance live in one place — not five disconnected tools stitched together with spreadsheets.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    desc: "Every screen is designed to get you back to running your business, not learning software.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, your control",
    desc: "No vendor lock-in and no hidden data-sharing. Export anything, anytime.",
  },
  {
    icon: Users,
    title: "Built with real operators",
    desc: "Every feature started as something a small business owner asked for directly.",
  },
];

export default function About() {
  return (
    <>
      <section className="py-24 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">About us</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            We got tired of switching tabs to run a business
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
            BusinessFlow started as an invoicing tool. It didn&apos;t stay one for long — every
            small business we talked to was running the same spreadsheets and logins just to
            know if they were making money. So we built the thing that replaces all of it.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-gray-900 dark:text-white">
            From InvoiceFlow to BusinessFlow
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            We launched as InvoiceFlow with one job: send an invoice and get paid. It worked,
            but it also showed us what came before and after the invoice — leads that never
            made it to a customer record, projects with no visibility into their budget,
            expenses nobody approved. The name stopped describing the product, so we changed
            it. BusinessFlow is the same commitment to one job done well, just a bigger job.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-gray-900 dark:text-white text-center">
            What we believe
          </h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Icon size={18} className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <p className="mt-4 font-display font-semibold text-gray-900 dark:text-white">
                    {v.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl font-semibold text-gray-900 dark:text-white">
            Want to see it for yourself?
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Start free — no credit card, no sales call required.
          </p>
          <a
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition"
          >
            Start free
          </a>
        </div>
      </section>
    </>
  );
}