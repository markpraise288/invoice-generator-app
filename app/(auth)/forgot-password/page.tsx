"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Workflow } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REDIRECT_DELAY_MS = 1800;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const emailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);
  const showEmailError = touched && email.length > 0 && !emailValid;
  const showEmailRequired = touched && email.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!emailValid) return;

    setStatus("loading");
    setMessage("");

    try {
      // apiFetch handles the base URL, credentials, headers, and throws on non-2xx
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setStatus("success");
      setMessage("Code sent — redirecting you to enter it...");

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 self-start text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <ArrowLeft size={14} />
        Back to login
      </Link>

      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
            <CardHeader className="text-center space-y-3 pb-2">
              <div className="flex justify-center">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md">
                  <Workflow className="text-white" size={20} />
                </div>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-indigo-600 dark:text-teal-400">
                  BusinessFlow
                </p>
                <h1 className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">
                  Forgot your password?
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the email on your account and we&apos;ll send you a 6-digit code to reset it.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              {status === "success" ? (
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setTouched(true)}
                          className={`pl-9 ${
                            showEmailError || showEmailRequired
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "border-gray-300 dark:border-gray-700"
                          }`}
                          aria-invalid={showEmailError || showEmailRequired}
                        />
                      </div>
                      {showEmailRequired && (
                        <p className="text-xs text-red-500">Email is required.</p>
                      )}
                      {showEmailError && (
                        <p className="text-xs text-red-500">Enter a valid email address.</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-6 rounded-xl"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Sending code...
                        </span>
                      ) : (
                        "Send reset code"
                      )}
                    </Button>
                  </form>

                  {status === "error" && (
                    <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400">
                      {message}
                    </p>
                  )}

                  <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500 leading-relaxed">
                    The code expires in 15 minutes. If you don&apos;t see the email, check your spam
                    folder. Already have a code?{" "}
                    <Link
                      href="/reset-password"
                      className="text-indigo-600 dark:text-teal-400 hover:underline"
                    >
                      Enter it here
                    </Link>
                    .
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}