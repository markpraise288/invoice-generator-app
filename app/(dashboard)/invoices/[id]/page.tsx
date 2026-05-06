"use client";

import { useEffect, useState } from "react";
import InvoiceRenderer from "@/components/invoicesUI/InvoiceRenderer";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Invoice } from "@/types/invoice";
import { useParams } from "next/navigation";

interface User {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const invoiceRes = await fetchWithAuth(`/invoices/${id}`);
        const userRes = await fetchWithAuth(`/users`);

        setInvoice(invoiceRes.data);
        setUser(userRes.data);
      } catch (err: any) {
        console.error(err);

        if (err.message === "Session expired") {
          window.location.href = "/login";
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!invoice || !user) {
    return <div className="p-6">No data found</div>;
  }

  return (
    <div className="p-6 h-full bg-blue-50 rounded dark:bg-gray-900">
      <Link
        href="/invoices"
        className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-4 hover:underline"
      >
        <ArrowBigLeft /> Back
      </Link>

      <div className="p-6 overflow-y-scroll h-full bg-blue-50 rounded dark:bg-gray-900">
        <InvoiceRenderer invoice={invoice} user={user} />
      </div>
    </div>
  );
}