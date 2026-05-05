import { useNotifications } from "@/hooks/useNotifications";
import { FileText, DollarSign, User, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivities() {
  const { data: notifications = [], isLoading } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case "invoice": return <FileText className="text-blue-500 w-4 h-4" />;
      case "payment": return <DollarSign className="text-green-500 w-4 h-4" />;
      case "client": return <User className="text-purple-500 w-4 h-4" />;
      default: return <Bell className="text-gray-500 w-4 h-4" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.max(0, now.getTime() - date.getTime());
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (isLoading) return <Skeleton className="h-60 w-full rounded-2xl" />;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow dark:shadow-none border border-gray-100 dark:border-gray-700 h-full">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <p>No activity yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.slice(0, 5).map((n) => (
            <li key={n._id} className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {getIcon(n.type)}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(n.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}