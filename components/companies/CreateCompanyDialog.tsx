// components/companies/CreateCompanyDialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import {
  useCreateCompany,
  useUpdateCompany,
} from "@/hooks/useCompanies";
import type {
  Company,
  CreateCompanyPayload,
  UpdateCompanyPayload,
  CompanySize,
  CompanyRelatedTo,
} from "@/hooks/useCompanies";
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
  Building2,
  Globe,
  Phone,
  Mail,
  DollarSign,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Target,
  Users,
  Search as SearchIcon,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Related entity config — Company only links to Lead or Customer,
// per company.model.js's narrower relatedTo enum ──────────────────────────────

const relatedToConfig: Record<
  CompanyRelatedTo,
  { label: string; icon: React.ElementType; searchEndpoint: string }
> = {
  Lead: { label: "Lead", icon: Target, searchEndpoint: "/leads" },
  Customer: { label: "Customer", icon: Users, searchEndpoint: "/customers" },
};

const relatedToTypes = Object.keys(relatedToConfig) as CompanyRelatedTo[];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCompany?: Company | null;
  defaultRelatedId?: string; // fixed context — e.g. opened from a Lead's or Customer's own page
  defaultRelatedTo?: CompanyRelatedTo;
  defaultRelatedLabel?: string; // display name for the locked chip
  onSuccess?: (company: Company) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Marketing",
  "Legal",
  "Real Estate",
  "Other",
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

// ─── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-1">
      {children}
    </p>
  );
}

// ─── Related record search combobox (Lead / Customer) ─────────────────────────
// Same pattern as CreateContactDialog's RelatedRecordCombobox, narrowed to
// the two types Company can actually link to.

function RelatedRecordCombobox({
  relatedTo,
  selected,
  onSelect,
  onClear,
  disabled,
}: {
  relatedTo: CompanyRelatedTo;
  selected: { _id: string; name: string } | null;
  onSelect: (record: { _id: string; name: string }) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [q, setQ] = useState("");
  const config = relatedToConfig[relatedTo];

  const { data: results, isLoading } = useQuery({
    queryKey: [config.searchEndpoint, "company-link-search", q],
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
      <SearchIcon
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

const getDefaultForm = (company?: Company | null) => ({
  name: company?.name ?? "",
  domain: company?.domain ?? "",
  website: company?.website ?? "",
  industry: company?.industry ?? "",
  size: (company?.size ?? "") as CompanySize | "",
  phone: company?.phone ?? "",
  email: company?.email ?? "",
  description: company?.description ?? "",
  revenueDollars: company?.revenue ? String(company.revenue / 100) : "",
  street: company?.address?.street ?? "",
  city: company?.address?.city ?? "",
  state: company?.address?.state ?? "",
  country: company?.address?.country ?? "",
  zip: company?.address?.zip ?? "",
});

// ─── Main Component ────────────────────────────────────────────────────────────

export function CreateCompanyDialog({
  open,
  onOpenChange,
  editCompany,
  defaultRelatedId,
  defaultRelatedTo,
  defaultRelatedLabel,
  onSuccess,
}: CreateCompanyDialogProps) {
  const isEdit = !!editCompany;
  const isFixedContext = !!defaultRelatedId && !!defaultRelatedTo;

  const [form, setForm] = useState(getDefaultForm(editCompany));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Picker-mode state — only relevant when NOT in a fixed context
  const [pickerType, setPickerType] = useState<CompanyRelatedTo>("Lead");
  const [pickerRecord, setPickerRecord] = useState<{ _id: string; name: string } | null>(null);

  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany(
    editCompany?._id ?? ""
  );
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;

    setForm(getDefaultForm(editCompany));
    setErrors({});

    if (isFixedContext) {
      setPickerRecord(null);
      return;
    }

    // Editing an existing company, no fixed context — pre-fill the picker
    // from the company's own relatedTo/relatedId so its current link shows,
    // and it can be reassigned (e.g. from one Customer to another) if needed.
    if (editCompany && typeof editCompany.relatedId !== "string") {
      setPickerType(editCompany.relatedTo);
      setPickerRecord({
        _id: editCompany.relatedId._id,
        name: (editCompany.relatedId as any).name ?? "",
      });
    } else {
      setPickerType("Lead");
      setPickerRecord(null);
    }
  }, [open, editCompany, isFixedContext]);

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

  const handlePickerTypeChange = (type: CompanyRelatedTo) => {
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
    if (!form.name.trim()) next.name = "Company name is required";
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      next.website = "Website must start with http:// or https://";
    }
    if (
      form.domain &&
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(
        form.domain.toLowerCase()
      )
    ) {
      next.domain = "Enter a valid domain e.g. acme.com";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }
    if (
      form.revenueDollars &&
      (isNaN(Number(form.revenueDollars)) || Number(form.revenueDollars) < 0)
    ) {
      next.revenueDollars = "Enter a valid positive number";
    }
    if (!isFixedContext && !pickerRecord) {
      next.related = "Choose a Lead or Customer to link this company to";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isPending) return;

    const relatedId = isFixedContext ? defaultRelatedId! : pickerRecord!._id;
    const relatedTo = isFixedContext ? defaultRelatedTo! : pickerType;

    const payload: CreateCompanyPayload = {
      name: form.name.trim(),
      relatedId,
      relatedTo,
    };

    if (form.domain.trim()) payload.domain = form.domain.trim().toLowerCase();
    if (form.website.trim()) payload.website = form.website.trim();
    if (form.industry) payload.industry = form.industry;
    if (form.size) payload.size = form.size as CompanySize;
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.email.trim()) payload.email = form.email.trim().toLowerCase();
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.revenueDollars)
      payload.revenue = Math.round(Number(form.revenueDollars) * 100);

    const address: Record<string, string> = {};
    if (form.street.trim()) address.street = form.street.trim();
    if (form.city.trim()) address.city = form.city.trim();
    if (form.state.trim()) address.state = form.state.trim();
    if (form.country.trim()) address.country = form.country.trim();
    if (form.zip.trim()) address.zip = form.zip.trim();
    if (Object.keys(address).length > 0) payload.address = address;

    if (isEdit) {
      updateCompany(payload as UpdateCompanyPayload, {
        onSuccess: (updated) => {
          onSuccess?.(updated);
          onOpenChange(false);
        },
      });
    } else {
      createCompany(payload, {
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
  const FixedIcon = fixedConfig?.icon ?? Target;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Building2 size={16} className="text-primary" />
            {isEdit ? "Edit company" : "New company"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── Identity ── */}
          <SectionLabel>Company identity</SectionLabel>

          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="text-xs">
              Company name
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Acme Inc"
              className={cn(
                "h-9",
                errors.name && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isPending}
              autoFocus
            />
            <FieldError message={errors.name} />
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
                  onValueChange={(v) => handlePickerTypeChange(v as CompanyRelatedTo)}
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

          {/* Domain + Website */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="domain" className="text-xs">
                Domain
              </Label>
              <Input
                id="domain"
                name="domain"
                value={form.domain}
                onChange={handleChange}
                placeholder="acme.com"
                className={cn(
                  "h-9",
                  errors.domain && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isPending}
              />
              <FieldError message={errors.domain} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="website" className="text-xs">
                Website
              </Label>
              <div className="relative">
                <Globe
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://acme.com"
                  className={cn(
                    "h-9 pl-8",
                    errors.website && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isPending}
                />
              </div>
              <FieldError message={errors.website} />
            </div>
          </div>

          {/* Industry + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Industry</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-between text-sm font-normal"
                    disabled={isPending}
                  >
                    <span
                      className={form.industry ? "text-foreground" : "text-muted-foreground"}
                    >
                      {form.industry || "Select industry"}
                    </span>
                    <ChevronDown size={13} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    onClick={() => setForm((prev) => ({ ...prev, industry: "" }))}
                    className="text-xs text-muted-foreground"
                  >
                    None
                  </DropdownMenuItem>
                  {INDUSTRIES.map((ind) => (
                    <DropdownMenuItem
                      key={ind}
                      onClick={() => setForm((prev) => ({ ...prev, industry: ind }))}
                      className={cn("text-xs", form.industry === ind && "bg-muted")}
                    >
                      {ind}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs">Company size</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-between text-sm font-normal"
                    disabled={isPending}
                  >
                    <span className={form.size ? "text-foreground" : "text-muted-foreground"}>
                      {COMPANY_SIZES.find((s) => s.value === form.size)?.label ?? "Select size"}
                    </span>
                    <ChevronDown size={13} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    onClick={() => setForm((prev) => ({ ...prev, size: "" }))}
                    className="text-xs text-muted-foreground"
                  >
                    None
                  </DropdownMenuItem>
                  {COMPANY_SIZES.map((s) => (
                    <DropdownMenuItem
                      key={s.value}
                      onClick={() => setForm((prev) => ({ ...prev, size: s.value }))}
                      className={cn("text-xs", form.size === s.value && "bg-muted")}
                    >
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Contact info ── */}
          <SectionLabel>Contact information</SectionLabel>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone" className="text-xs">
                Phone
              </Label>
              <div className="relative">
                <Phone
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 555 000 0000"
                  className="h-9 pl-8"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <div className="relative">
                <Mail
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="hello@acme.com"
                  className={cn(
                    "h-9 pl-8",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isPending}
                />
              </div>
              <FieldError message={errors.email} />
            </div>
          </div>

          {/* Revenue */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="revenueDollars" className="text-xs">
              Annual revenue (USD)
            </Label>
            <div className="relative max-w-50">
              <DollarSign
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                id="revenueDollars"
                name="revenueDollars"
                type="number"
                min={0}
                step={1000}
                value={form.revenueDollars}
                onChange={handleChange}
                placeholder="0"
                className={cn(
                  "h-9 pl-8",
                  errors.revenueDollars && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isPending}
              />
            </div>
            <FieldError message={errors.revenueDollars} />
          </div>

          {/* ── Address ── */}
          <SectionLabel>Address</SectionLabel>

          <div className="flex flex-col gap-2.5">
            <Input
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Street address"
              className="h-9 text-sm"
              disabled={isPending}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="h-9 text-sm"
                disabled={isPending}
              />
              <Input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State / Province"
                className="h-9 text-sm"
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Country"
                className="h-9 text-sm"
                disabled={isPending}
              />
              <Input
                name="zip"
                value={form.zip}
                onChange={handleChange}
                placeholder="ZIP / Postal code"
                className="h-9 text-sm"
                disabled={isPending}
              />
            </div>
          </div>

          {/* ── Notes ── */}
          <SectionLabel>Notes</SectionLabel>

          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Any notes about this company..."
            rows={3}
            className="resize-none text-sm"
            disabled={isPending}
          />
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
              "Create company"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}