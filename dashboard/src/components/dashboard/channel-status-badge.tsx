import { cn } from "@/lib/utils";

interface ChannelStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; dotClass: string; textClass: string }
> = {
  online: {
    label: "Online",
    dotClass: "bg-emerald-500 animate-clawd-pulse-subtle",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  offline: {
    label: "Offline",
    dotClass: "bg-slate-400 dark:bg-slate-500",
    textClass: "text-slate-600 dark:text-slate-400",
  },
  error: {
    label: "Error",
    dotClass: "bg-rose-500",
    textClass: "text-rose-700 dark:text-rose-400",
  },
  connecting: {
    label: "Connecting",
    dotClass: "bg-amber-500 animate-clawd-pulse-subtle",
    textClass: "text-amber-700 dark:text-amber-400",
  },
};

export function ChannelStatusBadge({
  status,
  className,
}: ChannelStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.offline;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        config.textClass,
        className
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full shrink-0", config.dotClass)}
      />
      {config.label}
    </span>
  );
}
