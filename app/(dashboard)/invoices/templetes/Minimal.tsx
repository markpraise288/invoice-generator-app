import React from "react";
import { Invoice, User } from "@/types";

const formatCurrency = (amount: number, currency: "USD" | "MWK") => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-MW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

interface Props {
  invoice: Invoice;
  user: User;
}

const ServiceInvoiceTemplate: React.FC<Props> = ({ invoice, user }) => {
  const service = invoice.serviceDetails || {};

  const totalHours = service.totalHours || 0;
  const hourlyRate = service.hourlyRate || 0;

  // 💰 CORE CALCULATION
  const subtotal = totalHours * hourlyRate;

  const discountAmount =
    invoice.discount?.type === "percentage"
      ? subtotal * (invoice.discount.value / 100)
      : invoice.discount?.value || 0;

  const afterDiscount = subtotal - discountAmount;

  const taxAmount =
    invoice.tax?.type === "percentage"
      ? afterDiscount * (invoice.tax.value / 100)
      : invoice.tax?.value || 0;

  const shipping = Number(invoice.shipping?.cost || 0);

  const total = afterDiscount + taxAmount + shipping;

  // 💸 PAYMENTS
  const paid = invoice.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;

  const balance = total - paid;

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "-";

  const statusColor = {
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    draft: "bg-gray-200 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    partial: "bg-orange-100 text-orange-700",
    cancelled: "bg-gray-300 text-gray-800",
    viewed: "bg-purple-100 text-purple-700",
  }[invoice.status || "draft"];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-12 rounded-2xl shadow-xl text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-14">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Invoice</h1>
          <p className="text-gray-400 mt-2">
            #{invoice.invoiceNumber || "0000"}
          </p>
        </div>

        <div className="text-right space-y-1">
          <p className="font-bold text-lg">{user.companyName || user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">{user.phone}</p>

          <span
            className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${statusColor}`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      {/* CLIENT + DATES */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Bill To</p>
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

        <div className="text-right space-y-2">
          <p>
            <span className="text-gray-400 text-xs">Issue</span>
            <br />
            {formatDate(invoice.issueDate)}
          </p>
          <p>
            <span className="text-gray-400 text-xs">Due</span>
            <br />
            {formatDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      {/* 🔥 SERVICE SUMMARY (CORE UI) */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-10 grid grid-cols-3 gap-6 text-center shadow-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase">Project</p>
          <p className="font-semibold text-lg mt-1">
            {service.projectName || "Freelance Work"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Total Hours</p>
          <p className="font-semibold text-lg mt-1">{totalHours} hrs</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Hourly Rate</p>
          <p className="font-semibold text-lg mt-1">
            {formatCurrency(hourlyRate, invoice.currency)}
          </p>
        </div>
      </div>

      {/* 🔥 COST BREAKDOWN (NO TABLE) */}
      <div className="flex justify-end mb-12">
        <div className="w-96 bg-gray-50 p-6 rounded-2xl space-y-3 shadow-sm text-sm">
          <div className="flex justify-between">
            <span>Service Total</span>
            <span>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount, invoice.currency)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount, invoice.currency)}</span>
            </div>
          )}

          {shipping > 0 && (
            <div className="flex justify-between">
              <span>Expenses / Shipping</span>
              <span>{formatCurrency(shipping, invoice.currency)}</span>
            </div>
          )}

          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total, invoice.currency)}</span>
          </div>

          {paid > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Paid</span>
                <span>-{formatCurrency(paid, invoice.currency)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Balance Due</span>
                <span>{formatCurrency(balance, invoice.currency)}</span>
              </div>
            </>
          )}
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

      {/* SIGNATURE */}
      <div className="mt-12 flex justify-end">
        <div className="text-right">
          <p className="text-xs text-gray-400">Prepared by</p>
          <p className="font-semibold">{user.name}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceInvoiceTemplate;
