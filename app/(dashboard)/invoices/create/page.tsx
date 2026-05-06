"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { Client, InvoiceItem, User, Invoice } from "@/types";

import InvoiceRenderer from "@/components/invoicesUI/InvoiceRenderer";
import TemplateSelector from "@/components/invoicesUI/TemplateSelector";

import StandardFields from "@/components/invoicesUI/forms/StandardFields";
import SubscriptionFields from "@/components/invoicesUI/forms/SubscriptionFields";
import ServiceFields from "@/components/invoicesUI/forms/ServiceFields";
import PaymentAndNotesFields from "@/components/invoicesUI/forms/PaymentAndNotesFields";

// ✅ Currency Formatter
const formatCurrency = (amount: number, currency: "USD" | "MWK") => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-MW", {
    style: "currency",
    currency,
  }).format(amount);
};

export default function CreateInvoicePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [user, setUser] = useState<User>({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // ✅ INIT (Fix hydration)
  useEffect(() => {
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 30);

    setInvoice({
      type: "standard",
      template: "modern",
      status: "draft",
      currency: "USD",

      invoiceNumber: `INV-${Date.now()}`, // 🔥 simple smart ID

      issueDate: today.toISOString(),
      dueDate: due.toISOString(),

      clientSnapshot: {
        name: "",
        email: "",
        phone: "",
        address: "",
      },

      items: [{ description: "", quantity: 1, price: 0 }],

      shipping: {
        cost: 0,
        method: '',
        address: ''
      },

      discount: { type: "percentage", value: 0 },
      tax: { type: "percentage", value: 0 },

      notes: "",
      terms: "",

      serviceDetails: {
        totalHours: 0,
        hourlyRate: 0,
        projectName: ''
      },

      subscriptionDetails: {
        planName: "",
        billingCycle: "monthly",
        startDate: today.toISOString(),
      },
    });

    setMounted(true);
  }, []);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, userRes] = await Promise.all([
          apiFetch("/clients", { cache: "no-store" }),
          apiFetch("/users"),
        ]);

        setClients(clientsRes.data);
        setUser(userRes.data);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };

    fetchData();
  }, []);

  // ===== CLIENT =====
  const handleSelectClient = (clientId: string) => {
    const selected = clients.find((c) => c._id === clientId);
    if (!selected) return;

    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            clientSnapshot: {
              name: selected.name,
              email: selected.email,
              phone: selected.phone,
              address: selected.address,
            },
          }
        : prev
    );
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            clientSnapshot: {
              ...prev.clientSnapshot,
              [name]: value,
            },
          }
        : prev
    );
  };

  // ===== ITEMS =====
  const handleItemChange = <K extends keyof InvoiceItem>(
    index: number,
    field: K,
    value: InvoiceItem[K]
  ) => {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
            ),
          }
        : prev
    );
  };

  const addItem = () => {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            items: [...prev.items, { description: "", quantity: 1, price: 0 }],
          }
        : prev
    );
  };

  const removeItem = (index: number) => {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
          }
        : prev
    );
  };

  // ===== DISCOUNT & TAX =====
  const handleDiscount = (value: string) => {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            discount: { type: "percentage", value: Number(value) },
          }
        : prev
    );
  };

  const handleTax = (value: string) => {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            tax: { type: "percentage", value: Number(value) },
          }
        : prev
    );
  };

  // ===== TOTALS =====
  const totals = useMemo(() => {
    if (!invoice) return { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 };

    const subtotal = invoice.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    const discount =
      invoice.discount.type === "percentage"
        ? subtotal * (invoice.discount.value / 100)
        : invoice.discount.value;

    const afterDiscount = subtotal - discount;

    const tax =
      invoice.tax.type === "percentage"
        ? afterDiscount * (invoice.tax.value / 100)
        : invoice.tax.value;

    const shipping = invoice.shipping?.cost || 0;

    const total = afterDiscount + tax + shipping;

    return { subtotal, discount, tax, shipping, total };
  }, [invoice]);

  if (!mounted || !invoice) {
    return <div className="p-6 text-gray-500">Loading invoice builder...</div>;
  }

  // ===== CREATE =====
  const handleCreate = async () => {
  try {
    setLoading(true);

    const send = confirm("Send invoice immediately?");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/invoices?send=${send}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...invoice,
          total: totals.total,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to create invoice");
      return;
    }

    // 🔥 IMPORTANT: handle PDF response
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // 🔥 Extract filename from header (optional but clean)
    const contentDisposition = res.headers.get("Content-Disposition");
    let fileName = "invoice.pdf";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) fileName = match[1];
    }

    // 🔥 Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    // ✅ AFTER download → redirect
    setTimeout(() => {
      router.push("/invoices");
    }, 500);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex gap-6 p-6 w-full bg-gray-50 dark:bg-slate-900">

      {/* LEFT */}
      <div className="w-[35%] space-y-6 overflow-y-auto h-screen pr-2">

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-xl w-full font-semibold shadow"
        >
          {loading ? "Creating..." : "Create Invoice"}
        </button>

        {/* SETUP */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow space-y-4">
          <h3 className="font-bold">Invoice Setup</h3>

          <select
            value={invoice.type}
            onChange={(e) =>
              setInvoice((prev) =>
                prev ? { ...prev, type: e.target.value as any } : prev
              )
            }
            className="w-full p-2 border rounded"
          >
            <option value="standard">Standard</option>
            <option value="subscription">Subscription</option>
            <option value="service">Service</option>
          </select>

          <TemplateSelector
            selected={invoice.template}
            onSelect={(template) =>
              setInvoice((prev) =>
                prev ? { ...prev, template: template as any } : prev
              )
            }
            isPro={true}
          />
        </div>

        {/* FORM */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          {invoice.type === "standard" && (
            <StandardFields
              invoice={invoice}
              clients={clients}
              handleClientChange={handleClientChange}
              handleSelectClient={handleSelectClient}
              addItem={addItem}
              removeItem={removeItem}
              handleItemChange={handleItemChange}
              handleDiscount={handleDiscount}
              handleTax={handleTax}
            />
          )}

          {invoice.type === "subscription" && (
            <SubscriptionFields invoice={invoice} setInvoice={setInvoice as any} />
          )}

          {invoice.type === "service" && (
            <ServiceFields invoice={invoice} setInvoice={setInvoice as any} />
          )}
        </div>

        {/* SHIPPING */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <h3 className="font-bold mb-2">Shipping</h3>
          <input
            type="number"
            value={invoice.shipping?.cost || 0}
            onChange={(e) =>
              setInvoice((prev) =>
                prev ? { ...prev, shipping: { ...prev.shipping, cost: Number(e.target.value) } } : prev
              )
            }
            className="w-full p-2 border rounded"
          />
        </div>

          {/* PAYMENT & NOTES */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
        <PaymentAndNotesFields invoice={invoice} setInvoice={setInvoice as any} />
      </div>

        {/* SUMMARY */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow text-sm space-y-2">
          <h3 className="font-bold">Summary</h3>
          <p>Subtotal: {formatCurrency(totals.subtotal, invoice.currency)}</p>
          <p>Discount: {formatCurrency(totals.discount, invoice.currency)}</p>
          <p>Tax: {formatCurrency(totals.tax, invoice.currency)}</p>
          <p>Shipping: {formatCurrency(totals.shipping, invoice.currency)}</p>
          <p className="font-bold text-lg">
            Total: {formatCurrency(totals.total, invoice.currency)}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-[65%] bg-white dark:bg-slate-950 p-6 rounded-xl shadow overflow-y-auto h-screen">
        <InvoiceRenderer
          invoice={{ ...invoice, total: totals.total }}
          user={user}
        />
      </div>
    </div>
  );
}