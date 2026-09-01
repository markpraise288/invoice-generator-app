"use client";

interface Props {
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal_sent"
    | "negotiation"
    | "won"
    | "lost";
}

const variants = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  contacted:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  qualified:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  proposal_sent:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  negotiation:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function LeadStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${variants[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}