"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Session {
  id: string;
  userName: string;
  channel: string;
  startedAt: string;
  duration: string;
  status: "active" | "ended";
  messageCount: number;
  messages: Message[];
}

const mockSessions: Session[] = [
  {
    id: "sess-001",
    userName: "Alice Chen",
    channel: "Telegram",
    startedAt: "2026-02-22 09:15",
    duration: "12m 34s",
    status: "active",
    messageCount: 8,
    messages: [
      { id: "m1", role: "user", content: "Can you help me set up the API integration?", timestamp: "09:15" },
      { id: "m2", role: "assistant", content: "Of course! I can help you with the API integration. Which service would you like to connect?", timestamp: "09:15" },
      { id: "m3", role: "user", content: "I need to connect to our CRM system.", timestamp: "09:16" },
      { id: "m4", role: "assistant", content: "Great choice. I will walk you through setting up the CRM connection. First, you will need your API key from the CRM dashboard.", timestamp: "09:16" },
    ],
  },
  {
    id: "sess-002",
    userName: "Bob Martinez",
    channel: "WhatsApp",
    startedAt: "2026-02-22 08:42",
    duration: "45m 12s",
    status: "active",
    messageCount: 23,
    messages: [
      { id: "m5", role: "user", content: "What are our sales numbers for Q4?", timestamp: "08:42" },
      { id: "m6", role: "assistant", content: "Based on the latest data, Q4 revenue was $2.4M, up 18% from Q3.", timestamp: "08:42" },
      { id: "m7", role: "user", content: "How does that compare to last year?", timestamp: "08:43" },
    ],
  },
  {
    id: "sess-003",
    userName: "Carol Davis",
    channel: "Discord",
    startedAt: "2026-02-22 07:30",
    duration: "1h 15m",
    status: "ended",
    messageCount: 45,
    messages: [
      { id: "m8", role: "user", content: "I need help debugging a deployment issue.", timestamp: "07:30" },
      { id: "m9", role: "assistant", content: "I would be happy to help. Can you share the error logs?", timestamp: "07:30" },
      { id: "m10", role: "user", content: "The container keeps crashing with OOM errors.", timestamp: "07:31" },
      { id: "m11", role: "assistant", content: "That suggests your container is running out of memory. Let us look at the resource limits in your deployment config.", timestamp: "07:31" },
      { id: "m12", role: "user", content: "Found it, the limit was set to 256MB. Thanks!", timestamp: "07:45" },
    ],
  },
  {
    id: "sess-004",
    userName: "David Kim",
    channel: "Slack",
    startedAt: "2026-02-22 06:55",
    duration: "22m 08s",
    status: "ended",
    messageCount: 12,
    messages: [
      { id: "m13", role: "user", content: "Schedule a team meeting for next Tuesday.", timestamp: "06:55" },
      { id: "m14", role: "assistant", content: "I will check the calendar availability for next Tuesday. What time works best?", timestamp: "06:55" },
      { id: "m15", role: "user", content: "Afternoon, around 2pm.", timestamp: "06:56" },
    ],
  },
  {
    id: "sess-005",
    userName: "Eva Patel",
    channel: "Signal",
    startedAt: "2026-02-21 23:10",
    duration: "8m 45s",
    status: "ended",
    messageCount: 5,
    messages: [
      { id: "m16", role: "user", content: "What is the status of project Aurora?", timestamp: "23:10" },
      { id: "m17", role: "assistant", content: "Project Aurora is currently in Phase 2: Testing. 78% of test cases have passed, and the team is on track for the March 1st milestone.", timestamp: "23:10" },
      { id: "m18", role: "user", content: "Perfect, thank you.", timestamp: "23:11" },
    ],
  },
  {
    id: "sess-006",
    userName: "Frank Wilson",
    channel: "Telegram",
    startedAt: "2026-02-21 21:30",
    duration: "35m 20s",
    status: "ended",
    messageCount: 18,
    messages: [
      { id: "m19", role: "user", content: "Generate a report on customer churn rates.", timestamp: "21:30" },
      { id: "m20", role: "assistant", content: "I will compile the customer churn analysis. Our current monthly churn rate is 3.2%, down from 4.1% last quarter.", timestamp: "21:31" },
      { id: "m21", role: "user", content: "What are the main drivers?", timestamp: "21:32" },
      { id: "m22", role: "assistant", content: "The top three churn drivers are: 1) pricing concerns (38%), 2) feature gaps (27%), and 3) support response times (19%).", timestamp: "21:32" },
    ],
  },
  {
    id: "sess-007",
    userName: "Grace Lee",
    channel: "WhatsApp",
    startedAt: "2026-02-21 18:20",
    duration: "5m 10s",
    status: "ended",
    messageCount: 3,
    messages: [
      { id: "m23", role: "user", content: "Quick question: what is our current NPS score?", timestamp: "18:20" },
      { id: "m24", role: "assistant", content: "Our current NPS score is 72, which is considered excellent. It is up 5 points from last quarter.", timestamp: "18:20" },
      { id: "m25", role: "user", content: "Great, thanks!", timestamp: "18:21" },
    ],
  },
  {
    id: "sess-008",
    userName: "Henry Zhao",
    channel: "Discord",
    startedAt: "2026-02-21 16:45",
    duration: "1h 02m",
    status: "ended",
    messageCount: 38,
    messages: [
      { id: "m26", role: "user", content: "Help me draft an architecture proposal for the new microservices migration.", timestamp: "16:45" },
      { id: "m27", role: "assistant", content: "I would be happy to help with the architecture proposal. Let us start by outlining the current monolith structure and the target microservices design.", timestamp: "16:45" },
      { id: "m28", role: "user", content: "We have 5 main domains: auth, orders, inventory, payments, and notifications.", timestamp: "16:47" },
    ],
  },
  {
    id: "sess-009",
    userName: "Iris Nakamura",
    channel: "Slack",
    startedAt: "2026-02-21 14:00",
    duration: "15m 30s",
    status: "ended",
    messageCount: 9,
    messages: [
      { id: "m29", role: "user", content: "What are the top feature requests from this month?", timestamp: "14:00" },
      { id: "m30", role: "assistant", content: "The top 3 feature requests this month are: 1) Dark mode (142 votes), 2) API rate limit dashboard (98 votes), 3) Custom webhook templates (76 votes).", timestamp: "14:00" },
      { id: "m31", role: "user", content: "Add dark mode to the next sprint.", timestamp: "14:02" },
    ],
  },
  {
    id: "sess-010",
    userName: "Jack Thompson",
    channel: "Signal",
    startedAt: "2026-02-21 11:30",
    duration: "28m 55s",
    status: "ended",
    messageCount: 15,
    messages: [
      { id: "m32", role: "user", content: "Summarize the incident report from last night.", timestamp: "11:30" },
      { id: "m33", role: "assistant", content: "Last night at 02:14 UTC, the primary database experienced a connection pool exhaustion. Root cause: a runaway query from the analytics service. Impact: 12 minutes of degraded API performance. Resolution: the analytics query was killed and connection pool limits were increased.", timestamp: "11:30" },
      { id: "m34", role: "user", content: "What preventive measures are in place now?", timestamp: "11:32" },
      { id: "m35", role: "assistant", content: "Three measures have been implemented: 1) Query timeout of 30s for analytics, 2) Separate connection pool for analytics workloads, 3) Alert trigger at 80% pool utilization.", timestamp: "11:32" },
    ],
  },
];

export default function SessionsPage() {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  function toggleSession(sessionId: string) {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
        <p className="text-muted-foreground">
          Active and recent conversation sessions
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-10 px-4 py-3 text-left font-medium"></th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Channel</th>
                <th className="px-4 py-3 text-left font-medium">Started</th>
                <th className="px-4 py-3 text-left font-medium">Duration</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Messages</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockSessions.map((session) => (
                <>
                  <tr
                    key={session.id}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleSession(session.id)}
                  >
                    <td className="px-4 py-3">
                      {expandedSessions.has(session.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{session.userName}</td>
                    <td className="px-4 py-3">{session.channel}</td>
                    <td className="px-4 py-3 text-muted-foreground">{session.startedAt}</td>
                    <td className="px-4 py-3 text-muted-foreground">{session.duration}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={session.status === "active" ? "default" : "secondary"}
                        className={
                          session.status === "active"
                            ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20"
                            : "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20"
                        }
                      >
                        {session.status === "active" ? "Active" : "Ended"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{session.messageCount}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSession(session.id);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                  {expandedSessions.has(session.id) && (
                    <tr key={`${session.id}-messages`}>
                      <td colSpan={8} className="bg-muted/30 px-4 py-4">
                        <div className="mx-auto max-w-2xl space-y-3">
                          {session.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.role === "user" ? "justify-start" : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                  message.role === "user"
                                    ? "bg-muted text-foreground"
                                    : "bg-blue-600 text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium opacity-70">
                                    {message.role === "user" ? session.userName : "Clawd AI"}
                                  </span>
                                  <span className="text-xs opacity-50">{message.timestamp}</span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
