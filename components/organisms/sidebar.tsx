// components/organisms/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Receipt,
  Lightbulb,
  Brain,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const logout = useAuthStore((s:any) => s.logout);

  const isCollapsed = state === "collapsed";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Insights", href: "/insights", icon: Lightbulb },
    { name: "AI Bot", href: "/ai", icon: Brain  },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    window.location.href = "/login";
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="hidden md:flex border-r bg-gradient-to-b from-white to-gray-50"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "flex items-center p-4 border-b bg-white",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                FinSight
              </span>
            )}
          </div>

          {/* Toggle Button - Only show when expanded */}
          {!isCollapsed && (
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft size={18} />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
            )}

            <SidebarMenu className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-all duration-200",
                        isCollapsed ? "justify-center" : "justify-start"
                      )}
                    >
                      <Link 
                        href={item.href} 
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                          "hover:bg-blue-50 hover:text-blue-600",
                          "transition-colors duration-200",
                          isActive 
                            ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" 
                            : "text-gray-700",
                          isCollapsed && "justify-center"
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon size={20} className="flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="font-medium">{item.name}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>

        {/* Expand Button - Only show when collapsed */}
        {isCollapsed && (
          <div className="px-3 py-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSidebar}
              className="w-full h-10 rounded-lg hover:bg-gray-100"
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* Logout Section */}
        <div className="p-3 border-t bg-white">
          <Button
            variant="outline"
            className={cn(
              "w-full flex items-center gap-2 rounded-lg",
              "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
              "transition-all duration-200",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}