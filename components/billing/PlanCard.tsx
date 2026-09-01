import { Check, ExternalLink, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BillingPlan } from "@/hooks/useBilling";

interface PlanCardProps {
  plan: BillingPlan;
  highlighted?: boolean;
  footer?: React.ReactNode;
}

const formatPrice = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
};

export function PlanCard({ plan, highlighted, footer }: PlanCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-6",
        highlighted && "border-primary shadow-sm ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
          {plan.description && (
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
          )}
        </div>
        {!plan.isActive && (
          <Badge variant="outline" className="text-muted-foreground">
            Inactive
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {formatPrice(plan.price, plan.currency)}
        </span>
        <span className="text-sm text-muted-foreground">/{plan.interval}</span>
      </div>

      {!plan.paypalPlanId && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3.5 w-3.5" />
          Not yet synced to PayPal
        </div>
      )}

      {plan.features.length > 0 && (
        <ul className="mt-5 flex-1 space-y-2.5">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}