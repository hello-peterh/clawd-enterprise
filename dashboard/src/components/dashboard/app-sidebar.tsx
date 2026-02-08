"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Radio,
  BarChart3,
  ScrollText,
  Settings,
  Shield,
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

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "Channels", href: "/channels", icon: Radio },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Audit Log", href: "/audit-log", icon: ScrollText },
  { title: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  user: {
    name: string | null;
    role: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold leading-none">Clawd</h1>
            <span className="text-xs text-muted-foreground">Enterprise</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium leading-none truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
