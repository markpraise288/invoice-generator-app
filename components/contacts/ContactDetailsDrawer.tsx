// components/contacts/ContactDetailsDrawer.tsx

"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  useContact,
  useContactStats,
  useDeleteContact,
  useUpdateLastContacted,
} from "@/hooks/useContacts";
import type { Contact, ContactStage, RelatedTo } from "@/hooks/useContacts";
import { CreateContactDialog } from "./CreateContactDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Mail,
  Phone,
  Building2,
  Users,
  Target,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Activity,
  ClipboardList,
  ExternalLink,
  MapPin,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ContactDetailsDrawerProps {
  contactId: string | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  // Optional — lets the parent page navigate to the linked record's own
  // page/drawer when its row is clicked (e.g. open CompanyDetailsDrawer).
  // Omit if you don't want the row to be clickable.
  onRelatedClick?: (relatedTo: RelatedTo, relatedId: string) => void;
}

// ─── Related entity display config (icon + label per type) ────────────────────
// Mirrors relatedToConfig in CreateContactDialog — Contact's relatedTo is
// narrower than Task's (only Company/Customer/Lead, per contact.model.js).

const relatedToDisplay: Record<RelatedTo, { icon: React.ElementType; label: string }> = {
  Company: { icon: Building2, label: "Company" },
  Customer: { icon: Users, label: "Customer" },
  Lead: { icon: Target, label: "Lead" },
};

// ─── Stage config ──────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<ContactStage, { label: string; className: string }> = {
  subscriber: {
    label: "Subscriber",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  lead: {
    label: "Lead",
    className: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  opportunity: {
    label: "Opportunity",
    className: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  },
  customer: {
    label: "Customer",
    className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  evangelist: {
    label: "Evangelist",
    className: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  other: {
    label: "Other",
    className: "bg-muted text-muted-foreground",
  },
};

// ─── Helpers for the polymorphic relatedId field ───────────────────────────────
// Same unwrapping pattern used everywhere else this conversation — one place
// that handles "is relatedId a bare string or a populated object."

function getRelatedId(contact: Contact): string | null {
  if (!contact.relatedId) return null;
  return typeof contact.relatedId === "string" ? contact.relatedId : contact.relatedId._id;
}

function getRelatedLabel(contact: Contact): string | null {
  if (!contact.relatedId || typeof contact.relatedId === "string") return null;
  return (contact.relatedId.name as string) ?? null;
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function ContactAvatar({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-base",
  }[size];

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center",
        "font-bold text-primary shrink-0",
        sizeClass
      )}
    >
      {initials}
    </div>
  );
}

// ─── Detail Row ────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-muted-foreground" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {href ? (
          
           <a href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={cn(
              "text-sm font-medium text-primary hover:underline underline-offset-2 truncate",
              className
            )}
          >
            {value}
          </a>
        ) : onClick ? (
          <button
            onClick={onClick}
            className={cn(
              "text-sm font-medium text-primary hover:underline underline-offset-2 truncate text-left",
              className
            )}
          >
            {value}
          </button>
        ) : (
          <span
            className={cn(
              "text-sm font-medium text-foreground truncate",
              className
            )}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass,
  bgClass,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div
        className={cn(
          "size-7 rounded-md flex items-center justify-center",
          bgClass
        )}
      >
        <Icon size={13} className={iconClass} />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold text-foreground leading-none">
          {value}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
      </div>
    </div>
  );
}

// ─── Stats Section ─────────────────────────────────────────────────────────────

function StatsSection({ contactId }: { contactId: string }) {
  const { data: stats, isLoading } = useContactStats(contactId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2"
          >
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={Activity}
        label="Activities"
        value={stats.activityCount}
        iconClass="text-blue-500"
        bgClass="bg-blue-500/10"
      />
      <StatCard
        icon={ClipboardList}
        label="Tasks"
        value={stats.taskCount}
        iconClass="text-amber-500"
        bgClass="bg-amber-500/10"
      />
      <StatCard
        icon={Clock}
        label="Open tasks"
        value={stats.openTaskCount}
        iconClass="text-rose-500"
        bgClass="bg-rose-500/10"
      />
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-7 rounded-md" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ContactDetailsDrawer({
  contactId,
  open,
  onClose,
  onDeleted,
  onRelatedClick,
}: ContactDetailsDrawerProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: contact, isLoading } = useContact(contactId ?? "", {
    enabled: !!contactId && open,
  });

  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();
  const { mutate: updateLastContacted, isPending: isUpdatingLastContacted } =
    useUpdateLastContacted(contactId ?? "");

  if (!contactId) return null;

  const handleDelete = () => {
    deleteContact(contactId, {
      onSuccess: () => {
        setConfirmDelete(false);
        onClose();
        onDeleted?.();
      },
    });
  };

  const relatedId = contact ? getRelatedId(contact) : null;
  const relatedLabel = contact ? getRelatedLabel(contact) : null;
  const relatedDisplay = contact?.relatedTo ? relatedToDisplay[contact.relatedTo] : null;
  const RelatedIcon = relatedDisplay?.icon ?? Building2;

  const stageConf = contact?.stage
    ? STAGE_CONFIG[contact.stage]
    : null;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 overflow-y-auto p-3">
          {/* ── Header ── */}
          <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
            {isLoading ? (
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-14 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ) : contact ? (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <ContactAvatar name={contact.name} size="lg" />
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <h2 className="text-base font-bold text-foreground leading-none truncate">
                      {contact.name}
                    </h2>
                    {contact.position && (
                      <p className="text-xs text-muted-foreground">
                        {contact.position}
                        {relatedLabel && (
                          <span className="text-muted-foreground">
                            {" · "}
                            {relatedLabel}
                          </span>
                        )}
                      </p>
                    )}
                    {stageConf && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] h-5 px-2 w-fit",
                          stageConf.className
                        )}
                      >
                        {stageConf.label}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    onClick={() => updateLastContacted()}
                    disabled={isUpdatingLastContacted}
                  >
                    <CheckCircle2 size={13} />
                    Contacted
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        className="text-xs"
                        onClick={() => setEditOpen(true)}
                      >
                        <Pencil size={13} className="mr-2" />
                        Edit contact
                      </DropdownMenuItem>
                      {contact.email && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() =>
                            (window.location.href = `mailto:${contact.email}`)
                          }
                        >
                          <Mail size={13} className="mr-2" />
                          Send email
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-xs text-destructive focus:text-destructive"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 size={13} className="mr-2" />
                        Delete contact
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : null}
          </SheetHeader>

          {/* ── Body ── */}
          {isLoading ? (
            <DrawerSkeleton />
          ) : contact ? (
            <div className="flex flex-col gap-6 px-6 py-5">
              {/* ── Stats ── */}
              <StatsSection contactId={contact._id} />

              <Separator />

              {/* ── Contact info ── */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact details
                </h3>
                <div className="flex flex-col gap-3">
                  {contact.email && (
                    <DetailRow
                      icon={Mail}
                      label="Email"
                      value={contact.email}
                      href={`mailto:${contact.email}`}
                    />
                  )}
                  {contact.phone && (
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={contact.phone}
                      href={`tel:${contact.phone}`}
                    />
                  )}
                  {relatedLabel && relatedDisplay && (
                    <DetailRow
                      icon={RelatedIcon}
                      label={relatedDisplay.label}
                      value={relatedLabel}
                      onClick={
                        onRelatedClick && relatedId
                          ? () => onRelatedClick(contact.relatedTo, relatedId)
                          : undefined
                      }
                    />
                  )}
                  {contact.fullAddress && (
                    <DetailRow
                      icon={MapPin}
                      label="Address"
                      value={contact.fullAddress}
                    />
                  )}
                  {contact.lastContactedAt ? (
                    <DetailRow
                      icon={Clock}
                      label="Last contacted"
                      value={formatDistanceToNow(
                        new Date(contact.lastContactedAt),
                        { addSuffix: true }
                      )}
                    />
                  ) : (
                    <DetailRow
                      icon={Clock}
                      label="Last contacted"
                      value="Never"
                      className="text-muted-foreground"
                    />
                  )}
                </div>
              </div>

              {/* ── Social ── */}
              {(contact.social?.linkedin || contact.social?.twitter) && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Social
                    </h3>
                    <div className="flex flex-col gap-3">
                      {contact.social.linkedin && (
                        <DetailRow
                          icon={ExternalLink}
                          label="LinkedIn"
                          value="View profile"
                          href={contact.social.linkedin}
                        />
                      )}
                      {contact.social.twitter && (
                        <DetailRow
                          icon={ExternalLink}
                          label="Twitter"
                          value="View profile"
                          href={contact.social.twitter}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ── Description ── */}
              {contact.description && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Notes
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {contact.description}
                    </p>
                  </div>
                </>
              )}

              {/* ── Tags ── */}
              {contact.tags && contact.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {contact.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[11px] px-2 h-5"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Meta ── */}
              <Separator />
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Meta
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Owner
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {contact.owner.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Created by
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {contact.createdBy.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Added
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(contact.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 py-16">
              <p className="text-sm text-muted-foreground">
                Contact not found
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Edit dialog ── */}
      {contact && (
        <CreateContactDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          editContact={contact}
          onSuccess={() => setEditOpen(false)}
        />
      )}

      {/* ── Delete confirmation ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {contact?.name}
              </span>{" "}
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