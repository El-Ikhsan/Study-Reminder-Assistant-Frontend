"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  time: string;
  temperature: number;
  brightness: number;
  noise: number;
}

interface TelemetryChartProps {
  data: ChartDataPoint[];
  activeMetric: "temperature" | "brightness" | "noise";
  onMetricChange: (metric: "temperature" | "brightness" | "noise") => void;
}

const metrics = [
  { key: "temperature" as const, label: "Temperature", color: "var(--chart-1)", unit: "°C" },
  { key: "brightness" as const, label: "Brightness", color: "var(--chart-2)", unit: "lux" },
  { key: "noise" as const, label: "Noise", color: "var(--chart-3)", unit: "dB" },
];

export function TelemetryChart({ data, activeMetric, onMetricChange }: TelemetryChartProps) {
  const activeMetricConfig = useMemo(
    () => metrics.find((m) => m.key === activeMetric)!,
    [activeMetric]
  );

  return (
    <div className="glass-panel p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Live Telemetry</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time sensor data over the last 30 minutes
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
          {metrics.map((metric) => (
            <Button
              key={metric.key}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 rounded-lg text-xs transition-all",
                activeMetric === metric.key
                  ? "bg-background/80 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
              onClick={() => onMetricChange(metric.key)}
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeMetricConfig.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={activeMetricConfig.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickMargin={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickMargin={8}
              width={45}
              tickFormatter={(value) => `${value}${activeMetricConfig.unit}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-panel-subtle px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className="text-sm font-medium" style={{ color: activeMetricConfig.color }}>
                        {payload[0].value} {activeMetricConfig.unit}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={activeMetricConfig.color}
              strokeWidth={2}
              fill={`url(#gradient-${activeMetric})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: activeMetricConfig.color,
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
