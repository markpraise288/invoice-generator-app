"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinanceSummaryCards } from "@/components/finance/FinanceSummaryCards";
import { ProfitLossChart } from "@/components/finance/ProfitLossChart";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { BudgetTable } from "@/components/finance/BudgetTable";
import type { ReportDateRange } from "@/hooks/useFinance";

// Default to the last 6 full months — a reasonable out-of-the-box window for
// a financial dashboard, avoiding the "no data because no dates picked yet"
// empty state on first load.
const getDefaultRange = (): ReportDateRange => {
  const now = new Date();
  const dateTo = now.toISOString().slice(0, 10);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const dateFrom = sixMonthsAgo.toISOString().slice(0, 10);
  return { dateFrom, dateTo, groupBy: "month" };
};

export default function FinancePage() {
  const [dateRange, setDateRange] = useState<ReportDateRange>(getDefaultRange());

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Finance</h1>
          <p className="text-sm text-muted-foreground">
            Profit &amp; loss, cash flow, and budget tracking in one place.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="dateFrom" className="text-xs">From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateRange.dateFrom}
              onChange={(e) => setDateRange((r) => ({ ...r, dateFrom: e.target.value }))}
              className="w-40"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dateTo" className="text-xs">To</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateRange.dateTo}
              onChange={(e) => setDateRange((r) => ({ ...r, dateTo: e.target.value }))}
              className="w-40"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Group By</Label>
            <Select
              value={dateRange.groupBy}
              onValueChange={(v: "day" | "week" | "month") =>
                setDateRange((r) => ({ ...r, groupBy: v }))
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <FinanceSummaryCards dateRange={dateRange} />

      <ProfitLossChart dateRange={dateRange} />

      <CashFlowChart dateRange={dateRange} />

      <div className="rounded-xl border p-5">
        <BudgetTable />
      </div>

      <p className="text-xs text-muted-foreground">
        P&amp;L reflects paid sales and approved/paid expenses. Cash flow reflects actual completed
        payments and paid expenses. These can differ — see each chart for details.
      </p>
    </div>
  );
}