"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useAdminTicket, useAdminSendMessage, useUpdateTicketStatus } from "@/hooks/useAdminSupportTickets";
import type { TicketCategory, TicketStatus } from "@/hooks/useSupportTickets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bug,
  CreditCard,
  Sparkles,
  UserCog,
  HelpCircle,
  Paperclip,
  Send,
  X,
  FileText,
  Loader2,
  ChevronDown,
  Building2,
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

const ALL_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export default function AdminReportThreadPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const { data, isLoading } = useAdminTicket(ticketId);
  const { mutate: sendMessage, isPending: isSending } = useAdminSendMessage(ticketId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTicketStatus(ticketId);

  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = "";
  };

  const handleSend = () => {
    if (!body.trim() && files.length === 0) return;
    sendMessage(
      { body: body.trim(), files },
      {
        onSuccess: () => {
          setBody("");
          setFiles([]);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Report not found.</p>;
  }

  const { ticket, messages } = data;
  const CategoryIcon = CATEGORY_CONFIG[ticket.category].icon;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/user-reports" className="text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
            <CategoryIcon size={14} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">{ticket.subject}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {ticket.userId?.name} ({ticket.userId?.email})
              <span className="flex items-center gap-1">
                <Building2 size={10} />
                {ticket.workspaceId?.name}
              </span>
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isUpdatingStatus}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium shrink-0 disabled:opacity-50",
                STATUS_CONFIG[ticket.status].className
              )}
            >
              {STATUS_CONFIG[ticket.status].label}
              <ChevronDown size={11} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ALL_STATUSES.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => updateStatus(s)}
                disabled={s === ticket.status}
                className="text-xs"
              >
                {STATUS_CONFIG[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
        )}
        {messages.map((message) => {
          const isAdmin = message.senderRole === "admin";
          return (
            <div key={message._id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] flex flex-col gap-1", isAdmin ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    isAdmin
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  )}
                >
                  {!isAdmin && (
                    <p className="text-[10px] font-medium uppercase tracking-wider mb-1 opacity-70">
                      {ticket.userId?.name}
                    </p>
                  )}
                  {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
                  {message.attachments.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {message.attachments.map((att, i) =>
                        isImage(att.mimeType) ? (
                          <a key={i} href={att.url} target="_blank" rel="noreferrer">
                            <img
                              src={att.url}
                              alt={att.filename}
                              className="max-h-48 rounded-lg border border-black/10"
                            />
                          </a>
                        ) : (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              "flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5",
                              isAdmin ? "bg-white/15" : "bg-muted"
                            )}
                          >
                            <FileText size={13} />
                            {att.filename}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {format(new Date(message.createdAt), "MMM d, h:mm a")}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex flex-col gap-2">
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {files.map((file, i) => (
              <li key={i} className="flex items-center gap-1 text-xs bg-muted rounded-md px-2 py-1 text-foreground">
                {file.name}
                <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                  <X size={11} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-end gap-2">
          <label className="flex items-center justify-center size-9 rounded-lg border border-border cursor-pointer hover:bg-muted/30 text-muted-foreground shrink-0">
            <Paperclip size={16} />
            <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={isSending} />
          </label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Reply to this report..."
            rows={1}
            className="min-h-9 resize-none"
            disabled={isSending}
          />
          <Button
            size="icon"
            className="shrink-0"
            onClick={handleSend}
            disabled={isSending || (!body.trim() && files.length === 0)}
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}