"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Bell,
  BarChart3,
  Target,
  Contact,
  Building2,
  Handshake,
  ListChecks,
  FileText,
  CreditCard,
  Receipt,
  TrendingUp,
  PieChart,
  Users,
  FolderKanban,
  UsersRound,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  CalendarDays,
  Workflow
} from "lucide-react";

import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";
import toast from "react-hot-toast";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Leads", href: "/leads", icon: Target },
      { name: "Contacts", href: "/contacts", icon: Contact },
      { name: "Companies", href: "/companies", icon: Building2 },
      { name: "Deals", href: "/deals", icon: Handshake },
      { name: "Tasks", href: "/tasks", icon: ListChecks },
      { name: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Invoices", href: "/invoices", icon: FileText },
      { name: "Payments", href: "/payments", icon: CreditCard },
      { name: "Expenses", href: "/expenses", icon: Receipt },
      { name: "Sales", href: "/sales", icon: TrendingUp },
      { name: "Finance", href: "/finance", icon: PieChart },
    ],
  },
  {
    label: "Work",
    items: [
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Team", href: "/team", icon: UsersRound },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const router = useRouter();

  // Group whose active link matches the current route starts open by default
  const activeGroupLabel = navGroups.find((g) =>
    g.items.some((item) => item.href === pathname)
  )?.label;

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(activeGroupLabel ? [activeGroupLabel] : [navGroups[0].label])
  );

  // Keep the active route's group open if the route changes externally
  useEffect(() => {
    if (activeGroupLabel) {
      setOpenGroups((prev) => new Set(prev).add(activeGroupLabel));
    }
  }, [activeGroupLabel]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const logout = () => {
    try {
      apiFetch("/auth/logout", { method: "POST" }).then(() => {
        toast.success("Logged out successfully!");
        router.push("/");
      });
    } catch (err) {
      console.error(err);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r shadow-sm transition-all duration-300",
        "border-blue-200 bg-blue-50",
        "dark:border-gray-800 dark:bg-gray-900"
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-blue-200 p-4 dark:border-gray-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-semibold text-lg dark:text-white">
          <span className="bg-linear-to-br from-indigo-600 to-teal-500 p-1 h-8 w-8 flex justify-center items-center rounded-lg">
            <Workflow size={18} className="text-white" />
          </span>
          BusinessFlow
        </Link>

        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-blue-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2 pt-4">
        {navGroups.map((group, groupIdx) => {
          const isOpen = openGroups.has(group.label);

          return (
            <div key={group.label}>
              {collapsed && groupIdx > 0 && (
                <div className="mx-3 mb-2 mt-1 border-t border-blue-200 dark:border-gray-800" />
              )}

              {/* GROUP HEADER — collapsed sidebar has no room for this, so hide it and just show icons */}
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-500/70 transition-colors hover:text-blue-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {group.label}
                  <ChevronDown
                    size={13}
                    className={cn(
                      "transition-transform duration-200",
                      isOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>
              )}

              {/* GROUP ITEMS — always rendered when collapsed (no dropdown, just icons); collapsible when expanded */}
              <div
                className={cn(
                  "space-y-0.5 overflow-hidden transition-all duration-200",
                  !collapsed && !isOpen && "max-h-0",
                  !collapsed && isOpen && "mt-0.5 max-h-[999px]",
                  collapsed && "mt-0"
                )}
              >
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-[0.4rem] transition-all",
                        isActive
                          ? "bg-blue-200 font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "text-blue-900/70 hover:bg-blue-100 hover:text-blue-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300"
                      )}
                    >
                      <Icon size={20} className="shrink-0" />

                      {!collapsed && <span className="text-sm">{item.name}</span>}

                      {collapsed && (
                        <span
                          className={cn(
                            "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2",
                            "whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg",
                            "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                            "dark:bg-blue-800"
                          )}
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-blue-200 p-3 dark:border-gray-800">
        <button
          onClick={() => router.push("/settings")}
          className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-blue-700 transition hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}

          {collapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-blue-800">
              Settings
            </span>
          )}
        </button>
        <button
          onClick={logout}
          className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-red-500 transition hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}

          {collapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-blue-800">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}