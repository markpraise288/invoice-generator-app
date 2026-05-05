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
  const paymentMethods = invoice.paymentMethods || [
    { method: "", details: "" },
  ];

  // ===== ADD PAYMENT METHOD =====
  const addPaymentMethod = () => {
    setInvoice((prev: any) => ({
      ...prev,
      paymentMethods: [
        ...(prev.paymentMethods || []),
        { method: "", details: "" },
      ],
    }));
  };

  // ===== REMOVE PAYMENT METHOD =====
  const removePaymentMethod = (index: number) => {
    setInvoice((prev: any) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  // ===== UPDATE PAYMENT METHOD =====
  const updatePaymentMethod = (
    index: number,
    field: "method" | "details",
    value: string
  ) => {
        setInvoice((prev: any) => ({
      ...prev,
      paymentMethods: (prev.paymentMethods || []).map(
        (pm: any, i: number) =>
          i === index ? { ...pm, [field]: value } : pm
      ),
    }));
  };

  return (
    <div className="space-y-6">

      {/* 🔥 PAYMENT METHODS */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Payment Methods</h3>
          <button
            onClick={addPaymentMethod}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Plus size={16} />
            Add Method
          </button>
        </div>

        {paymentMethods.map((pm: any, index: number) => (
          <div
            key={index}
            className="border rounded-lg p-3 space-y-2 relative"
          >
            {/* REMOVE BUTTON */}
            {paymentMethods.length > 1 && (
              <button
                onClick={() => removePaymentMethod(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* METHOD TYPE */}
            <input
              type="text"
              placeholder="Payment Method (e.g. Bank, PayPal, Airtel Money)"
              value={pm.method}
              onChange={(e) =>
                updatePaymentMethod(index, "method", e.target.value)
              }
              className="w-full border p-2 rounded-lg text-sm"
            />

            {/* DETAILS */}
            <input
              type="text"
              placeholder="Details (Account number, email, phone...)"
              value={pm.details}
              onChange={(e) =>
                updatePaymentMethod(index, "details", e.target.value)
              }
              className="w-full border p-2 rounded-lg text-sm"
            />
          </div>
        ))}
      </div>

      {/* 🔥 TERMS */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow space-y-2">
        <h3 className="font-bold text-lg">Terms & Conditions</h3>

        <textarea
          placeholder="e.g. Payment due within 7 days. Late fee applies after due date..."
          value={invoice.terms || ""}
          onChange={(e) =>
            setInvoice((prev: any) => ({
              ...prev,
              terms: e.target.value,
            }))
          }
          className="w-full border p-3 rounded-lg text-sm min-h-25"
        />
      </div>

      {/* 🔥 NOTES */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow space-y-2">
        <h3 className="font-bold text-lg">Notes</h3>

        <textarea
          placeholder="Add a personal message to your client..."
          value={invoice.notes || ""}
          onChange={(e) =>
            setInvoice((prev: any) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
          className="w-full border p-3 rounded-lg text-sm min-h-25"
        />
      </div>
    </div>
  );
}