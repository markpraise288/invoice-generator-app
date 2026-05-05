"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCircle,
  Trash2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  CreditCard,
  Receipt,
  TrendingUp,
  PieChart,
  Bell,
} from "lucide-react";

import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import toast from "react-hot-toast";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Sales", href: "/sales", icon: TrendingUp },
  { name: "Finance", href: "/finance", icon: PieChart },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Account", href: "/account", icon: UserCircle },
  { name: "Trash", href: "/trash", icon: Trash2 },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const router = useRouter();

  const logout = () => {
  // Implement logout logic here
  try{
    apiFetch("/auth/logout", { method: "POST" }).then(() => {
      toast.success("Logged out successfully!");
      router.push("/");
    });
  }
  catch(err){
    console.error(err);
    toast.error("Logout failed. Please try again.");
  }
};

    return (
    <aside className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm flex flex-col transition-all duration-300">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <h1 className="text-lg font-bold flex items-center gap-2 dark:text-white">
            <span className="bg-blue-700 text-white w-8 h-8 flex items-center justify-center rounded-full">
              🚀
            </span>
            InvoiceFlow
          </h1>
        )}

        {/* TOGGLE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-2 space-y-3 mt-4">

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-300"
              )}
            >
              {/* ICON */}
              <Icon size={20} />

              {/* TEXT */}
              {!collapsed && (
                <span className="text-sm">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}