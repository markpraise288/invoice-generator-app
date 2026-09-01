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

const ElegantInvoiceTemplate: React.FC<Props> = ({ invoice, user }) => {
  const subtotal = (invoice.items || []).reduce(
    (acc: number, item: InvoiceItem) => acc + item.quantity * item.price,
    0
  );

  const taxAmount =
    invoice.tax.type === "percentage"
      ? subtotal * (invoice.tax.value / 100)
      : invoice.tax.value;

  const total = subtotal + taxAmount;

  return (
    <div className="max-w-5xl mx-auto bg-white text-gray-800 rounded-2xl shadow-xl overflow-hidden print:shadow-none">

      {/* 🔥 HEADER */}
      <div className="px-10 py-8 flex justify-between items-center border-b">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            {user.companyName || user.name}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">{user.phone}</p>
        </div>

        <div className="text-right">
          <h2 className="text-4xl font-bold text-[#1491a1] tracking-tight">
            INVOICE
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            #{invoice.invoiceNumber || "0001"}
          </p>
        </div>
      </div>

      {/* 🔥 META INFO */}
      <div className="grid grid-cols-3 gap-6 px-10 py-6 border-b text-sm">
        <div>
          <p className="text-gray-500">Issue Date</p>
          <p className="font-medium">
            {invoice.issueDate || "-"}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Due Date</p>
          <p className="font-medium">
            {invoice.dueDate}
          </p>
        </div>

        <div className="text-right">
          <p className="text-gray-500">Status</p>
          <p className="font-medium capitalize">
            {invoice.status}
          </p>
        </div>
      </div>

      {/* 🔥 BILL TO */}
      <div className="px-10 py-6 border-b">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Bill To
        </h3>
        <p className="font-semibold">
          {invoice.customerSnapshot.name}
        </p>
        <p className="text-sm text-gray-500">
          {invoice.customerSnapshot.email}
        </p>
        <p className="text-sm text-gray-500">
          {invoice.customerSnapshot.address}
        </p>
      </div>

      {/* 🔥 TABLE */}
      <div className="px-10 py-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-xs uppercase text-gray-600 tracking-wide">
              <th className="py-3 px-3 text-left">Description</th>
              <th className="py-3 px-3 text-center">Qty</th>
              <th className="py-3 px-3 text-center">Rate</th>
              <th className="py-3 px-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {(invoice.items || []).map((item, i) => (
              <tr
                key={i}
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

      {/* 🔥 TOTAL + NOTES */}
      <div className="px-10 py-6 grid grid-cols-2 gap-6 border-t">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Tax ({invoice.tax.value}%)
            </span>
            <span>{formatCurrency(taxAmount, invoice.currency)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-bold text-[#1491a1]">
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
      {/* NOTES */}
      {invoice.notes && (
        <div className="border-t pt-6 text-sm text-gray-500 mx-10">
          {invoice.notes}
        </div>
      )}

      {/* 🔥 FOOTER */}
      <div className="px-10 py-6 bg-gray-50 text-sm text-gray-500 flex justify-between items-center">
        <p>{user.address}</p>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default ElegantInvoiceTemplate;