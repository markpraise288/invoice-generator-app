"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Workflow,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface AuthFormProps {
  title: "Login" | "Signup";
  submitRequest: (formData: FormDataType) => Promise<void>;
  onGoogleAuth?: () => void;
  /** Render just the card with no full-screen wrapper/background — use when the
   * parent page supplies its own layout (e.g. a split-screen signup page). */
  embedded?: boolean;
}

interface FormDataType {
  companyName?: string;
  address?: string;
  name?: string;
  phone?: string;
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PasswordRule = {
  label: string;
  test: (pw: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
  { label: "One special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const STRENGTH_LABELS = ["Weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = [
  "bg-gray-200 dark:bg-gray-800",
  "bg-red-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-emerald-500",
];

export default function AuthForm({ title, submitRequest, onGoogleAuth, embedded = false }: AuthFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    companyName: "",
    address: "",
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const isSignup = title === "Signup";

  const emailValid = useMemo(() => EMAIL_REGEX.test(formData.email), [formData.email]);
  const showEmailError = (touched.email || attempted) && formData.email.length > 0 && !emailValid;
  const showEmailRequired = (touched.email || attempted) && formData.email.length === 0;

  const passwordScore = useMemo(
    () => PASSWORD_RULES.filter((rule) => rule.test(formData.password)).length,
    [formData.password]
  );
  const passwordValid = isSignup ? passwordScore === PASSWORD_RULES.length : formData.password.length > 0;
  const showPasswordRules = isSignup && (touched.password || formData.password.length > 0);

  const canSubmit = emailValid && (isSignup ? passwordScore >= 3 : formData.password.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!canSubmit) return;

    setLoading(true);
    try {
      await submitRequest(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      if (onGoogleAuth) {
        await onGoogleAuth();
      } else {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const card = (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
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
              <h2 className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isSignup
                  ? "Start free — no credit card required."
                  : "Log in to pick up where you left off."}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* SIGNUP FIELDS */}
              {isSignup && (
                <div className="space-y-4">
                  <Field
                    icon={User}
                    id="name"
                    label="Full name"
                    placeholder="Jane Doe"
                    value={formData.name || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <Field
                    icon={Building}
                    id="companyName"
                    label="Company name"
                    placeholder="Acme Inc."
                    value={formData.companyName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      icon={Phone}
                      id="phone"
                      label="Phone"
                      placeholder="(555) 000-0000"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Field
                      icon={MapPin}
                      id="address"
                      label="Address"
                      placeholder="City, State"
                      value={formData.address || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
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

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="pl-9 pr-10 border-gray-300 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {attempted && !isSignup && formData.password.length === 0 && (
                  <p className="text-xs text-red-500">Password is required.</p>
                )}

                {/* PASSWORD STRENGTH */}
                {showPasswordRules && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < passwordScore
                              ? STRENGTH_COLORS[passwordScore]
                              : "bg-gray-200 dark:bg-gray-800"
                          }`}
                        />
                      ))}
                    </div>
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
                      {STRENGTH_LABELS[passwordScore]} password
                    </p>
                    <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(formData.password);
                        return (
                          <li
                            key={rule.label}
                            className={`flex items-center gap-1.5 text-xs ${
                              passed
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {passed ? <Check size={12} /> : <X size={12} />}
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-6 rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </span>
                ) : (
                  title
                )}
              </Button>

              {/* DIVIDER */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 dark:text-gray-500">OR</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              </div>

              {/* GOOGLE AUTH */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
                className="w-full border-gray-300 dark:border-gray-700 py-6 rounded-xl font-medium"
              >
                {googleLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <GoogleIcon size={16} />
                    Continue with Google
                  </span>
                )}
              </Button>

              {/* FORGOT PASSWORD */}
              {!isSignup && (
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-indigo-600 dark:text-teal-400 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}

              {/* SWITCH */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => router.push(isSignup ? "/login" : "/signup")}
                  className="text-indigo-600 dark:text-teal-400 font-medium hover:underline"
                >
                  {isSignup ? "Log in" : "Sign up"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
  );

  if (embedded) {
    return card;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      {card}
    </div>
  );
}

/* GOOGLE "G" MARK */
function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11C3.24 21.3 7.29 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.61H1.26A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.26 5.39l4.01-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

/* FIELD (labeled input with icon) */
function Field({
  icon: Icon,
  id,
  label,
  ...props
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  id: string;
  label: string;
  [key: string]: any;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input id={id} name={id} className="pl-9 border-gray-300 dark:border-gray-700" {...props} />
      </div>
    </div>
  );
}