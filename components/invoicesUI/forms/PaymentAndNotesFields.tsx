"use client";

import React from "react";
import { Invoice } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}

export default function PaymentAndNotesFields({
  invoice,
  setInvoice,
}: Props) {
  const paymentMethods = invoice.paymentMethods ?? [
    { method: "", details: "" },
  ];

  const updateInvoiceField = (
    field: "terms" | "notes",
    value: string
  ) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addPaymentMethod = () => {
    setInvoice((prev) => ({
      ...prev,
      paymentMethods: [
        ...(prev.paymentMethods ?? []),
        { method: "", details: "" },
      ],
    }));
  };

  const removePaymentMethod = (index: number) => {
    setInvoice((prev) => ({
      ...prev,
      paymentMethods:
        prev.paymentMethods?.filter((_, i) => i !== index) ?? [],
    }));
  };

  const updatePaymentMethod = (
    index: number,
    field: "method" | "details",
    value: string
  ) => {
    setInvoice((prev) => ({
      ...prev,
      paymentMethods:
        prev.paymentMethods?.map((paymentMethod, i) =>
          i === index
            ? { ...paymentMethod, [field]: value }
            : paymentMethod
        ) ?? [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* ================= PAYMENT METHODS ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Methods
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Add one or more payment options for your client.
            </p>
          </div>

          <button
            type="button"
            onClick={addPaymentMethod}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <Plus size={16} />
            Add Method
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((paymentMethod, index) => (
            <div
              key={index}
              className="relative rounded-xl border border-gray-200 p-4 dark:border-slate-700"
            >
              {paymentMethods.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePaymentMethod(index)}
                  className="absolute right-3 top-3 text-red-500 transition hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Payment Method (Bank Transfer, PayPal, Airtel Money...)"
                  value={paymentMethod.method}
                  onChange={(e) =>
                    updatePaymentMethod(
                      index,
                      "method",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />

                <input
                  type="text"
                  placeholder="Account Number, Email, Phone Number..."
                  value={paymentMethod.details}
                  onChange={(e) =>
                    updatePaymentMethod(
                      index,
                      "details",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TERMS ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          Terms & Conditions
        </h3>

        <p className="mb-3 text-sm text-gray-500 dark:text-slate-400">
          Specify payment terms and important conditions.
        </p>

        <textarea
          placeholder="Payment due within 7 days. Late fees may apply after the due date..."
          value={invoice.terms ?? ""}
          onChange={(e) =>
            updateInvoiceField("terms", e.target.value)
          }
          className="min-h-30 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
      </section>

      {/* ================= NOTES ================= */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          Notes
        </h3>

        <p className="mb-3 text-sm text-gray-500 dark:text-slate-400">
          Add a personal message or additional information for your client.
        </p>

        <textarea
          placeholder="Thank you for your business. We appreciate your support."
          value={invoice.notes ?? ""}
          onChange={(e) =>
            updateInvoiceField("notes", e.target.value)
          }
          className="min-h-30 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
      </section>
    </div>
  );
}