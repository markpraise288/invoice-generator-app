"use client";

import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useCreateOrder, useCaptureOrder } from "@/hooks/useBilling";
import { toast } from "sonner";

interface CheckoutButtonProps {
  customer: string;
  invoice?: string | null;
  amount: number; // cents
  currency?: string;
  onSuccess?: () => void;
}

export function CheckoutButton({
  customer,
  invoice,
  amount,
  currency = "USD",
  onSuccess,
}: CheckoutButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrder = useCreateOrder();
  const captureOrder = useCaptureOrder();

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", label: "pay" }}
        disabled={isProcessing || amount <= 0}
        createOrder={async () => {
          try {
            const result = await createOrder.mutateAsync({
              customer,
              invoice,
              amount,
              currency,
            });
            return result.orderId;
          } catch (err) {
            toast.error("Failed to start checkout");
            throw err;
          }
        }}
        onApprove={async (data) => {
          setIsProcessing(true);
          try {
            await captureOrder.mutateAsync(data.orderID);
            toast.success("Payment completed successfully");
            onSuccess?.();
          } catch (err) {
            toast.error("Payment could not be captured");
          } finally {
            setIsProcessing(false);
          }
        }}
        onError={(err) => {
          console.error("PayPal Buttons error:", err);
          toast.error("Something went wrong with PayPal checkout");
        }}
        onCancel={() => {
          toast.info?.("Checkout cancelled") ?? toast("Checkout cancelled");
        }}
      />
    </div>
  );
}