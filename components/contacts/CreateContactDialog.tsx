// components/contacts/CreateContactDialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import {
  useCreateContact,
  useUpdateContact,
} from "@/hooks/useContacts";
import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
  ContactStage,
  RelatedTo,
} from "@/hooks/useContacts";
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
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  Users,
  Target,
  Search,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Related entity config — Contact can only link to these three types,
// per contact.model.js's relatedTo enum (narrower than Task's six types) ──────

const relatedToConfig: Record<
  RelatedTo,
  { label: string; icon: React.ElementType; searchEndpoint: string }
> = {
  Company: { label: "Company", icon: Building2, searchEndpoint: "/companies" },
  Customer: { label: "Customer", icon: Users, searchEndpoint: "/customers" },
  Lead: { label: "Lead", icon: Target, searchEndpoint: "/leads" },
};

const relatedToTypes = Object.keys(relatedToConfig) as RelatedTo[];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editContact?: Contact | null;
  defaultRelatedId?: string; // fixed context — e.g. opened from a Company's own page
  defaultRelatedTo?: RelatedTo;
  defaultRelatedLabel?: string; // display name for the locked chip
  onSuccess?: (contact: Contact) => void;
}

// ─── Stage options ─────────────────────────────────────────────────────────────

const STAGE_OPTIONS: { value: ContactStage; label: string }[] = [
  { value: "subscriber", label: "Subscriber" },
  { value: "lead", label: "Lead" },
  { value: "opportunity", label: "Opportunity" },
  { value: "customer", label: "Customer" },
  { value: "evangelist", label: "Evangelist" },
  { value: "other", label: "Other" },
];

// ─── Field Error ───────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle size={11} />
      {message}
    </span>
  );
}

// ─── Generic related-record search combobox (Company / Customer / Lead) ───────
// Same pattern as CreateTaskDialog's RelatedRecordCombobox — one component
// covering all three possible types via relatedToConfig, rather than three
// near-duplicate company/customer/lead-specific comboboxes.

function RelatedRecordCombobox({
  relatedTo,
  selected,
  onSelect,
  onClear,
  disabled,
}: {
  relatedTo: RelatedTo;
  selected: { _id: string; name: string } | null;
  onSelect: (record: { _id: string; name: string }) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [q, setQ] = useState("");
  const config = relatedToConfig[relatedTo];

  const { data: results, isLoading } = useQuery({
    queryKey: [config.searchEndpoint, "contact-link-search", q],
    queryFn: async () => {
      const res = await apiFetch(
        `${config.searchEndpoint}?search=${encodeURIComponent(q)}&limit=10`
      );
      const key = Object.keys(res.data || {}).find((k) => Array.isArray(res.data[k]));
      return (key ? res.data[key] : res.data ?? []) as any[];
    },
    enabled: q.length >= 1,
  });

  if (selected) {
    const Icon = config.icon;
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/40 h-9">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={13} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{selected.name}</span>
        </div>
        <button
          onClick={onClear}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search
        size={13}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${config.label.toLowerCase()}s...`}
        className="pl-8 h-9 text-sm"
        disabled={disabled}
      />
      {q.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          ) : !results || results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No {config.label.toLowerCase()}s found for "{q}"
            </p>
          ) : (
            <div className="max-h-44 overflow-y-auto">
              {results.map((record: any) => (
                <button
                  key={record._id}
                  onClick={() => {
                    onSelect({ _id: record._id, name: record.name });
                    setQ("");
                  }}
                  className="w-full flex flex-col px-3 py-2.5 text-left hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{record.name}</span>
                  {record.email && (
                    <span className="text-xs text-muted-foreground">{record.email}</span>
                  )}
                  {record.domain && (
                    <span className="text-xs text-muted-foreground">{record.domain}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Default form state ────────────────────────────────────────────────────────

const getDefaultForm = (contact?: Contact | null) => ({
  name: contact?.name ?? "",
  email: contact?.email ?? "",
  phone: contact?.phone ?? "",
  position: contact?.position ?? "",
  description: contact?.description ?? "",
  stage: (contact?.stage ?? "lead") as ContactStage,
  linkedin: contact?.social?.linkedin ?? "",
  twitter: contact?.social?.twitter ?? "",
});

// ─── Main Component ────────────────────────────────────────────────────────────

export function CreateContactDialog({
  open,
  onOpenChange,
  editContact,
  defaultRelatedId,
  defaultRelatedTo,
  defaultRelatedLabel,
  onSuccess,
}: CreateContactDialogProps) {
  const isEdit = !!editContact;
  const isFixedContext = !!defaultRelatedId && !!defaultRelatedTo;

  const [form, setForm] = useState(getDefaultForm(editContact));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Picker-mode state — only relevant when NOT in a fixed context
  const [pickerType, setPickerType] = useState<RelatedTo>("Company");
  const [pickerRecord, setPickerRecord] = useState<{ _id: string; name: string } | null>(null);

  const { mutate: createContact, isPending: isCreating } = useCreateContact();
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContact(
    editContact?._id ?? ""
  );
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    setForm(getDefaultForm(editContact));
    setErrors({});

    if (isFixedContext) {
      setPickerRecord(null);
      return;
    }

    // Editing an existing contact, no fixed context — pre-fill the picker
    // from the contact's own relatedTo/relatedId so its current link shows,
    // and it can be reassigned to something else if needed.
    if (editContact && typeof editContact.relatedId !== "string") {
      setPickerType(editContact.relatedTo);
      setPickerRecord({
        _id: editContact.relatedId._id,
        name: (editContact.relatedId as any).name ?? "",
      });
    } else {
      setPickerType("Company");
      setPickerRecord(null);
    }
  }, [open, editContact, isFixedContext]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePickerTypeChange = (type: RelatedTo) => {
    setPickerType(type);
    setPickerRecord(null); // switching type invalidates whatever record was picked
    if (errors.related) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.related;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Contact name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }
    if (!isFixedContext && !pickerRecord) {
      next.related = "Choose what this contact is linked to";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isPending) return;

    const relatedId = isFixedContext ? defaultRelatedId! : pickerRecord!._id;
    const relatedTo = isFixedContext ? defaultRelatedTo! : pickerType;

    const payload: CreateContactPayload = {
      name: form.name.trim(),
      stage: form.stage,
      relatedId,
      relatedTo,
    };

    if (form.email.trim()) payload.email = form.email.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.position.trim()) payload.position = form.position.trim();
    if (form.description.trim()) payload.description = form.description.trim();

    const social: Record<string, string> = {};
    if (form.linkedin.trim()) social.linkedin = form.linkedin.trim();
    if (form.twitter.trim()) social.twitter = form.twitter.trim();
    if (Object.keys(social).length > 0) payload.social = social;

    if (isEdit) {
      updateContact(payload as UpdateContactPayload, {
        onSuccess: (updated) => {
          onSuccess?.(updated);
          onOpenChange(false);
        },
      });
    } else {
      createContact(payload, {
        onSuccess: (created) => {
          onSuccess?.(created);
          onOpenChange(false);
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const fixedConfig = defaultRelatedTo ? relatedToConfig[defaultRelatedTo] : null;
  const FixedIcon = fixedConfig?.icon ?? Building2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <User size={16} className="text-primary" />
            {isEdit ? "Edit contact" : "New contact"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── Name ── */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="text-xs">
              Full name
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={cn(
                "h-9",
                errors.name && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isPending}
              autoFocus
            />
            <FieldError message={errors.name} />
          </div>

          {/* ── Email + Phone ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className={cn(
                  "h-9",
                  errors.email && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isPending}
              />
              <FieldError message={errors.email} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone" className="text-xs">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 000 0000"
                className="h-9"
                disabled={isPending}
              />
            </div>
          </div>

          {/* ── Position + Stage ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="position" className="text-xs">
                Job title
              </Label>
              <Input
                id="position"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Sales Manager"
                className="h-9"
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Stage</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-between text-sm"
                    disabled={isPending}
                  >
                    {STAGE_OPTIONS.find((s) => s.value === form.stage)
                      ?.label ?? "Lead"}
                    <ChevronDown size={13} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44">
                  {STAGE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, stage: opt.value }))
                      }
                      className={cn(
                        "text-xs",
                        form.stage === opt.value && "bg-muted"
                      )}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Linked to: locked chip OR type + record picker ── */}
          {isFixedContext ? (
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Linked to</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/40 h-9">
                <FixedIcon size={13} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">
                  {defaultRelatedLabel || defaultRelatedId}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Label className="text-xs">
                Linked to
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={pickerType}
                  onValueChange={(v) => handlePickerTypeChange(v as RelatedTo)}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {relatedToTypes.map((type) => {
                      const Icon = relatedToConfig[type].icon;
                      return (
                        <SelectItem key={type} value={type}>
                          <span className="flex items-center gap-2">
                            <Icon size={13} className="text-muted-foreground" />
                            {relatedToConfig[type].label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <RelatedRecordCombobox
                  relatedTo={pickerType}
                  selected={pickerRecord}
                  onSelect={setPickerRecord}
                  onClear={() => setPickerRecord(null)}
                  disabled={isPending}
                />
              </div>
              <FieldError message={errors.related} />
            </div>
          )}

          {/* ── Description ── */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="description" className="text-xs">
              Notes
              <span className="text-muted-foreground ml-1 font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Any notes about this contact..."
              rows={3}
              className="resize-none text-sm"
              disabled={isPending}
            />
          </div>

          {/* ── Social ── */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Social links
            </Label>
            <Input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
              className="h-9 text-sm"
              disabled={isPending}
            />
            <Input
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
              className="h-9 text-sm"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center gap-1 mr-auto">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">⌘</kbd>
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">↵</kbd>
            <span className="text-[11px] text-muted-foreground ml-0.5">to save</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create contact"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}