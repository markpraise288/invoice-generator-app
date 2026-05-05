// components/Navbar.tsx

import Link from "next/link";
import { Rocket } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg dark:text-white">
          <span className="bg-blue-700 p-1 h-8 w-8 flex justify-center items-center rounded-full">
            <Rocket size={18} className="text-white" />
          </span>
          InvoiceFlow
        </Link>

        {/* CENTER LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-blue-600 dark:text-gray-300">
            Features
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-blue-600 dark:text-gray-300"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}