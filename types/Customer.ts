export interface BillingAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  billingAddress?: BillingAddress;
  company?: { _id: string; name: string } | null;
  contact?: { _id: string; name: string; email: string } | null;
  status: "active" | "inactive" | "delinquent";
  totalRevenue: number;
  currency: string;
  notes?: string;
  owner?: { _id: string; name: string; email: string } | null;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}