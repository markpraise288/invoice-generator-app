import React from "react";
import { Invoice, User } from "@/types";
import { InvoiceItem } from "@/types/invoice";

const formatCurrency = (amount: number, currency: "USD" | "MWK") => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-MW", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

interface CompactInvoiceProps {
  invoice: Invoice;
  user: User;
}

const CompactInvoiceTemplate: React.FC<CompactInvoiceProps> = ({
  invoice,
  user,
}) => {
  const subtotal = (invoice.items || []).reduce(
    (acc: number, item: InvoiceItem) => acc + item.quantity * item.price,
    0,
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

  const Badge = ({ num }: { num: number }) => (
    <div className="w-7 h-7 bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm">
      {num}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-gray-800 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Invoice
          </h1>

          <div className="w-36 h-16 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 font-medium rounded-lg">
            Your Logo
          </div>
        </div>

        <div className="flex gap-4">
          <Badge num={1} />
          <div className="text-sm space-y-1 text-right">
            <h2 className="font-semibold text-lg text-gray-900">
              {user.companyName}
            </h2>
            <p className="text-gray-500 whitespace-pre-line">{user.address}</p>
            <p className="text-gray-500">{user.phone}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-0.5 bg-linear-to-r from-blue-600 to-indigo-600 mb-10 rounded-full" />

      {/* DETAILS */}
      <div className="flex justify-between mb-14">
        <div className="flex gap-4">
          <Badge num={2} />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Invoice Details
            </h3>

            <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <span className="text-gray-500">Invoice #</span>
              <span className="font-medium">
                {invoice.invoiceNumber || "0000"}
              </span>

              <span className="text-gray-500">Issue Date</span>
              <span className="font-medium">
                {invoice.issueDate || "MM/DD/YYYY"}
              </span>

              <span className="text-gray-500">Due Date</span>
              <span className="font-medium">
                {invoice.dueDate || "MM/DD/YYYY"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right max-w-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Bill To
          </h3>
          <p className="font-semibold text-gray-900">
            {invoice.clientSnapshot.name}
          </p>
          <p className="text-sm text-gray-500 whitespace-pre-line">
            {invoice.clientSnapshot.address}
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-5">
          <Badge num={3} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Items / Services
          </h3>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-center">Rate</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((item: InvoiceItem, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="py-4 px-4 font-medium">{item.description}</td>
                  <td className="text-center text-gray-500">{item.quantity}</td>
                  <td className="text-center text-gray-500 font-mono">
                    {formatCurrency(item.price, invoice.currency)}
                  </td>
                  <td className="text-right px-4 font-semibold font-mono">
                    {formatCurrency(
                      item.quantity * item.price,
                      invoice.currency,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="w-75 bg-gray-50 rounded-xl p-6 shadow-sm ml-auto mb-10">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>

          <div className="flex justify-between text-gray-500">
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount, invoice.currency)}</span>
          </div>

          <div className="flex justify-between text-gray-500">
            <span>Tax</span>
            <span>{formatCurrency(taxAmount, invoice.currency)}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t flex justify-between items-center">
          <span className="text-xs uppercase font-semibold tracking-wider">
            Total
          </span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(total, invoice.currency)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 text-sm mb-10 mx-3">
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

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-6 border-t text-sm text-gray-400">
        <p>Generated by {user.companyName}</p>
        <p className="italic">Thank you for your business</p>
      </div>
    </div>
  );
};

export default CompactInvoiceTemplate;
