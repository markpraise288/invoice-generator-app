"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { InvoiceItem, User, Invoice } from "@/types";
import { Customer } from "@/types/Customer";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import { currencies } from "@/utils/currencies";
import InvoiceRenderer from "@/components/invoicesUI/InvoiceRenderer";
import TemplateSelector from "@/components/invoicesUI/TemplateSelector";

import StandardFields from "@/components/invoicesUI/forms/StandardFields";
import SubscriptionFields from "@/components/invoicesUI/forms/SubscriptionFields";
import ServiceFields from "@/components/invoicesUI/forms/ServiceFields";
import PaymentAndNotesFields from "@/components/invoicesUI/forms/PaymentAndNotesFields";

import { useCreateInvoice } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Loader2, Mail, X } from "lucide-react";

// ─── Error helpers ─────────────────────────────────────────────────────────────

interface CreateInvoiceError {
  title: string;
  message: string;
  fieldErrors?: string[];
}

// Parses the server's error response shape, falling back gracefully if the
// body isn't JSON (e.g. a proxy/network-level 502) or doesn't match the
// expected { message, errors } shape from the Joi validation middleware.
async function parseErrorResponse(res: Response): Promise<CreateInvoiceError> {
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // response wasn't JSON — fall through to status-based messaging
  }

  if (res.status === 422 && body?.errors) {
    return {
      title: "Some fields need attention",
      message: "Please fix the following before creating the invoice:",
      fieldErrors: Array.isArray(body.errors) ? body.errors : [body.errors],
    };
  }

  if (res.status === 401) {
    return {
      title: "Session expired",
      message: "Please sign in again and retry.",
    };
  }

  if (res.status >= 500) {
    return {
      title: "Server error",
      message:
        body?.message ??
        "Something went wrong generating this invoice. Please try again in a moment.",
    };
  }

  return {
    title: "Couldn't create invoice",
    message: body?.message ?? "An unexpected error occurred. Please try again.",
  };
}

// ─── Error Banner ──────────────────────────────────────────────────────────────

function ErrorBanner({
  error,
  onDismiss,
}: {
  error: CreateInvoiceError;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
      <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">{error.title}</p>
        <p className="text-xs text-destructive/80">{error.message}</p>
        {error.fieldErrors && error.fieldErrors.length > 0 && (
          <ul className="mt-1 list-disc list-inside space-y-0.5">
            {error.fieldErrors.map((msg, i) => (
              <li key={i} className="text-xs text-destructive/80">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-destructive/60 hover:text-destructive shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CreateInvoicePage() {
  const router = useRouter();
  const { mutateAsync: createInvoice, isPending: loading } = useCreateInvoice();

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<CreateInvoiceError | null>(null);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [user, setUser] = useState<User>({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const setInvoiceState: React.Dispatch<React.SetStateAction<Invoice>> = (
    action
  ) => {
    setInvoice((prev) => {
      if (!prev) return prev;
      return typeof action === "function"
        ? (action as (prevInvoice: Invoice) => Invoice)(prev)
        : action;
    });
  };

  // ── Init (fix hydration) ────────────────────────────────────────────────────

  useEffect(() => {
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 30);

    setInvoice({
      type: "standard",
      template: "modern",
      status: "draft",
      currency: "USD",
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: formatDate(today),
      dueDate: formatDate(due),
      customerSnapshot: {
        name: "",
        email: "",
        phone: "",
        address: "",
      },
      items: [{ description: "", quantity: 0, price: 0 }],
      shipping: {
        cost: 0,
        method: "",
        address: "",
      },
      discount: { type: "percentage", value: 0 },
      tax: { type: "percentage", value: 0 },
      notes: "",
      terms: "",
      serviceDetails: {
        totalHours: 0,
        hourlyRate: 0,
        projectName: "",
      },
      subscriptionDetails: {
        planName: "",
        planPrice: 0,
        billingCycle: "monthly",
        startDate: formatDate(today),
      },
      paymentMethods: [{ method: "", details: "" }],
    });

    setMounted(true);
  }, []);

  // ── Fetch data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, userRes] = await Promise.all([
          apiFetch("/customers", { cache: "no-store" }),
          apiFetch("/users"),
        ]);

        setCustomers(customersRes.data.customers ?? []);
        setUser(userRes.data);
      } catch (err) {
        console.error("Failed to load customers/user data:", err);
        setError({
          title: "Couldn't load required data",
          message:
            "We couldn't load your customer list or account info. Some fields may be unavailable — refresh the page to try again.",
        });
      }
    };

    fetchData();
  }, []);

  // ── Client ──────────────────────────────────────────────────────────────────

  const handleSelectCustomer = (customerId: string) => {
    const selected = customers.find((c) => c._id === customerId);
    if (!selected) return;

    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            customerSnapshot: {
              name: selected.name,
              email: selected.email,
              phone: selected.phone ?? "",
              address: `${selected.billingAddress?.street}, ${selected.billingAddress?.city}, ${selected.billingAddress?.state}, ${selected.billingAddress?.country},`,
            },
          }
        : prev
    );
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            customerSnapshot: {
              ...prev.customerSnapshot,
              [name]: value,
            },
          }
        : prev
    );
  };

  // ── Items ───────────────────────────────────────────────────────────────────

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
            items: [...prev.items, { description: "", quantity: 0, price: 0 }],
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

  // ── Discount & tax ──────────────────────────────────────────────────────────

  const handleDiscount = (value: string) => {
    setInvoice((prev) =>
      prev
        ? { ...prev, discount: { type: "percentage", value: Number(value) } }
        : prev
    );
  };

  const handleTax = (value: string) => {
    setInvoice((prev) =>
      prev
        ? { ...prev, tax: { type: "percentage", value: Number(value) } }
        : prev
    );
  };

  // ── Totals ──────────────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    if (!invoice) {
      return { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 };
    }

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

  // ── Client-side validation before the confirm dialog opens ─────────────────

  const validateBeforeCreate = (): CreateInvoiceError | null => {
    if (!invoice) return null;

    const fieldErrors: string[] = [];

    if (!invoice.customerSnapshot.name?.trim()) {
      fieldErrors.push("Customer name is required");
    }
    if (!invoice.customerSnapshot.email?.trim()) {
      fieldErrors.push("Customer email is required");
    }
    if (!invoice.dueDate) {
      fieldErrors.push("Due date is required");
    }

    const effectiveInvoiceType =
      invoice.template === "bold"
        ? "subscription"
        : invoice.template === "minimal"
        ? "service"
        : invoice.type;
    
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            type: effectiveInvoiceType,
          }
        : prev
    );
    // Items are only required for standard/freelance invoice types —
    // matches the backend's conditional validation
    if (["standard"].includes(effectiveInvoiceType)) {
      const hasValidItem = invoice.items.some(
        (item) => item.description?.trim() && item.quantity > 0
      );
      if (!hasValidItem) {
        fieldErrors.push(
          "Add at least one item with a description and quantity"
        );
      }
    }

    if (fieldErrors.length > 0) {
      return {
        title: "Before we create this invoice",
        message: "A few things need to be filled in:",
        fieldErrors,
      };
    }

    return null;
  };

  // ── Create flow ─────────────────────────────────────────────────────────────
  // Step 1: validate + open confirm dialog.
  // Step 2 (submitInvoice): fires once the user picks Yes/No.

  const handleCreateClick = () => {
    setError(null);
    const validationError = validateBeforeCreate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSendConfirmOpen(true);
  };

  const submitInvoice = async (send: boolean) => {
    setSendConfirmOpen(false);
    setError(null);

    if (!invoice) return;
    if(invoice.type !== "standard") {
      setInvoice((prev) => prev ? { ...prev, items: [{ description: "Subscription/Service", quantity: 1, price: invoice.subscriptionDetails?.planPrice || invoice.serviceDetails?.hourlyRate || 0 }] } : prev);
    }

    try {
      await createInvoice({
        data: { ...invoice, total: totals.total },
        send,
      });
      router.push("/invoices");
    } catch (err) {
      const response = (err as { response?: Response })?.response;
      if (response) {
        setError(await parseErrorResponse(response));
      } else {
        console.error("Invoice creation failed:", err);
        setError({
          title: "Network error",
          message:
            "Couldn't reach the server. Check your connection and try again.",
        });
      }
    }
  };

  if (!mounted || !invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Loading invoice builder...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-6 w-full bg-gray-50 dark:bg-slate-900">
      {/* LEFT */}
      <div className="w-[35%] space-y-6 overflow-y-auto h-screen pr-2">
        {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}

        <Button
          onClick={handleCreateClick}
          disabled={loading}
          className="w-full h-11 font-semibold gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Creating...
            </>
          ) : (
            "Create Invoice"
          )}
        </Button>

        {/* SETUP */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow space-y-4">
          <h3 className="font-bold">Invoice Setup</h3>

          <select
            value={invoice.currency}
            onChange={(e) =>
              setInvoiceState({
                ...invoice,
                currency: e.target.value as Invoice["currency"],
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:ring-blue-400"
          >
            {currencies.map((currency) => (
              <option
                key={currency.code}
                value={currency.code}
                className="bg-white text-black dark:bg-gray-800 dark:text-white"
              >
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>

          <div className="space-y-2">
            <label
              htmlFor="dueDate"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Due Date
            </label>

            <input
              id="dueDate"
              type="date"
              value={
                invoice.dueDate.toString() === "Invalid Date"
                  ? ""
                  : new Date(invoice.dueDate).toISOString().split("T")[0]
              }
              onChange={(e) =>
                setInvoiceState({
                  ...invoice,
                  dueDate: formatDate(e.target.value),
                })
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:ring-blue-400"
            />
          </div>

          <TemplateSelector
            selected={invoice.template}
            onSelect={(template) =>
              setInvoiceState((prev) =>
                prev ? { ...prev, template: template as any } : prev
              )
            }
            isPro={true}
          />
        </div>

        {/* FORM */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <StandardFields
            invoice={invoice}
            customers={customers}
            handleCustomerChange={handleCustomerChange}
            handleSelectCustomer={handleSelectCustomer}
            addItem={addItem}
            removeItem={removeItem}
            handleItemChange={handleItemChange}
            handleDiscount={handleDiscount}
            handleTax={handleTax}
          />

          {invoice.template === "bold" && (
            <SubscriptionFields
              invoice={invoice}
              setInvoice={setInvoiceState as any}
            />
          )}

          {invoice.template === "minimal" && (
            <ServiceFields invoice={invoice} setInvoice={setInvoiceState as any} />
          )}
        </div>

        {/* SHIPPING */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Details
          </h3>

          <div className="space-y-4">
            {/* Shipping Cost */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Shipping Cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.shipping?.cost ?? 0}
                onChange={(e) =>
                  setInvoiceState((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...(prev.shipping ?? {
                              cost: 0,
                              method: "",
                              address: "",
                            }),
                            cost: Number(e.target.value),
                          },
                        }
                      : prev
                  )
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Shipping Method */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Shipping Method
              </label>
              <select
                value={invoice.shipping?.method ?? ""}
                onChange={(e) =>
                  setInvoiceState((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...(prev.shipping ?? {
                              cost: 0,
                              method: "",
                              address: "",
                            }),
                            method: e.target.value,
                          },
                        }
                      : prev
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Select Shipping Method</option>
                <option value="DHL">DHL</option>
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="Courier">Courier</option>
                <option value="Bus Cargo">Bus Cargo</option>
                <option value="Pickup">Pickup</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Shipping Address
              </label>
              <textarea
                value={invoice.shipping?.address ?? ""}
                onChange={(e) =>
                  setInvoiceState((prev) =>
                    prev
                      ? {
                          ...prev,
                          shipping: {
                            ...(prev.shipping ?? {
                              cost: 0,
                              method: "",
                              address: "",
                            }),
                            address: e.target.value,
                          },
                        }
                      : prev
                  )
                }
                rows={3}
                placeholder="Enter shipping destination address..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* PAYMENT & NOTES */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <PaymentAndNotesFields
            invoice={invoice}
            setInvoice={setInvoiceState as any}
          />
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
        <InvoiceRenderer invoice={{ ...invoice, total: totals.total }} user={user} />
      </div>

      {/* SEND CONFIRMATION */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              Send this invoice now?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to create invoice{" "}
              <span className="font-medium text-foreground">
                {invoice.invoiceNumber}
              </span>{" "}
              for{" "}
              <span className="font-medium text-foreground">
                {invoice.customerSnapshot.name || "this customer"}
              </span>
              . Choose whether to email it to them right away, or just save it
              as a draft you can send later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} onClick={() => submitInvoice(false)}>
              No, just save it
            </AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={() => submitInvoice(true)}>
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin mr-1.5" />
                  Sending...
                </>
              ) : (
                "Yes, send now"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}