// components/deals/DealDetailsDrawer.tsx

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useUpdateDeal, useMoveStage, useDeleteDeal, dealStageConfig, formatDealValue } from "@/hooks/useDeals";
import type { Deal, DealStage, DealRelatedTo, UpdateDealPayload } from "@/hooks/useDeals";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  X,
  Trash2,
  Building2,
  User,
  Target,
  Users,
  CalendarClock,
  TrendingUp,
  Check,
  AlertTriangle,
  DollarSign,
  Trophy,
  XCircle,
  MoreHorizontal,
  Loader2,
  type LucideIcon,
} from "lucide-react";

// ─── Related entity display config (icon + label per type) ────────────────────
// Mirrors relatedToConfig in CreateDealDialog — Deal's full four-type enum.

const relatedToDisplay: Record<DealRelatedTo, { icon: React.ElementType; label: string }> = {
  Lead: { icon: Target, label: "Lead" },
  Customer: { icon: Users, label: "Customer" },
  Company: { icon: Building2, label: "Company" },
  Contact: { icon: User, label: "Contact" },
};

// ─── Helpers for the polymorphic relatedId field ───────────────────────────────
// Same unwrapping pattern used across every polymorphic model this conversation.

function getRelatedId(deal: Deal): string | null {
  if (!deal.relatedId) return null;
  return typeof deal.relatedId === "string" ? deal.relatedId : deal.relatedId._id;
}

function getRelatedLabel(deal: Deal): string | null {
  if (!deal.relatedId || typeof deal.relatedId === "string") return null;
  return (deal.relatedId.name as string) ?? null;
}

function getRelatedSubtitle(deal: Deal): string | null {
  if (!deal.relatedId || typeof deal.relatedId === "string") return null;
  const record = deal.relatedId;
  return ([record.position, record.email, record.domain].filter(Boolean).join(" · ")) || null;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DealDetailsDrawerProps {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
  // Optional — lets the parent navigate to the linked record's own page/drawer
  onRelatedClick?: (relatedTo: DealRelatedTo, relatedId: string) => void;
}

// ─── Stage Pipeline Indicator ──────────────────────────────────────────────────

function StagePipeline({
  currentStage,
  onMove,
  isPending,
}: {
  currentStage: DealStage;
  onMove: (stage: DealStage) => void;
  isPending: boolean;
}) {
  const openStages: DealStage[] = [
    "prospecting",
    "qualification",
    "proposal",
    "negotiation",
    "contract_sent",
  ];

  const currentIndex = openStages.indexOf(currentStage);
  const isClosed =
    currentStage === "closed_won" || currentStage === "closed_lost";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {openStages.map((stage, index) => {
          const config = dealStageConfig[stage];
          const isActive = stage === currentStage;
          const isPast = !isClosed && index < currentIndex;

          return (
            <button
              key={stage}
              onClick={() => !isActive && onMove(stage)}
              disabled={isPending || isActive}
              title={config.label}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                isActive
                  ? "opacity-100"
                  : isPast
                  ? "opacity-60 hover:opacity-80"
                  : "opacity-20 hover:opacity-40",
                isPending && "cursor-not-allowed"
              )}
              style={{
                backgroundColor:
                  isActive || isPast ? config.color : "#e2e8f0",
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs font-semibold",
            dealStageConfig[currentStage].textClass
          )}
        >
          {dealStageConfig[currentStage].label}
        </span>

        {isClosed ? (
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] h-5 px-2",
              currentStage === "closed_won"
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
            )}
          >
            {currentStage === "closed_won" ? (
              <><Trophy size={9} className="mr-1" />Won</>
            ) : (
              <><XCircle size={9} className="mr-1" />Lost</>
            )}
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            {dealStageConfig[currentStage].probability}% default probability
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Inline Edit Field ─────────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  name,
  type = "text",
  placeholder,
  prefix,
  suffix,
  onSave,
  isPending,
}: {
  label: string;
  value: string;
  name: string;
  type?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  onSave: (name: string, value: string) => void;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);

  const handleSave = () => {
    if (local !== value) onSave(name, local);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setLocal(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            {prefix && (
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {prefix}
              </span>
            )}
            <Input
              type={type}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn("h-8 text-sm", prefix && "pl-6")}
              disabled={isPending}
              autoFocus
            />
            {suffix && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                {suffix}
              </span>
            )}
          </div>
          <Button
            size="icon"
            className="size-8 shrink-0"
            onClick={handleSave}
            disabled={isPending}
          >
            <Check size={13} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 shrink-0"
            onClick={() => {
              setLocal(value);
              setEditing(false);
            }}
          >
            <X size={13} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setLocal(value);
        setEditing(true);
      }}
      className="group flex flex-col gap-0.5 text-left w-full"
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {value || (
          <span className="text-muted-foreground font-normal italic">
            {placeholder ?? "Click to edit"}
          </span>
        )}
      </span>
    </button>
  );
}

// ─── Lost Reason Dialog ────────────────────────────────────────────────────────

function LostReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark deal as lost</AlertDialogTitle>
          <AlertDialogDescription>
            Optionally provide a reason for losing this deal. This helps
            improve your sales process over time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Budget constraints, chose competitor..."
          rows={3}
          className="resize-none text-sm mt-2"
          disabled={isPending}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className="bg-rose-500 text-white hover:bg-rose-600"
            onClick={() => onConfirm(reason)}
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin mr-1.5" />
            ) : null}
            Mark as lost
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Detail Row ────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-muted-foreground" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span
          className={cn(
            "text-sm font-medium text-foreground",
            onClick && "group-hover:text-primary transition-colors",
            className
          )}
        >
          {value}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="group flex items-start gap-3 text-left w-full">
        {content}
      </button>
    );
  }

  return <div className="flex items-start gap-3">{content}</div>;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DealDetailsDrawer({
  deal,
  open,
  onClose,
  onRelatedClick,
}: DealDetailsDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lostReasonOpen, setLostReasonOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState<DealStage | null>(null);

  const { mutate: updateDeal, isPending: isUpdating } = useUpdateDeal(
    deal?._id ?? ""
  );
  const { mutate: moveStage, isPending: isMoving } = useMoveStage(
    deal?._id ?? ""
  );
  const { mutate: deleteDeal, isPending: isDeleting } = useDeleteDeal();

  if (!deal) return null;

  const isClosed =
    deal.stage === "closed_won" || deal.stage === "closed_lost";

  const relatedId = getRelatedId(deal);
  const relatedLabel = getRelatedLabel(deal);
  const relatedSubtitle = getRelatedSubtitle(deal);
  const relatedDisplay = relatedToDisplay[deal.relatedTo];
  const RelatedIcon = (relatedDisplay?.icon as React.ComponentType<{ size?: number; className?: string }>) ?? Building2;

  // ── Field save ─────────────────────────────────────────────────────────────

  const handleFieldSave = (name: string, value: string) => {
    const payload: UpdateDealPayload = {};

    if (name === "title") payload.title = value;
    if (name === "valueDollars") {
      payload.value = Math.round(Number(value) * 100);
    }
    if (name === "probability") {
      payload.probability = Math.min(100, Math.max(0, Number(value)));
    }
    if (name === "closeDate") {
      payload.closeDate = new Date(value).toISOString();
    }
    if (name === "description") payload.description = value;

    if (Object.keys(payload).length > 0) {
      updateDeal(payload);
    }
  };

  // ── Stage move ─────────────────────────────────────────────────────────────

  const handleStageMove = (stage: DealStage) => {
    if (stage === "closed_lost") {
      setPendingStage(stage);
      setLostReasonOpen(true);
      return;
    }
    moveStage({ stage });
  };

  const handleLostConfirm = (reason: string) => {
    if (!pendingStage) return;
    moveStage(
      { stage: pendingStage, lostReason: reason || undefined },
      {
        onSuccess: () => {
          setLostReasonOpen(false);
          setPendingStage(null);
        },
      }
    );
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    deleteDeal(deal._id, {
      onSuccess: () => {
        setConfirmDelete(false);
        onClose();
      },
    });
  };

  const closeDateValue = deal.closeDate
    ? deal.closeDate.slice(0, 10)
    : "";

  const valueDollars = (deal.value / 100).toFixed(2);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-y-auto">
          {/* ── Header ── */}
          <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <h2 className="text-base font-bold text-foreground leading-snug">
                  {deal.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl font-bold text-foreground">
                    {formatDealValue(deal.value)}
                  </span>
                  {deal.isOverdue && !isClosed && (
                    <Badge
                      variant="secondary"
                      className="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 text-[10px] h-5"
                    >
                      <AlertTriangle size={9} className="mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 mr-5.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {!isClosed && (
                      <>
                        <DropdownMenuItem
                          className="text-xs text-emerald-600 focus:text-emerald-600"
                          onClick={() => handleStageMove("closed_won")}
                          disabled={isMoving}
                        >
                          <Trophy size={13} className="mr-2" />
                          Mark as won
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs text-rose-500 focus:text-rose-500"
                          onClick={() => handleStageMove("closed_lost")}
                          disabled={isMoving}
                        >
                          <XCircle size={13} className="mr-2" />
                          Mark as lost
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      className="text-xs text-destructive focus:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 size={13} className="mr-2" />
                      Delete deal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* ── Stage pipeline ── */}
            <div className="mt-3">
              <StagePipeline
                currentStage={deal.stage}
                onMove={handleStageMove}
                isPending={isMoving}
              />
            </div>
          </SheetHeader>

          {/* ── Body ── */}
          <div className="flex flex-col gap-6 px-6 py-5 flex-1">
            {/* ── Editable fields ── */}
            <div className="flex flex-col gap-4">
              <EditableField
                label="Deal title"
                value={deal.title}
                name="title"
                placeholder="Enter deal title"
                onSave={handleFieldSave}
                isPending={isUpdating}
              />

              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="Value (USD)"
                  value={valueDollars}
                  name="valueDollars"
                  type="number"
                  prefix="$"
                  onSave={handleFieldSave}
                  isPending={isUpdating}
                />
                <EditableField
                  label="Win probability"
                  value={String(deal.probability)}
                  name="probability"
                  type="number"
                  suffix="%"
                  onSave={handleFieldSave}
                  isPending={isUpdating}
                />
              </div>

              <EditableField
                label="Expected close date"
                value={closeDateValue}
                name="closeDate"
                type="date"
                onSave={handleFieldSave}
                isPending={isUpdating}
              />

              <EditableField
                label="Description"
                value={deal.description ?? ""}
                name="description"
                placeholder="Add deal context or notes..."
                onSave={handleFieldSave}
                isPending={isUpdating}
              />
            </div>

            <Separator />

            {/* ── Relations ── */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Relations
              </h3>
              {relatedLabel ? (
                <DetailRow
                  icon={RelatedIcon}
                  label={relatedDisplay?.label ?? "Linked to"}
                  value={
                    <span>
                      {relatedLabel}
                      {relatedSubtitle && (
                        <span className="text-muted-foreground font-normal">
                          {" · "}
                          {relatedSubtitle}
                        </span>
                      )}
                    </span>
                  }
                  onClick={
                    onRelatedClick && relatedId
                      ? () => onRelatedClick(deal.relatedTo, relatedId)
                      : undefined
                  }
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No specific {relatedDisplay?.label.toLowerCase() ?? "record"} linked yet
                </p>
              )}
            </div>

            <Separator />

            {/* ── Deal metrics ── */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  icon={DollarSign}
                  label="Weighted value"
                  value={formatDealValue(deal.value)}
                  className="text-primary"
                />
                <DetailRow
                  icon={TrendingUp}
                  label="Probability"
                  value={`${deal.probability}%`}
                />
                <DetailRow
                  icon={CalendarClock}
                  label="Close date"
                  value={
                    deal.closeDate
                      ? format(new Date(deal.closeDate), "MMM d, yyyy")
                      : "—"
                  }
                  className={deal.isOverdue && !isClosed ? "text-rose-500" : ""}
                />
                {deal.closedAt && (
                  <DetailRow
                    icon={Check}
                    label="Closed at"
                    value={format(new Date(deal.closedAt), "MMM d, yyyy")}
                    className={
                      deal.stage === "closed_won"
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }
                  />
                )}
              </div>

              {/* Lost reason */}
              {deal.stage === "closed_lost" && deal.lostReason && (
                <div className="rounded-lg border border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 px-3 py-2.5">
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">
                    Lost reason
                  </p>
                  <p className="text-sm text-foreground">
                    {deal.lostReason}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Meta ── */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Meta
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Owner</span>
                  <span className="text-xs font-medium text-foreground">
                    {deal.owner.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Created by
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {deal.createdBy.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Created
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(deal.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last updated
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(deal.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Lost reason dialog ── */}
      <LostReasonDialog
        open={lostReasonOpen}
        onOpenChange={setLostReasonOpen}
        onConfirm={handleLostConfirm}
        isPending={isMoving}
      />

      {/* ── Delete confirmation ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {deal.title}
              </span>{" "}
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}