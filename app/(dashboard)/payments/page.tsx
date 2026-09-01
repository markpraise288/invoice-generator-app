"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayments, type PaymentsListParams } from "@/hooks/usePayments";
import { PaymentsSummaryCards } from "@/components/payments/PaymentsSummaryCards";
import { PaymentsFilters } from "@/components/payments/PaymentsFilters";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { RecordPaymentDialog } from "@/components/payments/RecordPaymentDialog";

export default function PaymentsPage() {
  const [filters, setFilters] = useState<PaymentsListParams>({
    page: 1,
    limit: 20,
  });
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);

  const { data, isLoading } = usePayments(filters);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            Track collected, pending, and refunded payments across all customers.
          </p>
        </div>
        <Button onClick={() => setRecordDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <PaymentsSummaryCards
        filters={{
          customer: filters.customer,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        }}
      />

      <PaymentsFilters filters={filters} onChange={setFilters} />

      <PaymentsTable payments={data?.payments ?? []} isLoading={isLoading} />

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
            {data.pagination.total} payments
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === data.pagination.totalPages}
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <RecordPaymentDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
      />
    </div>
  );
}