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
import { MoreHorizontal, CheckCircle2, XCircle, RotateCcw, CreditCard } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { useUpdatePaymentStatus, type Payment } from "@/hooks/usePayments";
import { toast } from "sonner";

interface PaymentsTableProps {
  payments: Payment[];
  isLoading: boolean;
}

const formatCurrency = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const methodLabels: Record<Payment["method"], string> = {
  paypal: "PayPal",
  card: "Card",
  bank_transfer: "Bank Transfer",
  manual: "Manual",
};

export function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const updateStatus = useUpdatePaymentStatus();

  const handleStatusChange = async (
    payment: Payment,
    status: "completed" | "failed" | "refunded"
  ) => {
    try {
      await updateStatus.mutateAsync({ id: payment._id, status });
      toast.success(`Payment marked as ${status}`);
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setRefundTarget(null);
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

  if (!payments.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No payments found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a manual payment or wait for PayPal transactions to come in.
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
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {payment.customer?.name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {payment.customer?.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {methodLabels[payment.method]}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(payment.paidAt || payment.createdAt)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.amount, payment.currency)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {payment.status !== "completed" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(payment, "completed")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark completed
                        </DropdownMenuItem>
                      )}
                      {payment.status !== "failed" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(payment, "failed")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Mark failed
                        </DropdownMenuItem>
                      )}
                      {payment.status === "completed" && (
                        <DropdownMenuItem
                          className="text-red-600 dark:text-red-400 focus:text-red-600"
                          onClick={() => setRefundTarget(payment)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Refund
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!refundTarget}
        onOpenChange={(open) => !open && setRefundTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund this payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the payment as refunded and subtracts{" "}
              <span className="font-medium text-foreground">
                {refundTarget &&
                  formatCurrency(refundTarget.amount, refundTarget.currency)}
              </span>{" "}
              from the customer's total revenue. This does not automatically
              process a refund with PayPal — do that separately if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => refundTarget && handleStatusChange(refundTarget, "refunded")}
              className="bg-red-600 hover:bg-red-700"
            >
              Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}