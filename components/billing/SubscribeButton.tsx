"use client";

import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useSubscribeCustomer } from "@/hooks/useBilling";
import { toast } from "sonner";
import type { BillingPlan } from "@/hooks/useBilling";

interface SubscribeButtonProps {
  customer: string;
  plan: BillingPlan;
  onSuccess?: () => void;
}

export function SubscribeButton({ customer, plan, onSuccess }: SubscribeButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const subscribeCustomer = useSubscribeCustomer();

  const canSubscribe = plan.isActive && !!plan.paypalPlanId;

  if (!canSubscribe) {
    return (
      <button
        disabled
        className="w-full rounded-md border border-dashed py-2.5 text-sm text-muted-foreground"
      >
        {plan.isActive ? "Plan not yet available" : "Plan inactive"}
      </button>
    );
  }

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", label: "subscribe" }}
        disabled={isProcessing}
        createSubscription={async () => {
          try {
            const result = await subscribeCustomer.mutateAsync({
              customer,
              plan: plan._id,
            });
            return result.subscription.paypalSubscriptionId as string;
          } catch (err) {
            toast.error("Failed to start subscription");
            throw err;
          }
        }}
        onApprove={async () => {
          setIsProcessing(true);
          try {
            toast.success("Subscription activated");
            onSuccess?.();
          } finally {
            setIsProcessing(false);
          }
        }}
        onError={(err) => {
          console.error("PayPal Buttons error:", err);
          toast.error("Something went wrong starting your subscription");
        }}
        onCancel={() => {
          toast("Subscription setup cancelled");
        }}
      />
    </div>
  );
}