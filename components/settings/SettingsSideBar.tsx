// components/settings/SettingsSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  Users,
  Bell,
  Palette,
  Shield,
  CreditCard,
  ChevronRight,
  Settings,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

// ─── Nav Items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    group: "Account",
    items: [
      {
        label: "Profile",
        href: "/settings/profile",
        icon: User,
        description: "Your personal information",
      },
      {
        label: "Appearance",
        href: "/settings/appearance",
        icon: Palette,
        description: "Theme and display preferences",
      },
      {
        label: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
        description: "Email and in-app alerts",
      },
    ],
  },
  {
    group: "Workspace",
    items: [
      {
        label: "Workspace",
        href: "/settings/workspace",
        icon: Building2,
        description: "Name, logo and preferences",
      },
      {
        label: "Team",
        href: "/settings/team",
        icon: Users,
        description: "Members and permissions",
      },
      {
        label: "Billing",
        href: "/settings/billing",
        icon: CreditCard,
        description: "Plan and usage",
      },
    ],
  },
];

// ─── Avatar ────────────────────────────────────────────────────────────────────

function ProfileAvatar({
  name,
  avatar,
  size = "md",
}: {
  name: string;
  avatar?: string;
  size?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", sizeClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center",
        "font-semibold text-primary shrink-0",
        sizeClass
      )}
    >
      {initials}
    </div>
  );
}

// ─── Nav Item ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  isActive,
}: {
  item: (typeof NAV_ITEMS)[0]["items"][0];
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <div
        className={cn(
          "size-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
          isActive
            ? "bg-primary/15 text-primary"
            : "bg-muted group-hover:bg-muted/80 text-muted-foreground group-hover:text-foreground"
        )}
      >
        <Icon size={15} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={cn(
            "text-sm font-medium leading-none",
            isActive ? "text-primary" : "text-foreground"
          )}
        >
          {item.label}
        </span>
        <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {item.description}
        </span>
      </div>
      {isActive && (
        <ChevronRight size={14} className="text-primary shrink-0" />
      )}
    </Link>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SettingsSidebar() {
  const pathname = usePathname();
  const { data: profile } = useProfile();

  return (
    <aside className="flex flex-col w-64 shrink-0">
      {/* ── Back to Dashboard ── */}
      <Link
        href="/dashboard"
        className={cn(
          "group flex items-center gap-2.5 mx-3 mt-3 mb-2 px-3 py-2.5 rounded-xl",
          "border border-border bg-card",
          "hover:border-primary/30 hover:bg-primary/5",
          "transition-all"
        )}
      >
        <div className="size-7 rounded-md bg-muted group-hover:bg-primary/15 flex items-center justify-center shrink-0 transition-colors">
          <ArrowLeft
            size={14}
            className="text-muted-foreground group-hover:text-primary transition-colors"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-none">
            Back to Dashboard
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            Exit settings
          </span>
        </div>
        <LayoutDashboard
          size={13}
          className="ml-auto text-muted-foreground group-hover:text-primary transition-colors shrink-0"
        />
      </Link>

      {/* ── Divider ── */}
      <div className="mx-3 mb-3 border-t border-border" />

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Settings size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground leading-none">
            Settings
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage your account
          </p>
        </div>
      </div>

      {/* ── Profile card ── */}
      {profile && (
        <Link
          href="/settings/profile"
          className={cn(
            "flex items-center gap-3 mx-3 px-3 py-3 rounded-xl border transition-all mb-4",
            pathname === "/settings/profile"
              ? "border-primary/30 bg-primary/5"
              : "border-border hover:border-border/80 hover:bg-muted/30"
          )}
        >
          <ProfileAvatar name={profile.name} avatar={profile.avatar} />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-foreground truncate leading-none">
              {profile.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate mt-0.5">
              {profile.email}
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0",
              profile.role === "admin"
                ? "bg-primary/10 text-primary"
                : profile.role === "viewer"
                ? "bg-muted text-muted-foreground"
                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
            )}
          >
            {profile.role}
          </span>
        </Link>
      )}

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-5 flex-1 px-1">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1">
              {group.group}
            </p>
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="mt-auto px-3 py-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground text-center">
          InvoiceFlow CRM
          <span className="mx-1.5 opacity-40">·</span>
          <span className="opacity-60">v1.0.0</span>
        </p>
      </div>
    </aside>
  );
}

export { ProfileAvatar };