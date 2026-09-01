import Link from "next/link";
import { Workflow } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How it works", href: "#flow" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg dark:text-white">
            <span className="bg-linear-to-br from-indigo-600 to-teal-500 p-1 h-8 w-8 flex justify-center items-center rounded-lg">
              <Workflow size={18} className="text-white" />
            </span>
            BusinessFlow
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            The system businesses run their leads, sales, invoicing, and finances through.
          </p>
          <div className="mt-6 flex gap-4 text-gray-400">
            <FaXTwitter size={18} className="hover:text-indigo-600 cursor-pointer transition-colors" />
            <FaLinkedin size={18} className="hover:text-indigo-600 cursor-pointer transition-colors" />
            <FaGithub size={18} className="hover:text-indigo-600 cursor-pointer transition-colors" />
          </div>
        </div>

        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section}>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{section}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} BusinessFlow. All rights reserved.
      </div>
    </footer>
  );
}