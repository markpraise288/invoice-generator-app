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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Lock } from "lucide-react";
import {
  useCreateLead,
  useUpdateLead,
  type Lead,
  type CreateLeadPayload,
  type LeadSource,
} from "@/hooks/useLeads";
import { LeadScoreIndicator } from "@/components/leads/LeadScoreIndicator";
import { toast } from "sonner";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}

const emptyForm: CreateLeadPayload = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "other",
  score: 0,
  value: 0,
  currency: "USD",
  tags: [],
  notes: "",
};

const sourceLabels: Record<LeadSource, string> = {
  website: "Website",
  referral: "Referral",
  cold_outreach: "Cold Outreach",
  social_media: "Social Media",
  event: "Event",
  advertisement: "Advertisement",
  other: "Other",
};

export function LeadFormDialog({ open, onOpenChange, lead }: LeadFormDialogProps) {
  const isEditing = !!lead;
  const isLocked = !!lead?.convertedCustomer;

  const [form, setForm] = useState<CreateLeadPayload>(emptyForm);
  const [valueInput, setValueInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const isSubmitting = createLead.isPending || updateLead.isPending;

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        source: lead.source,
        score: lead.score,
        value: lead.value,
        currency: lead.currency,
        tags: lead.tags,
        notes: lead.notes || "",
      });
      setValueInput(lead.value ? (lead.value / 100).toString() : "");
      setTagsInput(lead.tags.join(", "));
    } else {
      setForm(emptyForm);
      setValueInput("");
      setTagsInput("");
    }
  }, [lead, open]);

  const handleSubmit = async () => {
    if (isLocked) return;

    if (!form.name?.trim() || !form.email?.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const payload: CreateLeadPayload = {
      ...form,
      value: Math.round(parseFloat(valueInput || "0") * 100),
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing && lead) {
        await updateLead.mutateAsync({ id: lead._id, data: payload });
        toast.success("Lead updated");
      } else {
        await createLead.mutateAsync(payload);
        toast.success("Lead created");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || (isEditing ? "Failed to update lead" : "Failed to create lead"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Lead" : "New Lead"}
            {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          </DialogTitle>
        </DialogHeader>

        {isLocked && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            This lead has been converted to a customer and can no longer be edited.
          </div>
        )}

        <fieldset disabled={isLocked} className="grid gap-4 py-2 disabled:opacity-60">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={form.source}
                onValueChange={(v: LeadSource) => setForm((f) => ({ ...f, source: v }))}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Estimated Value</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="score">Lead Score</Label>
              <LeadScoreIndicator score={form.score ?? 0} variant="compact" />
            </div>
            <Slider
              id="score"
              value={[form.score ?? 0]}
              onValueChange={([v]) => setForm((f) => ({ ...f, score: v }))}
              max={100}
              step={1}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="enterprise, urgent, upsell"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Context about this lead..."
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
              {isEditing ? "Save Changes" : "Create Lead"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}