"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Users,
  BarChart3,
  Shield,
  Plus,
  UserPlus,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import { useSession } from "next-auth/react";

const stats = [
  {
    title: "Active Channels",
    value: "12",
    description: "from last month",
    icon: Radio,
    trend: "up" as const,
    trendValue: "+3",
  },
  {
    title: "Total Users",
    value: "48",
    description: "across all roles",
    icon: Users,
    trend: "up" as const,
    trendValue: "+7",
  },
  {
    title: "Messages Today",
    value: "1,284",
    description: "vs 1,100 yesterday",
    icon: BarChart3,
    trend: "up" as const,
    trendValue: "+16.7%",
  },
  {
    title: "System Health",
    value: "99.9%",
    description: "uptime this month",
    icon: Shield,
    trend: "neutral" as const,
    trendValue: "Stable",
  },
];

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    user: "Sarah Chen",
    action: "connected",
    target: "#general on Slack",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    user: "Alex Rivera",
    action: "invited",
    target: "jordan@company.com",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    user: "Morgan Lee",
    action: "updated config for",
    target: "Discord Bot",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: "Jamie Park",
    action: "viewed audit log for",
    target: "Teams Integration",
    timestamp: "3 hours ago",
  },
  {
    id: "5",
    user: "Taylor Kim",
    action: "deployed model update to",
    target: "Production",
    timestamp: "5 hours ago",
  },
];

const gettingStartedSteps = [
  { label: "Create admin account", done: true },
  { label: "Configure gateway connection", done: false },
  { label: "Connect your first channel", done: false },
  { label: "Invite team members", done: false },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] ?? "there";
  const completedSteps = gettingStartedSteps.filter((s) => s.done).length;
  const totalSteps = gettingStartedSteps.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="space-y-8 animate-clawd-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {userName}
          </h2>
          <p className="text-muted-foreground">{formatDate()}</p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className={`animate-clawd-slide-up opacity-0 animate-delay-${(i + 1) * 100}`}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              trendValue={stat.trendValue}
            />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 shadow-md shadow-blue-500/20">
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
        <Button variant="outline" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Two column: Activity + Getting Started */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Activity feed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across your enterprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={recentActivity} />
          </CardContent>
        </Card>

        {/* Getting started */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to set up your instance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completedSteps}/{totalSteps} completed
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {gettingStartedSteps.map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      step.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {!step.done && (
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
