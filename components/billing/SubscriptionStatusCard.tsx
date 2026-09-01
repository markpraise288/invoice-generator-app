"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCancelSubscription, type Subscription } from "@/hooks/useBilling";
import { toast } from "sonner";

interface SubscriptionStatusCardProps {
  subscription: Subscription;
}

const statusStyles: Record<Subscription["status"], string> = {
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  cancelled:
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  suspended:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  expired:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const formatPrice = (cents: number, currency: string) => {
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

export function SubscriptionStatusCard({ subscription }: SubscriptionStatusCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const cancelSubscription = useCancelSubscription();

  const handleCancel = async (immediately: boolean) => {
    try {
      await cancelSubscription.mutateAsync({
        id: subscription._id,
        immediately,
        reason: "Cancelled from dashboard",
      });
      toast.success(
        immediately ? "Subscription cancelled" : "Subscription will cancel at period end"
      );
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setConfirmOpen(false);
    }
  };

  const canCancel = subscription.status === "active" && !subscription.cancelAtPeriodEnd;

  return (
    <>
      <div className="rounded-xl border p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-foreground">{subscription.plan.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(subscription.plan.price, subscription.plan.currency)}/
              {subscription.plan.interval}
            </p>
          </div>
          <Badge variant="outline" className={cn("capitalize", statusStyles[subscription.status])}>
            {subscription.status}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          {subscription.cancelAtPeriodEnd
            ? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
            : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
        </div>

        {canCancel && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCancelImmediately(false);
                setConfirmOpen(true);
              }}
            >
              Cancel at period end
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              onClick={() => {
                setCancelImmediately(true);
                setConfirmOpen(true);
              }}
            >
              Cancel immediately
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cancelImmediately ? "Cancel subscription now?" : "Cancel at period end?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelImmediately
                ? "This immediately cancels the subscription with PayPal. The customer will lose access right away."
                : `The subscription will remain active until ${formatDate(
                    subscription.currentPeriodEnd
                  )}, then stop renewing.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancel(cancelImmediately)}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}