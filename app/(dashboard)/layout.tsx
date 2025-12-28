"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/organisms/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s: any) => s.accessToken);

  useEffect(() => {
    // Check if user is authenticated
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, router]);

  if (!accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <SidebarProvider>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-10">
          {/* Mobile Menu Button */}
          <div className="md:hidden mb-4">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}