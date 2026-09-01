"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { apiFetch } from "@/lib/apiFetch";

interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authorized" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    const verifyAccess = async () => {
      try {
        // Reuses whatever endpoint your regular app already uses to fetch the
        // logged-in user (adjust the path below if yours differs — see note).
        const res = await apiFetch("/users");
        const user = res.data as CurrentUser;

        if (cancelled) return;

        if (user?.role === "superadmin") {
          setStatus("authorized");
        } else {
          setStatus("denied");
        }
      } catch (err) {
        if (!cancelled) setStatus("denied");
      }
    };

    verifyAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "denied") {
      // Deliberately redirect to the regular dashboard, not a "403" page —
      // no need to confirm to a non-admin that an /admin panel exists at all
      // beyond what a 404-style redirect already reveals just from the URL.
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "checking") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <p className="text-sm text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldAlert className="h-8 w-8 text-red-500" />
          <p className="text-sm text-slate-300">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}