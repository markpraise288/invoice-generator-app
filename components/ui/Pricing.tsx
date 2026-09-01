"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    desc: "For solo founders getting off the ground.",
    features: ["Up to 50 leads", "Unlimited invoices", "1 team member", "Basic finance reports"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    desc: "For small teams running real sales operations.",
    features: [
      "Unlimited leads & pipeline",
      "Payments & recurring billing",
      "Up to 10 team members",
      "Projects & budgets",
      "Full finance suite",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    desc: "For growing businesses that need more control.",
    features: [
      "Unlimited everything",
      "Custom roles & permissions",
      "Priority support",
      "Dedicated onboarding",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
];

export default function Pricing() {
  const router = useRouter();

  return (
    <section id="pricing" className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">Pricing</p>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
            Simple pricing, as you grow
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-indigo-600 shadow-xl bg-white dark:bg-gray-900 scale-105"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              }`}
            >
              {plan.highlighted && (
                <span className="self-start rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white mb-4">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.desc}</p>
              <p className="mt-6">
                <span className="font-mono text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
              </p>

              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-teal-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push("/signup")}
                className={`mt-8 rounded-xl px-5 py-3 text-sm font-medium transition ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}