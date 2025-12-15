"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/organisms/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <SidebarProvider>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </SidebarProvider>
    </div>
  );
}