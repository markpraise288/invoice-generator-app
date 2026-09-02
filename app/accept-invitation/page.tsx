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
  AlertCircle,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Workflow,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";

const EMAIL_ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

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

interface InvitationInfo {
  email: string;
  role: string;
  workspaceName: string;
  hasAccount: boolean;
}

/**
 * IMPORTANT:
 * This component contains useSearchParams().
 *
 * It is intentionally NOT the default export.
 * The default export below wraps it with Suspense.
 */
function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] =
    useState<InvitationInfo | null>(null);

  /*
   * undefined = still checking session
   * null = not logged in
   * string = logged-in user's email
   */
  const [currentEmail, setCurrentEmail] = useState<
    string | null | undefined
  >(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Signup fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordScore = useMemo(
    () =>
      PASSWORD_RULES.filter((rule) =>
        rule.test(password)
      ).length,
    [password]
  );

  // Login fields
  const [loginPassword, setLoginPassword] = useState("");

  /**
   * Validate invitation and check current session.
   */
  useEffect(() => {
    if (!token) {
      setError("This invitation link is missing a token.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        /*
         * Validate invitation token.
         */
        const res = await apiFetch(
          `/invitations/validate?token=${encodeURIComponent(token)}`
        );

        setInvitation(res.data as InvitationInfo);
      } catch (err: any) {
        setError(
          err?.message ||
            "This invitation link isn't valid."
        );

        setLoading(false);
        return;
      }

      try {
        /*
         * Check whether the visitor is already logged in.
         */
        const profileRes = await apiFetch(
          "/settings/profile"
        );

        setCurrentEmail(
          profileRes.data?.email || null
        );
      } catch {
        /*
         * Not logged in.
         * This is normal for an invitation recipient.
         */
        setCurrentEmail(null);
      }

      setLoading(false);
    })();
  }, [token]);

  /**
   * Continue with Google.
   */
  const handleGoogle = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setFormError(
        "Authentication service is not configured."
      );
      return;
    }

    window.location.href =
      `${apiUrl}/auth/google?invitationToken=` +
      encodeURIComponent(token);
  };

  /**
   * Accept invitation when the user is already logged in
   * with the email that received the invitation.
   */
  const handleAcceptDirect = async () => {
    setSubmitting(true);
    setFormError(null);

    try {
      await apiFetch(
        "/team-invitations/invitations/accept",
        {
          method: "POST",
          body: JSON.stringify({
            token,
          }),
        }
      );

      router.push("/dashboard");
    } catch (err: any) {
      setFormError(
        err?.message ||
          "Couldn't accept the invitation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Login first, then accept invitation.
   */
  const handleLoginThenAccept = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSubmitting(true);
    setFormError(null);

    try {
      if (!invitation) {
        throw new Error(
          "Invitation information is unavailable."
        );
      }

      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: invitation.email,
          password: loginPassword,
        }),
      });

      await apiFetch(
        "/team-invitations/invitations/accept",
        {
          method: "POST",
          body: JSON.stringify({
            token,
          }),
        }
      );

      router.push("/dashboard");
    } catch (err: any) {
      setFormError(
        err?.message || "Login failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Create a new account and accept invitation.
   */
  const handleSignupThenAccept = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSubmitting(true);
    setFormError(null);

    try {
      await apiFetch("/invitations/signup", {
        method: "POST",
        body: JSON.stringify({
          token,
          name,
          password,
          phone,
        }),
      });

      router.push("/dashboard");
    } catch (err: any) {
      setFormError(
        err?.message ||
          "Couldn't create your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = invitation
    ? EMAIL_ROLE_LABEL[invitation.role] ||
      invitation.role
    : "";

  /**
   * Is the currently logged-in user the person
   * who received this invitation?
   */
  const loggedInAsInvitee =
    currentEmail &&
    invitation &&
    currentEmail.toLowerCase() ===
      invitation.email.toLowerCase();

  /**
   * Is someone else currently logged in?
   */
  const loggedInAsSomeoneElse =
    currentEmail &&
    invitation &&
    !loggedInAsInvitee;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 px-4 py-8">
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
                  You&apos;re invited
                </h1>
              </div>
            </CardHeader>

            <CardContent>
              {/* =========================
                  LOADING
              ========================== */}
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2
                    size={24}
                    className="animate-spin text-gray-400"
                  />
                </div>
              )}

              {/* =========================
                  INVALID INVITATION
              ========================== */}
              {!loading && error && (
                <div className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                    <AlertCircle
                      className="text-red-600 dark:text-red-400"
                      size={24}
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {error}
                  </p>

                  <Link
                    href="/login"
                    className="text-sm text-indigo-600 dark:text-teal-400 hover:underline"
                  >
                    Go to login
                  </Link>
                </div>
              )}

              {/* =========================
                  VALID INVITATION
              ========================== */}
              {!loading &&
                !error &&
                invitation && (
                  <div className="space-y-5">

                    {/* Invitation information */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 shrink-0">
                        <Building2
                          size={16}
                          className="text-indigo-600 dark:text-teal-400"
                        />
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          Join{" "}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {invitation.workspaceName}
                          </span>{" "}
                          as a{" "}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {roleLabel}
                          </span>
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {invitation.email}
                        </p>
                      </div>
                    </div>

                    {/* =========================
                        LOGGED IN AS SOMEONE ELSE
                    ========================== */}
                    {loggedInAsSomeoneElse && (
                      <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-200">
                        You&apos;re currently logged in as{" "}
                        <strong>{currentEmail}</strong>,
                        but this invitation was sent to{" "}
                        <strong>
                          {invitation.email}
                        </strong>
                        .{" "}

                        <button
                          type="button"
                          onClick={async () => {
                            await apiFetch(
                              "/auth/logout",
                              {
                                method: "POST",
                              }
                            ).catch(() => {});

                            setCurrentEmail(null);
                          }}
                          className="underline font-medium"
                        >
                          Log out
                        </button>{" "}
                        to continue.
                      </div>
                    )}

                    {/* =========================
                        ALREADY LOGGED IN
                    ========================== */}
                    {loggedInAsInvitee && (
                      <Button
                        onClick={handleAcceptDirect}
                        disabled={submitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-6 rounded-xl"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Joining...
                          </span>
                        ) : (
                          `Accept and join ${invitation.workspaceName}`
                        )}
                      </Button>
                    )}

                    {/* =========================
                        LOGIN EXISTING ACCOUNT
                    ========================== */}
                    {currentEmail === null &&
                      invitation.hasAccount && (
                        <form
                          onSubmit={
                            handleLoginThenAccept
                          }
                          className="space-y-4"
                        >
                          {/* Email */}
                          <div className="space-y-1.5">
                            <Label htmlFor="loginEmail">
                              Email address
                            </Label>

                            <div className="relative">
                              <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                              />

                              <Input
                                id="loginEmail"
                                value={
                                  invitation.email
                                }
                                disabled
                                className="pl-9 bg-gray-50 dark:bg-gray-800"
                              />
                            </div>
                          </div>

                          {/* Password */}
                          <div className="space-y-1.5">
                            <Label htmlFor="loginPassword">
                              Password
                            </Label>

                            <div className="relative">
                              <Lock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                              />

                              <Input
                                id="loginPassword"
                                type={
                                  showPassword
                                    ? "text"
                                    : "password"
                                }
                                value={
                                  loginPassword
                                }
                                onChange={(e) =>
                                  setLoginPassword(
                                    e.target.value
                                  )
                                }
                                required
                                className="pl-9 pr-10 border-gray-300 dark:border-gray-700"
                                placeholder="••••••••"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword(
                                    (value) =>
                                      !value
                                  )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                tabIndex={-1}
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showPassword ? (
                                  <EyeOff
                                    size={16}
                                  />
                                ) : (
                                  <Eye
                                    size={16}
                                  />
                                )}
                              </button>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-6 rounded-xl"
                          >
                            {submitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Logging in...
                              </span>
                            ) : (
                              "Log in and accept"
                            )}
                          </Button>
                        </form>
                      )}

                    {/* =========================
                        CREATE NEW ACCOUNT
                    ========================== */}
                    {currentEmail === null &&
                      !invitation.hasAccount && (
                        <form
                          onSubmit={
                            handleSignupThenAccept
                          }
                          className="space-y-4"
                        >
                          {/* Full name */}
                          <div className="space-y-1.5">
                            <Label htmlFor="name">
                              Full name
                            </Label>

                            <div className="relative">
                              <User
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                              />

                              <Input
                                id="name"
                                value={name}
                                onChange={(e) =>
                                  setName(
                                    e.target.value
                                  )
                                }
                                required
                                className="pl-9 border-gray-300 dark:border-gray-700"
                                placeholder="Jane Doe"
                              />
                            </div>
                          </div>

                          {/* Email */}
                          <div className="space-y-1.5">
                            <Label htmlFor="signupEmail">
                              Email address
                            </Label>

                            <div className="relative">
                              <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                              />

                              <Input
                                id="signupEmail"
                                value={
                                  invitation.email
                                }
                                disabled
                                className="pl-9 bg-gray-50 dark:bg-gray-800"
                              />
                            </div>
                          </div>

                          {/* Password */}
                          <div className="space-y-1.5">
                            <Label htmlFor="password">
                              Password
                            </Label>

                            <div className="relative">
                              <Lock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                              />

                              <Input
                                id="password"
                                type={
                                  showPassword
                                    ? "text"
                                    : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                  setPassword(
                                    e.target.value
                                  )
                                }
                                required
                                className="pl-9 pr-10 border-gray-300 dark:border-gray-700"
                                placeholder="••••••••"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword(
                                    (value) =>
                                      !value
                                  )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                tabIndex={-1}
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showPassword ? (
                                  <EyeOff
                                    size={16}
                                  />
                                ) : (
                                  <Eye
                                    size={16}
                                  />
                                )}
                              </button>
                            </div>

                            {/* Password rules */}
                            {password.length > 0 && (
                              <ul className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
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
                            )}
                          </div>

                          {/* Phone */}
                          <div className="space-y-1.5">
                            <Label htmlFor="phone">
                              Phone number{" "}
                              <span className="text-gray-400">
                                (optional)
                              </span>
                            </Label>

                            <Input
                              id="phone"
                              type="tel"
                              value={phone}
                              onChange={(e) =>
                                setPhone(
                                  e.target.value
                                )
                              }
                              className="border-gray-300 dark:border-gray-700"
                              placeholder="+265..."
                            />
                          </div>

                          {/* Create account */}
                          <Button
                            type="submit"
                            disabled={
                              submitting ||
                              passwordScore < 3
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-6 rounded-xl"
                          >
                            {submitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Creating account...
                              </span>
                            ) : (
                              "Create account and join"
                            )}
                          </Button>
                        </form>
                      )}

                    {/* =========================
                        GOOGLE AUTH
                    ========================== */}
                    {!loggedInAsInvitee && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />

                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            OR
                          </span>

                          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGoogle}
                          disabled={submitting}
                          className="w-full border-gray-300 dark:border-gray-700 py-6 rounded-xl font-medium"
                        >
                          Continue with Google
                        </Button>
                      </>
                    )}

                    {/* =========================
                        FORM ERROR
                    ========================== */}
                    {formError && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3">
                        <p className="text-sm text-center text-red-600 dark:text-red-400">
                          {formError}
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * IMPORTANT FIX FOR NEXT.JS
 *
 * useSearchParams() is inside AcceptInvitationContent.
 * Next.js requires a Suspense boundary around it during
 * production prerendering.
 */
export default function AcceptInvitationPage() {
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
      <AcceptInvitationContent />
    </Suspense>
  );
}