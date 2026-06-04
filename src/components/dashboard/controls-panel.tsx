"use client";

import { useState } from "react";
import { Monitor, Volume2, Sun, Moon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";

interface ControlsPanelProps {
  screenBrightness: number;
  onScreenBrightnessChange: (value: number) => void;
  onScreenBrightnessCommit: (value: number) => void;
  speakerVolume: number;
  onSpeakerVolumeChange: (value: number) => void;
  onSpeakerVolumeCommit: (value: number) => void;
}

export function ControlsPanel({
  screenBrightness,
  onScreenBrightnessChange,
  onScreenBrightnessCommit,
  speakerVolume,
  onSpeakerVolumeChange,
  onSpeakerVolumeCommit,
}: ControlsPanelProps) {
  // xl breakpoint is 1280px in Tailwind
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  return (
    <div className="glass-panel p-5 h-full flex flex-col">
      <div>
        <h3 className="text-sm font-semibold mb-4 text-foreground/80">Device Controls</h3>
      </div>

      <div className={cn(
        "flex-1 flex gap-6",
        isDesktop ? "flex-row justify-around py-2" : "flex-col justify-center space-y-2"
      )}>

      {/* Screen Brightness */}
      <ControlSlider
        label="Brightness"
        value={screenBrightness}
        onChange={onScreenBrightnessChange}
        onCommit={onScreenBrightnessCommit}
        icon={<Monitor className="w-4 h-4" />}
        leftIcon={<Moon className="w-3 h-3" />}
        rightIcon={<Sun className="w-3 h-3" />}
        color="chart-2"
        formatValue={(v) => `${v}%`}
        orientation={isDesktop ? "vertical" : "horizontal"}
      />

      {/* Speaker Volume */}
      <ControlSlider
        label="Volume"
        value={speakerVolume}
        onChange={onSpeakerVolumeChange}
        onCommit={onSpeakerVolumeCommit}
        icon={<Volume2 className="w-4 h-4" />}
        leftIcon={<Volume2 className="w-3 h-3 opacity-40" />}
        rightIcon={<Volume2 className="w-3 h-3" />}
        color="chart-1"
        formatValue={(v) => `${v}%`}
        orientation={isDesktop ? "vertical" : "horizontal"}
      />
      </div>
    </div>
  );
}

interface ControlSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
  icon: React.ReactNode;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  color: string;
  formatValue: (value: number) => string;
  orientation: "horizontal" | "vertical";
}

function ControlSlider({
  label,
  value,
  onChange,
  onCommit,
  icon,
  leftIcon,
  rightIcon,
  color,
  formatValue,
  orientation,
}: ControlSliderProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (orientation === "vertical") {
    return (
      <div
        className="flex flex-col items-center h-full justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span
          className={cn(
            "text-sm font-mono transition-all",
            isHovered ? "text-primary" : "text-muted-foreground"
          )}
        >
          {formatValue(value)}
        </span>

        <div className="flex-1 flex flex-col items-center gap-3 my-4">
          <span className="text-muted-foreground">{rightIcon}</span>
          <Slider
            orientation="vertical"
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            onValueCommit={([v]) => onCommit(v)}
            max={100}
            step={1}
            className={cn(
              "h-full",
              "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4",
              "[&_[role=slider]]:border-2 [&_[role=slider]]:border-primary",
              "[&_[role=slider]]:bg-background [&_[role=slider]]:shadow-md",
              "[&_.relative]:w-2 [&_.relative]:rounded-full",
              "[&_[data-slot=slider-track]]:bg-secondary/80"
            )}
          />
          <span className="text-muted-foreground">{leftIcon}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              isHovered ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground"
            )}
          >
            {icon}
          </div>
          <span className="text-xs font-medium text-foreground/80">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              isHovered ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground"
            )}
          >
            {icon}
          </div>
          <span className="text-sm font-medium text-foreground/80">{label}</span>
        </div>
        <span
          className={cn(
            "text-sm font-mono transition-all",
            isHovered ? "text-primary" : "text-muted-foreground"
          )}
        >
          {formatValue(value)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{leftIcon}</span>
        <div className="flex-1 relative">
          <Slider
            orientation="horizontal"
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            onValueCommit={([v]) => onCommit(v)}
            max={100}
            step={1}
            className={cn(
              "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4",
              "[&_[role=slider]]:border-2 [&_[role=slider]]:border-primary",
              "[&_[role=slider]]:bg-background [&_[role=slider]]:shadow-md",
              "[&_.relative]:h-2 [&_.relative]:rounded-full",
              "[&_[data-slot=slider-track]]:bg-secondary/80"
            )}
          />
        </div>
        <span className="text-muted-foreground">{rightIcon}</span>
      </div>
    </div>
  );
}
