"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSales, type Sale, type SalesListParams } from "@/hooks/useSales";
import { SalesSummaryCards } from "@/components/sales/SalesSummaryCards";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesTable } from "@/components/sales/SalesTable";
import { SaleFormDialog } from "@/components/sales/SaleFormDialog";
import { SaleDetailsDrawer } from "@/components/sales/SaleDetailsDrawer";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<SalesListParams>({ page: 1, limit: 20 });
  const [formOpen, setFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [drawerSaleId, setDrawerSaleId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useSales({ ...filters, search: debouncedSearch });

  const openDrawer = (sale: Sale) => {
    setDrawerSaleId(sale._id);
    setDrawerOpen(true);
  };

  const openEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormOpen(true);
  };

  const openEditFromDrawer = () => {
    const sale = data?.sales.find((s) => s._id === drawerSaleId) || null;
    setDrawerOpen(false);
    if (sale) openEdit(sale);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingSale(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground">
            Track transactions and revenue across your customers.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <SalesSummaryCards filters={{ dateFrom: filters.dateFrom, dateTo: filters.dateTo }} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by sale # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <SalesFilters filters={filters} onChange={setFilters} />
      </div>

      <SalesTable
        sales={data?.sales ?? []}
        isLoading={isLoading}
        onView={openDrawer}
        onEdit={openEdit}
      />

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} sales
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === data.pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <SaleFormDialog open={formOpen} onOpenChange={handleFormOpenChange} sale={editingSale} />

      <SaleDetailsDrawer
        saleId={drawerSaleId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={openEditFromDrawer}
      />
    </div>
  );
}