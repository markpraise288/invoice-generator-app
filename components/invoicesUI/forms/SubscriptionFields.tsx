"use client";

import { Invoice } from "@/types";

interface Props {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}

export default function SubscriptionFields({ invoice, setInvoice }: Props) {
  const subscription = invoice.subscriptionDetails ?? {
    planName: "",
    planPrice: 0,
    billingCycle: "monthly" as "monthly" | "yearly",
    startDate: "",
    endDate: "",
    nextBillingDate: "",
  };

  // ✅ Clean updater (SaaS pattern)
  const updateSubscription = (
    field: keyof typeof subscription,
    value: any
  ) => {
    setInvoice((prev) => ({
      ...prev,
      subscriptionDetails: {
        planName: prev.subscriptionDetails?.planName ?? "",
        planPrice: prev.subscriptionDetails?.planPrice ?? 0,
        billingCycle: prev.subscriptionDetails?.billingCycle ?? "monthly",
        startDate: prev.subscriptionDetails?.startDate ?? "",
        endDate: prev.subscriptionDetails?.endDate ?? "",
        nextBillingDate: prev.subscriptionDetails?.nextBillingDate ?? "",
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Subscription Details
      </h3>

      {/* PLAN NAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500 dark:text-gray-400">
          Plan Name
        </label>
        <input
          type="text"
          placeholder="e.g. Pro Plan"
          value={subscription.planName}
          onChange={(e) =>
            updateSubscription("planName", e.target.value)
          }
          className="w-full border p-2 rounded-lg bg-white dark:bg-slate-900 dark:border-slate  -600"
        />
      </div>

      {/* BILLING CYCLE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500 dark:text-gray-400">
          Billing Cycle
        </label>
        <select
          value={subscription.billingCycle}
          onChange={(e) =>
            updateSubscription(
              "billingCycle",
              e.target.value as "monthly" | "yearly"
            )
          }
          className="w-full border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* DATES GRID */}
      <div className="grid grid-cols-2 gap-4">
        {/* START DATE */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500 dark:text-gray-400">
            Start Date
          </label>
          <input
            type="date"
            value={subscription.startDate?.split("T")[0] || ""}
            onChange={(e) =>
              updateSubscription("startDate", e.target.value)
            }
            className="w-full border p-2 rounded-lg bg-white dark:bg-slate-900 dark:border-slate-600"
          />
        </div>

        {/* NEXT BILLING */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500 dark:text-gray-400">
            Next Billing Date
          </label>
          <input
            type="date"
            value={subscription.nextBillingDate?.split("T")[0] || ""}
            onChange={(e) =>
              updateSubscription("nextBillingDate", e.target.value)
            }
            className="w-full border p-2 rounded-lg bg-white dark:bg-slate-900 dark:border-slate-600"
          />
        </div>
      </div>

      {/* END DATE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500 dark:text-gray-400">
          End Date (Optional)
        </label>
        <input
          type="date"
          value={subscription.endDate?.split("T")[0] || ""}
          onChange={(e) =>
            updateSubscription("endDate", e.target.value)
          }
          className="w-full border p-2 rounded-lg bg-white dark:bg-slate-900 dark:border-slate-600"
        />
      </div>

      {/* PLAN PRICE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500 dark:text-gray-400">
          Plan Price
        </label>
        <input
          type="number"
          value={subscription.planPrice || ""}
          onChange={(e) =>
            updateSubscription("planPrice", parseFloat(e.target.value) || 0)
          }
          className="w-full border p-2 rounded-lg bg-white dark:bg-slate-900 dark:border-slate-600"
        />
      </div>

      {/* 🔥 SaaS Hint */}
      <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        This invoice will repeat based on the billing cycle. Make sure your
        next billing date is correct.
      </div>
    </div>
  );
}