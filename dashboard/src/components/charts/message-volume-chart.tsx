"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function generateMockData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      messages: Math.floor(Math.random() * 600) + 200,
    });
  }
  return data;
}

const data = generateMockData();

export function MessageVolumeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="messageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="messages"
          stroke="hsl(221, 83%, 53%)"
          strokeWidth={2}
          fill="url(#messageGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
