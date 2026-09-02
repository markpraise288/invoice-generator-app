// components/companies/CompanyDetailsDrawer.tsx

"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  companyKeys,
  useCompany,
  useCompanyStats,
  useDeleteCompany,
} from "@/hooks/useCompanies";
import type { Company } from "@/hooks/useCompanies";
import { useContacts, type Contact } from "@/hooks/useContacts";
import { CreateCompanyDialog } from "./CreateCompanyDialog";
import { CreateContactDialog } from "@/components/contacts/CreateContactDialog";
import { ContactDetailsDrawer } from "@/components/contacts/ContactDetailsDrawer";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  Users,
  DollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  TrendingUp,
  ExternalLink,
  Briefcase,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CompanyDetailsDrawerProps {
  companyId: string | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

// ─── Revenue formatter ─────────────────────────────────────────────────────────

const formatRevenue = (cents?: number): string => {
  if (!cents) return "—";
  const d = cents / 100;
  if (d >= 1_000_000_000) return `$${(d / 1_000_000_000).toFixed(1)}B`;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${(d / 1_000).toFixed(1)}K`;
  return `$${d.toLocaleString()}`;
};

// ─── Company Avatar ────────────────────────────────────────────────────────────

function CompanyAvatar({ name, size = "lg" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = {
    sm: "size-8 text-xs rounded-lg",
    md: "size-10 text-sm rounded-lg",
    lg: "size-14 text-base rounded-xl",
  }[size];

  return (
    <div
      className={cn(
        "bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 shrink-0",
        sizeClass
      )}
    >
      {initials}
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
  value: string | number;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className={cn("size-7 rounded-md flex items-center justify-center", bgClass)}>
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

// ─── Detail Row ────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  href?: string;
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
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline underline-offset-2 truncate inline-flex items-center gap-1"
          >
            {value}
            <ExternalLink size={11} />
          </a>
        ) : (
          <span className="text-sm font-medium text-foreground truncate">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Contacts Tab ──────────────────────────────────────────────────────────────

function ContactsTab({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);

  const { data: contactsList, isLoading } = useContacts({relatedTo: "Company", relatedId: companyId});

  const contacts = contactsList?.contacts

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${contacts?.length ?? 0} contact${(contacts?.length ?? 0) !== 1 ? "s" : ""}`}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={12} />
            Add contact
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !contacts || contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-border text-center">
            <Users size={18} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">
              No contacts yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add a contact linked to {companyName}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={13} />
              Add contact
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => {
                  setSelectedContactId(contact._id);
                  setContactDrawerOpen(true);
                }}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-border/80 hover:bg-muted/30 transition-all text-left"
              >
                {/* Avatar */}
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {contact.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground truncate">
                    {contact.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {contact.position ?? contact.email ?? "—"}
                  </span>
                </div>

                {/* Stage badge */}
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 shrink-0"
                >
                  {contact.stage}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create contact dialog — scoped to this company */}
      <CreateContactDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultRelatedId={companyId}
        defaultRelatedTo="Company"
      />

      {/* Contact details drawer */}
      <ContactDetailsDrawer
        contactId={selectedContactId}
        open={contactDrawerOpen}
        onClose={() => {
          setContactDrawerOpen(false);
          setSelectedContactId(null);
        }}
      />
    </>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-7 rounded-md shrink-0" />
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

export function CompanyDetailsDrawer({
  companyId,
  open,
  onClose,
  onDeleted,
}: CompanyDetailsDrawerProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: company, isLoading } = useCompany(companyId ?? "", {
    queryKey: companyKeys.detail(companyId ?? ""),
    enabled: !!companyId && open,
  });

  const { data: stats, isLoading: statsLoading } = useCompanyStats(
    companyId ?? ""
  );

  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();

  if (!companyId) return null;

  const handleDelete = () => {
    deleteCompany(companyId, {
      onSuccess: () => {
        setConfirmDelete(false);
        onClose();
        onDeleted?.();
      },
    });
  };

  const fullAddress = company?.address
    ? [
        company.address.street,
        company.address.city,
        company.address.state,
        company.address.country,
        company.address.zip,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-y-auto">
          {/* ── Header ── */}
          <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
            {isLoading ? (
              <div className="flex items-start gap-4">
                <Skeleton className="size-14 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : company ? (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <CompanyAvatar name={company.name} size="lg" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <h2 className="text-base font-bold text-foreground leading-none truncate">
                      {company.name}
                    </h2>
                    {company.industry && (
                      <p className="text-xs text-muted-foreground">
                        {company.industry}
                      </p>
                    )}
                    {company.domain && (
                      <a
                        href={`https://${company.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline underline-offset-2 w-fit"
                      >
                        {company.domain}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 mr-5">
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
                        Edit company
                      </DropdownMenuItem>
                      {company.website && (
                        <DropdownMenuItem
                          className="text-xs"
                          onClick={() =>
                            window.open(company.website, "_blank")
                          }
                        >
                          <Globe size={13} className="mr-2" />
                          Visit website
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-xs text-destructive focus:text-destructive"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 size={13} className="mr-2" />
                        Delete company
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
          ) : company ? (
            <Tabs defaultValue="overview" className="flex flex-col flex-1">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 px-6 gap-1 shrink-0">
                <TabsTrigger
                  value="overview"
                  className="text-xs pt-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-2"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="text-xs pt-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-2"
                >
                  Contacts
                  {stats?.contactCount ? (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-[10px] h-4 px-1.5"
                    >
                      {stats.contactCount}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              </TabsList>

              {/* ── Overview tab ── */}
              <TabsContent
                value="overview"
                className="px-6 py-5 flex flex-col gap-6 mt-0"
              >
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    icon={Users}
                    label="Contacts"
                    value={
                      statsLoading ? "—" : stats?.contactCount ?? 0
                    }
                    iconClass="text-blue-500"
                    bgClass="bg-blue-500/10"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Leads"
                    value={
                      statsLoading ? "—" : stats?.leadCount ?? 0
                    }
                    iconClass="text-violet-500"
                    bgClass="bg-violet-500/10"
                  />
                  <StatCard
                    icon={DollarSign}
                    label="Revenue"
                    value={formatRevenue(company.revenue)}
                    iconClass="text-emerald-500"
                    bgClass="bg-emerald-500/10"
                  />
                </div>

                <Separator />

                {/* Details */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Details
                  </h3>
                  <div className="flex flex-col gap-3">
                    {company.website && (
                      <DetailRow
                        icon={Globe}
                        label="Website"
                        value={company.website}
                        href={company.website}
                      />
                    )}
                    {company.phone && (
                      <DetailRow
                        icon={Phone}
                        label="Phone"
                        value={company.phone}
                      />
                    )}
                    {company.email && (
                      <DetailRow
                        icon={Mail}
                        label="Email"
                        value={company.email}
                        href={`mailto:${company.email}`}
                      />
                    )}
                    {company.size && (
                      <DetailRow
                        icon={Users}
                        label="Size"
                        value={`${company.size} employees`}
                      />
                    )}
                    {company.industry && (
                      <DetailRow
                        icon={Briefcase}
                        label="Industry"
                        value={company.industry}
                      />
                    )}
                    {fullAddress && (
                      <DetailRow
                        icon={MapPin}
                        label="Address"
                        value={fullAddress}
                      />
                    )}
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Notes
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {company.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Tags */}
                {company.tags && company.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {company.tags.map((tag) => (
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

                {/* Meta */}
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
                        {company.owner.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Created by
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {company.createdBy.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Added
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(company.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Last updated
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(company.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── Contacts tab ── */}
              <TabsContent
                value="contacts"
                className="px-6 py-5 mt-0"
              >
                <ContactsTab
                  companyId={company._id}
                  companyName={company.name}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center flex-1 py-16">
              <p className="text-sm text-muted-foreground">
                Company not found
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Edit dialog ── */}
      {company && (
        <CreateCompanyDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          editCompany={company}
          onSuccess={() => setEditOpen(false)}
        />
      )}

      {/* ── Delete confirmation ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this company?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {company?.name}
              </span>{" "}
              will be permanently removed. Associated contacts will not be
              deleted but will be unlinked from this company.
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
              {isDeleting ? "Deleting..." : "Delete company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}