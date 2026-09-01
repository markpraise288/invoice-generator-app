"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useConvertLead, type Lead } from "@/hooks/useLeads";
import { CustomerCompanyContactFields } from "@/components/customers/CustomerCompanyContactFields";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

export function ConvertLeadDialog({ open, onOpenChange, lead }: ConvertLeadDialogProps) {
  const router = useRouter();
  const convertLead = useConvertLead();

  const [company, setCompany] = useState<string | null>(null);
  const [contact, setContact] = useState<string | null>(null);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });

  if (!lead) return null;

  const alreadyConverted = !!lead.convertedCustomer;
  const notWon = lead.stage !== "won";
  const blocked = alreadyConverted || notWon;

  const handleConvert = async () => {
    try {
      const result = await convertLead.mutateAsync({
        id: lead._id,
        data: { billingAddress: address, company, contact },
      });
      toast.success(`${lead.name} converted to a customer`);
      onOpenChange(false);
      router.push(`/customers/${result.customer._id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert lead");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Convert to Customer</DialogTitle>
          <DialogDescription>
            This creates a new Customer record from <strong>{lead.name}</strong>'s details.
          </DialogDescription>
        </DialogHeader>

        {alreadyConverted ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Already converted to customer "{lead.convertedCustomer?.name}".
          </div>
        ) : notWon ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            Only leads in the "Won" stage can be converted. Move this lead to Won first.
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <CustomerCompanyContactFields
              company={company}
              contact={contact}
              onCompanyChange={setCompany}
              onContactChange={setContact}
            />

            <div className="grid gap-2">
              <Label>Billing Address (optional)</Label>
              <Input
                placeholder="Street"
                value={address.street}
                onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                />
                <Input
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                />
                <Input
                  placeholder="Zip"
                  value={address.zip}
                  onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Country"
                value={address.country}
                onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {blocked ? "Close" : "Cancel"}
          </Button>
          {!blocked && (
            <Button onClick={handleConvert} disabled={convertLead.isPending}>
              {convertLead.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Convert to Customer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}