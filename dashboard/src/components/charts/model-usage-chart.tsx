"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Claude Sonnet", usage: 45 },
  { name: "Claude Haiku", usage: 30 },
  { name: "GPT-4o", usage: 15 },
  { name: "Claude Opus", usage: 10 },
];

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#7c3aed"];

export function ModelUsageChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          domain={[0, 50]}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number | undefined) => [`${value ?? 0}%`, "Usage"]}
        />
        <Bar dataKey="usage" radius={[0, 4, 4, 0]} barSize={28}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
