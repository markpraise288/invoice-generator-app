"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Calendar,
  DollarSign,
  Users,
  LogIn,
  Loader2,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { TenantStatusBadge } from "@/components/admin/TenantStatusBadge";
import {
  useTenant,
  useChangeTenantPlan,
  useImpersonateTenant,
  type Tenant,
  type TenantPlan,
} from "@/hooks/useAdmin";
import { toast } from "sonner";

interface TenantDetailsDrawerProps {
  tenantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100
  );
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const planLabels: Record<TenantPlan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function TenantDetailsDrawer({ tenantId, open, onOpenChange }: TenantDetailsDrawerProps) {
  const { data: tenant, isLoading } = useTenant(tenantId || "");

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<TenantPlan>("free");
  const [newMrr, setNewMrr] = useState("");

  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [impersonateReason, setImpersonateReason] = useState("");
  const [impersonationResult, setImpersonationResult] = useState<{ token: string } | null>(null);

  const changeTenantPlan = useChangeTenantPlan();
  const impersonateTenant = useImpersonateTenant();

  const openPlanDialog = (t: Tenant) => {
    setNewPlan(t.plan);
    setNewMrr(t.mrr ? (t.mrr / 100).toString() : "");
    setPlanDialogOpen(true);
  };

  const handleChangePlan = async () => {
    if (!tenant) return;
    try {
      await changeTenantPlan.mutateAsync({
        id: tenant._id,
        plan: newPlan,
        mrr: newMrr ? Math.round(parseFloat(newMrr) * 100) : undefined,
      });
      toast.success("Plan updated");
      setPlanDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update plan");
    }
  };

  const handleImpersonate = async () => {
    if (!tenant || !impersonateReason.trim()) {
      toast.error("A reason is required to impersonate a tenant");
      return;
    }
    try {
      const result = await impersonateTenant.mutateAsync({
        tenantId: tenant._id,
        reason: impersonateReason,
      });
      setImpersonationResult({ token: result.token });
      toast.success("Impersonation session created");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start impersonation");
    }
  };

  const closeImpersonateDialog = () => {
    setImpersonateDialogOpen(false);
    setImpersonateReason("");
    setImpersonationResult(null);
  };

  const copyToken = () => {
    if (impersonationResult) {
      navigator.clipboard.writeText(impersonationResult.token);
      toast.success("Token copied to clipboard");
    }
  };

  if (isLoading || !tenant) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-xl">{tenant.businessName}</SheetTitle>
            <div className="mt-2 flex items-center gap-2">
              <TenantStatusBadge status={tenant.status} />
              <span className="text-sm text-muted-foreground">{planLabels[tenant.plan]} plan</span>
            </div>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-6">
            {tenant.status === "suspended" && tenant.suspendedReason && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Suspended</p>
                  <p className="mt-0.5">{tenant.suspendedReason}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Owner Email
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {tenant.ownerEmail}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Users
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{tenant.userCount}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  MRR
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatCurrency(tenant.mrr)}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Signed Up
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(tenant.createdAt)}
                </p>
              </div>
            </div>

            {tenant.trialEndsAt && tenant.status === "trialing" && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Trial Ends</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(tenant.trialEndsAt)}
                </p>
              </div>
            )}

            {/* SENSITIVE ACTIONS */}
            <div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin Actions
              </p>
              <Button variant="outline" onClick={() => openPlanDialog(tenant)}>
                Change Plan
              </Button>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10"
                onClick={() => setImpersonateDialogOpen(true)}
                disabled={!tenant.ownerUser}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Impersonate Tenant
              </Button>
              {!tenant.ownerUser && (
                <p className="text-xs text-muted-foreground">
                  No linked owner user account — impersonation unavailable.
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* CHANGE PLAN DIALOG */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Plan — {tenant.businessName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Plan</Label>
              <Select value={newPlan} onValueChange={(v: TenantPlan) => setNewPlan(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mrr">Monthly Revenue (optional override)</Label>
              <input
                id="mrr"
                type="number"
                min="0"
                step="0.01"
                value={newMrr}
                onChange={(e) => setNewMrr(e.target.value)}
                placeholder="0.00"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePlan} disabled={changeTenantPlan.isPending}>
              {changeTenantPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPERSONATE DIALOG */}
      <Dialog
        open={impersonateDialogOpen}
        onOpenChange={(open) => !open && closeImpersonateDialog()}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Impersonate {tenant.businessName}</DialogTitle>
            <DialogDescription>
              This generates a token to view the app as this tenant's owner account. Every
              impersonation session is recorded in the audit log.
            </DialogDescription>
          </DialogHeader>

          {impersonationResult ? (
            <div className="grid gap-3 py-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                Session created — expires in 1 hour.
              </div>
              <Label className="text-xs">Impersonation Token</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md border bg-muted px-2 py-1.5 text-xs">
                  {impersonationResult.token}
                </code>
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={copyToken}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this token as a Bearer token to view the app as {tenant.ownerEmail}. It expires
                automatically in 1 hour.
              </p>
            </div>
          ) : (
            <div className="grid gap-2 py-2">
              <Label htmlFor="impersonateReason">Reason (required)</Label>
              <Textarea
                id="impersonateReason"
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                rows={3}
                placeholder="e.g. Investigating support ticket #482..."
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeImpersonateDialog}>
              {impersonationResult ? "Close" : "Cancel"}
            </Button>
            {!impersonationResult && (
              <Button
                onClick={handleImpersonate}
                disabled={impersonateTenant.isPending || !impersonateReason.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {impersonateTenant.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Impersonation Token
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}