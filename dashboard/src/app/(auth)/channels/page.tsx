import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Channels</h2>
        <p className="text-muted-foreground">
          View and manage connected messaging channels
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Channel Management</CardTitle>
          <CardDescription>
            Channel status and controls will be available once the gateway API client is connected (Phase 2).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
