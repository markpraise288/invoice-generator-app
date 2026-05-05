"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, SlidersHorizontal } from "lucide-react";

import { Invoice, Payment } from "@/types";
import InvoicesTable from "@/components/invoicesUI/InvoiceTable";
import { Button } from "@/components/ui/button";
import { useInvoices, useDeleteInvoice, useUpdateInvoice } from "@/hooks/useInvoices";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/apiFetch";

export default function InvoicesPage() {
  const router = useRouter();
  const { data: invoices = [], isLoading } = useInvoices();
  const deleteMutation = useDeleteInvoice();
  const updateMutation = useUpdateInvoice();

  const [isPaying, setIsPaying] = useState(false);
  const [updatedInvoice, setUpdatedInvoice] = useState<Invoice | null>(null);

  const [paymentDetails, setPaymentDetails] = useState<Payment>({
    amount: 0,
    date: new Date().toISOString(),
  });

  // 🔥 FILTER STATES
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortAmount, setSortAmount] = useState<"none" | "asc" | "desc">("none");
  const [dateFilter, setDateFilter] = useState("all");

  // 🔥 COMPUTE STATUS (REAL LOGIC)
  const computeStatus = (invoice: Invoice) => {
    const totalPaid =
      invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    const dueDate = new Date(invoice.dueDate);
    const today = new Date();

    if (totalPaid === 0) return "draft";
    if (totalPaid < invoice.total!) {
      if (dueDate < today) return "overdue";
      return "partial";
    }
    if (totalPaid === invoice.total) return "paid";

    return invoice.status;
  };

  // 🔥 FILTER + SORT ENGINE
  const filteredInvoices = useMemo(() => {
    let data = [...invoices];

    // 🔍 Search
    if (search) {
      data = data.filter(
        (inv) =>
          inv.invoiceNumber!.toLowerCase().includes(search.toLowerCase()) ||
          inv.clientSnapshot.name
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    // 🎯 Status filter
    if (statusFilter !== "all") {
      data = data.filter(
        (inv) => computeStatus(inv) === statusFilter
      );
    }

    // 📅 Date filter
    if (dateFilter !== "all") {
      const now = new Date();

      data = data.filter((inv) => {
        const date = new Date(inv.dueDate);

        if (dateFilter === "thisMonth") {
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        }

        if (dateFilter === "lastMonth") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);

          return (
            date.getMonth() === lastMonth.getMonth() &&
            date.getFullYear() === lastMonth.getFullYear()
          );
        }

        return true;
      });
    }

    // 💰 Sorting
    if (sortAmount === "asc") {
      data.sort((a, b) => a.total! - b.total!);
    }

    if (sortAmount === "desc") {
      data.sort((a, b) => b.total! - a.total!);
    }

    return data;
  }, [invoices, search, statusFilter, sortAmount, dateFilter]);

  // 🔹 Delete
  const onDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(id);
    }
  };

  // 🔹 Open payment modal
  const updateInvoice = (invoice: Invoice) => {
    setUpdatedInvoice(invoice);
    setIsPaying(true);
  };

  // 🔹 Handle payment input
  const handleChange = (value: string) => {
    setPaymentDetails((prev) => ({
      ...prev,
      amount: Number(value),
    }));
  };

  // 🔥 Save payment
  const handleSubmit = async () => {
    if (!updatedInvoice) return;

    const newPayments = [...(updatedInvoice.payments || []), paymentDetails];

    updateMutation.mutate({
      id: updatedInvoice._id!,
      data: { payments: newPayments }
    }, {
      onSuccess: () => {
        setPaymentDetails({
          amount: 0,
          date: new Date().toISOString(),
        });
        setIsPaying(false);
        setUpdatedInvoice(null);
      }
    });
  };

  // 🔥 RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortAmount("none");
    setDateFilter("all");
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Implement PDF generation and downloading logic here
    alert(`Downloading invoice #${invoice.invoiceNumber}`);
    const res = apiFetch(`/invoices/${invoice._id}/download`,{
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-500">Manage your invoices here.</p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/invoices/create")}
          className="bg-blue-700 text-white w-full md:w-auto hover:bg-blue-800"
        >
          <FileText className="mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* 🔥 FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 border dark:border-gray-600 rounded-xl px-3 py-2 w-full sm:w-62.5 bg-gray-50 dark:bg-gray-900">
          <Search size={16} className="text-gray-500 dark:text-gray-400" />
          <input
            placeholder="Search invoice..."
            className="outline-none w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>

        {/* Date */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Dates</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
        </select>

        {/* Sort */}
        <select
          value={sortAmount}
          onChange={(e) =>
            setSortAmount(e.target.value as "asc" | "desc" | "none")
          }
          className="border dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="none">Sort Amount</option>
          <option value="asc">Low → High</option>
          <option value="desc">High → Low</option>
        </select>

        {/* Reset */}
        <Button variant="outline" onClick={resetFilters} className="dark:border-gray-600 dark:text-gray-300">
          <SlidersHorizontal size={16} />
          Reset
        </Button>
      </div>

      {/* TABLE */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <InvoicesTable
          invoices={filteredInvoices}
          onDelete={onDelete}
          updateInvoice={updateInvoice}
          downloadInvoice={downloadInvoice}
        />
      )}

      {/* PAYMENT MODAL */}
      {isPaying && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-[90%] sm:w-100 space-y-4 border dark:border-gray-700 shadow-xl">
            <h2 className="font-bold text-lg dark:text-white">Add Payment</h2>

            <input
              type="number"
              placeholder="Enter amount"
              autoFocus
              onChange={(e) => handleChange(e.target.value)}
              className="border dark:border-gray-600 rounded-xl p-2 w-full bg-white dark:bg-gray-900 dark:text-white"
            />

            <div className="flex justify-end gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPaying(false)}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}