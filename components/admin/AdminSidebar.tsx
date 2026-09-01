"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ScrollText,
  ShieldAlert,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";
import toast from "react-hot-toast";

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Tenants", href: "/admin/tenants", icon: Building2 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { name: "Billing", href: "/admin/billing", icon: Wallet },
  { name: "Reports", href: "/admin/user-reports", icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      {/* HEADER — deliberately distinct branding so it's unmistakable this isn't the regular app */}
      <div className="flex items-center gap-2 border-b border-slate-800 p-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
          <ShieldAlert size={16} />
        </span>
        <div>
          <p className="text-sm font-bold leading-none text-white">Admin Panel</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
            Platform Owner
          </p>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-0.5 p-2 pt-4">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-slate-800 font-medium text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-950/40"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}