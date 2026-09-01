export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";

export interface Payment {
  amount: number;
  date: string; // ISO
  method?: "cash" | "bank" | "card" | "mobile_money";
  reference?: string; // transaction id
}

export interface InvoiceItem {
  description: string;

  quantity: number; // hours or units
  price: number; // rate per unit/hour

  // 🔥 NEW (freelancer power)
  unit?: "hrs" | "days" | "items";
  hours?: number; // optional override
  rate?: number;

  // 🔥 NEW (business)
  taxRate?: number; // per-item tax
  discount?: number; // per-item discount

  total?: number; // computed
}

export interface CustomerSnapshot {
  name: string;
  email: string;
  phone: string;
  address: string;

  // 🔥 NEW
  companyName?: string;
  taxId?: string;
}

export type InvoiceType = "standard" | "service" | "subscription";

export type InvoiceTemplate =
  | "modern"
  | "minimal"
  | "classic"
  | "corporateWave"
  | "bold"
  | "elegant"
  | "bold-pro"
  | "compact";

export interface Invoice {
  _id?: string;
  invoiceNumber?: string;

  status: InvoiceStatus;

  type: InvoiceType;
  template: InvoiceTemplate;

  currency: "USD" | "MWK";

  issueDate?: string;
  dueDate: string;

  // 🔥 NEW (important for pro UX)
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;

  customerSnapshot: CustomerSnapshot;

  // 🔥 ITEMS (core)
  items: InvoiceItem[];

  // 🔥 FREELANCER / SERVICE
  serviceDetails?: {
    totalHours?: number;
    hourlyRate?: number;
    projectName?: string;
  };

  // 🔥 SUBSCRIPTION
  subscriptionDetails?: {
    planName: string;
    planPrice: number;
    billingCycle: "monthly" | "yearly";
    startDate: string;
    endDate?: string;
    nextBillingDate?: string;
  };

  // 🔥 SHIPPING (NEW 🔥)
  shipping?: {
    cost: number;
    method?: string; // DHL, Pickup, etc.
    address?: string;
  };

  // 🔥 GLOBAL DISCOUNT
  discount: {
    type: "percentage" | "fixed";
    value: number;
  };

  // 🔥 GLOBAL TAX
  tax: {
    type: "percentage" | "fixed";
    value: number;
  };

  // 🔥 EXTRA FEES (VERY IMPORTANT)
  fees?: {
    label: string; // e.g. "Platform Fee"
    amount: number;
  }[];

  // 🔥 PAYMENTS
  paymentMethods?: {
    method: string;
    details: string;
  }[];

  payments?: Payment[];

  // 🔥 CALCULATED FIELDS
  subtotal?: number;
  totalTax?: number;
  totalDiscount?: number;
  totalPaid?: number;
  balanceDue?: number;

  total?: number;

  // 🔥 PROFESSIONAL TOUCH
  notes?: string;
  terms?: string;

  // 🔥 BRANDING
  logoUrl?: string;
  accentColor?: string;

  // 🔥 SYSTEM
  isDeleted?: boolean;

  createdAt?: string;
  updatedAt?: string;
}
