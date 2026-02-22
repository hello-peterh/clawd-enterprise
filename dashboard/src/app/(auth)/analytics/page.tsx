"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Timer, Radio, ArrowUpRight } from "lucide-react";
import { MessageVolumeChart } from "@/components/charts/message-volume-chart";
import { ChannelBreakdownChart } from "@/components/charts/channel-breakdown-chart";
import { ModelUsageChart } from "@/components/charts/model-usage-chart";
import { ResponseTimeChart } from "@/components/charts/response-time-chart";

const stats = [
  {
    title: "Total Messages",
    value: "12,847",
    description: "+12% from last month",
    icon: MessageSquare,
  },
  {
    title: "Avg Response",
    value: "342ms",
    description: "-8% from last month",
    icon: Timer,
  },
  {
    title: "Active Channels",
    value: "8",
    description: "2 added this month",
    icon: Radio,
  },
  {
    title: "Uptime",
    value: "99.7%",
    description: "Last 30 days",
    icon: ArrowUpRight,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Message volume, channel usage, and model analytics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageVolumeChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelBreakdownChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ModelUsageChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTimeChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
