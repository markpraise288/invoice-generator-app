// app/settings/layout.tsx

import { SettingsSidebar } from "@/components/settings/SettingsSideBar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <div className="border-r border-border py-2">
        <SettingsSidebar />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">{children}</div>
      </div>
    </div>
  );
}