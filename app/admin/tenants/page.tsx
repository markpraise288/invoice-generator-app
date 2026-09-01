"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTenants, type Tenant, type TenantsListParams } from "@/hooks/useAdmin";
import { TenantsTable } from "@/components/admin/TenantsTable";
import { TenantDetailsDrawer } from "@/components/admin/TenantsDetailsDrawer";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function AdminTenantsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [plan, setPlan] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [drawerTenantId, setDrawerTenantId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const params: TenantsListParams = {
    search: debouncedSearch,
    plan: plan === "all" ? undefined : (plan as TenantsListParams["plan"]),
    status: status === "all" ? undefined : (status as TenantsListParams["status"]),
    page,
    limit: 20,
  };

  const { data, isLoading } = useTenants(params);

  const openDrawer = (tenant: Tenant) => {
    setDrawerTenantId(tenant._id);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tenants</h1>
        <p className="text-sm text-muted-foreground">
          Every business account running on InvoiceFlow.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by business name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={plan}
          onValueChange={(v) => {
            setPlan(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TenantsTable
        tenants={data?.tenants ?? []}
        isLoading={isLoading}
        onView={openDrawer}
      />

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total}{" "}
            tenants
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <TenantDetailsDrawer
        tenantId={drawerTenantId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}