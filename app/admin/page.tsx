"use client";

import { PlatformStatsCards } from "@/components/admin/PlatformStatsCards";
import { RevenueChart } from "@/components/admin/RevenueChart";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Platform Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of every business running on InvoiceFlow.
        </p>
      </div>

      <PlatformStatsCards />

      <RevenueChart />
    </div>
  );
}