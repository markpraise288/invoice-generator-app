"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Download, 
  Calendar,
  Filter,
  ArrowUpDown,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SalesTable from "@/components/finance/SalesTable";
import SummaryCard from "@/components/finance/SummaryCard";
import SaleForm from "@/components/finance/SaleForm";
import { useSales } from "@/hooks/useFinance";
import { Sale } from "@/types/finance";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesPage() {
  const { data: sales = [], isLoading } = useSales();
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month" | "year">("month");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  // Calculate status totals for summary
  const statusTotals = useMemo(() => {
    const totals: Record<string, { count: number; amount: number }> = {};
    sales.filter((sale) => !sale.isDeleted).forEach((sale) => {
      if (!totals[sale.status]) {
        totals[sale.status] = { count: 0, amount: 0 };
      }
      totals[sale.status].count++;
      totals[sale.status].amount += sale.amount;
    });
    return totals;
  }, [sales]);

  // Filter sales by date
  const filteredSales = useMemo(() => {
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
        return sales;
    }

    return sales.filter((sale) => new Date(sale.date) >= startDate && !sale.isDeleted);
  }, [sales, dateFilter]);

  // Sort sales
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });
  }, [filteredSales, sortBy]);

  const totalRevenue = useMemo(() => {
    return sortedSales.reduce((sum, sale) => sum + sale.amount, 0);
  }, [sortedSales]);

  const paidRevenue = useMemo(() => {
    return sortedSales
      .filter((sale) => sale.status === "paid")
      .reduce((sum, sale) => sum + sale.amount, 0);
  }, [sortedSales]);

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
            Sales
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Track your income and payment status
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
            onClick={() => setShowSaleForm(true)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <Plus className="mr-2" />
            Record Sale
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
          value={totalRevenue}
          icon={FileText}
          iconColor="text-green-600"
        />
        <SummaryCard
          title="Paid"
          value={paidRevenue}
          icon={Calendar}
          iconColor="text-green-600"
        />
        <SummaryCard
          title="Pending"
          value={statusTotals.pending?.amount || 0}
          icon={Calendar}
          iconColor="text-yellow-600"
        />
        <SummaryCard
          title="Deals"
          value={sales.filter((sale) => !sale.isDeleted).length.toString()}
          icon={Calendar}
          iconColor="text-purple-600"
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
            Showing {sortedSales.length} of {sales.length} sales
          </div>
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SalesTable 
          sales={sortedSales} 
          onEdit={(sale) => {
            setEditingSale(sale);
            setShowSaleForm(true);
          }}
        />
      </motion.div>

      {/* Sale Form Modal */}
      <SaleForm 
        isOpen={showSaleForm}
        onClose={() => {
          setShowSaleForm(false);
          setEditingSale(null);
        }}
        sale={editingSale}
      />
    </div>
  );
}
