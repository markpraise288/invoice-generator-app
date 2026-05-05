import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export interface Notification {
  _id: string;
  title: string;
  description: string;
  type: "invoice" | "payment" | "client" | "system";
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiFetch("/notifications");
      return res.data || [];
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};
