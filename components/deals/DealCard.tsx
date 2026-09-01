// components/deals/DealCard.tsx

import { useState } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  Pencil,
  Building2,
  User,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  useDeleteDeal,
  useMoveStage,
  dealStageConfig,
  formatDealValue,
} from "@/hooks/useDeals";
import type { Deal, DealStage } from "@/hooks/useDeals";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  isDragging?: boolean;
}

// ─── Close Date Label ──────────────────────────────────────────────────────────

function CloseDateLabel({
  closeDate,
  isOverdue,
}: {
  closeDate: string;
  isOverdue: boolean;
}) {
  const date = new Date(closeDate);
  const label = isToday(date)
    ? "Closes today"
    : isTomorrow(date)
      ? "Closes tomorrow"
      : isOverdue
        ? `${format(date, "MMM d")} overdue`
        : `Close ${format(date, "MMM d")}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        isOverdue
          ? "text-rose-500"
          : isToday(date)
            ? "text-amber-500"
            : "text-muted-foreground",
      )}
      title={format(date, "PPP")}
    >
      {isOverdue ? <AlertTriangle size={10} /> : <CalendarClock size={10} />}
      {label}
    </span>
  );
}

// ─── Stage Move Menu ───────────────────────────────────────────────────────────

function StageMoveMenu({
  deal,
  onMoveTo,
}: {
  deal: Deal;
  onMoveTo: (stage: DealStage) => void;
}) {
  const stages = Object.entries(dealStageConfig) as [
    DealStage,
    (typeof dealStageConfig)[DealStage],
  ][];

  return (
    <>
      <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal px-2 pt-1">
        Move to stage
      </DropdownMenuLabel>
      {stages.map(([stage, config]) => (
        <DropdownMenuItem
          key={stage}
          onClick={() => onMoveTo(stage)}
          disabled={stage === deal.stage}
          className={cn(
            "text-xs gap-2",
            stage === deal.stage && "opacity-40 cursor-default",
          )}
        >
          <span
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: config.color }}
          />
          {config.label}
        </DropdownMenuItem>
      ))}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showStageMenu, setShowStageMenu] = useState(false);

  const { mutate: deleteDeal, isPending: isDeleting } = useDeleteDeal();
  const { mutate: moveStage } = useMoveStage(deal._id);

  const handleDelete = () => {
    deleteDeal(deal._id, {
      onSuccess: () => setConfirmDelete(false),
    });
  };

  const handleMoveStage = (stage: DealStage) => {
    moveStage({ stage });
    setShowStageMenu(false);
  };

  const stageConf = dealStageConfig[deal.stage];

  return (
    <>
      <div
        onClick={onClick}
        className={cn(
          "group relative flex flex-col gap-2.5 rounded-xl border border-border",
          "bg-card p-3 cursor-pointer transition-all",
          "hover:border-border/80 hover:shadow-sm",
          isDragging && "shadow-lg rotate-1 opacity-90 scale-[1.02]",
          deal.isOverdue && "border-rose-200/60 dark:border-rose-900/40",
        )}
      >
        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 flex-1">
            {deal.title}
          </p>

          {/* Actions menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu open={showStageMenu} onOpenChange={setShowStageMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-6 shrink-0 transition-opacity",
                    "opacity-0 group-hover:opacity-100",
                  )}
                >
                  <MoreHorizontal size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  className="text-xs"
                  onClick={() => onClick?.()}
                >
                  <Pencil size={13} className="mr-2" />
                  Edit deal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <StageMoveMenu deal={deal} onMoveTo={handleMoveStage} />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs text-destructive focus:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={13} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Value + probability ── */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-foreground">
            {formatDealValue(deal.value)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold",
              "px-1.5 py-0.5 rounded-md",
              stageConf.bgClass,
              stageConf.textClass,
            )}
          >
            <TrendingUp size={10} />
            {deal.probability}%
          </span>
        </div>

        {/* ── Contact + company ── */}
        {deal.relatedId && (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 size={11} className="shrink-0" />
              <span className="truncate">{deal.relatedId.name}</span>
            </span>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-border/50">
          <CloseDateLabel
            closeDate={deal.closeDate}
            isOverdue={deal.isOverdue}
          />

          {/* Weighted value */}
          <span className="text-[11px] text-muted-foreground">
            ~{formatDealValue(deal.value)}
          </span>
        </div>

        {/* ── Overdue indicator strip ── */}
        {deal.isOverdue && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500 rounded-t-xl" />
        )}
      </div>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deal.title}</span>{" "}
              will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
