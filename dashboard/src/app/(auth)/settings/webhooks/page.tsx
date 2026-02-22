"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, Plus, Trash2, Play, X, ChevronDown, ChevronUp } from "lucide-react";

const AVAILABLE_EVENTS = [
  "user.created",
  "user.updated",
  "channel.started",
  "channel.stopped",
  "session.created",
  "message.sent",
  "settings.updated",
];

interface Delivery {
  id: string;
  event: string;
  responseStatus: number | null;
  deliveredAt: string;
}

interface WebhookEndpointData {
  id: string;
  url: string;
  enabled: boolean;
  events: string[];
  deliveries: Delivery[];
}

const initialEndpoints: WebhookEndpointData[] = [
  {
    id: "wh_1",
    url: "https://api.example.com/webhooks/clawd",
    enabled: true,
    events: ["user.created", "user.updated", "session.created"],
    deliveries: [
      {
        id: "del_1",
        event: "user.created",
        responseStatus: 200,
        deliveredAt: "2026-02-21T14:30:00Z",
      },
      {
        id: "del_2",
        event: "session.created",
        responseStatus: 200,
        deliveredAt: "2026-02-21T13:15:00Z",
      },
      {
        id: "del_3",
        event: "user.updated",
        responseStatus: 500,
        deliveredAt: "2026-02-20T09:45:00Z",
      },
    ],
  },
  {
    id: "wh_2",
    url: "https://hooks.slack.com/services/T00/B00/xxx",
    enabled: false,
    events: ["channel.started", "channel.stopped", "message.sent"],
    deliveries: [
      {
        id: "del_4",
        event: "channel.started",
        responseStatus: 200,
        deliveredAt: "2026-02-19T11:00:00Z",
      },
      {
        id: "del_5",
        event: "message.sent",
        responseStatus: null,
        deliveredAt: "2026-02-18T16:20:00Z",
      },
    ],
  },
];

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState(initialEndpoints);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  }

  function handleAdd() {
    if (!newUrl.trim() || selectedEvents.length === 0) return;
    const newEndpoint: WebhookEndpointData = {
      id: `wh_${Date.now()}`,
      url: newUrl.trim(),
      enabled: true,
      events: selectedEvents,
      deliveries: [],
    };
    setEndpoints((prev) => [...prev, newEndpoint]);
    setNewUrl("");
    setSelectedEvents([]);
    setShowAddForm(false);
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this webhook endpoint?")) {
      setEndpoints((prev) => prev.filter((ep) => ep.id !== id));
    }
  }

  function handleTest(id: string) {
    const endpoint = endpoints.find((ep) => ep.id === id);
    if (!endpoint) return;
    const newDelivery: Delivery = {
      id: `del_${Date.now()}`,
      event: "test.ping",
      responseStatus: 200,
      deliveredAt: new Date().toISOString(),
    };
    setEndpoints((prev) =>
      prev.map((ep) =>
        ep.id === id
          ? { ...ep, deliveries: [newDelivery, ...ep.deliveries] }
          : ep
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Webhooks</h2>
          <p className="text-muted-foreground">
            Configure webhook endpoints for event notifications
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Add Endpoint Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Webhook Endpoint</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.example.com/webhooks"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subscribe to Events</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AVAILABLE_EVENTS.map((event) => (
                  <label
                    key={event}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="rounded"
                    />
                    {event}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Create Endpoint</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoint Cards */}
      {endpoints.map((endpoint) => (
        <Card key={endpoint.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Webhook className="h-4 w-4" />
                  <code className="text-sm font-normal">{endpoint.url}</code>
                </CardTitle>
                <CardDescription className="flex flex-wrap gap-1.5">
                  {endpoint.events.map((event) => (
                    <Badge key={event} variant="secondary">
                      {event}
                    </Badge>
                  ))}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={endpoint.enabled ? "default" : "secondary"}
                >
                  {endpoint.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTest(endpoint.id)}
              >
                <Play className="h-3 w-3" />
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExpandedEndpoint(
                    expandedEndpoint === endpoint.id ? null : endpoint.id
                  )
                }
              >
                {expandedEndpoint === endpoint.id ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Deliveries ({endpoint.deliveries.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(endpoint.id)}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>

            {/* Delivery History */}
            {expandedEndpoint === endpoint.id &&
              endpoint.deliveries.length > 0 && (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left">
                        <th className="px-4 py-2 font-medium text-muted-foreground">
                          Event
                        </th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">
                          Delivered At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.deliveries.map((delivery) => (
                        <tr
                          key={delivery.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-2">
                            <Badge variant="outline">{delivery.event}</Badge>
                          </td>
                          <td className="px-4 py-2">
                            {delivery.responseStatus === null ? (
                              <Badge variant="destructive">Failed</Badge>
                            ) : delivery.responseStatus >= 200 &&
                              delivery.responseStatus < 300 ? (
                              <Badge variant="default">
                                {delivery.responseStatus}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                {delivery.responseStatus}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {new Date(delivery.deliveredAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </CardContent>
        </Card>
      ))}

      {endpoints.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No webhook endpoints</p>
            <p className="text-sm text-muted-foreground">
              Create an endpoint to start receiving event notifications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
