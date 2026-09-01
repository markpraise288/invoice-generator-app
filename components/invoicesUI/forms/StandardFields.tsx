"use client";

import { InvoiceItem, Invoice } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { Customer } from "@/types/Customer"
interface StandardFieldsProps {
  invoice: Invoice;
  customers: Customer[];
  handleSelectCustomer: (id: string) => void;
  handleCustomerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleItemChange: <K extends keyof InvoiceItem>(
    index: number,
    field: K,
    value: InvoiceItem[K]
  ) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  handleDiscount: (value: string) => void;
  handleTax: (value: string) => void;
}

export default function StandardFields({
  invoice,
  customers,
  handleSelectCustomer,
  handleCustomerChange,
  handleItemChange,
  addItem,
  removeItem,
  handleDiscount,
  handleTax,
}: StandardFieldsProps) {
  return (
    <div className="space-y-6 mb-6">

      {/* 🔹 CLIENT SELECT */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold mb-3">Select Customer</h3>

        <select
          onChange={(e) => handleSelectCustomer(e.target.value)}
          className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600"
        >
          <option value="">-- Select Customer --</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 CLIENT INFO */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-2">
        <h3 className="font-semibold">Customer Info</h3>

        <input
          name="name"
          value={invoice.customerSnapshot.name}
          onChange={handleCustomerChange}
          placeholder="Customer Name"
          className="input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        <input
          name="email"
          value={invoice.customerSnapshot.email}
          onChange={handleCustomerChange}
          placeholder="Email"
          className="input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        <input
          name="phone"
          value={invoice.customerSnapshot.phone}
          onChange={handleCustomerChange}
          placeholder="Phone"
          className="input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        <input
          name="address"
          value={invoice.customerSnapshot.address}
          onChange={handleCustomerChange}
          placeholder="Address"
          className="input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
      </div>

      {/* 🔹 ITEMS */}
      {(invoice.template !== "bold" && invoice.template !== "minimal") && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold mb-3">Items</h3>

          <div className="space-y-4">
            {invoice.items.map((item: InvoiceItem, i: number) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  placeholder="Description"
                  className="col-span-5 input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={item.description}
                  onChange={(e) => handleItemChange(i, "description", e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Qty"
                  className="col-span-2 input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={item.quantity || "Qty"}
                  onChange={(e) => handleItemChange(i, "quantity", Number(e.target.value))}
                />

                <input
                  type="number"
                  placeholder="Price"
                  className="col-span-3 input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={item.price || "Price"}
                  onChange={(e) => handleItemChange(i, "price", Number(e.target.value))}
                />

                <button
                  onClick={() => removeItem(i)}
                  className="col-span-2 flex justify-center items-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg p-2 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={addItem} className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Plus size={16} />
            Add Item
          </button>
        </div>
      )}
      
      {/* 🔹 FINANCIAL */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Discount %"
          value={invoice.discount.value || ""}
          onChange={(e) => handleDiscount(e.target.value)}
          className="input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />

        <input
          type="number"
          placeholder="Tax %"
          value={invoice.tax.value || ""}
          onChange={(e) => handleTax(e.target.value)}
          className="input dark:bg-slate-900 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          aria-controls="none"
        />
      </div>
    </div>
  );
}