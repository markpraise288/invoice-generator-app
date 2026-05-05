"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, DollarSign, ShoppingCart } from "lucide-react";
import { Expense, Sale } from "@/types/finance";

interface RecentTransactionsProps {
  expenses: Expense[];
  sales: Sale[];
}

type Transaction = {
  id: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  date: string;
  category?: string;
  status?: string;
};

export default function RecentTransactions({ expenses, sales }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Combine and sort transactions by date
  const transactions: Transaction[] = [
    ...sales.map((sale, index) => ({
      id: sale._id ?? `sale-${index}`,
      type: "income" as const,
      title: sale.source,
      amount: sale.amount,
      date: sale.date,
      status: sale.status,
    })),
    ...expenses.map((expense, index) => ({
      id: expense._id ?? `expense-${index}`,
      type: "expense" as const,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last 10 transactions
        </span>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <motion.div
            key={`${transaction.type}-${transaction.id}-${index}`}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                transaction.type === "income" 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}>
                {transaction.type === "income" ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownLeft className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {transaction.category && (
                    <span className="capitalize">{transaction.category}</span>
                  )}
                  {transaction.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      transaction.status === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : transaction.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {transaction.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === "income" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(transaction.date)}
              </p>
            </div>
          </motion.div>
        ))}

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No transactions yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
