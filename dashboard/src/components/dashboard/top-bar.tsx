"use client";

import { signOut } from "next-auth/react";
import { LogOut, Moon, Sun, Search, Bell, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TopBarProps {
  user: {
    name: string | null;
    email: string;
  };
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/channels": "Channels",
  "/analytics": "Analytics",
  "/audit-log": "Audit Log",
  "/settings": "Settings",
  "/settings/security": "Security",
  "/settings/api-keys": "API Keys",
  "/settings/notifications": "Notifications",
  "/settings/organizations": "Organizations",
};

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [];

  if (pathname === "/dashboard") {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }

  crumbs.push({ label: "Dashboard", href: "/dashboard" });

  if (pathname.startsWith("/settings/")) {
    crumbs.push({ label: "Settings", href: "/settings" });
  }

  const label = routeLabels[pathname];
  if (label) {
    crumbs.push({ label });
  }

  return crumbs;
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const preferred =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(preferred);
    document.documentElement.classList.toggle("dark", preferred === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-30">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.label} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Search trigger */}
      <button className="hidden sm:flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-2 hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
          {"\u2318"}K
        </kbd>
      </button>

      {/* Notification bell */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
          3
        </span>
      </Button>

      {/* Theme toggle */}
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback
                className={cn(
                  "text-xs font-semibold bg-gradient-to-br from-violet-500 to-violet-600 text-white"
                )}
              >
                {user.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">
              {user.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
