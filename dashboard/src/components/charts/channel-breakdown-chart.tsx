"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

const data = [
  { name: "Telegram", value: 35 },
  { name: "WhatsApp", value: 25 },
  { name: "Discord", value: 20 },
  { name: "Slack", value: 12 },
  { name: "Signal", value: 8 },
];

const COLORS = ["#3b82f6", "#22c55e", "#7c3aed", "#f59e0b", "#ef4444"];

export function ChannelBreakdownChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={(props: PieLabelRenderProps) => {
            const { name, percent } = props;
            return `${name ?? ""} ${((percent as number) * 100).toFixed(0)}%`;
          }}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number | undefined) => [`${value ?? 0}%`, "Share"]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span className="text-sm text-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
