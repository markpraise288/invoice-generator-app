import React from "react";
import { Invoice, User } from "@/types";

const formatCurrency = (amount: number, currency: "USD" | "MWK") => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-MW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface SubscriptionInvoiceProps {
  invoice: Invoice;
  user: User;
}

const SubscriptionInvoiceTemplate: React.FC<SubscriptionInvoiceProps> = ({
  invoice,
  user,
}) => {
  const sub = invoice.subscriptionDetails;

  const price = invoice.items?.[0]?.price || 0;

  const discount =
    invoice.discount?.type === "percentage"
      ? price * (invoice.discount.value / 100)
      : invoice.discount?.value || 0;

  const taxable = price - discount;

  const tax =
    invoice.tax?.type === "percentage"
      ? taxable * (invoice.tax.value / 100)
      : invoice.tax?.value || 0;

  const total = taxable + tax;

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-gray-900">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Subscription Invoice
          </h1>
          <p className="text-gray-400 mt-1">
            #{invoice.invoiceNumber || "00001"}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-lg">
            {user.companyName || user.name}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">{user.phone}</p>
        </div>
      </div>

      {/* CLIENT */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Bill To</p>
          <p className="font-semibold text-gray-900">
            {invoice.clientSnapshot.name}
          </p>
          <p className="text-sm text-gray-500">
            {invoice.clientSnapshot.email}
          </p>
        </div>

        <div className="text-right text-sm space-y-1">
          <p>
            <span className="text-gray-400">Issue:</span>{" "}
            {formatDate(invoice.issueDate)}
          </p>
          <p>
            <span className="text-gray-400">Next Billing:</span>{" "}
            {formatDate(sub?.nextBillingDate)}
          </p>
        </div>
      </div>

      {/* 🔥 PLAN CARD (MAIN UI) */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-10 shadow-lg">
        <div className="flex justify-between items-center">

          <div>
            <h2 className="text-xl font-semibold">
              {sub?.planName || "Subscription Plan"}
            </h2>
            <p className="text-sm opacity-80">
              {sub?.billingCycle === "yearly"
                ? "Billed yearly"
                : "Billed monthly"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold">
              {formatCurrency(price, invoice.currency)}
            </p>
            <p className="text-xs opacity-80">
              per {sub?.billingCycle || "month"}
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 SUBSCRIPTION DETAILS */}
      <div className="grid grid-cols-2 gap-6 mb-10 text-sm">
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">Start Date</p>
          <p className="font-medium">{formatDate(sub?.startDate)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">End Date</p>
          <p className="font-medium">{formatDate(sub?.endDate)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">Billing Cycle</p>
          <p className="font-medium capitalize">
            {sub?.billingCycle || "-"}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">Status</p>
          <p className="font-medium capitalize">
            {invoice.status}
          </p>
        </div>
      </div>

      {/* 🔥 SUMMARY */}
      <div className="flex justify-end mb-10">
        <div className="w-80 bg-gray-50 p-6 rounded-xl space-y-3">
          <div className="flex justify-between">
            <span>Plan Price</span>
            <span>{formatCurrency(price, invoice.currency)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>-{formatCurrency(discount, invoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(tax, invoice.currency)}</span>
          </div>

          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 text-sm mb-10">
        {/* 🔥 PAYMENT METHODS */}
        <div>
          <p className="font-semibold mb-3">Payment Methods</p>

          <div className="space-y-2 text-gray-600">
            {invoice.paymentMethods && invoice.paymentMethods.length > 0 ? (
              invoice.paymentMethods.map((pm: any, index: number) => (
                <div key={index} className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {pm.method || "Method"}
                  </span>
                  {pm.details && (
                    <span className="text-xs text-gray-500">{pm.details}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No payment methods provided</p>
            )}
          </div>
        </div>

        {/* 🔥 TERMS */}
        <div className="text-right">
          <p className="font-semibold mb-2">Terms</p>
          <p className="text-gray-500 whitespace-pre-line">
            {invoice.terms || "Payment due within 7 days."}
          </p>
        </div>
      </div>
      {/* NOTES */}
      {invoice.notes && (
        <div className="border-t pt-6 text-sm text-gray-500">
          {invoice.notes}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between text-xs text-gray-400 border-t pt-4">
        <span>{user.companyName}</span>
        <span>{user.email}</span>
      </div>
    </div>
  );
};

export default SubscriptionInvoiceTemplate;