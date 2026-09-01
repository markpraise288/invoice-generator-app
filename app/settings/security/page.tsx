// app/settings/security/page.tsx

"use client";

import { useState } from "react";
import {
  useSessions,
  useRevokeSession,
  useRevokeAllOtherSessions,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/hooks/useSettings";
import type { Session, ApiKey } from "@/hooks/useSettings";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { DangerZone } from "@/components/settings/DangerZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { formatDistanceToNow, format } from "date-fns";
import {
  Monitor,
  Smartphone,
  Globe,
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

// ─── Device Icon Resolver ───────────────────────────────────────────────────────

const getDeviceIcon = (device?: string) => {
  if (!device) return Globe;
  const lower = device.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return Smartphone;
  }
  return Monitor;
};

// ─── Session Row ───────────────────────────────────────────────────────────────

function SessionRow({
  session,
  isCurrent,
  onRevoke,
  isRevoking,
}: {
  session: Session;
  isCurrent: boolean;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const DeviceIcon = getDeviceIcon(session.device);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <DeviceIcon size={15} className="text-muted-foreground" />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {session.device ?? "Unknown device"}
          </span>
          {isCurrent && (
            <Badge
              variant="secondary"
              className="text-[10px] h-4 px-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
            >
              Current
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">
          {session.ip ?? "Unknown location"}
          {session.lastActiveAt && (
            <>
              {" · "}
              Active{" "}
              {formatDistanceToNow(new Date(session.lastActiveAt), {
                addSuffix: true,
              })}
            </>
          )}
        </span>
      </div>

      {!isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          Revoke
        </Button>
      )}
    </div>
  );
}

// ─── Create API Key Dialog ──────────────────────────────────────────────────────

function CreateApiKeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { mutate: createApiKey, isPending, error } = useCreateApiKey();

  const handleCreate = () => {
    if (!name.trim()) return;
    createApiKey(name.trim(), {
      onSuccess: (result) => {
        setCreatedKey(result.key);
      },
    });
  };

  const handleCopy = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setName("");
    setCreatedKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Key size={16} className="text-primary" />
                Create API key
              </DialogTitle>
              <DialogDescription className="text-xs">
                Give your key a name to help you identify it later
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zapier integration"
                className="h-9"
                disabled={isPending}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={isPending || !name.trim()}
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                    Creating...
                  </>
                ) : (
                  "Create key"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <ShieldCheck size={16} className="text-emerald-500" />
                Key created
              </DialogTitle>
              <DialogDescription className="text-xs">
                Copy this key now. For security reasons, it will not be
                shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/50">
                <code className="text-xs font-mono text-foreground flex-1 truncate">
                  {createdKey}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Copy size={13} />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                  Copied to clipboard
                </p>
              )}
            </div>
            <DialogFooter>
              <Button size="sm" onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── API Key Row ───────────────────────────────────────────────────────────────

function ApiKeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 group">
      <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Key size={15} className="text-muted-foreground" />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate">
          {apiKey.name}
        </span>
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-muted-foreground">
            {apiKey.prefix}
          </code>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end text-right shrink-0">
        <span className="text-xs text-muted-foreground">
          Created {format(new Date(apiKey.createdAt), "MMM d, yyyy")}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {apiKey.lastUsedAt
            ? `Last used ${formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}`
            : "Never used"}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onRevoke}
      >
        <Trash2 size={13} />
      </Button>
    </div>
  );
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SecuritySettingsPage() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { mutate: revokeSession, isPending: isRevokingSession } =
    useRevokeSession();
  const {
    mutate: revokeAllOther,
    isPending: isRevokingAll,
  } = useRevokeAllOtherSessions();

  const { data: apiKeys, isLoading: keysLoading } = useApiKeys();
  const { mutate: revokeApiKey } = useRevokeApiKey();

  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [revokeKeyTarget, setRevokeKeyTarget] = useState<ApiKey | null>(
    null
  );
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  // Assume the first session in the list is current — adjust based on
  // your actual session tracking (e.g. comparing token to current cookie)
  const currentSessionId = sessions?.[0]?._id;

  const handleRevokeKey = () => {
    if (!revokeKeyTarget) return;
    revokeApiKey(revokeKeyTarget._id, {
      onSuccess: () => setRevokeKeyTarget(null),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Security</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your active sessions and API access
        </p>
      </div>

      {/* ── Active sessions ── */}
      <SettingsSection
        title="Active sessions"
        description="Devices currently signed in to your account"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {sessions?.length ?? 0} active session
            {sessions?.length !== 1 ? "s" : ""}
          </span>
          {(sessions?.length ?? 0) > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setRevokeAllOpen(true)}
            >
              Revoke all other sessions
            </Button>
          )}
        </div>

        {sessionsLoading ? (
          <ListSkeleton />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {(sessions ?? []).map((session) => (
                <SessionRow
                  key={session._id}
                  session={session}
                  isCurrent={session._id === currentSessionId}
                  onRevoke={() => revokeSession(session._id)}
                  isRevoking={isRevokingSession}
                />
              ))}
            </div>
          </div>
        )}
      </SettingsSection>

      {/* ── API keys ── */}
      <SettingsSection
        title="API keys"
        description="Use API keys to authenticate requests from external tools and integrations"
        noBorder
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {apiKeys?.length ?? 0} key{apiKeys?.length !== 1 ? "s" : ""}
          </span>
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={() => setCreateKeyOpen(true)}
          >
            <Plus size={12} />
            New key
          </Button>
        </div>

        {keysLoading ? (
          <ListSkeleton />
        ) : (apiKeys ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 flex flex-col items-center justify-center text-center">
            <Key size={20} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">
              No API keys yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a key to connect external tools to your CRM
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {(apiKeys ?? []).map((key) => (
                <ApiKeyRow
                  key={key._id}
                  apiKey={key}
                  onRevoke={() => setRevokeKeyTarget(key)}
                />
              ))}
            </div>
          </div>
        )}
      </SettingsSection>

      {/* ── Dialogs ── */}
      <CreateApiKeyDialog
        open={createKeyOpen}
        onOpenChange={setCreateKeyOpen}
      />

      <AlertDialog
        open={!!revokeKeyTarget}
        onOpenChange={(o) => !o && setRevokeKeyTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {revokeKeyTarget?.name}
              </span>{" "}
              will no longer be able to authenticate requests. Any
              integrations using this key will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRevokeKey}
            >
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out on all devices except this one. You'll
              need to sign in again on those devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingAll}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRevokingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                revokeAllOther(undefined, {
                  onSuccess: () => setRevokeAllOpen(false),
                })
              }
            >
              {isRevokingAll ? "Revoking..." : "Revoke all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}