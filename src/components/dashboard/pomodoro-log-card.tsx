"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  RefreshCw,
  Clock,
  MessageSquare,
  AlertTriangle,
  Thermometer,
  Sun,
  Volume2,
  Book,
  Laptop,
  Smartphone,
  Monitor,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Activity,
  Zap,
} from "lucide-react";
import type {
  PomodoroSession,
  PomodoroLog,
  SensorEvent,
  SessionLogData,
} from "@/types/pomodoro";

// Mock data for demonstration
const MOCK_SESSIONS: PomodoroSession[] = [
  {
    id: "5ae880f3-25a3-4166-bea8-951d3dfb3512",
    deviceId: "f74017a7-fc9f-4f53-853e-75f938636863",
    focusDuration: 5,
    restDuration: 2,
    targetCycles: 1,
    media: "Laptop",
    currentCycle: 1,
    currentMode: "istirahat",
    currentPhase: "akhir",
    status: "completed",
    startedAt: "2026-05-07T17:23:03.000Z",
    endedAt: null,
  },
  {
    id: "af46efbe-93a0-48e4-8fe6-18d44b3b52c9",
    deviceId: "f74017a7-fc9f-4f53-853e-75f938636863",
    focusDuration: 5,
    restDuration: 5,
    targetCycles: 1,
    media: "Laptop",
    currentCycle: 1,
    currentMode: "istirahat",
    currentPhase: "akhir",
    status: "completed",
    startedAt: "2026-05-06T13:09:35.000Z",
    endedAt: null,
  },
];

const MOCK_CURRENT_SESSION_DATA: SessionLogData = {
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

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getMediaIcon(media: string) {
  switch (media) {
    case "Buku":
      return Book;
    case "Laptop":
      return Laptop;
    case "HP":
      return Smartphone;
    case "Komputer":
      return Monitor;
    default:
      return Laptop;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "running":
      return {
        icon: Play,
        label: "Berjalan",
        className: "bg-emerald-500/20 text-emerald-400",
      };
    case "paused":
      return {
        icon: Pause,
        label: "Dijeda",
        className: "bg-amber-500/20 text-amber-400",
      };
    case "completed":
      return {
        icon: CheckCircle2,
        label: "Selesai",
        className: "bg-sky-500/20 text-sky-400",
      };
    case "cancelled":
      return {
        icon: XCircle,
        label: "Dibatalkan",
        className: "bg-red-500/20 text-red-400",
      };
    default:
      return {
        icon: Clock,
        label: status,
        className: "bg-muted text-muted-foreground",
      };
  }
}

function getLogTypeConfig(logType: string) {
  switch (logType) {
    case "phase_alert":
      return {
        icon: Clock,
        label: "Fase",
        className: "bg-sky-500/20 text-sky-400",
      };
    case "voice_chat":
      return {
        icon: MessageSquare,
        label: "Voice",
        className: "bg-violet-500/20 text-violet-400",
      };
    case "system_alert":
      return {
        icon: AlertTriangle,
        label: "Sistem",
        className: "bg-amber-500/20 text-amber-400",
      };
    default:
      return {
        icon: Activity,
        label: logType,
        className: "bg-muted text-muted-foreground",
      };
  }
}

function getEventTypeConfig(eventType: string) {
  switch (eventType) {
    case "interupsi":
      return {
        icon: AlertTriangle,
        label: "Interupsi",
        className: "bg-red-500/20 text-red-400",
      };
    case "pemulihan":
      return {
        icon: Zap,
        label: "Pemulihan",
        className: "bg-emerald-500/20 text-emerald-400",
      };
    default:
      return {
        icon: Activity,
        label: eventType,
        className: "bg-muted text-muted-foreground",
      };
  }
}

// Session Log View Component
function SessionLogView({
  data,
  isCurrentSession = false,
  onRefresh,
  isRefreshing = false,
}: {
  data: SessionLogData;
  isCurrentSession?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "logs" | "sensors">("all");

  // Gabungkan dan urutkan data secara kronologis
  const getFilteredItems = () => {
    const logs = data.logs.map((l) => ({ type: "log" as const, data: l, date: new Date(l.createdAt).getTime() }));
    const sensors = data.sensorEvents.map((s) => ({ type: "sensor" as const, data: s, date: new Date(s.createdAt).getTime() }));

    let combined = [...logs, ...sensors];

    if (filter === "logs") combined = logs;
    if (filter === "sensors") combined = sensors;

    return combined.sort((a, b) => a.date - b.date); // Urut dari yang terlama ke terbaru (kronologis)
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Action Bar (Refresh + Filter) */}
      <div className="flex items-center justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 shadow-sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          <span className="text-xs font-medium">Refresh</span>
        </Button>

        <div className="flex bg-secondary/40 p-1 rounded-lg h-9">
          <button
            onClick={() => setFilter("all")}
            className={cn("px-3 text-xs font-medium rounded-md transition-all", filter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("logs")}
            className={cn("px-3 text-xs font-medium rounded-md transition-all", filter === "logs" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setFilter("sensors")}
            className={cn("px-3 text-xs font-medium rounded-md transition-all", filter === "sensors" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Sensor
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4 -mr-4 min-h-0">
        <div className="space-y-3 pb-4">
          {filteredItems.map((item) => {
            // Render Pomodoro
            if (item.type === "log") {
              const log = item.data as PomodoroLog;
              const config = getLogTypeConfig(log.logType);
              const LogIcon = config.icon;
              return (
                <div key={log.id} className="glass-panel p-3 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", config.className)}>
                        <LogIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{config.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Siklus {log.currentCycle} - {log.pomodoroMode === "fokus" ? "Fokus" : "Istirahat"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatTime(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.triggerContext}</p>
                  <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                    <p className="text-xs leading-relaxed">{log.aiResponse}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                      {log.emotion}
                    </span>
                  </div>
                </div>
              );
            }

            // Render Sensor Event
            if (item.type === "sensor") {
              const event = item.data as SensorEvent;
              const config = getEventTypeConfig(event.eventType);
              const EventIcon = config.icon;
              return (
                <div key={event.id} className="glass-panel p-3 rounded-xl space-y-2 border-l-2 border-l-amber-500/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", config.className)}>
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{config.label}</p>
                        <p className="text-[10px] text-muted-foreground">{event.triggerContext}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                    <p className="text-xs leading-relaxed">{event.aiResponse}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Thermometer className="w-3 h-3" />
                      <span>{event.temperatureAtTime}°C</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Sun className="w-3 h-3" />
                      <span>{event.lightAtTime} lux</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Volume2 className="w-3 h-3" />
                      <span>{event.noiseAtTime} dB</span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Activity className="w-8 h-8 opacity-20" />
              <p>Belum ada data untuk filter ini</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Session List Item Component
function SessionListItem({
  session,
  onClick,
}: {
  session: PomodoroSession;
  onClick: () => void;
}) {
  const MediaIcon = getMediaIcon(session.media);
  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full glass-panel p-3 rounded-xl transition-all duration-200 text-left group",
        "hover:bg-secondary/40",
        "focus:outline-none focus:ring-2 focus:ring-primary/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MediaIcon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">Sesi {session.media}</p>
            <div
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                statusConfig.className
              )}
            >
              <StatusIcon className="w-2.5 h-2.5" />
              {statusConfig.label}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(session.startedAt)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span>Fokus: {session.focusDuration}m</span>
        <span>Istirahat: {session.restDuration}m</span>
        <span>Siklus: {session.targetCycles}x</span>
      </div>
    </button>
  );
}

// Main Component
export function PomodoroLogCard() {
  const [activeView, setActiveView] = useState<"current" | "history">("current");
  const [selectedSession, setSelectedSession] = useState<PomodoroSession | null>(null);
  const [sessionLogData, setSessionLogData] = useState<SessionLogData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate fetching current session data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Simulate fetching session log data
  const handleSelectSession = async (session: PomodoroSession) => {
    setSelectedSession(session);
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSessionLogData(MOCK_CURRENT_SESSION_DATA);
    setIsLoading(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 h-[600px] flex flex-col">
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "current" | "history")} className="flex-1 flex flex-col min-h-0">

        {/* Main Header area with integrated TabsList */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold text-lg">Log Pomodoro</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Timeline aktivitas sesi</p>
            </div>
          </div>

          <TabsList className="grid grid-cols-2 bg-secondary/30 p-1 rounded-xl h-10 w-[220px]">
            <TabsTrigger
              value="current"
              className="rounded-lg data-[state=active]:bg-background/80 data-[state=active]:shadow-sm text-xs relative"
            >
              {activeView === "current" && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Sesi Aktif
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg data-[state=active]:bg-background/80 data-[state=active]:shadow-sm text-xs"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Riwayat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current" className="mt-0 flex-1 min-h-0 outline-none">
          <SessionLogView
            data={MOCK_CURRENT_SESSION_DATA}
            isCurrentSession={true}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-1 min-h-0 outline-none">
          {!selectedSession ? (
            <ScrollArea className="h-full pr-3 -mr-3">
              <div className="space-y-3 pb-2">
                {MOCK_SESSIONS.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    onClick={() => handleSelectSession(session)}
                  />
                ))}
                {MOCK_SESSIONS.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Belum ada riwayat sesi
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col h-full bg-secondary/5 rounded-xl border border-border/40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border/40 bg-secondary/20 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    {(() => {
                      const MediaIcon = getMediaIcon(selectedSession.media);
                      return <MediaIcon className="w-5 h-5 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Sesi {selectedSession.media}</span>
                      {(() => {
                        const statusConfig = getStatusConfig(selectedSession.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                              statusConfig.className
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </div>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(selectedSession.startedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                  className="gap-2 border-border/50 hover:bg-secondary/50 h-8"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </Button>
              </div>
              <div className="p-4 flex-1 min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : sessionLogData ? (
                  <SessionLogView data={sessionLogData} isCurrentSession={false} />
                ) : null}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}