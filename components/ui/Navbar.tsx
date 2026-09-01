"use client";

import Link from "next/link";
import { Workflow } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#flow", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg dark:text-white">
          <span className="bg-linear-to-br from-indigo-600 to-teal-500 p-1 h-8 w-8 flex justify-center items-center rounded-lg">
            <Workflow size={18} className="text-white" />
          </span>
          BusinessFlow
        </Link>

        {/* CENTER LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-teal-400 transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:scale-105 hover:bg-indigo-500 transition"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}