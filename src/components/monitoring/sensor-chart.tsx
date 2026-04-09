"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Reading {
  value: number;
  recorded_at: string;
  is_alert: boolean;
}

interface SensorChartProps {
  data: Reading[];
  max?: number;
  unit: string;
  color: string;
  height?: number;
}

export function SensorChart({ data, max, unit, color, height = 120 }: SensorChartProps) {
  // 시간순 정렬 (API는 DESC로 옴)
  const sorted = [...data].reverse().map((d) => ({
    ...d,
    time: new Date(d.recorded_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="time"
          tick={{ fontSize: 9, fill: "#888" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#888" }}
          width={35}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "11px",
          }}
          formatter={(value) => [`${value}${unit}`, ""]}
          labelStyle={{ color: "var(--muted)" }}
        />
        {max && (
          <ReferenceLine
            y={max}
            stroke="var(--danger)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
        {max && (
          <ReferenceLine
            y={max * 0.85}
            stroke="var(--accent)"
            strokeDasharray="2 4"
            strokeWidth={1}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
