"use client";

import { PayPalScriptProvider, type ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

interface PayPalProviderWrapperProps {
  children: React.ReactNode;
  mode?: "capture" | "subscription";
}

export function PayPalProviderWrapper({
  children,
  mode = "capture",
}: PayPalProviderWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        PayPal is not configured. Set{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          NEXT_PUBLIC_PAYPAL_CLIENT_ID
        </code>{" "}
        in your frontend environment variables.
      </div>
    );
  }

  const options: ReactPayPalScriptOptions = {
    clientId,
    currency: "USD",
    intent: mode === "subscription" ? "subscription" : "capture",
    vault: mode === "subscription",
  };

  return (
    <PayPalScriptProvider options={options}>{children}</PayPalScriptProvider>
  );
}