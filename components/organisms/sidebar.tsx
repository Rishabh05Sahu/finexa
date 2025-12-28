"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
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
import ThemeToggle from "@/components/atom/ThemeToggle";

export default function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const logout = useAuthStore((s: any) => s.logout);

  const isCollapsed = state === "collapsed";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Insights", href: "/insights", icon: Lightbulb },
    { name: "AI Bot", href: "/ai", icon: Brain },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    try {
      // Clear server-side cookie
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-4"
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "flex items-center flex-shrink-0",
              isCollapsed ? "justify-center" : "gap-2.5 min-w-0"
            )}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent leading-tight">
                  FinSight
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Finance
                </span>
              </div>
            )}
          </div>

          {/* Collapse Button - Only show when expanded */}
          {!isCollapsed && (
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSidebar}
              className="ml-auto h-8 w-8 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} className="shrink-0" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        {/* Navigation Section */}
        <SidebarGroup className="flex-1 py-3">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarMenu
            className={cn("space-y-1", isCollapsed ? "px-0" : "px-2")}
          >
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className={cn(
                      "relative transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive &&
                        "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm",
                      isCollapsed && "justify-center w-full"
                    )}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center w-full",
                        isCollapsed ? "justify-center" : "gap-3 px-3"
                      )}
                    >
                      <item.icon
                        size={20}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive && "text-sidebar-accent-foreground"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="font-medium text-sm truncate">
                          {item.name}
                        </span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Theme Toggle Section */}
        {!isCollapsed ? (
          <div className="px-3 py-2 border-t border-sidebar-border">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Theme
              </span>
              <ThemeToggle />
            </div>
          </div>
        ) : (
          <div className="px-1.5 py-2 border-t border-sidebar-border">
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        )}

        {/* Expand Button - Only show when collapsed */}
        {isCollapsed && (
          <div className="px-1.5 py-2 border-t border-sidebar-border">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSidebar}
              className="w-full h-9 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} className="shrink-0" />
            </Button>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "border-t border-sidebar-border",
          isCollapsed ? "p-2" : "p-3"
        )}
      >
        {isCollapsed ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogout}
            className="w-full h-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} className="shrink-0" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-10 flex items-center gap-2.5 rounded-lg border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="font-medium text-sm">Logout</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
