"use client";

import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          Search and manage individual user accounts across every tenant.
        </p>
      </div>

      <UsersTable />
    </div>
  );
}