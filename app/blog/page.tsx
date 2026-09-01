"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const categories = ["All", "Product", "Sales", "Finance", "Company"];

const posts = [
  {
    title: "Why we stopped treating invoices and payments as separate features",
    excerpt:
      "Splitting billing into two half-features made both worse. Here's what changed when we merged them.",
    category: "Product",
    date: "Jul 2026",
    readTime: "5 min read",
  },
  {
    title: "The lead-to-cash pipeline, mapped end to end",
    excerpt:
      "A lead becomes a deal, a deal becomes an invoice, an invoice becomes a line on your P&L. What actually has to happen at each step.",
    category: "Sales",
    date: "Jun 2026",
    readTime: "7 min read",
  },
  {
    title: "Cash flow is not the same question as profit",
    excerpt:
      "Most small businesses fail from a cash problem while their P&L looks fine. How to tell the two apart before it's a crisis.",
    category: "Finance",
    date: "Jun 2026",
    readTime: "6 min read",
  },
  {
    title: "Why we rebranded from InvoiceFlow to BusinessFlow",
    excerpt:
      "The name stopped describing the product about a year before we changed it. Here's what finally forced the decision.",
    category: "Company",
    date: "May 2026",
    readTime: "4 min read",
  },
  {
    title: "Project budgets are a promise, not a spreadsheet",
    excerpt:
      "Tracking budget-vs-spent only matters if it updates the moment money moves. Here's how we wired that up.",
    category: "Product",
    date: "May 2026",
    readTime: "5 min read",
  },
  {
    title: "The expense approval step nobody wants to own",
    excerpt:
      "Approvals feel like friction until the month someone expenses something they shouldn't have.",
    category: "Finance",
    date: "Apr 2026",
    readTime: "4 min read",
  },
];

export default function Blog() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <section className="py-24 px-6 bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <p className="font-mono text-sm text-indigo-600 dark:text-teal-400">Blog</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-gray-900 dark:text-white">
            Notes on running a business without the spreadsheets
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Product decisions, sales and finance fundamentals, and the occasional story from
            building BusinessFlow.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                active === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.a
              key={post.title}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col hover:border-indigo-300 dark:hover:border-teal-600 transition-colors"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-indigo-600 dark:text-teal-400">
                {post.category}
              </span>
              <h2 className="mt-3 font-display font-semibold text-lg text-gray-900 dark:text-white leading-snug">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex-1">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>
                  {post.date} · {post.readTime}
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-teal-400 transition-colors"
                />
              </div>
            </motion.a>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
            No posts in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}