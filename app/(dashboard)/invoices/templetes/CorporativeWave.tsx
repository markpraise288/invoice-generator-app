"use client";

import { Invoice, User } from "@/types";

interface Props {
  invoice: Invoice;
  user: User;
}

export default function CorporateWave({ invoice, user }: Props) {
  const subtotal = invoice.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const discount =
    invoice.discount.type === "percentage"
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value;

  const tax =
    invoice.tax.type === "percentage"
      ? ((subtotal - discount) * invoice.tax.value) / 100
      : invoice.tax.value;

  const total = subtotal - discount + tax;

  return (
    <div className="bg-white w-full max-w-4xl mx-auto shadow-xl rounded-lg overflow-hidden text-sm">

      {/* 🔷 HEADER */}
      <div className="relative bg-linear-to-r from-blue-700 to-slate-800 text-white p-8">
        <h1 className="text-4xl font-bold tracking-wide">INVOICE</h1>

        {/* 🔥 USER (BUSINESS INFO) */}
        <div className="absolute right-8 top-8 text-right">
          <p className="text-lg font-semibold">
            {user.companyName || user.name}
          </p>
          <p className="text-xs opacity-80">
            {user.email}
          </p>
        </div>
      </div>

      {/* 🔹 CLIENT + META */}
      <div className="grid grid-cols-2 gap-6 p-8">

        {/* CLIENT */}
        <div>
          <p className="font-semibold mb-2 text-gray-700">Invoice To:</p>
          <p className="font-medium text-gray-900">
            {invoice.clientSnapshot.name}
          </p>
          <p className="text-gray-500">{invoice.clientSnapshot.email}</p>
          <p className="text-gray-500">{invoice.clientSnapshot.phone}</p>
          <p className="text-gray-500">{invoice.clientSnapshot.address}</p>
        </div>

        {/* META */}
        <div className="text-right text-gray-700">
          <p><span className="font-medium">Invoice No:</span> {invoice.invoiceNumber || "-"}</p>
          <p><span className="font-medium">Issue Date:</span> {invoice.issueDate || "-"}</p>
          <p><span className="font-medium">Due Date:</span> {invoice.dueDate}</p>
        </div>
      </div>

      {/* 🔹 TABLE */}
      <div className="px-8">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-2 text-left">SL</th>
              <th className="p-2 text-left">Item Description</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Total</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b text-gray-700">
                <td className="p-2">{String(i + 1).padStart(2, "0")}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2">
                  {invoice.currency} {item.price}
                </td>
                <td className="p-2">{item.quantity || 1}</td>
                <td className="p-2">
                  {invoice.currency} {item.quantity * item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 FOOT SECTION */}
      <div className="grid grid-cols-2 gap-6 p-8">

        {/* 🔥 PAYMENT + USER DETAILS */}
        <div>
          <p className="font-semibold mb-2">Payment Info</p>
          <p>Account Name: {user.companyName || user.name}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
          <p>Address: {user.address}</p>
        </div>

        {/* 🔥 TOTALS */}
        <div className="text-right space-y-1 text-gray-700">
          <p>Sub Total: {invoice.currency} {subtotal.toFixed(2)}</p>
          <p>Discount: -{invoice.currency} {discount.toFixed(2)}</p>
          <p>Tax: {invoice.currency} {tax.toFixed(2)}</p>

          <div className="bg-slate-800 text-white px-5 py-2 mt-2 inline-block rounded-lg font-semibold">
            Total: {invoice.currency} {total.toFixed(2)}
          </div>

          {/* 🔥 SIGNATURE */}
          <div className="mt-8 text-gray-500">
            <p className="italic">{user.name}</p>
            <p className="text-xs">Authorized Signature</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 text-sm mb-10 mx-10 text-black">
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
        <div className="border-t pt-6 text-sm text-gray-500 m-10">
          {invoice.notes}
        </div>
      )}

      {/* 🔷 FOOTER */}
      <div className="bg-linear-to-r from-slate-800 to-blue-700 text-white p-6 text-sm">
        <p className="font-semibold">Get in Touch</p>
        <p>{user.phone}</p>
        <p>{user.address}</p>
      </div>
    </div>
  );
}