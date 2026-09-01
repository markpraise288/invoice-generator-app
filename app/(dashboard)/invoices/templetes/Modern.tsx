import React from "react";
import { Invoice, User } from "@/types";

const formatCurrency = (amount: number, currency: "USD" | "MWK") => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-MW", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

interface ModernInvoiceProps {
  invoice: Invoice;
  user: User;
}

const ModernInvoiceTemplate: React.FC<ModernInvoiceProps> = ({ invoice, user }) => {
  const subtotal = (invoice.items || []).reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const discountAmount =
    invoice.discount.type === "percentage"
      ? subtotal * (invoice.discount.value / 100)
      : invoice.discount.value;

  const taxableAmount = subtotal - discountAmount;

  const taxAmount =
    invoice.tax.type === "percentage"
      ? taxableAmount * (invoice.tax.value / 100)
      : invoice.tax.value;

  const total = taxableAmount + taxAmount;

  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* 🔥 HEADER */}
      <div className="relative px-10 py-12 bg-linear-to-r from-[#0f766e] via-[#14b8a6] to-[#5eead4] text-white">
        
        {/* Soft overlay for depth */}
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative flex justify-between items-start">
          {/* LEFT */}
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight">
              Invoice
            </h1>
            <p className="mt-3 text-sm opacity-80">
              Due: {dueDate}
            </p>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <p className="text-xl font-bold">
              {user.companyName || user.name}
            </p>
            <p className="text-sm opacity-80">
              #{invoice.invoiceNumber || "0000"}
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 BODY */}
      <div className="p-10">

        {/* CLIENT + COMPANY */}
        <div className="grid grid-cols-2 gap-10 mb-12">
          <div>
            <p className="text-xs uppercase text-gray-400 mb-2">Bill To</p>
            <p className="font-semibold text-gray-900">
              {invoice.customerSnapshot.name}
            </p>
            <p className="text-sm text-gray-500">
              {invoice.customerSnapshot.email}
            </p>
            <p className="text-sm text-gray-500">
              {invoice.customerSnapshot.address}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase text-gray-400 mb-2">
              From
            </p>
            <p className="font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="text-sm text-gray-500">
              {user.email}
            </p>
            <p className="text-sm text-gray-500">
              {user.phone}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="border rounded-xl overflow-hidden mb-12">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {(invoice.items || []).map((item, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {formatCurrency(item.price, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end">
          <div className="w-80 space-y-3">

            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, invoice.currency)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount, invoice.currency)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount, invoice.currency)}</span>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total
              </span>
              <span className="text-2xl font-bold text-teal-600">
                {formatCurrency(total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 text-sm mb-10 mx-10">
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
        <div className="border-t pt-6 text-sm text-gray-500 mx-10">
          {invoice.notes}
        </div>
      )}

      {/* 🔥 FOOTER */}
      <div className="bg-linear-to-r from-[#5eead4] via-[#14b8a6] to-[#0f766e] text-white px-10 py-6 flex justify-between text-sm">
        <span>{user.companyName}</span>
        <span>{user.email}</span>
      </div>
    </div>
  );
};

export default ModernInvoiceTemplate;