"use client";

import React from "react";
import { Invoice, User } from "@/types";
import { InvoiceItem } from "@/types/invoice";

const formatCurrency = (amount: number, currency: "USD" | "MWK") => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-MW", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

interface Props {
  invoice: Invoice;
  user: User;
}

const BoldCorporateTemplate: React.FC<Props> = ({ invoice, user }) => {
  // 🔥 SUBTOTAL
  const subtotal = (invoice.items || []).reduce(
    (acc: number, item: InvoiceItem) => acc + item.quantity * item.price,
    0
  );

  // 🔥 DISCOUNT (safe)
  const discountAmount =
    invoice.discount?.type === "percentage"
      ? subtotal * (invoice.discount.value / 100)
      : invoice.discount?.value || 0;

  const taxableAmount = subtotal - discountAmount;

  // 🔥 TAX
  const taxAmount =
    invoice.tax?.type === "percentage"
      ? taxableAmount * (invoice.tax.value / 100)
      : invoice.tax?.value || 0;

  // 🔥 SHIPPING (NEW)
  const shippingCost = invoice.shipping?.cost || 0;

  // 🔥 TOTAL
  const total = taxableAmount + taxAmount + shippingCost;

  return (
    <div className="max-w-4xl text-gray-800 mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none">

      {/* 🔥 HEADER */}
      <div className="bg-black text-white px-10 py-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">INVOICE</h1>
          <p className="text-sm opacity-80 mt-1">
            #{invoice.invoiceNumber || "00001"}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold">{user.companyName || user.name}</p>
          <p className="text-sm opacity-80">{user.email}</p>
          <p className="text-sm opacity-80">{user.phone}</p>
        </div>
      </div>

      {/* 🔥 CLIENT + META */}
      <div className="grid grid-cols-2 gap-8 px-10 py-8 border-b">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Bill To
          </h3>
          <p className="font-semibold">{invoice.customerSnapshot.name}</p>
          <p className="text-sm text-gray-500">
            {invoice.customerSnapshot.email}
          </p>
          <p className="text-sm text-gray-500">
            {invoice.customerSnapshot.address}
          </p>
        </div>

        <div className="text-right space-y-1 text-sm">
          <p>
            <span className="text-gray-500">Issue Date:</span>{" "}
            {invoice.issueDate || "-"}
          </p>
          <p>
            <span className="text-gray-500">Due Date:</span>{" "}
            {invoice.dueDate}
          </p>
          <p>
            <span className="text-gray-500">Status:</span>{" "}
            <span className="font-medium capitalize">
              {invoice.status}
            </span>
          </p>
        </div>
      </div>

      {/* 🔥 TABLE */}
      <div className="px-10 py-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-xs uppercase tracking-wider text-gray-600">
              <th className="py-3 px-3">Item</th>
              <th className="py-3 px-3 text-center">Qty</th>
              <th className="py-3 px-3 text-center">Price</th>
              <th className="py-3 px-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {(invoice.items || []).map((item, idx) => (
              <tr
                key={idx}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="py-3 px-3 font-medium">
                  {item.description}
                </td>
                <td className="py-3 px-3 text-center">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-center">
                  {formatCurrency(item.price, invoice.currency)}
                </td>
                <td className="py-3 px-3 text-right font-semibold">
                  {formatCurrency(
                    item.price * item.quantity,
                    invoice.currency
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 TOTALS */}
      <div className="px-10 py-6 grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Notes
          </h3>
          <p className="text-sm text-gray-500">
            {invoice.notes || "Thank you for your business!"}
          </p>
        </div>

        <div className="space-y-2 text-sm">

          {/* Subtotal */}
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount, invoice.currency)}</span>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between">
            <span className="text-gray-500">
              Tax ({invoice.tax?.value || 0}%)
            </span>
            <span>{formatCurrency(taxAmount, invoice.currency)}</span>
          </div>

          {/* 🔥 SHIPPING (NEW UI) */}
          {shippingCost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">
                Shipping {invoice.shipping?.method && `(${invoice.shipping.method})`}
              </span>
              <span>{formatCurrency(shippingCost, invoice.currency)}</span>
            </div>
          )}

          {/* TOTAL */}
          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total, invoice.currency)}</span>
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
    </div>
  );
};

export default BoldCorporateTemplate;