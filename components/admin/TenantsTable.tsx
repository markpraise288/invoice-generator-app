"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Eye,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Building2,
} from "lucide-react";
import { TenantStatusBadge } from "@/components/admin/TenantStatusBadge";
import {
  useSuspendTenant,
  useReactivateTenant,
  useDeleteTenant,
  type Tenant,
} from "@/hooks/useAdmin";
import { toast } from "sonner";

interface TenantsTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  onView: (tenant: Tenant) => void;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

const planLabels: Record<Tenant["plan"], string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function TenantsTable({ tenants, isLoading, onView }: TenantsTableProps) {
  const [suspendTarget, setSuspendTarget] = useState<Tenant | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

  const suspendTenant = useSuspendTenant();
  const reactivateTenant = useReactivateTenant();
  const deleteTenant = useDeleteTenant();

  const handleSuspend = async () => {
    if (!suspendTarget || !suspendReason.trim()) {
      toast.error("A reason is required to suspend a tenant");
      return;
    }
    try {
      await suspendTenant.mutateAsync({ id: suspendTarget._id, reason: suspendReason });
      toast.success(`${suspendTarget.businessName} suspended`);
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to suspend tenant");
    }
  };

  const handleReactivate = async (tenant: Tenant) => {
    try {
      await reactivateTenant.mutateAsync(tenant._id);
      toast.success(`${tenant.businessName} reactivated`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to reactivate tenant");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTenant.mutateAsync(deleteTarget._id);
      toast.success("Tenant deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete tenant");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!tenants.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No tenants yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Businesses that sign up for InvoiceFlow will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Business</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow
                key={tenant._id}
                className="cursor-pointer"
                onClick={() => onView(tenant)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{tenant.businessName}</span>
                    <span className="text-xs text-muted-foreground">{tenant.ownerEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {planLabels[tenant.plan]}
                </TableCell>
                <TableCell>
                  <TenantStatusBadge status={tenant.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{tenant.userCount}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(tenant.mrr)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(tenant)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      {tenant.status === "suspended" ? (
                        <DropdownMenuItem onClick={() => handleReactivate(tenant)}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Reactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            setSuspendTarget(tenant);
                            setSuspendReason("");
                          }}
                        >
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 focus:text-red-600"
                        onClick={() => setDeleteTarget(tenant)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* SUSPEND DIALOG — reason is required, matching the backend's validation */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Suspend {suspendTarget?.businessName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="suspendReason">Reason (required)</Label>
            <Textarea
              id="suspendReason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
              placeholder="e.g. Non-payment, ToS violation, requested by owner..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSuspend}
              className="bg-red-600 hover:bg-red-700"
              disabled={suspendTenant.isPending || !suspendReason.trim()}
            >
              Suspend Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tenant permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.businessName}</span>{" "}
              and remove them from the platform. This action cannot be undone and is logged in
              the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}