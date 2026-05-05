"use client";

import { useMemo } from "react";
import { Bell, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

interface Notification {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}

// API
const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await apiFetch("/notifications");
  return res || [];
};

const markAsRead = async (id: string) => {
  return apiFetch(`/notifications/${id}/read`, { method: "PUT" });
};

const markAllAsReadAPI = async () => {
  return apiFetch("/notifications/read-all", { method: "PUT" });
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  // 🔥 unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // 🔥 optimistic update
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const prev = queryClient.getQueryData<Notification[]>(["notifications"]);

      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

      return { prev };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["notifications"], context?.prev);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsReadAPI,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const prev = queryClient.getQueryData<Notification[]>(["notifications"]);

      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => ({ ...n, isRead: true }))
      );

      return { prev };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["notifications"], context?.prev);
    },
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);

    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return "Just now";
  };

  // 🔥 group notifications
  const grouped = useMemo(() => {
    const today: Notification[] = [];
    const earlier: Notification[] = [];

    notifications.forEach((n) => {
      const diff =
        new Date().getTime() - new Date(n.createdAt).getTime();

      if (diff < 86400000) {
        today.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, earlier };
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load notifications.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Notifications</h1>

          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {notifications.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending
              ? "Marking..."
              : "Mark all as read"}
          </Button>
        )}
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Bell className="w-12 h-12 mb-4 opacity-60" />
          <p className="text-lg font-medium">You're all caught up 🎉</p>
          <p className="text-sm text-gray-400">
            New activity will appear here
          </p>
        </div>
      )}

      {/* LIST */}
      {notifications.length > 0 && (
        <div className="space-y-6">
          {/* TODAY */}
          {grouped.today.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                Today
              </p>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {grouped.today.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markAsReadMutation.mutate(n._id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition ${
                      n.isRead
                        ? "opacity-60"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {n.isRead ? (
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                    ) : (
                      <Circle className="text-blue-500 w-5 h-5" />
                    )}

                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-500">
                        {n.description}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EARLIER */}
          {grouped.earlier.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                Earlier
              </p>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {grouped.earlier.map((n) => (
                  <div
                    key={n._id}
                    className="flex items-center gap-4 p-4 opacity-70"
                  >
                    <CheckCircle2 className="text-green-500 w-5 h-5" />

                    <div className="flex-1">
                      <p className="text-sm">{n.title}</p>
                      <p className="text-xs text-gray-500">
                        {n.description}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}