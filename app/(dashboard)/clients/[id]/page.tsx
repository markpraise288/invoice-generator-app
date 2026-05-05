"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { Client, Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Trash2, Edit } from "lucide-react";
import ClientInsights from "@/components/clientsUI/ClientInsights";
import ClientRevenueChart from "@/components/clientsUI/ClientRevenueChart";

export default function ClientProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const analytics = useMemo(() => {
    let monthlyRevenue: Record<string, number> = {};
    let totalDelay = 0;
    let latePayments = 0;
    let totalPayments = 0;

    invoices.forEach((inv) => {
      const month = new Date(inv.dueDate).toLocaleString("default", {
        month: "short",
      });

      // Revenue per month
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + inv.total!;

      // Payment behavior
      inv.payments?.forEach((p) => {
        const paymentDate = new Date(p.date);
        const dueDate = new Date(inv.dueDate);

        const delay =
          (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);

        if (delay > 0) {
          latePayments++;
          totalDelay += delay;
        }

        totalPayments++;
      });
    });

    const avgDelay = totalPayments > 0 ? totalDelay / totalPayments : 0;

    return {
      monthlyRevenue,
      avgDelay,
      lateRate: totalPayments > 0 ? (latePayments / totalPayments) * 100 : 0,
    };
  }, [invoices]);

  // 🔹 Fetch client + invoices
  const fetchData = async () => {
    try {
      const clientRes = await apiFetch(`/clients/${id}`);
      const invoicesRes = await apiFetch(`/invoices`);

      const allInvoices = invoicesRes.data;

      const clientInvoices = allInvoices.filter(
        (inv: Invoice) => inv.clientSnapshot.email === clientRes.data.email,
      );

      setClient(clientRes.data);
      setInvoices(clientInvoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // 🔥 CALCULATIONS
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;

    invoices.forEach((inv) => {
      totalRevenue += inv.total!;

      const paid = inv.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

      totalPaid += paid;
    });

    return {
      totalInvoices: invoices.length,
      totalRevenue,
      totalPaid,
      outstanding: totalRevenue - totalPaid,
      lastInvoice:
        invoices.length > 0 ? invoices[invoices.length - 1].dueDate : null,
    };
  }, [invoices]);

  // 🔹 Delete client
  const handleDelete = async () => {
    if (!client?._id) return;

    try {
      await apiFetch(`/clients/${client._id}`, {
        method: "DELETE",
      });

      router.push("/clients");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }


  const chartData = Object.entries(analytics.monthlyRevenue).map(
    ([month, revenue]) => ({
      month,
      revenue,
    }),
  );

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>

          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-gray-500">{client.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/invoices/create?client=${client._id}`)}
          >
            <FileText size={16} />
            New Invoice
          </Button>

          <Button variant="outline">
            <Edit size={16} />
            Edit
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      {/* CLIENT INFO */}
      <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-2xl shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-gray-500 dark:text-gray-300 text-sm">Phone</p>
          <p className="font-medium">{client.phone}</p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-300 text-sm">Address</p>
          <p className="font-medium">{client.address}</p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-300 text-sm">Status</p>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              client.isDeleted
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {client.isDeleted ? "Deleted" : "Active"}
          </span>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-300 text-sm">Last Invoice</p>
          <p className="font-medium">
            {stats.lastInvoice ? stats.lastInvoice.split("T")[0] : "N/A"}
          </p>
        </div>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Invoices" value={stats.totalInvoices} />
        <StatCard title="Revenue" value={`$${stats.totalRevenue}`} />
        <StatCard title="Paid" value={`$${stats.totalPaid}`} />
        <StatCard title="Outstanding" value={`$${stats.outstanding}`} danger />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ClientRevenueChart data={chartData} />

        <ClientInsights
          avgDelay={analytics.avgDelay}
          lateRate={analytics.lateRate}
          revenue={stats.totalRevenue}
        />
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white dark:bg-gray-800 dark:text-white rounded-2xl shadow p-4">
        <h2 className="font-bold mb-4">Invoices</h2>

        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-900 dark:text-white text-sm">
            <tr>
              <th className="p-2">Invoice</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Due</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-b">
                <td className="p-2">{inv.invoiceNumber}</td>
                <td className="p-2">${inv.total}</td>
                <td className="p-2">{inv.dueDate.split("T")[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 🔥 SMALL STAT CARD COMPONENT
function StatCard({
  title,
  value,
  danger,
}: {
  title: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-2xl shadow">
      <p className="text-gray-300 text-sm">{title}</p>
      <h2 className={`text-xl font-bold ${danger ? "text-red-600" : ""}`}>
        {value}
      </h2>
    </div>
  );
}
