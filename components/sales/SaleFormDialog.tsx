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
import { Loader2, Plus, Trash2, Lock } from "lucide-react";
import {
  useCreateSale,
  useUpdateSale,
  computeLineItemsPreview,
  type Sale,
  type CreateSaleLineItemInput,
  type CreateSalePayload,
} from "@/hooks/useSales";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale?: Sale | null;
}

interface CustomerOption {
  _id: string;
  name: string;
  email: string;
}

const emptyLineItem: CreateSaleLineItemInput = {
  description: "",
  quantity: 1,
  unitPrice: 0,
};

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100
  );
};

export function SaleFormDialog({ open, onOpenChange, sale }: SaleFormDialogProps) {
  const isEditing = !!sale;
  const isLocked = sale?.status === "paid" || sale?.status === "refunded";

  const [customer, setCustomer] = useState("");
  const [lineItems, setLineItems] = useState<CreateSaleLineItemInput[]>([
    { ...emptyLineItem },
  ]);
  const [priceInputs, setPriceInputs] = useState<string[]>([""]);
  const [discountInput, setDiscountInput] = useState("");
  const [taxInput, setTaxInput] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [notes, setNotes] = useState("");

  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const isSubmitting = createSale.isPending || updateSale.isPending;

  const { data: customers } = useQuery({
    queryKey: ["customers", "picker"],
    queryFn: async () => {
      const res = await apiFetch("/customers?limit=100");
      return (res.data?.customers ?? []) as CustomerOption[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (sale) {
      setCustomer(sale.customer._id);
      setLineItems(
        sale.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      );
      setPriceInputs(sale.lineItems.map((item) => (item.unitPrice / 100).toString()));
      setDiscountInput(sale.discount ? (sale.discount / 100).toString() : "");
      setTaxInput(sale.tax ? (sale.tax / 100).toString() : "");
      setSaleDate(sale.saleDate ? sale.saleDate.slice(0, 10) : "");
      setNotes(sale.notes || "");
    } else {
      setCustomer("");
      setLineItems([{ ...emptyLineItem }]);
      setPriceInputs([""]);
      setDiscountInput("");
      setTaxInput("");
      setSaleDate("");
      setNotes("");
    }
  }, [sale, open]);

  const updateLineItem = (index: number, patch: Partial<CreateSaleLineItemInput>) => {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const updatePriceInput = (index: number, value: string) => {
    setPriceInputs((prices) => prices.map((p, i) => (i === index ? value : p)));
    updateLineItem(index, { unitPrice: Math.round((parseFloat(value) || 0) * 100) });
  };

  const addLineItem = () => {
    setLineItems((items) => [...items, { ...emptyLineItem }]);
    setPriceInputs((prices) => [...prices, ""]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return; // always keep at least one row
    setLineItems((items) => items.filter((_, i) => i !== index));
    setPriceInputs((prices) => prices.filter((_, i) => i !== index));
  };

  const discount = Math.round((parseFloat(discountInput) || 0) * 100);
  const tax = Math.round((parseFloat(taxInput) || 0) * 100);
  const preview = computeLineItemsPreview(lineItems, discount, tax);

  const handleSubmit = async () => {
    if (isLocked) return;

    if (!customer) {
      toast.error("Please select a customer");
      return;
    }
    const validItems = lineItems.filter((item) => item.description.trim() && item.quantity > 0);
    if (!validItems.length) {
      toast.error("Add at least one line item with a description");
      return;
    }

    const payload: CreateSalePayload = {
      customer,
      lineItems: validItems,
      discount,
      tax,
      saleDate: saleDate || undefined,
      notes,
    };

    try {
      if (isEditing && sale) {
        await updateSale.mutateAsync({ id: sale._id, data: payload });
        toast.success("Sale updated");
      } else {
        await createSale.mutateAsync(payload);
        toast.success("Sale created");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || (isEditing ? "Failed to update sale" : "Failed to create sale"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-160 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? `Edit Sale ${sale?.saleNumber}` : "New Sale"}
            {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          </DialogTitle>
        </DialogHeader>

        {isLocked && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            This sale is {sale?.status} and can no longer be edited.
          </div>
        )}

        <fieldset disabled={isLocked} className="grid gap-4 py-2 disabled:opacity-60">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="saleDate">Sale Date</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
          </div>

          {/* LINE ITEMS */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, { description: e.target.value })}
                  />
                  <Input
                    className="w-20"
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(index, { quantity: parseInt(e.target.value, 10) || 1 })
                    }
                  />
                  <Input
                    className="w-28"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={priceInputs[index]}
                    onChange={(e) => updatePriceInput(index, e.target.value)}
                  />
                  <span className="flex h-9 w-24 shrink-0 items-center justify-end text-sm font-medium text-foreground">
                    {formatCurrency(item.quantity * (item.unitPrice || 0))}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-600"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tax">Tax</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                step="0.01"
                value={taxInput}
                onChange={(e) => setTaxInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* LIVE TOTALS PREVIEW */}
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(preview.subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>+{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t pt-1 font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(preview.total)}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Internal notes about this sale..."
            />
          </div>
        </fieldset>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {isLocked ? "Close" : "Cancel"}
          </Button>
          {!isLocked && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Sale"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}