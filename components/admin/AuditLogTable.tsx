"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, ShieldOff, ShieldCheck, RefreshCw, LogIn, LogOut, Trash2, Plus, Pencil } from "lucide-react";
import { useAuditLogs, type AdminAction, type AuditLog } from "@/hooks/useAdmin";

const actionConfig: Record<AdminAction, { label: string; icon: React.ElementType; color: string }> = {
  tenant_created: { label: "Tenant Created", icon: Plus, color: "text-emerald-600 dark:text-emerald-400" },
  tenant_updated: { label: "Tenant Updated", icon: Pencil, color: "text-sky-600 dark:text-sky-400" },
  tenant_suspended: { label: "Tenant Suspended", icon: ShieldOff, color: "text-red-600 dark:text-red-400" },
  tenant_reactivated: { label: "Tenant Reactivated", icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400" },
  tenant_plan_changed: { label: "Plan Changed", icon: RefreshCw, color: "text-purple-600 dark:text-purple-400" },
  tenant_deleted: { label: "Tenant Deleted", icon: Trash2, color: "text-red-600 dark:text-red-400" },
  impersonation_started: { label: "Impersonation Started", icon: LogIn, color: "text-amber-600 dark:text-amber-400" },
  impersonation_ended: { label: "Impersonation Ended", icon: LogOut, color: "text-slate-600 dark:text-slate-400" },
  user_suspended: { label: "User Suspended", icon: ShieldOff, color: "text-red-600 dark:text-red-400" },
  user_reactivated: { label: "User Reactivated", icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400" },
  user_role_changed: { label: "Role Changed", icon: RefreshCw, color: "text-purple-600 dark:text-purple-400" },
  user_deleted: { label: "User Deleted", icon: Trash2, color: "text-red-600 dark:text-red-400" },
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const renderMetadata = (log: AuditLog) => {
  const { metadata } = log;
  if (!metadata || Object.keys(metadata).length === 0) return null;

  if (log.action === "tenant_plan_changed" && metadata.fromPlan && metadata.toPlan) {
    return (
      <span className="text-xs text-muted-foreground">
        {String(metadata.fromPlan)} → {String(metadata.toPlan)}
      </span>
    );
  }
  if (metadata.reason) {
    return <span className="text-xs text-muted-foreground">"{String(metadata.reason)}"</span>;
  }
  return null;
};

export function AuditLogTable() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAuditLogs({
    action: actionFilter === "all" ? undefined : (actionFilter as AdminAction),
    targetType: targetTypeFilter === "all" ? undefined : (targetTypeFilter as "tenant" | "user"),
    page,
    limit: 30,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {Object.entries(actionConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={targetTypeFilter} onValueChange={(v) => { setTargetTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All targets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All targets</SelectItem>
            <SelectItem value="tenant">Tenants</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !data?.logs.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <ScrollText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">No audit log entries</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin actions will be recorded here as they happen.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.map((log) => {
                const config = actionConfig[log.action];
                const Icon = config?.icon || ScrollText;

                return (
                  <TableRow key={log._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 shrink-0 ${config?.color || "text-muted-foreground"}`} />
                        <span className="text-sm font-medium text-foreground">
                          {config?.label || log.action}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.targetType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{log.targetLabel}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.actor?.name || log.actor?.email || "System"}
                    </TableCell>
                    <TableCell>{renderMetadata(log)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total}{" "}
            entries
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}