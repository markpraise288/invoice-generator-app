"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
  title: "Login" | "Signup";
  submitRequest: (formData: FormDataType) => Promise<void>;
}

interface FormDataType {
  companyName?: string;
  address?: string;
  name?: string;
  phone?: string;
  email: string;
  password: string;
}

export default function AuthForm({ title, submitRequest }: AuthFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    companyName: "",
    address: "",
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-150 h-150 bg-blue-600/10 blur-[120px] rounded-full" />

      {/* FORM */}
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl p-8 space-y-6"
      >
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md">
              <Rocket className="text-white" />
            </div>
          </div>

          <h1 className="text-xl font-semibold dark:text-white">
            InvoiceFlow
          </h1>

          <h2 className="text-2xl font-bold dark:text-white">
            {title === "Login" ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

        {/* SIGNUP FIELDS */}
        {title === "Signup" && (
          <div className="space-y-4">
            <Input icon={User} name="name" placeholder="Full Name" value={formData.name || ""} onChange={handleChange} />
            <Input icon={Building} name="companyName" placeholder="Company Name" value={formData.companyName || ""} onChange={handleChange} />
            <Input icon={Phone} name="phone" placeholder="Phone" value={formData.phone || ""} onChange={handleChange} />
          </div>
        )}

        {/* EMAIL */}
        <Input
          icon={Mail}
          name="email"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
        />

        {/* PASSWORD */}
        <div className="relative">
          <Input
            icon={Lock}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          {/* PASSWORD STRENGTH */}
          {title === "Signup" && formData.password && (
            <div className="mt-2 text-xs">
              <span
                className={`${
                  passwordStrength === "weak"
                    ? "text-red-500"
                    : passwordStrength === "medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {passwordStrength} password
              </span>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
        >
          {loading ? "Processing..." : title}
        </button>

        {/* FORGOT PASSWORD */}
        {title === "Login" && (
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        )}

        {/* SWITCH */}
        <p className="text-center text-sm text-gray-500">
          {title === "Login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() =>
              router.push(title === "Login" ? "/signup" : "/login")
            }
            className="text-blue-600 cursor-pointer font-medium"
          >
            {title === "Login" ? "Sign up" : "Login"}
          </span>
        </p>
      </motion.form>
    </div>
  );
}

/* INPUT COMPONENT */
function Input({ icon: Icon, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-3 text-gray-400" size={18} />

      <input
        {...props}
        className="
          w-full pl-10 pr-3 py-3 rounded-xl
          border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-950
          text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition
        "
      />
    </div>
  );
}