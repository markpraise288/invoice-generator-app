"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Receipt,
  CheckCircle2,
  XCircle,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { ExpenseStatusBadge } from "@/components/expenses/ExpenseStatusBadge";
import {
  useApproveExpense,
  useMarkExpensePaid,
  useDeleteExpense,
  type Expense,
} from "@/hooks/useExpenses";
import { toast } from "sonner";

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onReject: (expense: Expense) => void;
}

const formatCurrency = (cents: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const categoryLabels: Record<Expense["category"], string> = {
  office_supplies: "Office Supplies",
  software: "Software",
  travel: "Travel",
  meals: "Meals & Entertainment",
  marketing: "Marketing",
  payroll: "Payroll",
  rent: "Rent",
  utilities: "Utilities",
  professional_services: "Professional Services",
  equipment: "Equipment",
  other: "Other",
};

export function ExpensesTable({ expenses, isLoading, onEdit, onReject }: ExpensesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const approveExpense = useApproveExpense();
  const markPaid = useMarkExpensePaid();
  const deleteExpense = useDeleteExpense();

  const handleApprove = async (expense: Expense) => {
    try {
      await approveExpense.mutateAsync(expense._id);
      toast.success("Expense approved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve expense");
    }
  };

  const handleMarkPaid = async (expense: Expense) => {
    try {
      await markPaid.mutateAsync({ id: expense._id });
      toast.success("Expense marked as paid");
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark expense as paid");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense.mutateAsync(deleteTarget._id);
      toast.success("Expense deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete expense");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Receipt className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No expenses yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your first expense to start tracking spending.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const isLocked = expense.status === "approved" || expense.status === "paid";

              return (
                <TableRow key={expense._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{expense.description}</span>
                      {expense.vendor && (
                        <span className="text-xs text-muted-foreground">{expense.vendor}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {categoryLabels[expense.category]}
                      {expense.isRecurring && (
                        <RefreshCw className="h-3 w-3 text-muted-foreground/60" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ExpenseStatusBadge status={expense.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.expenseDate)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount, expense.currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {expense.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(expense)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReject(expense)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {expense.status === "approved" && (
                          <DropdownMenuItem onClick={() => handleMarkPaid(expense)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Mark paid
                          </DropdownMenuItem>
                        )}
                        {!isLocked && (
                          <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {!isLocked && (
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400 focus:text-red-600"
                            onClick={() => setDeleteTarget(expense)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.description}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}