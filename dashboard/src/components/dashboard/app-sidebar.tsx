"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Radio,
  BarChart3,
  ScrollText,
  MessageSquare,
  Settings,
  Sparkles,
  ChevronDown,
  Globe,
  Shield,
  Key,
  Bell,
  Building2,
  Webhook,
  Database,
  Lock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "Channels", href: "/channels", icon: Radio },
  { title: "Sessions", href: "/sessions", icon: MessageSquare },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Organizations", href: "/organizations", icon: Building2 },
  { title: "Audit Log", href: "/audit-log", icon: ScrollText },
];

const settingsNavItems = [
  { title: "General", href: "/settings", icon: Settings },
  { title: "Security", href: "/settings/security", icon: Shield },
  { title: "SSO", href: "/settings/sso", icon: Lock },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Webhooks", href: "/settings/webhooks", icon: Webhook },
  { title: "Backup", href: "/settings/backup", icon: Database },
  { title: "Notifications", href: "/settings/notifications", icon: Bell },
];

interface AppSidebarProps {
  user: {
    name: string | null;
    role: string;
    orgName?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/settings")
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 shadow-sm shadow-violet-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold leading-none">Clawd</h1>
            <span className="inline-flex items-center rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-400">
              Enterprise
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "relative transition-colors",
                        isActive &&
                          "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-full before:bg-violet-600 dark:before:bg-violet-400"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-muted-foreground"
                          )}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible Settings section */}
        <SidebarGroup>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <span>Settings</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                settingsOpen && "rotate-180"
              )}
            />
          </button>
          {settingsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "relative transition-colors",
                          isActive &&
                            "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-full before:bg-violet-600 dark:before:bg-violet-400"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive
                                ? "text-violet-600 dark:text-violet-400"
                                : "text-muted-foreground"
                            )}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-xs font-semibold text-white shadow-sm">
            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">
              {user.name}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <RoleBadge role={user.role} />
            </div>
            {user.orgName && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span className="truncate">{user.orgName}</span>
              </div>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
