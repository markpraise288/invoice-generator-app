"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { DangerZone } from "@/components/settings/DangerZone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Check,
  Users,
  Database,
  Zap,
  Download,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";

// ─── Plan Config ───────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    description: "For individuals getting started",
    features: [
      "Up to 2 team members",
      "500 leads",
      "Basic pipeline & tasks",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9,
    description: "For growing sales teams",
    features: [
      "Up to 10 team members",
      "5,000 leads",
      "Deals, reports & analytics",
      "API access",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 29,
    description: "For established businesses",
    features: [
      "Up to 50 team members",
      "50,000 leads",
      "Advanced analytics & forecasting",
      "Webhooks & integrations",
      "Dedicated support",
    ],
  },
];

const USAGE_METRICS = [
  { label: "Team members", icon: Users, limit: 10, unit: "seats" },
  { label: "Leads stored", icon: Database, limit: 5000, unit: "leads" },
  { label: "API requests", icon: Zap, limit: 50000, unit: "this month" },
];

// ─── Usage Bar ─────────────────────────────────────────────────────────────

function UsageBar({
  label,
  icon: Icon,
  used,
  limit,
  unit,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  used: number;
  limit: number;
  unit: string;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = pct >= 80;

  return (
    <div className="flex flex-col gap-2 px-4 py-3.5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{label}</span>
        </div>
        <span
          className={cn(
            "text-xs font-semibold",
            isNearLimit ? "text-amber-500" : "text-foreground",
          )}
        >
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isNearLimit ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground">{unit}</span>
    </div>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isCurrent,
  onUpgrade,
  isLoading,
}: {
  plan: (typeof PLANS)[0];
  isCurrent: boolean;
  onUpgrade: (planId: string) => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-5 relative",
        isCurrent
          ? "border-primary/40 bg-primary/[0.02] dark:bg-primary/[0.05]"
          : "border-border",
      )}
    >
      {isCurrent && (
        <Badge className="absolute -top-2.5 left-5 text-[10px] px-2 h-5">
          Current plan
        </Badge>
      )}

      <div>
        <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {plan.description}
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">
          ${plan.price}
        </span>
        <span className="text-xs text-muted-foreground">/month</span>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-xs text-muted-foreground"
          >
            <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        size="sm"
        variant={isCurrent ? "outline" : "default"}
        disabled={isCurrent || isLoading}
        onClick={() => onUpgrade(plan.id)}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Processing...
          </span>
        ) : isCurrent ? (
          "Current plan"
        ) : (
          "Upgrade"
        )}
      </Button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

interface BillingData {
  currentPlan: string;
  renewsOn: string;
  usage: { [key: string]: number };
  invoices: Array<{ id: string; date: string; amount: number; status: string }>;
}

export default function BillingSettingsPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  // In app/settings/billing/page.tsx, add this near your other useEffects to
  // catch the redirect back from PayPal (?token=...&success=true) and confirm
  // the subscription automatically:

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const success = params.get("success");

    if (success === "true" && token) {
      (async () => {
        try {
          await apiFetch("/billing/upgrade/confirm", {
            method: "POST",
            body: JSON.stringify({ token }),
          });
          await fetchBillingData();
          // Clean the query string so a refresh doesn't re-confirm
          window.history.replaceState({}, "", "/settings/billing");
        } catch (err: any) {
          setError(err?.message || "Could not confirm your subscription");
        }
      })();
    }
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/billing/data");
      setData(response.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlan(planId);
    try {
      // Call backend to create PayPal subscription
      const response = await apiFetch("/billing/upgrade", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });

      // Redirect to PayPal approval link
      if (response.data?.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to initiate upgrade");
      setUpgradingPlan(null);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      // Call backend to create PayPal billing plan update flow
      const response = await apiFetch("/billing/update-payment-method", {
        method: "POST",
      });

      if (response.data?.updateUrl) {
        window.location.href = response.data.updateUrl;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update payment method");
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await apiFetch("/billing/cancel", { method: "POST" });
      setError(null);
      await fetchBillingData();
    } catch (err: any) {
      setError(err?.message || "Failed to cancel subscription");
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.id === data?.currentPlan);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription, usage, and payment history
        </p>
      </div>

      {/* ── Error message ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60">
          <AlertCircle
            size={16}
            className="text-red-600 dark:text-red-400 mt-0.5 shrink-0"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <span className="sr-only">Dismiss</span>×
          </button>
        </div>
      )}

      {/* ── Current plan summary ── */}
      {currentPlan && (
        <SettingsSection title="Current subscription">
          <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-border bg-card flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {currentPlan.name} plan
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  >
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ${currentPlan.price}/month · Renews{" "}
                  {data?.renewsOn
                    ? new Date(data.renewsOn).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={handleUpdatePaymentMethod}
            >
              <CreditCard size={13} />
              Update payment method
            </Button>
          </div>
        </SettingsSection>
      )}

      {/* ── Usage ── */}
      <SettingsSection
        title="Usage this billing cycle"
        description="Your current plan limits and consumption"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {USAGE_METRICS.map((metric) => (
            <UsageBar
              key={metric.label}
              {...metric}
              used={data?.usage[metric.label] || 0}
            />
          ))}
        </div>
      </SettingsSection>

      {/* ── Plans ── */}
      <SettingsSection
        title="Available plans"
        description="Upgrade or downgrade your subscription anytime with ProRated pricing"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={data?.currentPlan === plan.id}
              onUpgrade={handleUpgrade}
              isLoading={upgradingPlan === plan.id}
            />
          ))}
        </div>
      </SettingsSection>

      {/* ── Billing history ── */}
      {data?.invoices && data.invoices.length > 0 && (
        <SettingsSection title="Billing history" noBorder>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/40 border-b border-border px-4 py-2.5 grid grid-cols-[1fr_120px_100px_80px_40px] gap-4">
              {["Invoice", "Date", "Amount", "Status", ""].map((h) => (
                <span
                  key={h}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {h}
                </span>
              ))}
            </div>
            <div className="divide-y divide-border">
              {data.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="px-4 py-3 grid grid-cols-[1fr_120px_100px_80px_40px] gap-4 items-center"
                >
                  <span className="text-sm font-medium text-foreground">
                    {invoice.id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    ${invoice.amount.toFixed(2)}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] h-5 w-fit px-1.5",
                      invoice.status === "paid"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
                    )}
                  >
                    {invoice.status === "paid" ? "Paid" : "Pending"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                  >
                    <Download size={13} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 mt-3 w-fit"
          >
            View all invoices
            <ExternalLink size={11} />
          </a>
        </SettingsSection>
      )}

      {/* ── Danger zone ── */}
      {data?.currentPlan !== "starter" && (
        <DangerZone
          actions={[
            {
              title: "Cancel subscription",
              description:
                "Your workspace will be downgraded to the Starter plan at the end of your current billing period",
              buttonLabel: "Cancel subscription",
              confirmTitle: "Cancel your subscription?",
              confirmDescription:
                "You'll keep access to your current plan features until the end of your billing period. After that, your workspace will be downgraded to the Starter plan.",
              onConfirm: handleCancelSubscription,
              isPending: isCanceling,
            },
          ]}
        />
      )}
    </div>
  );
}
