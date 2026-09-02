"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Workflow,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";

type PasswordRule = {
  label: string;
  test: (pw: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  {
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: "One number",
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    label: "One special character",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

const STRENGTH_LABELS = [
  "Weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];

const STRENGTH_COLORS = [
  "bg-gray-200 dark:bg-gray-800",
  "bg-red-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-emerald-500",
];

const RESEND_COOLDOWN_S = 30;

/**
 * This component contains useSearchParams().
 *
 * It is rendered inside a Suspense boundary
 * by the default page component below.
 */
function ResetPasswordContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [touched, setTouched] = useState<
    Record<string, boolean>
  >({});

  const [attempted, setAttempted] =
    useState(false);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [message, setMessage] = useState("");

  const [resendCooldown, setResendCooldown] =
    useState(0);

  const [resending, setResending] =
    useState(false);

  /**
   * Countdown for resend code.
   */
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const t = setTimeout(
      () => setResendCooldown((s) => s - 1),
      1000
    );

    return () => clearTimeout(t);
  }, [resendCooldown]);

  /**
   * Calculate password strength.
   */
  const passwordScore = useMemo(
    () =>
      PASSWORD_RULES.filter((rule) =>
        rule.test(password)
      ).length,
    [password]
  );

  const passwordValid =
    passwordScore === PASSWORD_RULES.length;

  const showPasswordRules =
    touched.password || password.length > 0;

  /**
   * Validate reset code.
   */
  const codeValid = code.trim().length === 6;

  const showCodeError =
    (touched.code || attempted) && !codeValid;

  /**
   * Validate password confirmation.
   */
  const passwordsMatch =
    confirmPassword.length > 0 &&
    confirmPassword === password;

  const showMatchError =
    (touched.confirmPassword || attempted) &&
    confirmPassword.length > 0 &&
    !passwordsMatch;

  /**
   * Everything required to submit.
   */
  const canSubmit =
    codeValid &&
    passwordValid &&
    passwordsMatch;

  /**
   * Track field blur.
   */
  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  /**
   * Reset password.
   */
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setAttempted(true);

    if (!canSubmit) return;

    setStatus("loading");
    setMessage("");

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          code: code.trim(),
          password,
        }),
      });

      setStatus("success");

      setMessage(
        "Password reset. Redirecting you to log in..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err: any) {
      setStatus("error");

      setMessage(
        err?.message ||
          "That code didn't work. Check it and try again."
      );
    }
  };

  /**
   * Resend reset code.
   */
  const handleResend = async () => {
    if (
      resendCooldown > 0 ||
      !email
    ) {
      return;
    }

    setResending(true);

    try {
      await apiFetch(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({
            email,
          }),
        }
      );

      setResendCooldown(
        RESEND_COOLDOWN_S
      );
    } catch {
      /*
       * Keep silent intentionally.
       */
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 px-4 py-8">

      {/* Back to login */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 self-start text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <ArrowLeft size={14} />
        Back to login
      </Link>

      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="w-full max-w-md"
        >
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">

            {/* Header */}
            <CardHeader className="text-center space-y-3 pb-2">

              <div className="flex justify-center">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md">
                  <Workflow
                    className="text-white"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-indigo-600 dark:text-teal-400">
                  BusinessFlow
                </p>

                <h1 className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">
                  Reset your password
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {email ? (
                    <>
                      Enter the code sent to{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {email}
                      </span>
                    </>
                  ) : (
                    "Enter the code from your email and choose a new password."
                  )}
                </p>
              </div>
            </CardHeader>

            <CardContent>

              {/* SUCCESS */}
              {status === "success" ? (
                <div className="flex flex-col items-center text-center gap-3 py-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2
                      className="text-emerald-600 dark:text-emerald-400"
                      size={24}
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {message}
                  </p>

                  <Loader2
                    size={16}
                    className="animate-spin text-gray-400"
                  />
                </div>
              ) : (

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >

                  {/* =========================
                      RESET CODE
                  ========================== */}
                  <div className="space-y-1.5">

                    <Label htmlFor="code">
                      Reset code
                    </Label>

                    <div className="relative">

                      <KeyRound
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />

                      <Input
                        id="code"
                        name="code"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={code}
                        onChange={(e) =>
                          setCode(
                            e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            )
                          )
                        }
                        onBlur={() =>
                          handleBlur("code")
                        }
                        className={`pl-9 tracking-[0.3em] font-mono ${
                          showCodeError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                        aria-invalid={
                          showCodeError
                        }
                      />
                    </div>

                    {showCodeError && (
                      <p className="text-xs text-red-500">
                        Enter the 6-digit code from your email.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={
                        resendCooldown > 0 ||
                        resending ||
                        !email
                      }
                      className="text-xs text-indigo-600 dark:text-teal-400 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : resending
                        ? "Sending..."
                        : "Didn't get a code? Resend"}
                    </button>
                  </div>

                  {/* =========================
                      NEW PASSWORD
                  ========================== */}
                  <div className="space-y-1.5">

                    <Label htmlFor="password">
                      New password
                    </Label>

                    <div className="relative">

                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />

                      <Input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          handleBlur("password")
                        }
                        className="pl-9 pr-10 border-gray-300 dark:border-gray-700"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (s) => !s
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Password rules */}
                    {showPasswordRules && (
                      <div className="mt-3 space-y-2">

                        {/* Strength bar */}
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map(
                            (i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                  i <
                                  passwordScore
                                    ? STRENGTH_COLORS[
                                        passwordScore
                                      ]
                                    : "bg-gray-200 dark:bg-gray-800"
                                }`}
                              />
                            )
                          )}
                        </div>

                        {/* Strength label */}
                        <p
                          className={`text-xs font-medium ${
                            passwordScore <= 1
                              ? "text-red-500"
                              : passwordScore === 2
                              ? "text-amber-500"
                              : passwordScore === 3
                              ? "text-teal-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {
                            STRENGTH_LABELS[
                              passwordScore
                            ]
                          }{" "}
                          password
                        </p>

                        {/* Rules */}
                        <ul className="grid grid-cols-2 gap-x-3 gap-y-1">

                          {PASSWORD_RULES.map(
                            (rule) => {
                              const passed =
                                rule.test(
                                  password
                                );

                              return (
                                <li
                                  key={
                                    rule.label
                                  }
                                  className={`flex items-center gap-1.5 text-xs ${
                                    passed
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-gray-400 dark:text-gray-500"
                                  }`}
                                >
                                  {passed ? (
                                    <Check
                                      size={12}
                                    />
                                  ) : (
                                    <X
                                      size={12}
                                    />
                                  )}

                                  {rule.label}
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* =========================
                      CONFIRM PASSWORD
                  ========================== */}
                  <div className="space-y-1.5">

                    <Label htmlFor="confirmPassword">
                      Confirm new password
                    </Label>

                    <div className="relative">

                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />

                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="••••••••"
                        value={
                          confirmPassword
                        }
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          handleBlur(
                            "confirmPassword"
                          )
                        }
                        className={`pl-9 ${
                          showMatchError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-gray-300 dark:border-gray-700"
                        }`}
                        aria-invalid={
                          showMatchError
                        }
                      />
                    </div>

                    {showMatchError && (
                      <p className="text-xs text-red-500">
                        Passwords don&apos;t match.
                      </p>
                    )}
                  </div>

                  {/* =========================
                      SUBMIT
                  ========================== */}
                  <Button
                    type="submit"
                    disabled={
                      status === "loading"
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-6 rounded-xl"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Resetting...
                      </span>
                    ) : (
                      "Reset password"
                    )}
                  </Button>

                  {/* Error */}
                  {status === "error" && (
                    <p className="text-sm text-center text-red-600 dark:text-red-400">
                      {message}
                    </p>
                  )}

                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Next.js production build fix.
 *
 * ResetPasswordContent uses useSearchParams(),
 * so it must be rendered underneath Suspense.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <Loader2
            size={28}
            className="animate-spin text-gray-400"
          />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}