"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "John Mwale",
    role: "Freelancer",
    text: "InvoiceFlow completely changed how I manage my clients. Creating invoices is now effortless.",
  },
  {
    name: "Sarah Banda",
    role: "Small Business Owner",
    text: "I love how simple and powerful it is. The analytics help me track my income clearly.",
  },
  {
    name: "Kelvin Phiri",
    role: "Startup Founder",
    text: "Professional, fast, and reliable. This is exactly what I needed for my business.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto text-center">
        
        {/* HEADER */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold"
        >
          Trusted by Businesses Worldwide
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Thousands of freelancers and businesses rely on InvoiceFlow to manage their invoicing.
        </motion.p>

        {/* TESTIMONIAL CARDS */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition bg-white dark:bg-gray-900 text-left"
            >
              {/* TEXT */}
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                “{t.text}”
              </p>

              {/* USER */}
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}