"use client";

type Status =
  string | "draft"
  | "sent"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<Status, string> = {
    draft: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
    sent: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
    paid: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    partial: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    overdue: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
    cancelled: "bg-gray-500 dark:bg-gray-600 text-white",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}