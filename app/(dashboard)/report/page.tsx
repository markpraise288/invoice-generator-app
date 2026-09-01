"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useMyTickets, useCreateTicket } from "@/hooks/useSupportTickets";
import type { TicketCategory, TicketStatus } from "@/hooks/useSupportTickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  MessageCircle,
  Bug,
  CreditCard,
  Sparkles,
  UserCog,
  HelpCircle,
  Paperclip,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

const CATEGORY_CONFIG: Record<
  TicketCategory,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  bug: { label: "Bug", icon: Bug },
  billing: { label: "Billing", icon: CreditCard },
  feature_request: { label: "Feature request", icon: Sparkles },
  account: { label: "Account", icon: UserCog },
  other: { label: "Other", icon: HelpCircle },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" },
  in_progress: { label: "In progress", className: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
};

function NewTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const { mutate: createTicket, isPending } = useCreateTicket();

  const [category, setCategory] = useState<TicketCategory>("bug");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = "";
  };

  const handleSubmit = () => {
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!body.trim() && files.length === 0) {
      setError("Describe the problem, or attach a screenshot");
      return;
    }
    setError(null);

    createTicket(
      { category, subject: subject.trim(), body: body.trim(), files },
      {
        onSuccess: (data) => {
          setSubject("");
          setBody("");
          setFiles([]);
          onOpenChange(false);
          router.push(`/report/${data.ticket._id}`);
        },
        onError: (err: any) => setError(err?.message || "Couldn't submit the report"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageCircle size={16} className="text-primary" />
            Report a problem
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tell us what&apos;s going on — we&apos;ll reply here.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as TicketCategory[]).map((c) => {
                const config = CATEGORY_CONFIG[c];
                const Icon = config.icon;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    disabled={isPending}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors",
                      category === c
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-border/80 hover:bg-muted/30"
                    )}
                  >
                    <Icon size={14} className="text-muted-foreground shrink-0" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject" className="text-xs">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary of the issue"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body" className="text-xs">Details</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened? Steps to reproduce, if it's a bug."
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Attachments (optional)</Label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border cursor-pointer hover:bg-muted/30 text-sm text-muted-foreground w-fit">
              <Paperclip size={14} />
              Attach files
              <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={isPending} />
            </label>
            {files.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 mt-1">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-1 text-foreground"
                  >
                    {file.name}
                    <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                      <X size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/5">
              <AlertCircle size={13} className="text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                Submitting...
              </>
            ) : (
              "Submit report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TicketListSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: tickets, isLoading } = useMyTickets();
  const [newTicketOpen, setNewTicketOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Report a problem or ask a question — we&apos;ll get back to you here
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setNewTicketOpen(true)}>
          <Plus size={15} />
          New report
        </Button>
      </div>

      {isLoading ? (
        <TicketListSkeleton />
      ) : tickets && tickets.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {tickets.map((ticket) => {
              const CategoryIcon = CATEGORY_CONFIG[ticket.category].icon;
              return (
                <Link
                  key={ticket._id}
                  href={`/report/${ticket._id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0 relative">
                    <CategoryIcon size={14} className="text-muted-foreground" />
                    {ticket.userUnreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-indigo-600 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {ticket.subject}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {ticket.lastMessagePreview}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                    {formatDistanceToNow(new Date(ticket.lastMessageAt), { addSuffix: true })}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium shrink-0",
                      STATUS_CONFIG[ticket.status].className
                    )}
                  >
                    {STATUS_CONFIG[ticket.status].label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
          <MessageCircle size={24} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No reports yet. Run into a problem? We&apos;re here to help.
          </p>
        </div>
      )}

      <NewTicketDialog open={newTicketOpen} onOpenChange={setNewTicketOpen} />
    </div>
  );
}