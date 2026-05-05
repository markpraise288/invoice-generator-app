import InvoiceRenderer from "@/components/invoicesUI/InvoiceRenderer";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

import { cookies } from "next/headers";

const API_BASE = "http://localhost:5000/api";

async function getCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

async function refreshAccessToken(cookieHeader: string) {
  const res = await fetch(`${API_BASE}/auth/accessToken`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
  });

  return res.ok;
}

async function getInvoice(id: string) {
  try {
    let cookieHeader = await getCookieHeader();

    // 🔹 First attempt
    let res = await fetch(`${API_BASE}/invoices/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    // 🔴 If access token expired
    if (res.status === 401) {
      console.warn("Access token expired. Refreshing...");

      const refreshed = await refreshAccessToken(cookieHeader);

      if (!refreshed) {
        throw new Error("Session expired. Please login again.");
      }

      // 🔹 IMPORTANT: get updated cookies again
      cookieHeader = await getCookieHeader();

      // 🔁 Retry request
      res = await fetch(`${API_BASE}/invoices/${id}`, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      });
    }

    if (!res.ok) {
      throw new Error("Failed to fetch invoice");
    }

    const data = await res.json();
    return data.data;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getUser() {
  try {
    let cookieHeader = await getCookieHeader();

    // 🔹 First attempt
    let res = await fetch(`${API_BASE}/users`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    // 🔴 If access token expired
    if (res.status === 401) {
      console.warn("Access token expired. Refreshing...");

      const refreshed = await refreshAccessToken(cookieHeader);

      if (!refreshed) {
        throw new Error("Session expired. Please login again.");
      }

      // 🔹 IMPORTANT: get updated cookies again
      cookieHeader = await getCookieHeader();

      // 🔁 Retry request
      res = await fetch(`${API_BASE}/users`, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      });
    }

    if (!res.ok) {
      throw new Error("Failed to fetch invoice");
    }

    const data = await res.json();
    return data.data;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;
  const invoiceData = await getInvoice(id);
  const userData = await getUser();

  const invoice = invoiceData;
  const user = userData;

  return (
    <div className="p-6 h-full bg-blue-50 rounded dark:bg-gray-900">
      <Link href="/invoices" className="flex items-center gap-1 text-gray-600 dark:text-gray-300 mb-4 hover:underline">
        <ArrowBigLeft /> Back
      </Link>
    <div className="p-6 overflow-y-scroll h-full bg-blue-50 rounded dark:bg-gray-900">
      <InvoiceRenderer invoice={invoice} user={user} />
    </div>
    </div>
  );
}
