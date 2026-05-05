"use client";

import { useMemo, useState } from "react";
import { motion, percent } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Plus,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SummaryCard from "@/components/finance/SummaryCard";
import FinanceChart from "@/components/finance/FinanceChart";
import RecentTransactions from "@/components/finance/RecentTransactions";
import ExpenseForm from "@/components/finance/ExpenseForm";
import { useFinanceStats, useMonthlyFinanceData, useExpenses, useSales } from "@/hooks/useFinance";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceDashboard() {
  const router = useRouter();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: monthlyData, isLoading: chartLoading } = useMonthlyFinanceData();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: sales = [], isLoading: salesLoading } = useSales();

  const isLoading = statsLoading || chartLoading || expensesLoading || salesLoading;

  // Mock data for demonstration (remove when backend is ready)
  const mockStats = useMemo(() => {
    if (stats) return stats;
    return {
      totalRevenue: 125000,
      totalExpenses: 45000,
      netProfit: 80000,
      profitMargin: 64,
      trend: {
        value: 12.5,
        percentage: 12.5,
      },
      revenueGrowth: 12.5,
      expenseGrowth: -3.2,
    };
  }, [stats]);

  const mockMonthlyData = useMemo(() => {
    if (monthlyData && monthlyData.length > 0) return monthlyData;
    // Generate mock data for the last 12 months
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const revenue = Math.floor(Math.random() * 15000) + 8000;
      const expenses = Math.floor(Math.random() * 8000) + 3000;
      months.push({
        month: monthNames[date.getMonth()],
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }
    return months;
  }, [monthlyData]);

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
        <Skeleton className="h-80 w-full rounded-2xl" />
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
            Finance Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Track your revenue, expenses, and profitability
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/sales")}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <FileText className="mr-2" />
            New Sale
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
          title="Total Revenue"
          value={mockStats.totalRevenue}
          icon={DollarSign}
          iconColor="text-green-600"
          trend={{
            value: mockStats.trend!.value,
            label: "vs last month",
          }}
        />
        <SummaryCard
          title="Total Expenses"
          value={mockStats.totalExpenses}
          icon={TrendingDown}
          iconColor="text-red-600"
          trend={{
            value: mockStats.trend!.percentage * -1, // Invert for expenses
            label: "vs last month",
          }}
        />
        <SummaryCard
          title="Net Profit"
          value={mockStats.netProfit}
          icon={TrendingUp}
          iconColor="text-blue-600"
          trend={{
            value: mockStats.profitMargin,
            label: "profit margin",
          }}
        />
        <SummaryCard
          title="Profit Margin"
          value={`${mockStats.profitMargin}%`}
          icon={CreditCard}
          iconColor="text-purple-600"
        />
      </motion.div>

      {/* CHART */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <FinanceChart data={mockMonthlyData} />
      </motion.div>

      {/* RECENT TRANSACTIONS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <RecentTransactions expenses={expenses} sales={sales.filter((sale) => !sale.isDeleted)} />
      </motion.div>

      {/* EXPENSE FORM MODAL */}
      <ExpenseForm 
        isOpen={showExpenseForm} 
        onClose={() => setShowExpenseForm(false)} 
      />
    </div>
  );
}
