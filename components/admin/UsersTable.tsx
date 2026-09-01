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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, ShieldOff, ShieldCheck, Users as UsersIcon } from "lucide-react";
import {
  useAdminUsers,
  useSuspendUser,
  useReactivateUser,
  type AdminUser,
} from "@/hooks/useAdmin";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toast } from "sonner";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const { data, isLoading } = useAdminUsers({ search: debouncedSearch, limit: 30 });
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();

  const handleSuspend = async () => {
    if (!suspendTarget || !suspendReason.trim()) {
      toast.error("A reason is required to suspend a user");
      return;
    }
    try {
      await suspendUser.mutateAsync({ id: suspendTarget._id, reason: suspendReason });
      toast.success(`${suspendTarget.email} suspended`);
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to suspend user");
    }
  };

  const handleReactivate = async (user: AdminUser) => {
    try {
      await reactivateUser.mutateAsync(user._id);
      toast.success(`${user.email} reactivated`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to reactivate user");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !data?.users.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">No users found</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!user.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                      >
                        Suspended
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {!user.isActive ? (
                      <Button variant="ghost" size="sm" onClick={() => handleReactivate(user)}>
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                        Reactivate
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 dark:text-red-400"
                        onClick={() => {
                          setSuspendTarget(user);
                          setSuspendReason("");
                        }}
                      >
                        <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                        Suspend
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Suspend {suspendTarget?.email}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="userSuspendReason">Reason (required)</Label>
            <Textarea
              id="userSuspendReason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
              placeholder="e.g. ToS violation, suspicious activity..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSuspend}
              className="bg-red-600 hover:bg-red-700"
              disabled={suspendUser.isPending || !suspendReason.trim()}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}