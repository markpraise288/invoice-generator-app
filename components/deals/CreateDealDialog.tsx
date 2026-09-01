// components/deals/CreateDealDialog.tsx

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useCreateDeal, dealStageConfig, formatDealValue } from "@/hooks/useDeals";
import type { DealStage, CreateDealPayload, DealRelatedTo } from "@/hooks/useDeals";
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
  ChevronDown,
  Search,
  X,
  Building2,
  User,
  Target,
  Users,
  Loader2,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Related entity config — Deal's full four-type enum ────────────────────────

const relatedToConfig: Record<
  DealRelatedTo,
  { label: string; icon: React.ElementType; searchEndpoint: string }
> = {
  Lead: { label: "Lead", icon: Target, searchEndpoint: "/leads" },
  Customer: { label: "Customer", icon: Users, searchEndpoint: "/customers" },
  Company: { label: "Company", icon: Building2, searchEndpoint: "/companies" },
  Contact: { label: "Contact", icon: User, searchEndpoint: "/contacts" },
};

const relatedToTypes = Object.keys(relatedToConfig) as DealRelatedTo[];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStage?: DealStage;
  defaultRelatedId?: string; // fixed context — e.g. opened from a Company's/Contact's own page
  defaultRelatedTo?: DealRelatedTo;
  defaultRelatedLabel?: string; // display name for the locked chip
  onSuccess?: () => void;
}

// ─── Default state ─────────────────────────────────────────────────────────────

const getDefaultState = (defaultStage?: DealStage) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 30);
  const pad = (n: number) => String(n).padStart(2, "0");
  const defaultClose = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

  return {
    title: "",
    valueDollars: "",
    stage: (defaultStage ?? "prospecting") as DealStage,
    probability: dealStageConfig[defaultStage ?? "prospecting"].probability,
    closeDate: defaultClose,
    description: "",
  };
};

// ─── Field error ───────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle size={11} />
      {message}
    </span>
  );
}

// ─── Related record search combobox (Lead / Customer / Company / Contact) ─────
// Same pattern as CreateContactDialog / CreateCompanyDialog's version, now
// covering all four of Deal's possible relatedTo types.

function RelatedRecordCombobox({
  relatedTo,
  selected,
  onSelect,
  onClear,
  disabled,
}: {
  relatedTo: DealRelatedTo;
  selected: { _id: string; name: string; subtitle?: string } | null;
  onSelect: (record: { _id: string; name: string; subtitle?: string }) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [q, setQ] = useState("");
  const config = relatedToConfig[relatedTo];

  const { data: results, isLoading } = useQuery({
    queryKey: [config.searchEndpoint, "deal-link-search", q],
    queryFn: async () => {
      const res = await apiFetch(
        `${config.searchEndpoint}?search=${encodeURIComponent(q)}&limit=10`
      );
      const key = Object.keys(res.data || {}).find((k) => Array.isArray(res.data[k]));
      return (key ? res.data[key] : res.data ?? []) as any[];
    },
    enabled: q.length >= 1,
  });

  const Icon = config.icon;

  const subtitleFor = (record: any) =>
    [record.position, record.email, record.domain].filter(Boolean).join(" · ") || undefined;

  if (selected) {
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
      {q && (
        <button
          onClick={() => setQ("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={12} />
        </button>
      )}
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
                    onSelect({
                      _id: record._id,
                      name: record.name,
                      subtitle: subtitleFor(record),
                    });
                    setQ("");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                >
                  <Icon size={13} className="text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{record.name}</p>
                    {subtitleFor(record) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {subtitleFor(record)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stage Selector ────────────────────────────────────────────────────────────

function StageSelector({
  value,
  onChange,
}: {
  value: DealStage;
  onChange: (stage: DealStage) => void;
}) {
  const config = dealStageConfig[value];
  const stages = Object.entries(dealStageConfig) as [
    DealStage,
    (typeof dealStageConfig)[DealStage]
  ][];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between h-9 text-sm font-medium",
            config.textClass
          )}
        >
          <span className="flex items-center gap-2">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </span>
          <ChevronDown size={13} className="opacity-60 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[200px]">
        {stages.map(([stage, conf]) => (
          <DropdownMenuItem
            key={stage}
            onClick={() => onChange(stage)}
            className={cn(
              "text-xs gap-2",
              stage === value && "bg-muted"
            )}
          >
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: conf.color }}
            />
            <span className="flex-1">{conf.label}</span>
            {stage === value && (
              <span className="text-[10px] text-muted-foreground">
                current
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CreateDealDialog({
  open,
  onOpenChange,
  defaultStage,
  defaultRelatedId,
  defaultRelatedTo,
  defaultRelatedLabel,
  onSuccess,
}: CreateDealDialogProps) {
  const isFixedContext = !!defaultRelatedId && !!defaultRelatedTo;

  const [form, setForm] = useState(getDefaultState(defaultStage));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Picker-mode state — relevant even in fixed-context mode is skipped entirely
  const [pickerType, setPickerType] = useState<DealRelatedTo>("Lead");
  const [pickerRecord, setPickerRecord] = useState<{
    _id: string;
    name: string;
    subtitle?: string;
  } | null>(null);

  const { mutate: createDeal, isPending } = useCreateDeal();

  useEffect(() => {
    if (open) {
      setForm(getDefaultState(defaultStage));
      setErrors({});
      setPickerType("Lead");
      setPickerRecord(null);
    }
  }, [open, defaultStage]);

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

  const handleStageChange = (stage: DealStage) => {
    setForm((prev) => ({
      ...prev,
      stage,
      probability: dealStageConfig[stage].probability,
    }));
  };

  const handlePickerTypeChange = (type: DealRelatedTo) => {
    setPickerType(type);
    setPickerRecord(null); // switching type invalidates whatever record was picked
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Deal title is required";
    if (!form.valueDollars) {
      next.valueDollars = "Deal value is required";
    } else if (isNaN(Number(form.valueDollars)) || Number(form.valueDollars) < 0) {
      next.valueDollars = "Enter a valid positive number";
    }
    if (!form.closeDate) next.closeDate = "Close date is required";
    // Note: relatedId is intentionally NOT required here — per the schema,
    // relatedTo alone can be set without a specific record picked yet. Only
    // relatedTo needs a value, and it always has one (defaults to "Lead" in
    // picker mode, or comes from defaultRelatedTo in fixed-context mode).
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isPending) return;

    const relatedTo = isFixedContext ? defaultRelatedTo! : pickerType;
    const relatedId = isFixedContext ? defaultRelatedId : pickerRecord?._id;

    const payload: CreateDealPayload = {
      title: form.title.trim(),
      value: Math.round(Number(form.valueDollars) * 100), // dollars → cents
      stage: form.stage,
      probability: form.probability,
      closeDate: new Date(form.closeDate).toISOString(),
      relatedTo,
    };

    if (relatedId) payload.relatedId = relatedId;
    if (form.description.trim()) {
      payload.description = form.description.trim();
    }

    createDeal(payload, {
      onSuccess: () => {
        setForm(getDefaultState(defaultStage));
        setErrors({});
        setPickerType("Lead");
        setPickerRecord(null);
        onSuccess?.();
        onOpenChange(false);
      },
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(getDefaultState(defaultStage));
      setErrors({});
      setPickerType("Lead");
      setPickerRecord(null);
    }
    onOpenChange(next);
  };

  // Live preview of weighted value
  const valueInCents = Math.round(Number(form.valueDollars || 0) * 100);
  const weightedValue = Math.round((valueInCents * form.probability) / 100);

  const fixedConfig = defaultRelatedTo ? relatedToConfig[defaultRelatedTo] : null;
  const FixedIcon = fixedConfig?.icon ?? Target;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <DollarSign size={16} className="text-primary" />
            New Deal
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── Title ── */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="title" className="text-xs">
              Deal title
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Acme Corp — Enterprise Plan"
              className={cn(
                "h-9",
                errors.title &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isPending}
              autoFocus
            />
            <FieldError message={errors.title} />
          </div>

          {/* ── Value + probability ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="valueDollars" className="text-xs">
                Value (USD)
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="valueDollars"
                  name="valueDollars"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.valueDollars}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={cn(
                    "h-9 pl-6",
                    errors.valueDollars &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isPending}
                />
              </div>
              <FieldError message={errors.valueDollars} />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="probability" className="text-xs">
                <span className="inline-flex items-center gap-1">
                  <TrendingUp size={11} />
                  Win probability
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="probability"
                  name="probability"
                  type="number"
                  min={0}
                  max={100}
                  value={form.probability}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      probability: Math.min(
                        100,
                        Math.max(0, Number(e.target.value))
                      ),
                    }))
                  }
                  className="h-9 pr-6"
                  disabled={isPending}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  %
                </span>
              </div>
              {valueInCents > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  Weighted: {formatDealValue(weightedValue)}
                </span>
              )}
            </div>
          </div>

          {/* ── Stage + close date ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Stage</Label>
              <StageSelector
                value={form.stage}
                onChange={handleStageChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="closeDate" className="text-xs">
                Expected close
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="closeDate"
                name="closeDate"
                type="date"
                value={form.closeDate}
                onChange={handleChange}
                className={cn(
                  "h-9 text-sm",
                  errors.closeDate &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isPending}
              />
              <FieldError message={errors.closeDate} />
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
                <span className="text-muted-foreground ml-1 font-normal">
                  (optional)
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={pickerType}
                  onValueChange={(v) => handlePickerTypeChange(v as DealRelatedTo)}
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
            </div>
          )}

          {/* ── Description ── */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="description" className="text-xs">
              Description
              <span className="text-muted-foreground ml-1 font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deal context, notes, or next steps..."
              rows={3}
              className="resize-none text-sm"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center gap-1 mr-auto">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
              ⌘
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
              ↵
            </kbd>
            <span className="text-[11px] text-muted-foreground ml-0.5">
              to save
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create deal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}