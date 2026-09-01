"use client";

import { useState } from "react";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBillingPlans,
  useCreateBillingPlan,
  useSyncPlanToPayPal,
  type CreateBillingPlanPayload,
} from "@/hooks/useBilling";
import { PlanCard } from "@/components/billing/PlanCard";
import { toast } from "sonner";

const emptyPlanForm: CreateBillingPlanPayload = {
  name: "",
  description: "",
  price: 0,
  currency: "USD",
  interval: "month",
  features: [],
  isActive: true,
};

export default function SettingsBillingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateBillingPlanPayload>(emptyPlanForm);
  const [priceInput, setPriceInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");

  const { data: plans, isLoading } = useBillingPlans();
  const createPlan = useCreateBillingPlan();
  const syncPlan = useSyncPlanToPayPal();

  const resetForm = () => {
    setForm(emptyPlanForm);
    setPriceInput("");
    setFeaturesInput("");
  };

  const handleCreatePlan = async () => {
    const price = Math.round(parseFloat(priceInput || "0") * 100);

    if (!form.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!price || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      await createPlan.mutateAsync({
        ...form,
        price,
        features: featuresInput
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      });
      toast.success("Plan created — sync it to PayPal to make it available");
      resetForm();
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create plan");
    }
  };

  const handleSync = async (planId: string) => {
    try {
      await syncPlan.mutateAsync(planId);
      toast.success("Plan synced to PayPal");
    } catch (err: any) {
      toast.error(err?.message || "Failed to sync plan to PayPal");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Billing Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage subscription plans synced to PayPal.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : !plans?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium text-foreground">No billing plans yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a plan and sync it to PayPal to start accepting subscriptions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              footer={
                !plan.paypalPlanId ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSync(plan._id)}
                    disabled={syncPlan.isPending}
                  >
                    {syncPlan.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sync to PayPal
                  </Button>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Synced · {plan.paypalPlanId}
                  </p>
                )
              }
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>New Billing Plan</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="planName">Name</Label>
              <Input
                id="planName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Pro Plan"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="planDescription">Description</Label>
              <Textarea
                id="planDescription"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="For growing teams"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="planPrice">Price</Label>
                <Input
                  id="planPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="29.99"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="planInterval">Interval</Label>
                <Select
                  value={form.interval}
                  onValueChange={(v: "month" | "year") =>
                    setForm((f) => ({ ...f, interval: v }))
                  }
                >
                  <SelectTrigger id="planInterval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="planFeatures">Features (one per line)</Label>
              <Textarea
                id="planFeatures"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                rows={4}
                placeholder={"Unlimited invoices\nPriority support\nCustom branding"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createPlan.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={createPlan.isPending}>
              {createPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}