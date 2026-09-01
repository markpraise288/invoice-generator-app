"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Workflow, X } from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";
import { apiFetch } from "@/lib/apiFetch";

interface FormDataType {
  email: string;
  password: string;
  name?: string;
  companyName?: string;
  address?: string;
  phone?: string;
}

const benefits = [
  "Unlimited leads, deals, and pipeline tracking",
  "Invoicing and payments in one flow",
  "Project budgets tied to real spend",
  "Live profit & loss, without spreadsheets",
];

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const signupHandler = async (formData: FormDataType) => {
    setError(null);
    try {
      // apiFetch handles the base URL, credentials, headers, and throws on non-2xx
      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          address: formData.address,
          phone: formData.phone,
        }),
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "We couldn't create your account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-gray-950">
      {/* ERROR TOAST */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 px-4 py-3 text-sm text-red-700 dark:text-red-300 shadow-lg max-w-md"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: BRAND PANEL */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-indigo-700 via-indigo-600 to-teal-600 p-12 text-white relative overflow-hidden">
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <Link href="/" className="relative flex items-center gap-2 font-display font-semibold text-lg">
          <div className="bg-white/15 p-1.5 rounded-lg">
            <Workflow size={18} />
          </div>
          BusinessFlow
        </Link>

        <div className="relative">
          <h1 className="font-display text-3xl font-bold leading-tight">
            Run your whole business from one screen
          </h1>
          <p className="mt-4 text-indigo-100 max-w-sm">
            Leads, invoices, projects, and finance — connected, not duct-taped together.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-indigo-50">
                <Check size={16} className="mt-0.5 shrink-0 text-teal-300" />
                {b}
              </li>
            ))}
          </ul>

          <blockquote className="mt-10 border-l-2 border-white/30 pl-4 text-sm text-indigo-100 italic">
            &quot;We replaced four separate tools with BusinessFlow in a week. Our finance numbers
            finally match reality.&quot;
            <footer className="mt-2 not-italic font-medium text-white">— Early customer</footer>
          </blockquote>
        </div>

        <p className="relative text-xs text-indigo-200">
          No credit card required · Cancel anytime
        </p>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 self-start text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="flex-1 flex items-center justify-center py-8">
          <AuthForm title="Signup" submitRequest={signupHandler} embedded />
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}