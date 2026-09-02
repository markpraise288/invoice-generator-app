"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Lock } from "lucide-react";
import {
  useCreateExpense,
  useUpdateExpense,
  type Expense,
  type CreateExpensePayload,
  type ExpenseCategory,
  type RecurringInterval,
} from "@/hooks/useExpenses";
import { toast } from "sonner";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

const emptyForm: CreateExpensePayload = {
  description: "",
  category: "other",
  vendor: "",
  amount: 0,
  currency: "USD",
  isRecurring: false,
  recurringInterval: null,
  receiptUrl: "",
  notes: "",
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

export function ExpenseFormDialog({ open, onOpenChange, expense }: ExpenseFormDialogProps) {
  const isEditing = !!expense;
  const isLocked = expense?.status === "approved" || expense?.status === "paid";

  const [form, setForm] = useState<CreateExpensePayload>(emptyForm);
  const [amountInput, setAmountInput] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const isSubmitting = createExpense.isPending || updateExpense.isPending;

  useEffect(() => {
    if (expense) {
      setForm({
        description: expense.description,
        category: expense.category,
        vendor: expense.vendor || "",
        amount: expense.amount,
        currency: expense.currency,
        isRecurring: expense.isRecurring,
        recurringInterval: expense.recurringInterval || null,
        receiptUrl: expense.receiptUrl || "",
        notes: expense.notes || "",
      });
      setAmountInput(expense.amount ? (expense.amount / 100).toString() : "");
      setExpenseDate(expense.expenseDate ? expense.expenseDate.slice(0, 10) : "");
    } else {
      setForm(emptyForm);
      setAmountInput("");
      setExpenseDate("");
    }
  }, [expense, open]);

  const handleSubmit = async () => {
    if (isLocked) return;

    if (!form.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    const amount = Math.round(parseFloat(amountInput || "0") * 100);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (form.isRecurring && !form.recurringInterval) {
      toast.error("Please select how often this expense recurs");
      return;
    }

    const payload: CreateExpensePayload = {
      ...form,
      amount,
      expenseDate: expenseDate || undefined,
      recurringInterval: form.isRecurring ? form.recurringInterval : null,
    };

    try {
      if (isEditing && expense) {
        await updateExpense.mutateAsync({ id: expense._id, data: payload });
        toast.success("Expense updated");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Expense submitted");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || (isEditing ? "Failed to update expense" : "Failed to submit expense"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Expense" : "New Expense"}
            {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          </DialogTitle>
        </DialogHeader>

        {isLocked && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            This expense is {expense?.status} and can no longer be edited.
          </div>
        )}

        <fieldset disabled={isLocked} className="grid gap-4 py-2 disabled:opacity-60">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. AWS hosting, client dinner, office chairs..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v: ExpenseCategory) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger id="category">
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={form.vendor}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                placeholder="e.g. Amazon Web Services"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="receiptUrl">Receipt Link (optional)</Label>
            <Input
              id="receiptUrl"
              type="url"
              value={form.receiptUrl}
              onChange={(e) => setForm((f) => ({ ...f, receiptUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="isRecurring" className="text-sm">
                Recurring Expense
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark this as a recurring cost (doesn&apos;t auto-create future entries)
              </p>
            </div>
            <Switch
              id="isRecurring"
              checked={form.isRecurring}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, isRecurring: checked, recurringInterval: checked ? f.recurringInterval : null }))
              }
            />
          </div>

          {form.isRecurring && (
            <div className="grid gap-2">
              <Label htmlFor="recurringInterval">Repeats</Label>
              <Select
                value={form.recurringInterval || ""}
                onValueChange={(v: RecurringInterval) =>
                  setForm((f) => ({ ...f, recurringInterval: v }))
                }
              >
                <SelectTrigger id="recurringInterval">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Additional context..."
            />
          </div>
        </fieldset>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {isLocked ? "Close" : "Cancel"}
          </Button>
          {!isLocked && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Submit Expense"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}