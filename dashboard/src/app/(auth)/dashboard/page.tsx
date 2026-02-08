import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, BarChart3, Shield } from "lucide-react";

const stats = [
  {
    title: "Active Channels",
    value: "—",
    description: "Connect to gateway to view",
    icon: Radio,
  },
  {
    title: "Total Users",
    value: "1",
    description: "Admin account",
    icon: Users,
  },
  {
    title: "Messages Today",
    value: "—",
    description: "Connect to gateway to view",
    icon: BarChart3,
  },
  {
    title: "System Health",
    value: "Setup",
    description: "Configure gateway connection",
    icon: Shield,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your Clawd Enterprise instance
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

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to set up your enterprise instance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="default">Done</Badge>
              <span className="text-sm">Create admin account</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">Todo</Badge>
              <span className="text-sm">Configure gateway connection</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">Todo</Badge>
              <span className="text-sm">Connect your first channel</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">Todo</Badge>
              <span className="text-sm">Invite team members</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
