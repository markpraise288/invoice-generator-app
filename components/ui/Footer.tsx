import Link from "next/link";
import { Rocket } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        
        {/* BRAND */}
        <div>
          <div className="flex items-center gap-2 font-semibold text-lg dark:text-white">
            <span className="bg-blue-700 p-1 h-8 w-8 flex justify-center items-center rounded-full">
              <Rocket size={18} className="text-white" />
            </span>
            InvoiceFlow
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Simple and powerful invoicing for modern businesses.
          </p>
        </div>

        {/* PRODUCT */}
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="#features">Features</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="#about">About</Link></li>
            <li><Link href="#contact">Contact</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="#">Privacy Policy</Link></li>
            <li><Link href="#">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
      </div>
    </footer>
  );
}