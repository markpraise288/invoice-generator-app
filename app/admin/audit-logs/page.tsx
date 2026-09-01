"use client";

import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function AdminAuditLogsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          A complete, immutable record of every admin action taken on this platform.
        </p>
      </div>

      <AuditLogTable />
    </div>
  );
}