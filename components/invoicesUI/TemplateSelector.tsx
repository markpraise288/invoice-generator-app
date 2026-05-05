"use client";

import InvoiceRenderer from "@/components/invoicesUI/InvoiceRenderer";
import { Invoice, User } from "@/types";
import { tr } from "framer-motion/client";

interface Props {
  selected: Invoice["template"];
  onSelect: (template: Invoice["template"]) => void;
  isPro?: boolean;
}

// 🔥 Dummy preview data (clean + reusable)
const previewInvoice: Invoice = {
  template: "modern",
  type: "standard",
  status: "draft",
  currency: "USD",
  dueDate: new Date().toISOString(),

  clientSnapshot: {
    name: "John Client",
    email: "client@email.com",
    phone: "123456789",
    address: "New York, USA",
  },

  items: [
    { description: "Website Design", quantity: 1, price: 500 },
    { description: "Hosting", quantity: 1, price: 100 },
  ],

  discount: { type: "percentage", value: 0 },
  tax: { type: "percentage", value: 10 },
};

const previewUser: User = {
  name: "Your Name",
  companyName: "Your Company",
  email: "you@email.com",
  phone: "987654321",
  address: "Malawi",
};

const templates: { id: Invoice["template"]; pro: boolean }[] = [
  { id: "modern", pro: false },
  { id: "minimal", pro: false },
  { id: "classic", pro: false },
  { id: "corporateWave", pro: true },
  { id: "bold", pro: true },
  { id: "boldpro", pro: true },
  { id: "elegant", pro: true },
  { id: "compact", pro: true },
];

export default function TemplateSelector({
  selected,
  onSelect,
  isPro = false,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {templates.map((t) => {
        const locked = t.pro && !isPro;

        return (
          <div
            key={t.id}
            onClick={() => !locked && onSelect(t.id)}
            className={`relative cursor-pointer rounded-xl overflow-hidden border transition ${
              selected === t.id
                ? "border-blue-600 ring-2 ring-blue-500"
                : "border-gray-200 dark:border-slate-700"
            } ${locked ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"}`}
          >
            {/* 🔥 LIVE PREVIEW */}
            <div className="h-44 bg-gray-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              <div className="w-225 scale-[0.61] origin-bottom">
                <div className="rounded-lg overflow-hidden shadow-sm">
                  <InvoiceRenderer
                    invoice={{ ...previewInvoice, template: t.id as Invoice["template"] }}
                    user={previewUser}
                  />
                </div>
              </div>
            </div>

            {/* NAME */}
            <div className="p-2 text-xs font-semibold text-center capitalize bg-gray-50 dark:bg-slate-800">
              {t.id}
            </div>

            {/* SELECTED */}
            {selected === t.id && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                ✓
              </div>
            )}

            {/* PRO BADGE */}
            {t.pro && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded">
                PRO
              </div>
            )}

            {/* LOCK OVERLAY */}
            {locked && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                Upgrade
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
