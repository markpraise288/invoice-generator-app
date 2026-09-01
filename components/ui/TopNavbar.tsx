"use client";

import { Bell, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import GlobalSearch from "@/components/ui/GlobalSearch";
import { apiFetch } from "@/lib/apiFetch";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  isRead: boolean;
}

export default function TopNavbar() {
  const router = useRouter();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => Promise.resolve([]),
    staleTime: Infinity,
  });

  const hasUnread =
    Array.isArray(notifications) &&
    notifications.some((n) => !n.isRead);

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
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-700/60 px-4 md:px-6 py-3 flex items-center justify-between gap-4">

      {/* 🔍 SEARCH */}
      <div className="flex-1 max-w-lg">
        <GlobalSearch />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        <ModeToggle />

        {/*Billing */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/settings/billing")}
        >
          <CreditCard size={20} />
        </Button>

        {/* Report issue */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/report")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </Button>

        {/* 🔔 Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => router.push("/notifications")}
        >
          <Bell size={20} />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </Button>

        {/* 👤 Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:opacity-80 transition">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  PM
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" onClick={logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}