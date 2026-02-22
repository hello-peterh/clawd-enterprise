"use client";

import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  avatar?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "flex items-start gap-3 px-1 py-3",
            index < items.length - 1 && "border-b border-border/50"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              getAvatarColor(item.user)
            )}
          >
            {getInitials(item.user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.user}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-medium">{item.target}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.timestamp}
            </p>
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <div className="pt-3">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            View all activity
          </button>
        </div>
      )}
      {items.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      )}
    </div>
  );
}
