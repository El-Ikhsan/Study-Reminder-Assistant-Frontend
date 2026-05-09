"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Coffee,
  MessageSquare,
  AlertTriangle,
  Bell,
  Thermometer,
  Sun,
  Volume2,
  Clock,
  Book,
  Laptop,
  Smartphone,
  Monitor,
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PomodoroSession, PomodoroLog, SensorEvent, SessionLogData } from "@/types/pomodoro";

interface SessionLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: PomodoroSession;
}

const MEDIA_ICONS = {
  Buku: Book,
  Laptop: Laptop,
  HP: Smartphone,
  Komputer: Monitor,
};

const STATUS_CONFIG = {
  running: {
    icon: PlayCircle,
    label: "Berjalan",
    className: "text-primary bg-primary/10",
  },
  paused: {
    icon: PauseCircle,
    label: "Dijeda",
    className: "text-warning bg-warning/10",
  },
  completed: {
    icon: CheckCircle2,
    label: "Selesai",
    className: "text-success bg-success/10",
  },
  cancelled: {
    icon: XCircle,
    label: "Dibatalkan",
    className: "text-destructive bg-destructive/10",
  },
};

const LOG_TYPE_CONFIG = {
  phase_alert: {
    icon: Bell,
    label: "Fase Alert",
    className: "text-primary bg-primary/10",
  },
  voice_chat: {
    icon: MessageSquare,
    label: "Voice Chat",
    className: "text-accent bg-accent/10",
  },
  system_alert: {
    icon: AlertTriangle,
    label: "System Alert",
    className: "text-warning bg-warning/10",
  },
};

const EMOTION_CONFIG: Record<string, { color: string; bg: string }> = {
  IDLE: { color: "text-muted-foreground", bg: "bg-secondary/50" },
  DARK: { color: "text-warning", bg: "bg-warning/10" },
  NOISY: { color: "text-destructive", bg: "bg-destructive/10" },
  HOT: { color: "text-orange-500", bg: "bg-orange-500/10" },
  COLD: { color: "text-blue-500", bg: "bg-blue-500/10" },
};

// Mock function to fetch session logs - replace with actual API call
const fetchSessionLogs = async (sessionId: string): Promise<SessionLogData> => {
  // Simulated API response matching the data structure provided
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // This is mock data - in production, fetch from your API
  if (sessionId === "5ae880f3-25a3-4166-bea8-951d3dfb3512") {
    return {
      logs: [
        {
          id: "e655f64f-fa6f-480f-b9d8-b3de769d8e92",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          logType: "phase_alert",
          currentCycle: 1,
          pomodoroMode: "fokus",
          triggerContext: "Pomodoro: Fase Awal Fokus [Waktu: 5 Menit] [Media: Laptop]",
          aiResponse: "Fokuslah di depan laptop. 5 menit pertama adalah penentu keberhasilan sesi belajarmu.",
          emotion: "IDLE",
          createdAt: "2026-05-07T17:23:07.000Z",
        },
        {
          id: "f947fcf6-60a9-4937-be08-3678cb18f43f",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          logType: "phase_alert",
          currentCycle: 1,
          pomodoroMode: "fokus",
          triggerContext: "Pomodoro: Fase Pertengahan Fokus [Waktu: 3 Menit]",
          aiResponse: "Sisa 3 menit. Jangan biarkan kelelahan menghentikanmu, segera kembali bekerja.",
          emotion: "IDLE",
          createdAt: "2026-05-07T17:25:36.000Z",
        },
        {
          id: "55a72f0d-cb3f-475f-a2a8-d212b725c118",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          logType: "phase_alert",
          currentCycle: 1,
          pomodoroMode: "fokus",
          triggerContext: "Pomodoro: Fase Akhir Fokus [Waktu: 22 Detik] [Media: Laptop]",
          aiResponse: "Akhir fase fokus. 22 detik terakhir di depan laptop, jangan biarkan matamu lelah.",
          emotion: "IDLE",
          createdAt: "2026-05-07T17:27:44.000Z",
        },
        {
          id: "ec0b2e7c-26ef-41a5-ac67-584506469d09",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          logType: "phase_alert",
          currentCycle: 1,
          pomodoroMode: "istirahat",
          triggerContext: "Pomodoro: Fase Istirahat Pendek [Waktu: 2 Menit]",
          aiResponse: "Berdiri dan berjalanlah. 2 menit sudah cukup untuk kamu melonggarkan otot-ototmu.",
          emotion: "DARK",
          createdAt: "2026-05-07T17:28:07.000Z",
        },
        {
          id: "a823fee5-79e3-4529-aa95-7a81ab08596e",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          logType: "phase_alert",
          currentCycle: 1,
          pomodoroMode: "istirahat",
          triggerContext: "Pomodoro: Fase Peringatan Istirahat Akhir [Waktu: 11 Detik]",
          aiResponse: "Waktu istirahat hampir habis. Segera kembali ke meja belajarmu dalam 11 detik terakhir ini.",
          emotion: "IDLE",
          createdAt: "2026-05-07T17:29:56.000Z",
        },
        {
          id: "35696538-15cf-4856-af9e-993c4ba2fb1b",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          logType: "phase_alert",
          currentCycle: 1,
          pomodoroMode: "istirahat",
          triggerContext: "Pomodoro: Sesi Selesai [Putaran: 1] [Media: Laptop]",
          aiResponse: "Sesi 1 selesai. Kumpulkan semua catatan di layar laptopmu sekarang juga.",
          emotion: "IDLE",
          createdAt: "2026-05-07T17:30:10.000Z",
        },
      ],
      sensorEvents: [
        {
          id: "4f24b0ca-c747-457f-9494-0a56da13c4fe",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          eventType: "interupsi",
          triggerContext: "Interupsi: Suara Bising [Media: Laptop]",
          aiResponse: "Keributan ini mengganggu konsentrasiku. Tolong tutup pintu agar suara bising itu hilang.",
          emotion: "NOISY",
          temperatureAtTime: 28,
          lightAtTime: 647,
          noiseAtTime: 81,
          createdAt: "2026-05-07T17:26:27.000Z",
        },
        {
          id: "b6f30268-5625-445b-b862-6a5eb12aa05a",
          sessionId: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
          eventType: "pemulihan",
          triggerContext: "Transisi: Suara Bising ke Ramai",
          aiResponse: "Keributan berkurang menjadi ramai yang wajar. Kita bisa memulihkan kondisi ruangan ini.",
          emotion: "IDLE",
          temperatureAtTime: 28,
          lightAtTime: 647,
          noiseAtTime: 73,
          createdAt: "2026-05-07T17:27:00.000Z",
        },
      ],
    };
  }
  
  // Return empty data for other sessions
  return { logs: [], sensorEvents: [] };
};

export function SessionLogDialog({
  open,
  onOpenChange,
  session,
}: SessionLogDialogProps) {
  const [logData, setLogData] = useState<SessionLogData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const MediaIcon = MEDIA_ICONS[session.media];
  const statusConfig = STATUS_CONFIG[session.status];
  const StatusIcon = statusConfig.icon;

  useEffect(() => {
    if (open && session.id) {
      setIsLoading(true);
      fetchSessionLogs(session.id)
        .then(setLogData)
        .finally(() => setIsLoading(false));
    }
  }, [open, session.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-border/50 max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <MediaIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>Sesi {session.media}</span>
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    statusConfig.className
                  )}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>
              </div>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                {formatDate(session.startedAt)}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detail log sesi pomodoro untuk {session.media} pada {formatDate(session.startedAt)}
          </DialogDescription>

          {/* Session Summary */}
          <div className="flex items-center gap-4 mt-4 p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4 text-primary" />
              <span>{session.focusDuration}m fokus</span>
            </div>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2 text-sm">
              <Coffee className="w-4 h-4 text-success" />
              <span>{session.restDuration}m istirahat</span>
            </div>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <span>{session.targetCycles}x siklus</span>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="logs" className="flex-1">
          <TabsList className="w-full justify-start gap-2 px-6 pt-2 bg-transparent">
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg"
            >
              <Bell className="w-4 h-4 mr-2" />
              Log AI ({logData?.logs.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="sensors"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Sensor Events ({logData?.sensorEvents.length || 0})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <TabsContent value="logs" className="px-6 pb-6 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : logData?.logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-2xl bg-secondary/30 mb-4">
                    <Bell className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Tidak ada log untuk sesi ini</p>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  {logData?.logs.map((log, index) => {
                    const typeConfig = LOG_TYPE_CONFIG[log.logType];
                    const TypeIcon = typeConfig.icon;
                    const emotionConfig = EMOTION_CONFIG[log.emotion] || EMOTION_CONFIG.IDLE;

                    return (
                      <div
                        key={log.id}
                        className="relative pl-6 pb-4 border-l-2 border-border/50 last:pb-0"
                      >
                        {/* Timeline dot */}
                        <div
                          className={cn(
                            "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-background",
                            log.pomodoroMode === "fokus" ? "bg-primary" : "bg-success"
                          )}
                        />

                        <div className="bg-secondary/30 rounded-xl p-4 ml-2 border border-border/30">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className={cn(
                                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                  typeConfig.className
                                )}
                              >
                                <TypeIcon className="w-3 h-3" />
                                {typeConfig.label}
                              </div>
                              <div
                                className={cn(
                                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                  log.pomodoroMode === "fokus"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-success/10 text-success"
                                )}
                              >
                                {log.pomodoroMode === "fokus" ? (
                                  <Brain className="w-3 h-3" />
                                ) : (
                                  <Coffee className="w-3 h-3" />
                                )}
                                {log.pomodoroMode === "fokus" ? "Fokus" : "Istirahat"}
                              </div>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  emotionConfig.bg,
                                  emotionConfig.color
                                )}
                              >
                                {log.emotion}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatTime(log.createdAt)}
                            </span>
                          </div>

                          {/* Trigger Context */}
                          <p className="text-xs text-muted-foreground mb-2 font-mono bg-secondary/50 px-2 py-1 rounded">
                            {log.triggerContext}
                          </p>

                          {/* AI Response */}
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                              <MessageSquare className="w-3 h-3 text-primary" />
                            </div>
                            <p className="text-sm leading-relaxed">{log.aiResponse}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sensors" className="px-6 pb-6 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : logData?.sensorEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-2xl bg-secondary/30 mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Tidak ada sensor event untuk sesi ini</p>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  {logData?.sensorEvents.map((event) => {
                    const emotionConfig = EMOTION_CONFIG[event.emotion] || EMOTION_CONFIG.IDLE;
                    const isInterrupt = event.eventType === "interupsi";

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded-xl p-4 border",
                          isInterrupt
                            ? "bg-destructive/5 border-destructive/20"
                            : "bg-success/5 border-success/20"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isInterrupt ? "bg-destructive/10" : "bg-success/10"
                              )}
                            >
                              {isInterrupt ? (
                                <AlertTriangle
                                  className={cn(
                                    "w-4 h-4",
                                    isInterrupt ? "text-destructive" : "text-success"
                                  )}
                                />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              )}
                            </div>
                            <div>
                              <span
                                className={cn(
                                  "font-medium",
                                  isInterrupt ? "text-destructive" : "text-success"
                                )}
                              >
                                {isInterrupt ? "Interupsi" : "Pemulihan"}
                              </span>
                              <span
                                className={cn(
                                  "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                                  emotionConfig.bg,
                                  emotionConfig.color
                                )}
                              >
                                {event.emotion}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(event.createdAt)}
                          </span>
                        </div>

                        {/* Trigger Context */}
                        <p className="text-xs text-muted-foreground mb-3 font-mono bg-secondary/30 px-2 py-1 rounded">
                          {event.triggerContext}
                        </p>

                        {/* Sensor Values */}
                        <div className="flex items-center gap-4 mb-3 p-2 rounded-lg bg-secondary/30">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                            <span>{event.temperatureAtTime}°C</span>
                          </div>
                          <div className="h-3 w-px bg-border/50" />
                          <div className="flex items-center gap-1.5 text-xs">
                            <Sun className="w-3.5 h-3.5 text-yellow-500" />
                            <span>{event.lightAtTime} lux</span>
                          </div>
                          <div className="h-3 w-px bg-border/50" />
                          <div className="flex items-center gap-1.5 text-xs">
                            <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>{event.noiseAtTime} dB</span>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-sm leading-relaxed">{event.aiResponse}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
