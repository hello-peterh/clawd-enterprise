"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Radio,
  Play,
  Square,
  MessageSquare,
  Hash,
  AtSign,
  Send,
  Phone,
  Globe,
  AlertCircle,
} from "lucide-react";

type Channel = {
  id: string;
  name: string;
  type: string;
  status: string;
  messageCount?: number;
};

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  slack: Hash,
  discord: MessageSquare,
  teams: AtSign,
  telegram: Send,
  whatsapp: Phone,
  matrix: Globe,
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  running: { label: "Running", variant: "default" },
  started: { label: "Running", variant: "default" },
  active: { label: "Active", variant: "default" },
  stopped: { label: "Stopped", variant: "secondary" },
  error: { label: "Error", variant: "destructive" },
  unknown: { label: "Unknown", variant: "outline" },
};

export default function ChannelsPage() {
  const utils = trpc.useUtils();
  const channels = trpc.channels.list.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const startChannel = trpc.channels.start.useMutation({
    onSuccess: () => {
      utils.channels.list.invalidate();
    },
  });

  const stopChannel = trpc.channels.stop.useMutation({
    onSuccess: () => {
      utils.channels.list.invalidate();
    },
  });

  const isGatewayConnected = channels.data?.connected ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Channels</h2>
          <p className="text-muted-foreground">
            View and manage connected messaging channels
          </p>
        </div>
        {!isGatewayConnected && !channels.isLoading && (
          <Badge variant="outline" className="gap-1.5">
            <AlertCircle className="h-3 w-3" />
            Gateway Disconnected
          </Badge>
        )}
      </div>

      {!isGatewayConnected && !channels.isLoading && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>
                The OpenClaw gateway is not connected. Channel data shown below
                is placeholder data. Configure your gateway connection in{" "}
                <span className="font-medium text-foreground">Settings</span> to
                manage live channels.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {channels.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.data?.channels?.map((channel: Channel) => {
            const Icon = channelIcons[channel.type] ?? Radio;
            const status = statusConfig[channel.status] ?? statusConfig.unknown;
            const isRunning =
              channel.status === "running" ||
              channel.status === "started" ||
              channel.status === "active";
            const isMutating =
              startChannel.isPending || stopChannel.isPending;

            return (
              <Card key={channel.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {channel.name}
                        </CardTitle>
                        <CardDescription className="text-xs capitalize">
                          {channel.type}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between">
                    {channel.messageCount !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {channel.messageCount.toLocaleString()} messages
                      </p>
                    )}
                    <div className="ml-auto">
                      {isRunning ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isMutating || !isGatewayConnected}
                          onClick={() =>
                            stopChannel.mutate({ id: channel.id })
                          }
                        >
                          <Square className="mr-1.5 h-3 w-3" />
                          Stop
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isMutating || !isGatewayConnected}
                          onClick={() =>
                            startChannel.mutate({ id: channel.id })
                          }
                        >
                          <Play className="mr-1.5 h-3 w-3" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {channels.data?.channels?.length === 0 && (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Radio className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-1">No channels yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Connect your first messaging channel through the OpenClaw
                  gateway to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
