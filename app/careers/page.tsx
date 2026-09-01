"use client";

import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

const roles = [
  { title: "Senior Backend Engineer", team: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Full-time" },
  { title: "Customer Success Lead", team: "Support", location: "Remote (US)", type: "Full-time" },
  { title: "Growth Marketer", team: "Marketing", location: "Remote", type: "Full-time" },
];

const values = [
  {
    title: "Small team, real ownership",
    desc: "You'll ship things that reach real customers in your first week, not your first quarter.",
  },
  {
    title: "Remote, async-first",
    desc: "We write things down. Meetings are the exception, not the default.",
  },
  {
    title: "Built by people who use it",
    desc: "Everyone here runs part of the company inside BusinessFlow itself.",
  },
];

export default function Career() {
  return (
    <>
      <section className="py-24 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">Careers</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Help small businesses run on one system instead of ten
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
            We&apos;re a small, remote team building the CRM and back office founders actually
            want to use.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900"
            >
              <p className="font-display font-semibold text-gray-900 dark:text-white">
                {v.title}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-gray-900 dark:text-white">
            Open roles
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {roles.map((role, i) => (
              <motion.a
                key={role.title}
                href="#"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-gray-200 dark:border-gray-800 px-6 py-5 hover:border-indigo-300 dark:hover:border-teal-600 transition-colors"
              >
                <div>
                  <p className="font-display font-semibold text-gray-900 dark:text-white">
                    {role.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{role.team}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {role.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {role.type}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>

          <p className="mt-10 text-center text-gray-600 dark:text-gray-400">
            Don&apos;t see your role?{" "}
            <a
              href="mailto:careers@businessflow.com"
              className="text-indigo-600 dark:text-teal-400 font-medium hover:underline"
            >
              Email us
            </a>{" "}
            — we&apos;re always open to hearing from good people.
          </p>
        </div>
      </section>
    </>
  );
}