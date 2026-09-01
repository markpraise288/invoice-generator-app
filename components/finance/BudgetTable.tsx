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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, AlertTriangle, Wallet, Loader2 } from "lucide-react";
import {
  useBudgetVsActual,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  type BudgetWithActual,
  type CreateBudgetPayload,
  type BudgetPeriod,
} from "@/hooks/useFinance";
import type { ExpenseCategory } from "@/hooks/useExpenses";
import { toast } from "sonner";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
};

const categoryLabels: Record<ExpenseCategory, string> = {
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

const emptyForm: CreateBudgetPayload = {
  category: "other",
  limit: 0,
  period: "monthly",
  periodStart: "",
  periodEnd: "",
  notes: "",
};

export function BudgetTable() {
  const { data: budgets, isLoading } = useBudgetVsActual();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithActual | null>(null);
  const [form, setForm] = useState<CreateBudgetPayload>(emptyForm);
  const [limitInput, setLimitInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BudgetWithActual | null>(null);

  const isEditing = !!editingBudget;
  const isSubmitting = createBudget.isPending || updateBudget.isPending;

  const openCreate = () => {
    setEditingBudget(null);
    setForm(emptyForm);
    setLimitInput("");
    setFormOpen(true);
  };

  const openEdit = (budget: BudgetWithActual) => {
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      limit: budget.limit,
      period: budget.period,
      periodStart: budget.periodStart.slice(0, 10),
      periodEnd: budget.periodEnd.slice(0, 10),
      notes: budget.notes || "",
    });
    setLimitInput((budget.limit / 100).toString());
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const limit = Math.round(parseFloat(limitInput || "0") * 100);
    if (!limit || limit <= 0) {
      toast.error("Please enter a valid budget limit");
      return;
    }
    if (!form.periodStart || !form.periodEnd) {
      toast.error("Please set both a start and end date");
      return;
    }

    try {
      if (isEditing && editingBudget) {
        await updateBudget.mutateAsync({
          id: editingBudget._id,
          data: {
            limit,
            period: form.period,
            periodStart: form.periodStart,
            periodEnd: form.periodEnd,
            notes: form.notes,
          },
        });
        toast.success("Budget updated");
      } else {
        await createBudget.mutateAsync({ ...form, limit });
        toast.success("Budget created");
      }
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save budget");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBudget.mutateAsync(deleteTarget._id);
      toast.success("Budget deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete budget");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Budgets by Category</h3>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Budget
        </Button>
      </div>

      {!budgets?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <Wallet className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">No active budgets</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Set spending limits per category to track against actual expenses.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Category</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget._id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {budget.isOverBudget && (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className="font-medium text-foreground">
                        {categoryLabels[budget.category]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-48">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            budget.isOverBudget
                              ? "bg-red-500"
                              : budget.percentUsed >= 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
                        />
                      </div>
                      <span className="w-10 text-xs text-muted-foreground">
                        {budget.percentUsed}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(budget.spent)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(budget.limit)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(budget)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 dark:text-red-400"
                        onClick={() => setDeleteTarget(budget)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Budget" : "New Budget"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v: ExpenseCategory) => setForm((f) => ({ ...f, category: v }))}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Category can't be changed after creation — delete and create a new budget instead.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="limit">Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Period</Label>
                <Select
                  value={form.period}
                  onValueChange={(v: BudgetPeriod) => setForm((f) => ({ ...f, period: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="periodStart">Start Date</Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={form.periodStart}
                  onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="periodEnd">End Date</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={form.periodEnd}
                  onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Optional context..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop tracking spending against{" "}
              <span className="font-medium text-foreground">
                {deleteTarget && categoryLabels[deleteTarget.category]}
              </span>{" "}
              for this period. The underlying expenses are not affected.
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
    </div>
  );
}