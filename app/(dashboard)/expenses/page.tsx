"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Download, 
  Calendar,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpenseTable from "@/components/finance/ExpenseTable";
import ExpenseForm from "@/components/finance/ExpenseForm";
import SummaryCard from "@/components/finance/SummaryCard";
import { useExpenses } from "@/hooks/useFinance";
import { Expense, ExpenseCategory } from "@/types/finance";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month" | "year">("month");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  // Calculate category totals for summary
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.filter((expense) => !expense.isDeleted).forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  }, [expenses]);

  // Filter expenses by date
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (dateFilter) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return expenses.filter((expense) => !expense.isDeleted);
    }

    return expenses.filter((expense) => new Date(expense.date) >= startDate && !expense.isDeleted);
  }, [expenses, dateFilter]);

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });
  }, [filteredExpenses, sortBy]);

  const totalExpenses = useMemo(() => {
    return sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [sortedExpenses]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
            Expenses
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Manage and track your business expenses
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-700"
          >
            <Download className="mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowExpenseForm(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="mr-2" />
            Add Expense
          </Button>
        </div>
      </motion.div>

      {/* SUMMARY CARDS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <SummaryCard
          title="Total Expenses"
          value={totalExpenses}
          icon={ArrowUpDown}
          iconColor="text-red-600"
        />
        <SummaryCard
          title="Office"
          value={categoryTotals.office || 0}
          icon={Calendar}
          iconColor="text-blue-600"
        />
        <SummaryCard
          title="Software"
          value={categoryTotals.software || 0}
          icon={Calendar}
          iconColor="text-purple-600"
        />
        <SummaryCard
          title="Marketing"
          value={categoryTotals.marketing || 0}
          icon={Calendar}
          iconColor="text-pink-600"
        />
      </motion.div>

      {/* FILTERS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                className="pl-10 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="pl-10 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {sortedExpenses.length} of {expenses.filter((e) => !e.isDeleted).length} expenses
          </div>
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ExpenseTable 
          expenses={sortedExpenses} 
          onEdit={(expense) => {
            setEditingExpense(expense);
            setShowExpenseForm(true);
          }}
        />
      </motion.div>

      {/* EXPENSE FORM MODAL */}
      <ExpenseForm 
        isOpen={showExpenseForm} 
        onClose={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
      />
    </div>
  );
}
