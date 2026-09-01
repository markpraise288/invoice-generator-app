"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRejectExpense, type Expense } from "@/hooks/useExpenses";
import { toast } from "sonner";

interface ApproveExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (cents: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
};

export function ApproveExpenseDialog({ expense, open, onOpenChange }: ApproveExpenseDialogProps) {
  const [reason, setReason] = useState("");
  const rejectExpense = useRejectExpense();

  const handleReject = async () => {
    if (!expense || !reason.trim()) {
      toast.error("A reason is required to reject an expense");
      return;
    }

    try {
      await rejectExpense.mutateAsync({ id: expense._id, rejectionReason: reason });
      toast.success("Expense rejected");
      setReason("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject expense");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Reject Expense</DialogTitle>
          <DialogDescription>
            {expense && (
              <>
                <span className="font-medium text-foreground">{expense.description}</span>
                {" — "}
                {formatCurrency(expense.amount, expense.currency)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          <Label htmlFor="rejectionReason">Reason (required)</Label>
          <Textarea
            id="rejectionReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Missing receipt, not a business expense, over budget..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700"
            disabled={rejectExpense.isPending || !reason.trim()}
          >
            {rejectExpense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}