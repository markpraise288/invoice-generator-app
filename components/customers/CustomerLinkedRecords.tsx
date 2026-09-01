// components/customers/CustomerLinkedRecords.tsx

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useCustomer } from "@/hooks/useCustomers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Building2,
  Contact as ContactIcon,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { CompanyDetailsDrawer } from "@/components/companies/CompanyDetailsDrawer";
import { ContactDetailsDrawer } from "@/components/contacts/ContactDetailsDrawer";

interface CustomerLinkedRecordsProps {
  customerId: string;
}

const formatCurrency = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function CustomerLinkedRecords({
  customerId,
}: CustomerLinkedRecordsProps) {
  const { data: customer, isLoading: customerLoading } =
    useCustomer(customerId);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const paymentsQuery = useQuery({
    queryKey: ["customers", customerId, "payments"],
    queryFn: async () => {
      const res = await apiFetch(`/payments?customer=${customerId}`);
      return res.data?.payments ?? [];
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ["customers", customerId, "invoices"],
    queryFn: async () => {
      const res = await apiFetch(`/invoices?customer=${customerId}`);
      return res.data?.invoices ?? [];
    },
  });

  // A Customer links to either a Company or a Contact (per customer.model.js —
  // both are optional refs, not necessarily both present at once). Company
  // takes priority if a customer somehow has both linked, since Customers are
  // typically billed at the company/business level rather than the individual
  // contact level — same reasoning used when converting a Lead to a Customer.
  const hasCompany = !!customer?.company;
  const hasContact = !!customer?.contact;
  const relatedKind: "company" | "contact" | "none" = hasCompany
    ? "company"
    : hasContact
      ? "contact"
      : "none";

  const relatedLabel =
    relatedKind === "company"
      ? "Company"
      : relatedKind === "contact"
        ? "Contact"
        : "Company";
  const RelatedIcon = relatedKind === "contact" ? ContactIcon : Building2;

  const openRelatedDrawer = () => {
    if (relatedKind !== "none") setDrawerOpen(true);
  };

  return (
    <div className="rounded-xl border p-4">
      <Tabs defaultValue="payments">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">
            <Receipt className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="related">
            <RelatedIcon className="mr-2 h-4 w-4" />
            {relatedLabel}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4 space-y-2">
          {paymentsQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !paymentsQuery.data?.length ? (
            <EmptyRow label="No payments recorded for this customer yet." />
          ) : (
            paymentsQuery.data.map((payment: any) => (
              <div
                key={payment._id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize">
                    {payment.method?.replace("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.paidAt || payment.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <PaymentStatusBadge status={payment.status} />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-4 space-y-2">
          {invoicesQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !invoicesQuery.data?.length ? (
            <EmptyRow label="No invoices linked to this customer yet." />
          ) : (
            invoicesQuery.data.map((invoice: any) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {invoice.number || invoice._id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="related" className="mt-4">
          {customerLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : relatedKind === "none" ? (
            <EmptyRow label="No company or contact linked to this customer." />
          ) : relatedKind === "company" ? (
            <button
              onClick={openRelatedDrawer}
              className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {customer?.company?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Linked company
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <button
              onClick={openRelatedDrawer}
              className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <ContactIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {customer?.contact?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customer?.contact?.email || "Linked contact"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </TabsContent>
      </Tabs>

      {relatedKind === "company" && (
        <CompanyDetailsDrawer
          companyId={customer?.company?._id ?? null}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onDeleted={() => setDrawerOpen(false)}
        />
      )}

      {relatedKind === "contact" && (
        <ContactDetailsDrawer
          contactId={customer?.contact?._id ?? null}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onDeleted={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
