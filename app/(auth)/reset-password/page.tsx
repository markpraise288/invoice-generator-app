"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

        setStatus("success");
        setMessage("Password updated successfully! You can now login.");

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

    } catch (err) {
      setStatus("error");
      setMessage("Failed to update password. Please check your token or try again.");
    }
  };

  if (!token) return <p className="text-red-500 text-center">Invalid or missing reset token.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input 
          id="password"
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
      </div>
      <Button className="w-full" disabled={status === "loading"}>
        {status === "loading" ? <Loader2 className="animate-spin mr-2" /> : "Reset Password"}
      </Button>
      {message && (
        <p className={`mt-4 text-sm text-center ${status === "success" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Password</h1>
        <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
