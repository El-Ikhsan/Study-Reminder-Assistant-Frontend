"use client";

import { Play, Pause, RotateCcw, Coffee, Brain, Settings2, Book, Laptop, Smartphone, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type SessionType = "focus" | "break";
type LearningMedia = "book" | "laptop" | "phone" | "computer";

interface PomodoroSettings {
  focusDuration: number;
  breakDuration: number;
  totalCycles: number;
  learningMedia: LearningMedia;
}

interface PomodoroTimerProps {
  isRunning: boolean;
  onToggle: () => void;
  timeLeft: number;
  onReset: () => void;
  sessionType: SessionType;
  currentCycle: number;
  sessionsCompleted: number;
  settings: PomodoroSettings;
  onUpdateSettings: (settings: Partial<PomodoroSettings>) => void;
  isComplete: boolean;
}

const LEARNING_MEDIA_OPTIONS: { value: LearningMedia; label: string; icon: React.ElementType }[] = [
  { value: "book", label: "Buku", icon: Book },
  { value: "laptop", label: "Laptop", icon: Laptop },
  { value: "phone", label: "HP", icon: Smartphone },
  { value: "computer", label: "Komputer", icon: Monitor },
];

export function PomodoroTimer({
  isRunning,
  onToggle,
  timeLeft,
  onReset,
  sessionType,
  currentCycle,
  sessionsCompleted,
  settings,
  onUpdateSettings,
  isComplete,
}: PomodoroTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalTime = sessionType === "focus" 
    ? settings.focusDuration * 60 
    : settings.breakDuration * 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const currentMediaOption = LEARNING_MEDIA_OPTIONS.find(
    (opt) => opt.value === settings.learningMedia
  );
  const MediaIcon = currentMediaOption?.icon || Laptop;

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Focus Timer</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sessionsCompleted} sesi selesai hari ini
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Learning Media Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 rounded-lg">
            <MediaIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{currentMediaOption?.label}</span>
          </div>
          
          {/* Settings Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-secondary/50"
              >
                <Settings2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 glass-panel border-border/50 p-4" 
              align="end"
              sideOffset={8}
            >
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings2 className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Pengaturan Pomodoro</h4>
                </div>

                {/* Focus Duration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-primary" />
                      Durasi Fokus
                    </Label>
                    <span className="text-sm font-medium text-primary">
                      {settings.focusDuration} menit
                    </span>
                  </div>
                  <Slider
                    value={[settings.focusDuration]}
                    onValueChange={([value]) => onUpdateSettings({ focusDuration: value })}
                    min={5}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Break Duration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center gap-2">
                      <Coffee className="w-3.5 h-3.5 text-success" />
                      Durasi Istirahat
                    </Label>
                    <span className="text-sm font-medium text-success">
                      {settings.breakDuration} menit
                    </span>
                  </div>
                  <Slider
                    value={[settings.breakDuration]}
                    onValueChange={([value]) => onUpdateSettings({ breakDuration: value })}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Total Cycles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Pengulangan</Label>
                    <span className="text-sm font-medium">
                      {settings.totalCycles}x siklus
                    </span>
                  </div>
                  <Slider
                    value={[settings.totalCycles]}
                    onValueChange={([value]) => onUpdateSettings({ totalCycles: value })}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Learning Media */}
                <div className="space-y-3">
                  <Label className="text-sm">Media Belajar</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {LEARNING_MEDIA_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = settings.learningMedia === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => onUpdateSettings({ learningMedia: option.value })}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all border",
                            isSelected
                              ? "bg-primary/10 border-primary/50 text-primary"
                              : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Current Session Indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          sessionType === "focus" 
            ? "bg-primary/10 text-primary" 
            : "bg-success/10 text-success"
        )}>
          {sessionType === "focus" ? (
            <>
              <Brain className="w-3.5 h-3.5" />
              Fokus
            </>
          ) : (
            <>
              <Coffee className="w-3.5 h-3.5" />
              Istirahat
            </>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Siklus {currentCycle} dari {settings.totalCycles}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Background circle */}
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="8"
              strokeOpacity="0.8"
            />
            {/* Progress circle */}
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={sessionType === "focus" ? "var(--primary)" : "var(--success)"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>

          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isComplete ? (
              <>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-success" />
                </div>
                <span className="text-sm font-medium text-success">Selesai!</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {settings.totalCycles} siklus selesai
                </span>
              </>
            ) : (
              <>
                <span className="text-4xl font-semibold tracking-tight font-mono">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-muted-foreground mt-1 capitalize">
                  {sessionType === "focus" ? "Waktu fokus" : "Waktu istirahat"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl hover:bg-secondary/50"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-2xl transition-all shadow-lg",
            isComplete
              ? "bg-success/80 hover:bg-success text-success-foreground"
              : isRunning
                ? "bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          onClick={isComplete ? onReset : onToggle}
        >
          {isComplete ? (
            <RotateCcw className="w-5 h-5" />
          ) : isRunning ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        <div className="w-10" /> {/* Spacer for symmetry */}
      </div>

      {/* Cycle indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {Array.from({ length: settings.totalCycles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i < currentCycle - 1 || (i === currentCycle - 1 && sessionType === "break")
                ? "bg-primary"
                : i === currentCycle - 1 && isRunning
                  ? "bg-primary/50 animate-pulse-soft"
                  : "bg-secondary/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
