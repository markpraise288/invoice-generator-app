"use client";

import { Bell } from "lucide-react";
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

  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-700/60 px-4 md:px-6 py-3 flex items-center justify-between gap-4">

      {/* 🔍 SEARCH */}
      <div className="flex-1 max-w-lg">
        <GlobalSearch />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        <ModeToggle />

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
            <DropdownMenuItem onClick={() => router.push("/account")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}