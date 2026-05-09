"use client";

import { Thermometer, Sun, Volume2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryData {
  temperature: number;
  brightness: number;
  noise: number;
}

interface TelemetryCardsProps {
  data: TelemetryData;
}

export function TelemetryCards({ data }: TelemetryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TelemetryCard
        title="Temperature"
        value={data.temperature}
        unit="°C"
        icon={<Thermometer className="w-5 h-5" />}
        color="chart-1"
        min={15}
        max={35}
        optimal={{ min: 20, max: 26 }}
        trend={data.temperature > 23 ? "up" : "down"}
        trendValue={0.5}
      />
      <TelemetryCard
        title="Brightness"
        value={data.brightness}
        unit="lux"
        icon={<Sun className="w-5 h-5" />}
        color="chart-2"
        min={0}
        max={1000}
        optimal={{ min: 300, max: 500 }}
        trend={data.brightness > 400 ? "up" : "down"}
        trendValue={12}
      />
      <TelemetryCard
        title="Ambient Noise"
        value={data.noise}
        unit="dB"
        icon={<Volume2 className="w-5 h-5" />}
        color="chart-3"
        min={20}
        max={80}
        optimal={{ min: 30, max: 50 }}
        trend={data.noise > 40 ? "up" : "down"}
        trendValue={2}
      />
    </div>
  );
}

interface TelemetryCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  min: number;
  max: number;
  optimal: { min: number; max: number };
  trend: "up" | "down";
  trendValue: number;
}

function TelemetryCard({
  title,
  value,
  unit,
  icon,
  color,
  min,
  max,
  optimal,
  trend,
  trendValue,
}: TelemetryCardProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const isOptimal = value >= optimal.min && value <= optimal.max;
  
  return (
    <div className="glass-panel p-5 group hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            `bg-${color}/15 text-${color}`
          )}
          style={{ 
            backgroundColor: `var(--${color}) / 0.15)`,
            color: `var(--${color})`
          }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-primary" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {trend === "up" ? "+" : "-"}{trendValue} {unit}
              </span>
            </div>
          </div>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-medium",
          isOptimal 
            ? "bg-success/10 text-success" 
            : "bg-warning/10 text-warning"
        )}>
          {isOptimal ? "Optimal" : "Adjust"}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-2 bg-secondary/80 rounded-full overflow-hidden">
          {/* Optimal range indicator */}
          <div 
            className="absolute h-full bg-success/20 rounded-full"
            style={{
              left: `${((optimal.min - min) / (max - min)) * 100}%`,
              width: `${((optimal.max - optimal.min) / (max - min)) * 100}%`,
            }}
          />
          {/* Current value */}
          <div 
            className={cn(
              "absolute h-full rounded-full transition-all duration-500",
              isOptimal ? "bg-success" : "bg-warning"
            )}
            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{min} {unit}</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
}
