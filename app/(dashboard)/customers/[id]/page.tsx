"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerStatusBadge } from "@/components/customers/CustomerStatusBadge";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { CustomerLinkedRecords } from "@/components/customers/CustomerLinkedRecords";
import { useCustomer } from "@/hooks/useCustomers";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
};

export default function CustomerDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);

  const { data: customer, isLoading } = useCustomer(params.id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">Customer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const address = customer.billingAddress;
  const hasAddress =
    address && (address.street || address.city || address.state || address.country || address.zip);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/customers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {customer.name}
              </h1>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Total Revenue
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(customer.totalRevenue, customer.currency)}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Contact Info
          </p>
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {customer.email}
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {customer.phone}
              </div>
            )}
            {customer.company?.name && (
              <div className="flex items-center gap-2 text-foreground">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {customer.company.name}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Billing Address
          </p>
          {hasAddress ? (
            <div className="mt-2 flex items-start gap-2 text-sm text-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>
                {[address?.street, address?.city, address?.state, address?.zip, address?.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No address on file.</p>
          )}
        </div>
      </div>

      {customer.notes && (
        <div className="rounded-xl border p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
          <p className="mt-2 text-sm text-foreground">{customer.notes}</p>
        </div>
      )}

      <CustomerLinkedRecords customerId={customer._id} />

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={customer}
      />
    </div>
  );
}