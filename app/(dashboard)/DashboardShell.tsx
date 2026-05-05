"use client";

import Sidebar from "@/components/ui/SideBar";
import TopNavbar from "@/components/ui/TopNavbar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ShellLayout>{children}</ShellLayout>
    </SidebarProvider>
  );
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

    return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
          {children}
        </main>
      </div>

    </div>
  );
}