"use client";

import { useEffect, useState, useMemo } from "react";
import { Trash2, RotateCcw, Folder, FileText } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { Invoice, Client } from "@/types";
import { Sale, Expense } from "@/types/finance";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function TrashPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch deleted items
  const fetchTrash = async () => {
    try {
      const clientsRes = await apiFetch("/clients");
      const invoicesRes = await apiFetch("/invoices");
      const salesRes = await apiFetch("/sales");
      const expensesRes = await apiFetch("/expenses");

      setClients(
        clientsRes.data.filter((c: Client) => c.isDeleted)
      );

      setInvoices(
        invoicesRes.data.filter((i: Invoice) => i.isDeleted)
      );

      setSales(
        salesRes.data.data.filter((s: any) => s.isDeleted)
      );

      setExpenses(
        expensesRes.data.data.filter((e: any) => e.isDeleted)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // 🔹 Restore Client
  const restoreClient = async (id: string) => {
    await apiFetch(`/clients/${id}`, { method: "PATCH" });
    setClients((prev) => prev.filter((c) => c._id !== id));
  };

  // 🔹 Delete Client permanently
  const deleteClientPermanently = async (id: string) => {
    await apiFetch(`/clients/${id}/permanent`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c._id !== id));
  };

  // 🔹 Restore Invoice
  const restoreInvoice = async (id: string) => {
    await apiFetch(`/invoices/${id}`, { method: "PATCH" });
    setInvoices((prev) => prev.filter((i) => i._id !== id));
  };

  // 🔹 Delete Invoice permanently
  const deleteInvoicePermanently = async (id: string) => {
    await apiFetch(`/invoices/${id}/permanent`, { method: "DELETE" });
    setInvoices((prev) => prev.filter((i) => i._id !== id));
  };
  
  // restore Sale
  const restoreSale = async (id: string) => {
    await apiFetch(`/sales/${id}`, { method: "PATCH" });
    setSales((prev) => prev.filter((s) => s._id !== id));
  }

  // delete Sale permanently
  const deleteSalePermanently = async (id: string) => {
    await apiFetch(`/sales/${id}/permanent`, { method: "DELETE" });
    setSales((prev) => prev.filter((s) => s._id !== id));
  }

  // restore Expense
  const restoreExpense = async (id: string) => {
    await apiFetch(`/expenses/${id}`, { method: "PATCH" });
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  }

  // delete Expense permanently
  const deleteExpensePermanently = async (id: string) => {
    await apiFetch(`/expenses/${id}/permanent`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  }

  // 🔹 Grouping by type (optional future enhancement)
  const groupedClients = useMemo(() => clients, [clients]);
  const groupedInvoices = useMemo(() => invoices, [invoices]);
  const groupedSales = useMemo(() => sales.filter((sale) => sale.isDeleted), [sales]);
  const groupedExpenses = useMemo(() => expenses.filter((expense) => expense.isDeleted), [expenses]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <h1 className="text-3xl font-bold">Trash</h1>

      {/* CLIENTS */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Folder className="w-5 h-5" />
          Deleted Clients
        </h2>

        {groupedClients.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No deleted clients</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedClients.map((client) => (
              <div
                key={client._id}
                className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg border border-gray-100 dark:border-gray-700 transition"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {client.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {client.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 gap-1"
                    onClick={() => restoreClient(client._id!)}
                  >
                    <RotateCcw size={16} />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={() => deleteClientPermanently(client._id!)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* INVOICES */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <FileText className="w-5 h-5" />
          Deleted Invoices
        </h2>

        {groupedInvoices.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No deleted invoices</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg border border-gray-100 dark:border-gray-700 transition"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    #{invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {invoice.clientSnapshot.name}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 gap-1"
                    onClick={() => restoreInvoice(invoice._id!)}
                  >
                    <RotateCcw size={16} />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={() => deleteInvoicePermanently(invoice._id!)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SALES */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <FileText className="w-5 h-5" />
          Deleted Sales
        </h2>

        {groupedSales.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No deleted sales</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedSales.map((sales) => (
              <div
                key={sales._id}
                className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg border border-gray-100 dark:border-gray-700 transition"
              >
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {sales.client}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {sales.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 gap-1"
                    onClick={() => restoreSale(sales._id!)}
                  >
                    <RotateCcw size={16} />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={() => deleteSalePermanently(sales._id!)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EXPENSES */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <FileText className="w-5 h-5" />
          Deleted Expenses
        </h2>

        {groupedExpenses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No deleted expenses</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedExpenses.map((expense) => (
              <div
                key={expense._id}
                className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg border border-gray-100 dark:border-gray-700 transition"
              >
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {expense.title}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {expense.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 gap-1"
                    onClick={() => restoreExpense(expense._id!)}
                  >
                    <RotateCcw size={16} />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={() => deleteExpensePermanently(expense._id!)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}