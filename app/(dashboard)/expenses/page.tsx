"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenses, type Expense, type ExpensesListParams } from "@/hooks/useExpenses";
import { ExpensesSummaryCards } from "@/components/expenses/ExpensesSummaryCards";
import { ExpensesFilters } from "@/components/expenses/ExpensesFilters";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog";
import { ApproveExpenseDialog } from "@/components/expenses/ApproveExpenseDialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<ExpensesListParams>({ page: 1, limit: 20 });
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Expense | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data, isLoading } = useExpenses({ ...filters, search: debouncedSearch });

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const openReject = (expense: Expense) => {
    setRejectTarget(expense);
    setRejectDialogOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingExpense(null);
  };

  const handleRejectDialogOpenChange = (open: boolean) => {
    setRejectDialogOpen(open);
    if (!open) setRejectTarget(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Submit and approve business spending across every category.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </div>

      <ExpensesSummaryCards filters={{ dateFrom: filters.dateFrom, dateTo: filters.dateTo }} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by description or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ExpensesFilters filters={filters} onChange={setFilters} />
      </div>

      <ExpensesTable
        expenses={data?.expenses ?? []}
        isLoading={isLoading}
        onEdit={openEdit}
        onReject={openReject}
      />

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total}{" "}
            expenses
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === data.pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ExpenseFormDialog open={formOpen} onOpenChange={handleFormOpenChange} expense={editingExpense} />

      <ApproveExpenseDialog
        expense={rejectTarget}
        open={rejectDialogOpen}
        onOpenChange={handleRejectDialogOpenChange}
      />
    </div>
  );
}