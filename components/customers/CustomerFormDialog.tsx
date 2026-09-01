"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import {
  useCreateCustomer,
  useUpdateCustomer,
  type Customer,
  type CreateCustomerPayload,
} from "@/hooks/useCustomers";
import { toast } from "sonner";
import { CustomerCompanyContactFields } from "./CustomerCompanyContactFields";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

const emptyForm: CreateCustomerPayload = {
  name: "",
  email: "",
  phone: "",
  company: null,
  contact: null,
  billingAddress: { street: "", city: "", state: "", country: "", zip: "" },
  status: "active",
  currency: "USD",
  notes: "",
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
}: CustomerFormDialogProps) {
  const isEditing = !!customer;
  const [form, setForm] = useState<CreateCustomerPayload>(emptyForm);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isSubmitting = createCustomer.isPending || updateCustomer.isPending;

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        company: customer.company?._id || null,
        contact: customer.contact?._id || null,
        billingAddress: {
          street: customer.billingAddress?.street || "",
          city: customer.billingAddress?.city || "",
          state: customer.billingAddress?.state || "",
          country: customer.billingAddress?.country || "",
          zip: customer.billingAddress?.zip || "",
        },
        status: customer.status,
        currency: customer.currency,
        notes: customer.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [customer, open]);

  const handleChange = (field: keyof CreateCustomerPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (
    field: keyof NonNullable<CreateCustomerPayload["billingAddress"]>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      if (isEditing && customer) {
        await updateCustomer.mutateAsync({ id: customer._id, data: form });
        toast.success("Customer updated");
      } else {
        await createCustomer.mutateAsync(form);
        toast.success("Customer created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(isEditing ? "Failed to update customer" : "Failed to create customer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Customer" : "New Customer"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="billing@acme.com"
              />
            </div>
          </div>

          <CustomerCompanyContactFields
            company={form.company}
            contact={form.contact}
            onCompanyChange={(id) => setForm((prev) => ({ ...prev, company: id }))}
            onContactChange={(id) => setForm((prev) => ({ ...prev, contact: id }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleChange("status", v)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="delinquent">Delinquent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Billing Address</Label>
            <Input
              placeholder="Street"
              value={form.billingAddress?.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="City"
                value={form.billingAddress?.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
              />
              <Input
                placeholder="State"
                value={form.billingAddress?.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
              />
              <Input
                placeholder="Zip"
                value={form.billingAddress?.zip}
                onChange={(e) => handleAddressChange("zip", e.target.value)}
              />
            </div>
            <Input
              placeholder="Country"
              value={form.billingAddress?.country}
              onChange={(e) => handleAddressChange("country", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={form.currency}
                onChange={(e) =>
                  handleChange("currency", e.target.value.toUpperCase())
                }
                maxLength={3}
                placeholder="USD"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              placeholder="Internal notes about this customer..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}