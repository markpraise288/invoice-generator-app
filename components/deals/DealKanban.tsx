// components/deals/DealKanban.tsx

import { useEffect, useRef, useState } from "react";
import { useKanbanDeals, useMoveStage, dealStageConfig, formatDealValue } from "@/hooks/useDeals";
import type { Deal, DealStage } from "@/hooks/useDeals";
import { DealCard } from "./DealCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DealKanbanProps {
  onCreateDeal?: (stage?: DealStage) => void;
  onDealClick?: (deal: Deal) => void;
  ownerId?: string;
}

// ─── Open stages only (no closed_won / closed_lost) ───────────────────────────

const KANBAN_STAGES: DealStage[] = [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "contract_sent",
];

// ─── Column Skeleton ───────────────────────────────────────────────────────────

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-3 space-y-2.5"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="size-6 rounded" />
          </div>
          <Skeleton className="h-5 w-20" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Column Header ─────────────────────────────────────────────────────────────

function ColumnHeader({
  stage,
  count,
  totalValue,
  onAdd,
}: {
  stage: DealStage;
  count: number;
  totalValue: number;
  onAdd: () => void;
}) {
  const config = dealStageConfig[stage];

  return (
    <div className="flex items-center justify-between gap-2 mb-3 px-1">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="size-2.5 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs font-semibold text-foreground truncate">
          {config.label}
        </span>
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 h-4 font-medium shrink-0"
        >
          {count}
        </Badge>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] font-medium text-muted-foreground">
          {formatDealValue(totalValue)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 text-muted-foreground hover:text-foreground"
          onClick={onAdd}
        >
          <Plus size={13} />
        </Button>
      </div>
    </div>
  );
}

// ─── Drop Zone ─────────────────────────────────────────────────────────────────

function DropZone({
  isOver,
  isEmpty,
}: {
  isOver: boolean;
  isEmpty: boolean;
}) {
  if (!isOver && !isEmpty) return null;

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed transition-colors min-h-30",
        "flex items-center justify-center",
        isOver
          ? "border-primary/60 bg-primary/5"
          : "border-border/40 bg-muted/20"
      )}
    >
      {isEmpty && !isOver && (
        <p className="text-xs text-muted-foreground">No deals</p>
      )}
      {isOver && (
        <p className="text-xs text-primary font-medium">Drop here</p>
      )}
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  deals,
  totalValue,
  onDealClick,
  onCreateDeal,
  onDragStart,
  onDragEnd,
  onDrop,
  isLoading,
}: {
  stage: DealStage;
  deals: Deal[];
  totalValue: number;
  onDealClick?: (deal: Deal) => void;
  onCreateDeal?: () => void;
  onDragStart?: (dealId: string) => void;
  onDragEnd?: () => void;
  onDrop: (dealId: string, stage: DealStage) => void;
  isLoading?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only fire if leaving the column itself not a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = e.dataTransfer.getData("dealId");
    const fromStage = e.dataTransfer.getData("fromStage");
    if (dealId && fromStage !== stage) {
      onDrop(dealId, stage);
    }
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      <ColumnHeader
        stage={stage}
        count={deals.length}
        totalValue={totalValue}
        onAdd={onCreateDeal ?? (() => {})}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col gap-2 min-h-50 rounded-xl p-2 transition-colors",
          isDragOver
            ? "bg-primary/5 ring-2 ring-primary/20"
            : "bg-muted/30"
        )}
      >
        {isLoading ? (
          <ColumnSkeleton />
        ) : deals.length === 0 ? (
          <DropZone isOver={isDragOver} isEmpty />
        ) : (
          <>
            {isDragOver && deals.length > 0 && (
              <DropZone isOver={isDragOver} isEmpty={false} />
            )}
            {deals.map((deal) => (
              <div
                key={deal._id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("dealId", deal._id);
                  e.dataTransfer.setData("fromStage", deal.stage);
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingId(deal._id);
                  onDragStart?.(deal._id);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  onDragEnd?.();
                }}
                className={cn(
                  "transition-opacity",
                  draggingId === deal._id && "opacity-40"
                )}
              >
                <DealCard
                  deal={deal}
                  onClick={() => onDealClick?.(deal)}
                  isDragging={draggingId === deal._id}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Pipeline Summary Bar ──────────────────────────────────────────────────────

function PipelineSummaryBar({
  stageTotals,
}: {
  grouped: Record<DealStage, Deal[]>;
  stageTotals: Record<DealStage, { count: number; value: number }>;
}) {
  const totalValue = KANBAN_STAGES.reduce(
    (sum, s) => sum + (stageTotals[s]?.value ?? 0),
    0
  );

  const totalCount = KANBAN_STAGES.reduce(
    (sum, s) => sum + (stageTotals[s]?.count ?? 0),
    0
  );

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center gap-4 px-1 py-2 flex-wrap">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Pipeline value</span>
        <span className="text-sm font-bold text-foreground">
          {formatDealValue(totalValue)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Open deals</span>
        <span className="text-sm font-bold text-foreground">{totalCount}</span>
      </div>

      {/* Stage value bar */}
      <div className="flex-1 min-w-50">
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {KANBAN_STAGES.map((stage) => {
            const stageValue = stageTotals[stage]?.value ?? 0;
            const pct =
              totalValue > 0 ? (stageValue / totalValue) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={stage}
                style={{
                  width: `${pct}%`,
                  backgroundColor: dealStageConfig[stage].color,
                }}
                title={`${dealStageConfig[stage].label}: ${formatDealValue(stageValue)}`}
                className="transition-all"
              />
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {KANBAN_STAGES.filter(
            (s) => (stageTotals[s]?.count ?? 0) > 0
          ).map((stage) => (
            <span
              key={stage}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: dealStageConfig[stage].color }}
              />
              {dealStageConfig[stage].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DealKanban({
  onCreateDeal,
  onDealClick,
  ownerId,
}: DealKanbanProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useKanbanDeals({
    owner: ownerId,
  });

  // `useMoveStage(dealId)` is a hook that's parameterized by the specific
  // deal it moves — `mutate` only takes `{ stage }`, not `{ dealId, stage }`.
  // That means it can't just be called once with no id, and it definitely
  // can't be called *inside* a callback (e.g. inside `onDrop`, or inside
  // `KANBAN_STAGES.map(...)`) with a per-drop id — hooks must be called
  // unconditionally, at the top level, in the same order every render.
  //
  // Fix: keep a single top-level call to the hook, parameterized by a piece
  // of state (`pendingDrop`). When a drop happens, we don't call `mutate`
  // immediately — we just record which deal/stage is pending. That state
  // update triggers a re-render where `useMoveStage` is now bound to the
  // correct `dealId`. An effect then fires the actual mutation once that
  // binding is in place, and clears the pending state.
  const [pendingDrop, setPendingDrop] = useState<{
    dealId: string;
    stage: DealStage;
  } | null>(null);

  const { mutate: moveStage } = useMoveStage(pendingDrop?.dealId ?? "");

  const firedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingDrop) return;
    // Guard against firing twice for the same pending drop (e.g. if this
    // effect re-runs before state clears).
    const key = `${pendingDrop.dealId}:${pendingDrop.stage}`;
    if (firedForRef.current === key) return;
    firedForRef.current = key;

    moveStage(
      { stage: pendingDrop.stage },
      {
        onSettled: () => {
          setPendingDrop(null);
          firedForRef.current = null;
        },
      }
    );
  }, [pendingDrop, moveStage]);

  // ── Move handler ───────────────────────────────────────────────────────────

  const handleDrop = (dealId: string, toStage: DealStage) => {
    if (!data) return;

    let deal: Deal | undefined;
    for (const stage of KANBAN_STAGES) {
      deal = data.grouped[stage]?.find((d) => d._id === dealId);
      if (deal) break;
    }
    if (!deal) return;
    if (deal.stage === toStage) return;

    setPendingDrop({ dealId, stage: toStage });
  };

  // ── Filter deals by search ─────────────────────────────────────────────────

  const filterDeals = (deals: Deal[]): Deal[] => {
    if (!search.trim()) return deals;
    const q = search.toLowerCase();
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.relatedId?.name?.toLowerCase().includes(q)
    );
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load deals
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative min-w-0 max-w-xs flex-1">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs shrink-0"
          onClick={() => onCreateDeal?.()}
        >
          <Plus size={13} />
          Add deal
        </Button>
      </div>

      {/* ── Pipeline summary bar ── */}
      {data && (
        <PipelineSummaryBar
          grouped={data.grouped}
          stageTotals={data.stageTotals}
        />
      )}

      {/* ── Kanban board ── */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((stage) => {
          const deals = filterDeals(data?.grouped[stage] ?? []);
          const totals = data?.stageTotals[stage] ?? {
            count: 0,
            value: 0,
          };

          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={deals}
              totalValue={totals.value}
              onDealClick={onDealClick}
              onCreateDeal={() => onCreateDeal?.(stage)}
              onDrop={handleDrop}
              isLoading={isLoading}
            />
          );
        })}
      </div>
    </div>
  );
}