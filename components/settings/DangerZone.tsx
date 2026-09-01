// components/settings/DangerZone.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DangerAction {
  title: string;
  description: string;
  buttonLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmPhrase?: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
}

interface DangerZoneProps {
  title?: string;
  description?: string;
  actions: DangerAction[];
  className?: string;
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDangerDialog({
  open,
  onOpenChange,
  action,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  action: DangerAction | null;
}) {
  const [phraseInput, setPhraseInput] = useState("");

  if (!action) return null;

  const requiresPhrase = !!action.confirmPhrase;
  const phraseMatches =
    !requiresPhrase || phraseInput === action.confirmPhrase;

  const handleConfirm = async () => {
    await action.onConfirm();
    setPhraseInput("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setPhraseInput("");
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-destructive" />
            </div>
            <AlertDialogTitle>{action.confirmTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {action.confirmDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requiresPhrase && (
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="confirm-phrase" className="text-xs">
              Type{" "}
              <span className="font-mono font-semibold text-foreground">
                {action.confirmPhrase}
              </span>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-phrase"
              value={phraseInput}
              onChange={(e) => setPhraseInput(e.target.value)}
              placeholder={action.confirmPhrase}
              className="h-9 text-sm font-mono"
              disabled={action.isPending}
              autoComplete="off"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={action.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!phraseMatches || action.isPending}
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {action.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                Processing...
              </>
            ) : (
              action.buttonLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DangerZone({
  title = "Danger zone",
  description = "These actions are permanent and cannot be undone. Please proceed with caution.",
  actions,
  className,
}: DangerZoneProps) {
  const [activeAction, setActiveAction] = useState<DangerAction | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTrigger = (action: DangerAction) => {
    setActiveAction(action);
    setDialogOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "rounded-xl border border-destructive/30 bg-destructive/[0.02]",
          "dark:bg-destructive/[0.05]",
          className
        )}
      >
        <div className="px-5 py-4 border-b border-destructive/20">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">
              {title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="divide-y divide-destructive/10">
          {actions.map((action, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {action.title}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "shrink-0 text-destructive border-destructive/30",
                  "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                )}
                onClick={() => handleTrigger(action)}
              >
                {action.buttonLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDangerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        action={activeAction}
      />
    </>
  );
}