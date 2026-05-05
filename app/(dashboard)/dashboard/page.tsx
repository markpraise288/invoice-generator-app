"use client";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import RecentActivities from "@/components/dashboardUI/RecentActivities";
import QuickActions from "@/components/dashboardUI/QuickActions";
import { useRouter } from "next/navigation";
import RevenueChart from "@/components/dashboardUI/RevenueChart";
import OutstandingPayments from "@/components/dashboardUI/OutstandingPayments";
import TopClients from "@/components/dashboardUI/TopClients";
import Insights from "@/components/dashboardUI/Insights";
import { useMemo } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { generateRevenueData } from "@/utils/generateRevenueData";
import { calculateGrowth, getMonthlyStats } from "@/lib/growth";
import { computeDashboardStats } from "@/lib/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const router = useRouter();
  const { data: invoices = [], isLoading } = useInvoices();

  const stats = useMemo(() => {
    return computeDashboardStats(invoices);
  }, [invoices]);


    if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }


  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // or USD
    }).format(amount);
  };


  const revenueData = generateRevenueData(invoices);

  const monthly = getMonthlyStats(invoices);

  const revenueGrowth = calculateGrowth(
    monthly.currentRevenue,
    monthly.lastRevenue,
  );

  const invoiceGrowth = calculateGrowth(
    monthly.currentInvoices,
    monthly.lastInvoices,
  );

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const pendingGrowth = calculateGrowth(
  stats.pendingInvoices,
  monthly.lastInvoices // or last pending if you track it
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl">Dashboard</h1>
          <p className="text-gray-500 text-sm md:text-base">
            Welcome, manage your Clients and Invoices
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/invoices/create")}
          className="bg-blue-700 text-white w-full md:w-auto"
        >
          <FileText className="mr-2" />
          New Invoice
        </Button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card
          title="Total Invoices"
          icon="file"
          iconColor="text-blue-700"
          value={stats.totalInvoices.toString()}
          variant={invoiceGrowth >= 0 ? "rising" : "dropping"}
          time={`${formatGrowth(invoiceGrowth)} this month`}
        />

        <Card
          title="Paid Invoices"
          icon="success"
          iconColor="text-green-400"
          value={stats.paidInvoices.toString()}
          variant="rising"
          time="Completed"
        />

        <Card
          title="Pending Invoices"
          icon="time"
          iconColor="text-yellow-400"
          value={stats.pendingInvoices.toString()}
          variant={pendingGrowth <= 0 ? "rising" : "dropping"}
          time={`${formatGrowth(pendingGrowth)} unpaid trend`}
        />

        <Card
          title="Total Revenue"
          icon="dollar"
          iconColor="text-blue-700"
          value={formatMoney(stats.totalRevenue)}
          variant={revenueGrowth >= 0 ? "rising" : "dropping"}
          time={`${formatGrowth(revenueGrowth)} vs last month`}
        />
      </div>

      {/* CHART + PAYMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <RevenueChart data={revenueData} />
        <OutstandingPayments invoices={invoices} />
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <TopClients invoices={invoices} />
        <Insights invoices={invoices} />
      </div>

            {/* ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentActivities invoices={invoices} />
        <QuickActions />
      </div>

    </div>
  );
}
