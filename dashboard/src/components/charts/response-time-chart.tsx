"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
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
      avgResponseTime: Math.floor(Math.random() * 400) + 200,
    });
  }
  return data;
}

const data = generateMockData();

export function ResponseTimeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          domain={[0, 800]}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number | undefined) => [`${value ?? 0}ms`, "Avg Response Time"]}
        />
        <ReferenceLine
          y={500}
          stroke="#ef4444"
          strokeDasharray="8 4"
          label={{
            value: "500ms target",
            position: "right",
            fill: "#ef4444",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="avgResponseTime"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
