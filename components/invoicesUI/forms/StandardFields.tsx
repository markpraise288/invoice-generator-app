"use client";

import { Client, InvoiceItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface StandardFieldsProps {
  invoice: any;
  clients: Client[];
  handleSelectClient: (id: string) => void;
  handleClientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  clients,
  handleSelectClient,
  handleClientChange,
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
        <h3 className="font-semibold mb-3">Select Client</h3>

        <select
          onChange={(e) => handleSelectClient(e.target.value)}
          className="w-full p-2 rounded-lg border dark:bg-slate-700"
        >
          <option value="">-- Select Client --</option>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 CLIENT INFO */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-2">
        <h3 className="font-semibold">Client Info</h3>

        <input
          name="name"
          value={invoice.clientSnapshot.name}
          onChange={handleClientChange}
          placeholder="Client Name"
          className="input"
        />
        <input
          name="email"
          value={invoice.clientSnapshot.email}
          onChange={handleClientChange}
          placeholder="Email"
          className="input"
        />
        <input
          name="phone"
          value={invoice.clientSnapshot.phone}
          onChange={handleClientChange}
          placeholder="Phone"
          className="input"
        />
        <input
          name="address"
          value={invoice.clientSnapshot.address}
          onChange={handleClientChange}
          placeholder="Address"
          className="input"
        />
      </div>

      {/* 🔹 ITEMS */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold mb-3">Items</h3>

        <div className="space-y-4">
          {invoice.items.map((item: InvoiceItem, i: number) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 items-center"
            >
              <input
                placeholder="Description"
                className="col-span-5 input"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(i, "description", e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Qty"
                className="col-span-2 input"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(i, "quantity", Number(e.target.value))
                }
              />

              <input
                type="number"
                placeholder="Price"
                className="col-span-3 input"
                value={item.price}
                onChange={(e) =>
                  handleItemChange(i, "price", Number(e.target.value))
                }
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

        <button
          onClick={addItem}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* 🔹 FINANCIAL */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Discount %"
          value={invoice.discount.value || ""}
          onChange={(e) => handleDiscount(e.target.value)}
          className="input"
        />

        <input
          type="number"
          placeholder="Tax %"
          value={invoice.tax.value || ""}
          onChange={(e) => handleTax(e.target.value)}
          className="input"
          aria-controls="none"
        />
      </div>
    </div>
  );
}